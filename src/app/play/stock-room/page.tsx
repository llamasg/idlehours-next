'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayDateString } from './lib/dateUtils'

export default function StockRoomTodayPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/play/stock-room/${getTodayDateString()}`)
  }, [router])

  return null
}
