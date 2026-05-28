export default function StatCard({ label, valor, Icone, cor = '#00BFDF', invertido = false }) {
  return (
    <article
      className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
        invertido
          ? 'bg-cp-navy dark:bg-cp-navy border-cp-navy-2'
          : 'bg-card dark:bg-d-card border-border dark:border-d-border'
      }`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${cor}18` }}
      >
        <Icone size={18} strokeWidth={2} style={{ color: cor }} />
      </div>
      <div className="min-w-0">
        <div className={`text-[0.65rem] font-bold tracking-widest uppercase ${invertido ? 'text-white/50' : 'text-muted dark:text-d-muted'}`}>
          {label}
        </div>
        <div className={`font-sora text-xl font-extrabold leading-tight ${invertido ? 'text-white' : 'text-text dark:text-d-text'}`}>
          {valor}
        </div>
      </div>
    </article>
  )
}
