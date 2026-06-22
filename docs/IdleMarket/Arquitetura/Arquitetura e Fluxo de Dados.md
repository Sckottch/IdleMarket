# 🧱 Arquitetura e Fluxo de Dados

O projeto é dividido em três camadas independentes que se comunicam através de uma API REST. Nem a Unity nem o React possuem acesso direto ao banco de dados por motivos de segurança. A comunicação é **REST only** — sem WebSocket; quando o estado muda, o cliente repuxa do backend (ver [[Integração API]] e [[Decisões]]).

## Diagrama do Ecossistema 

[[Diagrama do Ecossistema.canvas|Diagrama do Ecossistema]]




