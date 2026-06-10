'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayDateString } from './lib/dateUtils'

export default function BoxSetTodayPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/play/box-set/${getTodayDateString()}`)
  }, [router])

  return null
}
