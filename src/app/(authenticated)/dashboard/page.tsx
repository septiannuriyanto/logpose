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
    <div className="p-6 space-y-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-black mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeProject && (
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-black mb-1">Top Project This Month</h3>
            <div className="flex items-center justify-between">
              <span className="text-black">{activeProject.project_name}</span>
              <span className="text-2xl font-bold text-green-600">
                {fmt(activeProject.total_seconds)}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-black mb-1">This Month’s Total</h3>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-bold text-blue-600">{fmt(monthTotal)}</p>
            {/* Optionally insert sparkline bar chart */}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-black mb-2">Recent Timesheets (Last 30 Days)</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-black">No entries yet.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((t) => (
              <li
                key={t.id}
                className="py-3 flex justify-between hover:bg-gray-50 p-2 rounded transition"
              >
                <div>
                  <span className="text-black font-semibold">{t.task_name}</span>
                  {t.project && (
                    <span className="text-black"> · {t.project.name}</span>
                  )}
                  <div className="text-xs text-black mt-1">
                    {new Date(t.start_time).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-black">{fmt(t.duration)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex space-x-6 mt-4">
        <Link href="/timesheets" className="text-green-600 hover:underline font-semibold">
          View full history
        </Link>
        <Link href="/projects" className="text-blue-600 hover:underline font-semibold">
          Manage projects
        </Link>
      </div>

      <Link
        href="/"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 hover:bg-green-700 text-white text-4xl rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
        aria-label="Start timer"
      >
        +
      </Link>
    </div>
  )
}
