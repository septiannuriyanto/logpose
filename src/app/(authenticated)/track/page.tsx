"use client";
import React, { useState, useEffect } from "react";

export default function TimeTrackerPage() {
  const [taskName, setTaskName] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [plannedFinish, setPlannedFinish] = useState<string>("");

// Convert ke Date object
const getPlannedFinishDate = () => {
  return plannedFinish ? new Date(plannedFinish) : null;
};


  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTracking && startTime) {
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isTracking, startTime]);

  const handleStart = () => {
    if (!taskName.trim()) return alert("Task name required.");
    setStartTime(new Date());
    setElapsed(0);
    setIsTracking(true);
  };

  const handleStop = () => {
    setIsTracking(false);
    // TODO: Save to Supabase or show confirmation
    console.log("Task logged:", {
      taskName,
      startTime,
      endTime: new Date(),
      duration: elapsed,
    });
    alert(`Task "${taskName}" logged: ${formatDuration(elapsed)}`);
    setTaskName("");
    const plannedFinishDate = getPlannedFinishDate();
const plannedDuration =
  plannedFinishDate && startTime
    ? Math.floor((plannedFinishDate.getTime() - startTime.getTime()) / 1000)
    : null;

console.log("Task logged:", {
  taskName,
  startTime,
  endTime: new Date(),
  duration: elapsed,
  plannedFinish: plannedFinishDate,
  plannedDuration,
});

  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">⏱️ Time Tracker</h1>

    <label>Enter task name</label>
      <input
        type="text"
        placeholder="E.g 'Water my plant'..."
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl shadow-sm"
        disabled={isTracking}
      />

    <label>Enter planned finish date/time</label>
      <input
  type="datetime-local"
  value={plannedFinish}
  onChange={(e) => setPlannedFinish(e.target.value)}
  className="w-full px-4 py-2 border rounded-xl shadow-sm"
  disabled={isTracking}
/>


      <div className="flex items-center gap-4">
        {!isTracking ? (
          <button
            onClick={handleStart}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700"
          >
            ▶️ Start Timer
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
          >
            ⏹️ Stop Timer
          </button>
        )}

        {isTracking && (
          <div className="text-lg font-mono">{formatDuration(elapsed)}</div>
        )}
      </div>
    </div>
  );
}
