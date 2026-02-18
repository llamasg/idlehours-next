/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipCalendar (Content Calendar)
   Monthly calendar with event dots & day-click detail
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';

import { usePipData } from '@/pip/hooks/usePipData';
import type { CalendarEvent } from '@/pip/lib/pipMockData';

/* ── constants ──────────────────────────────── */

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const EVENT_COLOURS: Record<CalendarEvent['type'], string> = {
  published: 'bg-accent-green',
  planned: 'bg-amber-400',
  social: 'bg-blue-400',
};

const EVENT_BADGES: Record<CalendarEvent['type'], string> = {
  published: 'bg-accent-green/15 text-accent-green',
  planned: 'bg-amber-400/15 text-amber-600',
  social: 'bg-blue-400/15 text-blue-600',
};

/* ── helpers ─────────────────────────────────── */

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => isSameDay(parseISO(e.date), day));
}

/* ── main component ──────────────────────────── */

export default function PipCalendar() {
  const { posts } = usePipData();

  // Map real published posts to calendar events
  const calendarEvents: CalendarEvent[] = posts
    .filter((p) => p.publishedAt)
    .map((p) => ({
      id: p._id,
      date: p.publishedAt.slice(0, 10),
      title: p.title,
      type: 'published' as const,
    }));

  /* Month navigation — start at current month */
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedEvents = selectedDay ? getEventsForDay(calendarEvents, selectedDay) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 px-4">
      {/* Heading */}
      <motion.h1
        className="text-3xl font-bold text-stone-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Content Calendar
      </motion.h1>

      {/* Month navigation */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-stone-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium uppercase text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const dayEvents = getEventsForDay(calendarEvents, day);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative min-h-[80px] rounded-lg border bg-white p-1 text-left
                  transition-all hover:border-stone-300
                  ${inMonth ? 'border-border' : 'border-border opacity-30'}
                  ${today ? 'ring-2 ring-burnt-orange' : ''}
                  ${isSelected && inMonth ? 'border-burnt-orange bg-burnt-orange/5' : ''}
                `}
              >
                <span
                  className={`text-xs font-medium ${
                    today ? 'text-burnt-orange' : 'text-stone-600'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayEvents.map((evt) => (
                      <span
                        key={evt.id}
                        className={`block h-2 w-2 rounded-full ${EVENT_COLOURS[evt.type]}`}
                        title={evt.title}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="flex flex-wrap gap-4 text-xs text-stone-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-green" />
          Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
          Planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
          Social
        </span>
      </motion.div>

      {/* Selected day detail panel */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay.toISOString()}
            className="rounded-xl border border-border bg-white p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-sm font-semibold text-stone-800">
              {format(selectedDay, 'EEEE, d MMMM yyyy')}
            </h3>

            {selectedEvents.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing scheduled for this day.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {selectedEvents.map((evt) => (
                  <li key={evt.id} className="flex items-center gap-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${EVENT_BADGES[evt.type]}`}
                    >
                      {evt.type}
                    </span>
                    <span className="text-sm text-stone-700">{evt.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {format(parseISO(evt.date), 'd MMM yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
