import { redirect } from 'next/navigation'
import { getTodayDateString } from '../street-date/lib/dateUtils'

export default function StreetDateV2Page() {
  redirect(`/play/street-date-v2/${getTodayDateString()}`)
}
