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

      console.log(recentData)
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
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeProject && (
          <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
            <h2 className="text-base font-medium text-gray-500 mb-2">
              Top Project This Month
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-800">
                {activeProject.project_name}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {fmt(activeProject.total_seconds)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
          <h2 className="text-base font-medium text-gray-500 mb-2">
            This Month’s Total
          </h2>
          <div className="flex justify-between items-end">
            <p className="text-4xl font-bold text-blue-600">{fmt(monthTotal)}</p>
            {/* Sparkline/chart could go here */}
          </div>
        </div>
      </div>

      {/* Recent Timesheets */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Timesheets (Last 30 Days)
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((t) => (
              <li
                key={t.id}
                className="py-3 flex justify-between items-start hover:bg-gray-50 rounded px-2 transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t.task_name}
                    {t.project && (
                      <span className="text-gray-600"> · {t.project.name}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(t.start_time).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {fmt(t.duration)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/timesheets"
          className="text-green-600 hover:text-green-700 font-medium underline underline-offset-2"
        >
          View full history
        </Link>
        <Link
          href="/projects"
          className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
        >
          Manage projects
        </Link>
      </div>

      {/* Floating Action Button */}
      <Link
        href="/"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 hover:bg-green-700 text-white text-4xl rounded-full shadow-lg flex items-center justify-center transition"
        aria-label="Start timer"
      >
        +
      </Link>
    </div>
  )
}
