import { redirect } from 'next/navigation'

export default async function SkillIssueDateRedirect({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  redirect(`/play/game-sense/${date}`)
}
