import { notFound } from 'next/navigation'
import JobBoard from '@/components/jobs/JobBoard'

export default function JobsPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <JobBoard />
}
