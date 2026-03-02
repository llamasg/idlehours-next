export default function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="shrink-0 font-heading text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}
