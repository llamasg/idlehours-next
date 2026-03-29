import { supabase } from './supabase'

export interface Job {
  id: string
  title: string
  column: 'website' | 'revenue' | 'marketing'
  status: 'active' | 'done'
  priority: 'low' | 'medium' | 'high'
  progress: string | null
  body: string
  tag: string | null
  created_at: string
  updated_at: string
}

export type JobCreate = Pick<Job, 'title' | 'column'> &
  Partial<Pick<Job, 'priority' | 'progress' | 'body' | 'tag'>>

export type JobUpdate = Partial<
  Pick<Job, 'title' | 'column' | 'status' | 'priority' | 'progress' | 'body' | 'tag'>
>

export async function getJobs(): Promise<Job[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('getJobs error:', error); return [] }
  return data as Job[]
}

export async function createJob(job: JobCreate): Promise<Job | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single()
  if (error) { console.error('createJob error:', error); return null }
  return data as Job
}

export async function updateJob(id: string, updates: JobUpdate): Promise<Job | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateJob error:', error); return null }
  return data as Job
}

export async function deleteJob(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) { console.error('deleteJob error:', error); return false }
  return true
}
