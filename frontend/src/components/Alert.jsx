export default function Alert({ type = "info", title, children }) {
  const styles =
    type === "error"
      ? "bg-rose-50 text-rose-900 border-rose-300"
      : type === "success"
        ? "bg-emerald-50 text-emerald-900 border-emerald-300"
        : "bg-sky-50 text-sky-900 border-sky-300";

  return (
    <div className={`rounded-lg border px-4 py-3 ${styles}`}>
      {title ? <div className="font-semibold mb-1">{title}</div> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}

