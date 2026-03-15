'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import TodayCard from '@/components/play/TodayCard'
import PlayGameCard from '@/components/play/PlayGameCard'
import BlitzSection from '@/components/play/BlitzSection'
import ShipItSection from '@/components/play/ShipItSection'
import JigsawSection from '@/components/play/JigsawSection'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'
import { getTodayDateString as getGameSenseToday } from './game-sense/lib/dateUtils'
import { getTodayDateString as getStreetDateToday } from './street-date/lib/dateUtils'
import { getTodayDateString as getShelfPriceToday } from './shelf-price/lib/dateUtils'

function SectionHeader({
  number,
  title,
  note,
}: {
  number: string
  title: React.ReactNode
  note?: string
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b-2 border-dashed border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1.5 font-heading text-[9px] font-extrabold uppercase tracking-[0.28em] text-muted-foreground">
          {number}
        </p>
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {note && (
        <p className="max-w-[220px] text-right text-xs font-semibold italic leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  )
}

export default function PlayHubPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-10">
        {/* Hero */}
        <header className="grid grid-cols-1 items-end gap-10 border-b border-dashed border-border py-12 sm:py-16 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="mb-4 flex items-center gap-2.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-600">
              <span className="block h-[1.5px] w-[18px] bg-amber-600" />
              Games
            </p>
            <h1 className="mb-3.5 font-heading text-[clamp(32px,4vw,50px)] font-bold leading-[1.15] tracking-tight text-foreground">
              Something to play<br />
              while the kettle boils.<br />
              <em className="font-semibold italic text-muted-foreground">Or longer, if you&apos;d like.</em>
            </h1>
            <p className="max-w-[440px] text-sm font-semibold italic leading-relaxed text-muted-foreground">
              Daily games that reset with the morning. A rapid-fire mode that never quite ends.
              And one that&apos;s worth setting proper time aside for.
            </p>
          </div>
          <TodayCard />
        </header>

        {/* Section 01: Daily */}
        <section className="pt-14">
          <SectionHeader
            number="01 — Daily"
            title={<>Fresh every morning. <em className="font-semibold italic text-muted-foreground">Gone by midnight.</em></>}
            note="One badge per game. Play them all and you've had a proper idle hour."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PlayGameCard
              title="Game Sense"
              subtitle="Guess the game"
              description="We describe it. You name it. The gap between &ldquo;I know this one&rdquo; and actually knowing it is where the game lives."
              href={`/play/game-sense/${getGameSenseToday()}`}
              imageBg="bg-[#EEEAF8]"
              btnClass="bg-blue-500"
            />
            <PlayGameCard
              title="Street Date"
              subtitle="Guess the year"
              description="Match a game to its release year from the box art alone. Some you&rsquo;ll know instantly. Some will humble you."
              href={`/play/street-date/${getStreetDateToday()}`}
              imageBg="bg-[#EAEBF0]"
              btnClass="bg-blue-500"
            />
            <PlayGameCard
              title="Shelf Price"
              subtitle="Guess the price"
              description="Higher or lower. Five rounds. Turns out your instinct about what games cost is either better or worse than you&rsquo;d expect."
              href={`/play/shelf-price/${getShelfPriceToday()}`}
              imageBg="bg-amber-100"
              btnClass="bg-amber-600"
              stickerClass="bg-amber-600 text-white"
            />
          </div>
          <div className="mt-4">
            <DailyBadgeShelf currentGame="game-sense" animateStamp={false} />
          </div>
        </section>

        {/* Section 02: Blitz */}
        <section className="pt-14">
          <SectionHeader
            number="02 — Rapid Fire"
            title={<>How many can you <em className="font-semibold italic text-muted-foreground">actually</em> name?</>}
            note="New topics added as the library grows. No daily reset on this one."
          />
          <BlitzSection />
        </section>

        {/* Section 03: Ship It */}
        <section className="pt-14">
          <SectionHeader
            number="03 — Narrative"
            title={<>A game about making <em className="font-semibold italic text-muted-foreground">a game.</em></>}
            note="Different from the others. Set some time aside. It's worth it."
          />
          <ShipItSection />
        </section>

        {/* Section 04: Slow Games */}
        <section className="pt-14">
          <SectionHeader
            number="04 — Slow Games"
            title={<>No timer. No score. <em className="font-semibold italic text-muted-foreground">Just the pieces.</em></>}
            note="Games that don't rush you. Bring tea."
          />
          <JigsawSection />
        </section>

        {/* Section 05: More Coming */}
        <section className="pt-14">
          <SectionHeader
            number="05"
            title={<>There&apos;s <em className="font-semibold italic text-muted-foreground">more coming.</em></>}
          />
          <div className="flex flex-col items-start justify-between gap-6 rounded-[18px] border-2 border-dashed border-border bg-secondary/30 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 font-heading text-[9px] font-extrabold uppercase tracking-[0.26em] text-muted-foreground">
                In the works
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                A new game is quietly taking shape.<br />
                <em className="font-semibold italic text-muted-foreground">We&apos;ll say more when there&apos;s something to say.</em>
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full border border-amber-500/30 bg-amber-100 px-4 py-2 font-heading text-[10px] font-black uppercase tracking-[0.12em] text-amber-600">
              Watch this space
            </span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
