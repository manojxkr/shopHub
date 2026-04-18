export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

