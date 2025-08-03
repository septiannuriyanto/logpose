export type Project = { id: string; name: string; created_at: string }

export type Timesheet = {
  id: number
  task_name: string
  duration: number
  project: { name: string } | null
  start_time: string
}

export type ProjectSummary = {
  project_id: string
  project_name: string
  total_seconds: number
}
