export type Project = { id: string; name: string; created_at: string }

export type TimeEntry = {
  id: string
  user_id: string
  project_id: string
  task_name: string
  project_name?: string
  start_time: string
  end_time: string
  duration: number
}
