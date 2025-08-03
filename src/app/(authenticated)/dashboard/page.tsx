'use client'
import { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ProjectSummary, Timesheet } from '@/lib/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type TopProject = Database['public']['Functions']['top_project_by_user']['Returns'][0]

export default function DashboardPage() {
  const supabase = createClient()
  const [activeProject, setActiveProject] = useState<ProjectSummary | null>(null)
  const [recent, setRecent] = useState<Timesheet[]>([])
  const [monthTotal, setMonthTotal] = useState<number>(0)

  useEffect(() => {
    async function loadDashboard() {
      const session = await supabase.auth.getSession()
      const uid = session.data.session?.user?.id
      if (!uid) return

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Monthly total
      const { data: totData } = await supabase
        .rpc('monthly_total_by_user', { uid, month_start: monthStart })
        .select('total_duration')
        .maybeSingle()
      setMonthTotal(totData?.total_duration ?? 0)

      // Recent entries from past month
      const { data: recentData } = await supabase
        .from('timesheets')
        .select('id, task_name, duration, start_time, project:projects(name)')
        .gte('start_time', monthStart)
        .eq('user_id', uid)
        .order('start_time', { ascending: false })
        .limit(5)
      setRecent(recentData ?? [])

      // Top project
      const { data: projData } = await supabase
        .rpc('top_project_by_user', { uid, month_start: monthStart })
        .maybeSingle()

      const typedProj = projData as TopProject | null

      if (projData && typedProj?.project_id) {
        setActiveProject({
          project_id: typedProj.project_id,
          project_name: typedProj.name,
          total_seconds: Number(typedProj.total_duration),
        })
      }
    }
    loadDashboard()
  }, [supabase])

  const fmt = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60;
    const parts = [];
    
    if (h) parts.push(`${h}h`);
    if (m || h) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {activeProject && (
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-medium">Top Project This Month</h3>
          <div className="mt-2 flex justify-between">
            <span>{activeProject.project_name}</span>
            <span className="font-semibold">{fmt(activeProject.total_seconds)}</span>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-medium">This Month’s Total</h3>
        <p className="mt-2 text-2xl">{fmt(monthTotal)}</p>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-medium">Recent Timesheets (Last 30 Days)</h3>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No entries yet.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {recent.map((t) => (
              <li key={t.id} className="py-2 flex justify-between">
                <div>
                  <span className="font-medium">{t.task_name}</span>
                  {t.project && ` · ${t.project.name}`}
                  <div className="text-xs text-gray-500">
                    {new Date(t.start_time).toLocaleDateString()}
                  </div>
                </div>
                <span>{fmt(t.duration)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex space-x-4">
        <Link href="/timesheets" className="text-green-600 hover:underline">
          View full history
        </Link>
        <Link href="/projects" className="text-blue-600 hover:underline">
          Manage projects
        </Link>
      </div>

      <Link
        href="/"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white text-3xl rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
        aria-label="Start timer"
      >
        +
      </Link>
    </div>
  )
}
