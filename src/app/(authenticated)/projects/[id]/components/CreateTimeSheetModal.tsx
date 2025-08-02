import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  task_number: number;
  description: string | null;
  priority: "low" | "medium" | "high";
  created_by: string | null;
  minute_budget: number | null;
  created_at: string;
}

interface CreateTimesheetModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTimesheetModal({
  projectId,
  projectName,
  onClose,
  onCreated,
}: CreateTimesheetModalProps) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [accomplished, setAccomplished] = useState(0);
  const [nextNumber, setNextNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("task_number", { ascending: false });
      setTasks(data || []);
    };
    fetchTasks();
  }, [projectId]);

  // ✅ Hitung accomplished & nomor timesheet jika task dipilih
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedTask) {
        // untuk case tanpa task
        const { count } = await supabase
          .from("timesheets")
          .select("id", { count: "exact", head: true })
          .eq("project_id", projectId)
          .is("task_id", null);

        setAccomplished(0);
        setNextNumber((count || 0) + 1);
        return;
      }

      const { data: ts, count } = await supabase
        .from("timesheets")
        .select("duration", { count: "exact" })
        .eq("task_id", selectedTask.id);

      const totalMinutes = ts?.reduce((sum, t) => sum + (t.duration || 0), 0) || 0;
      setAccomplished(totalMinutes);
      setNextNumber((count || 0) + 1);
    };

    fetchStats();
  }, [selectedTask, projectId]);

  const formatMinutes = (m: number | null) => {
    if (!m) return "0m";
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min > 0 ? `${min}m` : ""}` : `${min}m`;
  };

  const remaining =
    selectedTask?.minute_budget != null
      ? Math.max(selectedTask.minute_budget - accomplished, 0)
      : null;

  const handleSubmit = async () => {
    if (!taskName.trim()) {
      alert("Timesheet Name is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("timesheets").insert({
      project_id: projectId,
      task_id: selectedTask?.id || null,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      task_name: taskName,
      notes: notes || null,
      start_time: null,
      end_time: null,
      is_active: true,
      is_paused: false,
      timesheet_number: nextNumber, // ✅ allocate number
    });
    setLoading(false);
    if (error) {
      alert("Failed to create timesheet: " + error.message);
    } else {
      onCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">
          Create New Timesheet on {projectName}
        </h2>

        {/* Autocomplete Task */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Associated Task
          </label>
          {!selectedTask ? (
            <>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="Search task..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
              {query && (
                <div className="border rounded mt-1 bg-white max-h-40 overflow-y-auto">
                  {tasks
                    .filter((t) =>
                      t.title.toLowerCase().includes(query.toLowerCase())
                    )
                    .map((t) => (
                      <div
                        key={t.id}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedTask(t);
                          setTaskName(t.title);
                          setQuery("");
                        }}
                      >
                        #{t.task_number} - {t.title}
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-3 border rounded bg-gray-50 space-y-1 relative">
              <button
                className="absolute top-2 right-2 text-xs text-red-500"
                onClick={() => {
                  setSelectedTask(null);
                  setAccomplished(0);
                  setNextNumber(null);
                }}
              >
                Remove
              </button>
              <p className="text-sm font-semibold">
                #{selectedTask.task_number} - {selectedTask.title}
              </p>
              <p className="text-xs text-gray-500">
                {selectedTask.description}
              </p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  selectedTask.priority === "high"
                    ? "bg-red-100 text-red-700"
                    : selectedTask.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selectedTask.priority}
              </span>
              <p className="text-xs text-gray-500">
                Created at{" "}
                {new Date(selectedTask.created_at).toLocaleString()}
              </p>
              <p className="text-xs">
                Budget: {formatMinutes(selectedTask.minute_budget)} | Accomplished:{" "}
                {formatMinutes(accomplished)} | Remaining:{" "}
                {formatMinutes(remaining)}
              </p>
              {remaining === 0 && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ The allocated budget for this task has been fully used.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Timesheet Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Timesheet Name
          </label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full border rounded px-2 py-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              (remaining !== null && remaining === 0) // ✅ disable jika habis
            }
            className={`px-3 py-1 rounded text-white ${
              loading || (remaining !== null && remaining === 0)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600"
            }`}
          >
            {loading ? "Creating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
