'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard — PersonaCard
   Audience persona display card
   ────────────────────────────────────────────── */

interface Persona {
  name: string;
  icon: string;
  findsVia: string;
  readsMost: string;
  avgTime: string;
  peakHours: string;
  need: string;
}

interface PersonaCardProps {
  persona: Persona;
}

function Field({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm text-foreground ${italic ? 'italic text-stone-500' : ''}`}>{value}</p>
    </div>
  );
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{persona.icon}</span>
        <h3 className="text-lg font-semibold text-foreground">{persona.name}</h3>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <Field label="Finds you via:" value={persona.findsVia} />
        <Field label="Reads most:" value={persona.readsMost} />
        <Field label="Spends:" value={persona.avgTime} />
        <Field label="Most active:" value={persona.peakHours} />
        <Field label="What they need:" value={persona.need} italic />
      </div>
    </div>
  );
}
