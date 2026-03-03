'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayDateString } from './lib/dateUtils'

export default function ShelfPriceRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace(`/play/shelf-price/${getTodayDateString()}`)
  }, [router])
  return null
}
