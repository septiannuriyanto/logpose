"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
      .order("timesheet_number", { ascending: false });

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

  const formatDuration = (minutes: number | null, ongoing: boolean, notStarted: boolean) => {
    if (notStarted) return "Not Started";
    if (ongoing) return "Ongoing";
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getDurationColor = (minutes: number | null, ongoing: boolean, notStarted: boolean) => {
    if (notStarted) return "bg-gray-200 text-gray-600";
    if (ongoing) return "bg-gray-300 text-gray-700";
    if (!minutes) return "bg-gray-200 text-gray-600";
    if (minutes < 60) return "bg-green-100 text-green-700";
    if (minutes < 180) return "bg-blue-100 text-blue-700";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="timesheet__header flex flex-row justify-between pb-2">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Timesheets <span className="text-gray-400">({timesheets.length})</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1 rounded bg-indigo-600 text-white"
        >
          + New Timesheet
        </button>
      </div>

      {timesheets.length === 0 ? (
        <p className="text-gray-500 text-sm">No timesheets found</p>
      ) : (
        <ul className="space-y-3">
          {timesheets.map((t) => {
            const notStarted = !t.start_time; // ✅ cek apakah belum mulai
            const ongoing = !notStarted && !t.end_time;

            return (
              <li
                key={t.id}
                className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                      {projectIcon ? (
                        <img src={projectIcon} alt="Project Icon" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold">{projectName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-500">#{t.timesheet_number}</p>
                      <p className="font-semibold text-gray-900">{t.task_name}</p>
                      <p className="text-xs text-indigo-600 font-medium">{projectName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Taken by <span className="font-medium text-gray-700">{t.taken_by}</span>
                      </p>

                      {/* ✅ Jika belum mulai, tampilkan pesan */}
                      {notStarted ? (
                        <p className="text-xs text-red-500 mt-2">
                          Pekerjaan Timesheet ini belum dimulai
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(t.start_time!).toLocaleString()} –{" "}
                          {t.end_time ? new Date(t.end_time).toLocaleString() : "Ongoing"}
                        </p>
                      )}

                      {t.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">“{t.notes}”</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold self-start shadow-sm ${getDurationColor(
                      t.duration,
                      ongoing,
                      notStarted
                    )}`}
                  >
                    {formatDuration(t.duration, ongoing, notStarted)}
                  </span>
                </div>
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
