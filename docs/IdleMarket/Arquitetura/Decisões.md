# Registro de Decisões

> Log das decisões de design e suas justificativas. Cada entrada registra **o que mudou**, **o porquê** e o **impacto**. Serve pra manter o histórico do "por que isso é assim" sem poluir os docs de referência.

---

## Drop de wave comum: 70% → 60%

- **O quê:** chance de drop de equipamento em wave comum caiu de 70% para 60%.
- **Por quê:** o jogo fluiu melhor com 60% — menos inflação de itens, mantendo o peso/escassez do drop.
- **Impacto:** [[Equipamentos]], [[Recompensas]] e o `MockCombatService`. Balanceamento fino fica para depois do projeto pronto.

## Variação de inimigos: 2 modelos × 5 cores → 1 modelo × 4 cores

- **O quê:** reduzido para 1 modelo e 4 cores.
- **Por quê:** o 2º modelo do pacote não tinha a variação de ataque (Attack1/Attack2); ficamos com o que tem. A variação virou puramente cosmética (cor), sorteada por wave.
- **Impacto:** [[Interface]] (seção Variação de Inimigos). Sem efeito em stats nem no contrato de dados.

## Dois ataques: Attack2 = crítico

- **O quê:** o Animator tem dois ataques; `Attack2` toca no golpe crítico, `Attack1` no normal.
- **Por quê:** o `DamageResult` (com `isCritical`) já é calculado antes da animação para o número de dano, então dá para telegrafar o crítico na própria animação de graça.
- **Impacto:** contrato do Animator (`Run` bool, `Attack1`/`Attack2`/`Guard` triggers); `PlayAttack(isCrit)`.

## UI reativa por evento + comandos via manager

- **O quê:** a UI in-game é dirigida por eventos. Estado contínuo (HP, XP, nível do inimigo) flui do modelo para os listeners; comandos pontuais (número de dano, aviso de wave) passam pelo `GameUIManager`.
- **Por quê:** estado contínuo a UI consegue ouvir sozinha (acoplamento mais frouxo); momentos pontuais que só o combate conhece (esse golpe foi crítico, a wave virou) são comando. Misturar os dois acopla o combate à UI à toa.
- **Impacto:** HP via `Character.OnHealthChanged`, XP via `GameManager.OnProgressionChanged`, nível via `Character.OnInitialized`; `GameUIManager` faz composição (`BindCharacters`) + comando, fora do caminho de HP/XP. É o seam que o React reutiliza na Fase 3.

## Morte: bloqueante → reativa (fire-and-forget), só fade

- **O quê:** a animação de morte deixou de bloquear o combate; roda em paralelo. Virou só fade (o blink foi testado e removido).
- **Por quê:** a lógica do combate resolve por `IsAlive` (setado no `OnHit`), não pela animação — bloquear é desnecessário. A morte cabe na janela da volta do atacante. O blink ficou tosco no teste.
- **Impacto:** [[Interface]]; `PerformAttack` ramifica (vivo → Guard, morto → `PlayDeath` sem `yield`); o `ResetVisual` (no `InitializeStats`) cancela qualquer fade ainda em curso, deixando robusto independente do tempo.

## Moedas de loot decorativas: cortadas

- **O quê:** as moedas que cairiam/voariam na morte do inimigo foram removidas do escopo.
- **Por quê:** finalização da Fase 1 — enxugar o não essencial. O reveal de ouro/loot é responsabilidade do React de qualquer forma.
- **Impacto:** [[Interface]] (Feedback Visual, Fluxo de Fim de Wave, tabela de fronteira).

## Número de dano: objeto único reusado, ~0,5s

- **O quê:** o número de dano é um único objeto pré-posicionado, reposicionado e reanimado a cada golpe (sem instanciar/destruir), durando ~0,5s.
- **Por quê:** os ataques são sequenciais e o número some antes da volta do atacante, então nunca há dois na tela — um objeto só basta e evita churn.
- **Impacto:** [[Interface]] (Feedback Visual).

## Aura de boss: cortada

- **O quê:** o efeito de shader (aura/brilho) que distinguiria o chefão da wave final foi removido do escopo. O chefão usa o mesmo modelo/cor dos comuns; a distinção fica só no aviso "WAVE FINAL".
- **Por quê:** o trabalho pra implementar a aura seria grande demais e atrasaria muito o avanço do projeto. Não compensa agora.
- **Impacto:** [[Interface]] (seção Chefão e nota do `SetupWave`). Sem efeito em stats, fluxo ou contrato de dados.

## Integração Unity ↔ backend: transporte vs domínio (Fase 3 — Etapa 2)

- **O quê:** camada de transporte `ApiClient` (static; `Post<T>`/`Get<T>` sobre `UnityWebRequest`; token JWT como estado ambiente; Newtonsoft centralizado) separada dos serviços de domínio (`AuthService`, `BattleService`).
- **Por quê:** transporte sabe de HTTP/JSON/token; domínio sabe das operações. Login/victory são operações de domínio, não de transporte.
- **Impacto:** [[Integração API]]. Comunicação Unity → backend → banco validada ponta a ponta no editor.

## ICombatService → IBattleService + contrato de erro

- **O quê:** interface renomeada para `IBattleService` (agrupa status + victory + defeat, 1:1 com `/api/battle/*`). `onError` (`Action<ApiError>`) em todos os métodos (callback duplo). `RewardResult` → `VictoryResult { level, xp }`. `ReportDefeat` sem gold.
- **Por quê:** status não é "combate"; o nome bate com o grupo de rotas. Os campos do `VictoryResult` batem com o JSON do backend (Newtonsoft desserializa direto). Ouro é responsabilidade do React.
- **Impacto:** [[Integração API]], [[Sistema de Turnos]].

## Equipados puxados via /status a cada wave (jogo é receptor)

- **O quê:** o jogo nunca equipa/desequipa; puxa o snapshot de equipados via `/status` a cada `WaveStart` (`RefreshPlayerData`). Não há `IInventoryService` no runtime — o `MockInventoryService` fica só como debug.
- **Por quê:** equip é React → backend; anti-trapaça (estado autoritativo do servidor, janela `<=` uma wave); trocas no React entram na próxima wave.
- **Impacto:** [[Integração API]], [[Interface]], [[Sistema de Turnos]].

## Boot pela BootScene + a state machine sempre avança

- **O quê:** o `GameManager` (`DontDestroyOnLoad`) vive na `BootScene`, roda `Boot()` assíncrono e só então carrega a `GameScene`; o combate só inicia no fim do boot (`CombatManager.Start` não inicia mais). Mocks mantidos como toggle (`useMock`). Nos wrappers de victory/defeat, o `onComplete` dispara no sucesso **e** no erro.
- **Por quê:** ponto único de início do combate (sem corrida no caminho mock-direto); um POST que falha nunca congela a SM (derrota é não-crítica; vitória reconcilia no próximo refresh; sem re-POST).
- **Impacto:** [[Sistema de Turnos]] (Fluxo de Boot, Tratamento de Erro), [[Integração API]].
