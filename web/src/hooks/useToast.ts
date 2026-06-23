import { useEffect, useState } from "react";

export type ToastState = { id: number; msg: string; type: "success" | "error" };

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "success" | "error" = "error") =>
    setToast({ id: Date.now(), msg, type });

  return { toast, showToast };
}