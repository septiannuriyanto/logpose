"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import CreateTimesheetModal from "./CreateTimeSheetModal";

interface Timesheet {
  id: number;
  project_id: string;
  user_id: string;
  task_name: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  duration: number | null;
  is_active: boolean;
  is_paused: boolean;
  timesheet_number: number;
  taken_by?: string;
}

interface TimesheetsTabProps {
  projectId: string;
  projectName: string;
  projectIcon?: string | null;
}

export default function TimesheetsTab({
  projectId,
  projectName,
  projectIcon,
}: TimesheetsTabProps) {
  const supabase = createClient();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchTimesheets = async () => {
    const { data: tsData } = await supabase
      .from("timesheets")
      .select("*")
      .eq("project_id", projectId)
      .order("start_time", { ascending: false });

    if (!tsData) {
      setTimesheets([]);
      return;
    }

    const userIds = tsData.map((t) => t.user_id).filter(Boolean);
    let profilesMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      profilesData?.forEach((p) => {
        profilesMap[p.id] = p.full_name || p.email;
      });
    }

    const withUser = tsData.map((t) => ({
      ...t,
      taken_by: profilesMap[t.user_id] || "Unknown",
    }));

    setTimesheets(withUser);
  };

  useEffect(() => {
    fetchTimesheets();
  }, [projectId]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60;
    const parts = [];

    if (h) parts.push(`${h}h`);
    if (m || h) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  const getDurationColor = (minutes: number | null, ongoing: boolean, notStarted: boolean) => {
    if (notStarted) return "bg-gray-200 text-gray-600";
    if (ongoing) return "bg-gray-300 text-gray-700";
    if (!minutes) return "bg-gray-200 text-gray-600";
    if (minutes < 60) return "bg-green-100 text-green-700";
    if (minutes < 180) return "bg-blue-100 text-blue-700";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Timesheets
          <span className="text-gray-500">({timesheets.length})</span>
        </h2>
        {/* Optional: <button className="px-3 py-1 bg-indigo-600 text-white rounded-md">+ New</button> */}
      </div>

      {timesheets.length === 0 ? (
        <p className="text-gray-500 text-sm">No timesheets found</p>
      ) : (
        <ul className="space-y-4">
          {timesheets.map((t) => {
            const notStarted = !t.start_time;
            const ongoing = !notStarted && !t.end_time;
            return (
              <li
                key={t.id}
                className="flex justify-between items-start p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                    {projectIcon ? (
                      <img src={projectIcon} alt="Project Icon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">{projectName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-indigo-600">#{t.timesheet_number}</p>
                    <p className="text-md font-semibold text-gray-900">{t.task_name}</p>
                    <p className="text-sm font-medium text-indigo-600">{projectName}</p>
                    <p className="text-xs text-gray-600">
                      Taken by <span className="font-medium text-gray-700">{t.taken_by}</span>
                    </p>
                    {notStarted ? (
                      <p className="text-xs text-red-500 mt-2">This timesheet hasn’t started yet</p>
                    ) : (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(t.start_time!).toLocaleString()} –{" "}
                        {t.end_time ? new Date(t.end_time).toLocaleString() : "Ongoing"}
                      </p>
                    )}
                    {t.notes && (
                      <p className="text-xs italic text-gray-500 mt-1">“{t.notes}”</p>
                    )}
                  </div>
                </div>
                <span
                  className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getDurationColor(
                    t.duration,
                    ongoing,
                    notStarted
                  )}`}
                >
                  {formatDuration(t.duration ?? 0)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <CreateTimesheetModal
          projectId={projectId}
          projectName={projectName}
          onClose={() => setShowModal(false)}
          onCreated={fetchTimesheets}
        />
      )}
    </div>
  );
}
