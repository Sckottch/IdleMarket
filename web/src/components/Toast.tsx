import type { ToastState } from "../hooks/useToast";

function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div className={`toast-pop fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-md border bg-slate-900 px-4 py-2 text-sm shadow-lg ${
      toast.type === "success" ? "border-emerald-500/60 text-emerald-300" : "border-red-500/60 text-red-300"
    }`}>
      {toast.msg}
    </div>
  );
}

export default Toast;