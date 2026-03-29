'use client'

import { use } from 'react'

export default function StreetDateV2DayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Street Date v2 — {date}</h1>
      <p className="mt-2 text-muted-foreground">Game page placeholder — components coming next</p>
    </div>
  )
}
