'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayDateString } from './lib/dateUtils'

export default function SkillIssueTodayPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/play/skill-issue/${getTodayDateString()}`)
  }, [router])

  return null
}
