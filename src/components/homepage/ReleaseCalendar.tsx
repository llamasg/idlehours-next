import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface Release {
  id: number;
  name: string;
  date: string;
  platforms: string[];
  developer: string;
  publisher: string;
  description: string;
  color: string;
  idleHoursVerdict: string;
}

const upcomingReleases: Release[] = [
  {
    id: 1,
    name: "Paralives",
    date: "2026-05-31",
    platforms: ["PC"],
    developer: "Paralives Studio",
    publisher: "Paralives Studio",
    description:
      "A life simulation game inspired by The Sims but built with genuine indie care. Build homes, live lives, no microtransactions.",
    color: "#a78bfa",
    idleHoursVerdict:
      "Passes — life sim with no time pressure and developer transparency",
  },
  {
    id: 2,
    name: "Hades II (Full Release)",
    date: "2026-03-15",
    platforms: ["PC", "PS5", "Xbox"],
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    description:
      "The full release of one of the best early access games of 2024. Supergiant doesn't miss.",
    color: "#c95d0d",
    idleHoursVerdict:
      "Passes the Balatro Test — will absolutely steal your weekend",
  },
  {
    id: 3,
    name: "Hollow Knight: Silksong",
    date: "2026-04-10",
    platforms: ["PC", "Switch", "PS5", "Xbox"],
    developer: "Team Cherry",
    publisher: "Team Cherry",
    description:
      "Possibly the most anticipated indie game ever made. Play as Hornet in a new kingdom.",
    color: "#2d6a4f",
    idleHoursVerdict:
      "Pending — Team Cherry earns the benefit of the doubt",
  },
  {
    id: 4,
    name: "Stardew Valley 2.0 Update",
    date: "2026-02-28",
    platforms: ["PC", "Switch", "PS5", "Xbox", "Mobile"],
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    description:
      "ConcernedApe continues to support the game years after release. More Pelican Town content.",
    color: "#52b788",
    idleHoursVerdict: "Passes — the gold standard doesn't change",
  },
  {
    id: 5,
    name: "Cozy Grove: Camp Spirit",
    date: "2026-03-22",
    platforms: ["PC", "Switch", "Mobile"],
    developer: "Spry Fox",
    publisher: "Spry Fox",
    description:
      "A new chapter of the beloved daily ritual game. Ghost bears, cosy crafting, gentle melancholy.",
    color: "#f59e0b",
    idleHoursVerdict: "Passes — idle-friendly by design",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "idlehours_wishlist";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-based: Mon=0 … Sun=6 */
function getMondayBasedDay(year: number, month: number, day: number): number {
  const jsDay = new Date(year, month, day).getDay(); // Sun=0
  return (jsDay + 6) % 7;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function releasesOnDate(dateStr: string): Release[] {
  return upcomingReleases.filter((r) => r.date === dateStr);
}

function readWishlist(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ReleaseCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(2026, 1) // February 2026
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<number[]>(() => readWishlist());
  const [toast, setToast] = useState<string | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");

  /* Persist wishlist ------------------------------------------------ */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  /* Toast auto-dismiss ---------------------------------------------- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  /* Derived --------------------------------------------------------- */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = getMondayBasedDay(year, month, 1); // blank cells before 1st
  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const selectedRelease: Release | null =
    selectedDate !== null
      ? upcomingReleases.find((r) => r.date === selectedDate) ?? null
      : null;

  /* Handlers -------------------------------------------------------- */
  const prevMonth = () =>
    setCurrentMonth(new Date(year, month - 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(year, month + 1));

  const handleDayClick = useCallback(
    (day: number) => {
      const dateStr = toDateString(year, month, day);
      const hasRelease = releasesOnDate(dateStr).length > 0;
      if (hasRelease) {
        setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
      } else {
        setSelectedDate(null);
      }
    },
    [year, month]
  );

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        setToast("Removed from wishlist");
        return prev.filter((x) => x !== id);
      }
      setToast("Added to your wishlist \u{1F49C}");
      return [...prev, id];
    });
  };

  const handleReminderSubmit = () => {
    if (!selectedRelease) return;
    console.log("Reminder set for", selectedRelease.name, reminderEmail);
    setReminderOpen(false);
    setReminderEmail("");
    setToast("Reminder set! \u{1F514}");
  };

  /* Today string for highlight -------------------------------------- */
  const todayStr = (() => {
    const t = new Date();
    return toDateString(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  /* Build calendar cells -------------------------------------------- */
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      {/* Section header */}
      <div>
        <span className="inline-block text-xs font-semibold bg-[#7c3aed]/10 text-[#7c3aed] px-3 py-1 rounded-full mb-4">
          {"\u{1F4C5}"} Coming Soon
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Upcoming games worth your time
        </h2>
        <p className="text-muted-foreground mt-2 mb-10">
          Only games that pass the Idle Hours test make it onto this calendar.
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* ---- Left: Calendar ---- */}
        <motion.div
          className="bg-[#f3f0ff] rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Month header */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-[#e8e2ff] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h3 className="text-lg font-bold text-foreground">{monthLabel}</h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-[#e8e2ff] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="text-xs text-muted-foreground font-semibold text-center py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square rounded-lg bg-transparent"
                  />
                );
              }

              const dateStr = toDateString(year, month, day);
              const releases = releasesOnDate(dateStr);
              const hasRelease = releases.length > 0;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                    cursor-pointer transition-all relative
                    ${
                      isToday
                        ? "bg-[#7c3aed] text-white font-bold"
                        : "bg-[#e8e2ff] text-foreground hover:bg-[#d8d0f0]"
                    }
                    ${isSelected ? "ring-2 ring-[#7c3aed] shadow-md" : ""}
                  `}
                >
                  <span>{day}</span>
                  {hasRelease && (
                    <span
                      className="absolute bottom-1.5 w-1 h-1 rounded-full"
                      style={{ backgroundColor: releases[0].color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ---- Right: Detail Panel ---- */}
        <motion.div
          className="relative min-h-[400px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {selectedRelease ? (
              <motion.div
                key={selectedRelease.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Cover placeholder */}
                <div
                  className="aspect-video rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${selectedRelease.color}44, ${selectedRelease.color})`,
                  }}
                />

                {/* Game name */}
                <h3 className="text-2xl font-bold text-foreground mt-4">
                  {selectedRelease.name}
                </h3>

                {/* Date */}
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDisplayDate(selectedRelease.date)}
                </p>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedRelease.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-[#e8e2ff] text-[#7c3aed] px-2 py-1 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Developer / Publisher */}
                <p className="text-sm text-muted-foreground mt-3">
                  <span className="font-semibold">Developer:</span>{" "}
                  {selectedRelease.developer}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Publisher:</span>{" "}
                  {selectedRelease.publisher}
                </p>

                {/* Description */}
                <p className="text-sm text-foreground/80 mt-3">
                  {selectedRelease.description}
                </p>

                {/* Verdict */}
                <p className="text-sm italic text-brand-green mt-2">
                  {selectedRelease.idleHoursVerdict}
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    onClick={() => toggleWishlist(selectedRelease.id)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                      wishlist.includes(selectedRelease.id)
                        ? "bg-[#7c3aed]/20 text-[#7c3aed]"
                        : "bg-[#7c3aed] text-white"
                    }`}
                  >
                    {wishlist.includes(selectedRelease.id)
                      ? "On your Wishlist \u2713"
                      : "\u{1F49C} Add to Wishlist"}
                  </button>

                  <button
                    onClick={() => setReminderOpen(true)}
                    className="border border-[#7c3aed]/30 text-[#7c3aed] rounded-full px-5 py-2.5 text-sm transition-colors hover:bg-[#7c3aed]/5"
                  >
                    {"\u{1F514}"} Remind me
                  </button>
                </div>

                {/* Toast */}
                <AnimatePresence>
                  {toast && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-muted-foreground mt-3"
                    >
                      {toast}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <span className="text-4xl mb-3">{"\u{1F4C5}"}</span>
                <p className="text-muted-foreground">
                  Select a release date to see details
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- Reminder Modal ---- */}
          <AnimatePresence>
            {reminderOpen && selectedRelease && (
              <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/20 rounded-2xl"
                  onClick={() => setReminderOpen(false)}
                />

                {/* Modal */}
                <motion.div
                  className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 z-10"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Close */}
                  <button
                    onClick={() => setReminderOpen(false)}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <p className="text-foreground font-semibold mb-4">
                    We'll remind you when{" "}
                    <span className="text-[#7c3aed]">
                      {selectedRelease.name}
                    </span>{" "}
                    releases.
                  </p>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40"
                  />

                  <button
                    onClick={handleReminderSubmit}
                    className="mt-4 w-full bg-[#7c3aed] text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-[#6d28d9] transition-colors"
                  >
                    Set reminder {"\u2192"}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ReleaseCalendar;
