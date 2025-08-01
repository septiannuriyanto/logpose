'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'

export default function Timer({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) {
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [task, setTask] = useState('')
  const [notes, setNotes] = useState('')
  const [entryId, setEntryId] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [paused, setPaused] = useState(true)
  const [, tick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function loadActive() {
      const { data } = await supabase
        .from('timesheets')
        .select('id, task_name, notes, duration, start_time, is_paused')
        .eq('user_id', userId)
        // .eq('project_id', projectId)
        .is('end_time', null)
        .is('is_active', true)
        .limit(1)
        .maybeSingle()

      if (data) {
        setEntryId(data.id)
        setTask(data.task_name)
        setNotes(data.notes ?? '')
        setDuration(data.duration ?? 0)
        setPaused(data.is_paused ?? true)
        if (!data.is_paused && data.start_time) {
          setStartTime(new Date(data.start_time).getTime())
          intervalRef.current = setInterval(() => tick((t) => t + 1), 1000)
        }
      }
    }

    loadActive()
    return () => {
      intervalRef.current && clearInterval(intervalRef.current)
    }
  }, [userId])

  const getElapsed = () =>
    startTime && !paused
      ? duration + Math.floor((Date.now() - startTime) / 1000)
      : duration

  const play = async () => {
    const now = new Date()
    if (!entryId) {
      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          task_name: task,
          notes,
          duration: 0,
          start_time: now,
          is_paused: false,
          user_id: userId,
          // project_id: projectId,
        })
        .select('id')
        .single()
      if (error) return console.error(error)
      setEntryId(data.id)
    } else {
      await supabase
        .from('timesheets')
        .update({ start_time: now, is_paused: false })
        .eq('id', entryId)
    }

    setPaused(false)
    setStartTime(now.getTime())
    setOpen(false)
    intervalRef.current && clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => tick((t) => t + 1), 1000)
  }

  const pause = async () => {
    if (!entryId) return
    clearInterval(intervalRef.current!)
    const elapsedNow = getElapsed()
    await supabase
      .from('timesheets')
      .update({ duration: elapsedNow, is_paused: true })
      .eq('id', entryId)
    setDuration(elapsedNow)
    setPaused(true)
    setStartTime(null)
  }

  const done = async () => {
    if (!entryId) return
    clearInterval(intervalRef.current!)
    const elapsedNow = getElapsed()
    await supabase
      .from('timesheets')
      .update({
        duration: elapsedNow,
        end_time: new Date(),
        is_paused: false,
        is_active: false,
      })
      .eq('id', entryId)
    reset()
  }

  const reset = () => {
    clearInterval(intervalRef.current!)
    setEntryId(null)
    setTask('')
    setNotes('')
    setDuration(0)
    setPaused(true)
    setStartTime(null)
    setOpen(false)
  }

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const display = formatTime(getElapsed())

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {/* Plus Button */}
      {!entryId && !open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white text-3xl rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
          aria-label="Open task form"
        >
          +
        </button>
      )}

      {/* Form */}
      {open && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-5 w-80 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">New Task</h2>
          <input
            type="text"
            placeholder="Task name"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full text-base text-black placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-base text-black placeholder-gray-400 border border-gray-300 rounded-md px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={reset}
              className="px-3 py-1 text-gray-600 text-base hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={play}
              disabled={!task}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-base rounded-md shadow transition disabled:opacity-50"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Timer Card */}
      {entryId && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 w-80 flex items-center justify-between space-x-3">
          <div className="flex-1">
            <div className="font-medium text-base text-gray-900">{task}</div>
            <div className="text-sm text-gray-500">{display}</div>
          </div>
          <div className="flex flex-col space-y-2">
            {!paused ? (
              <button onClick={pause} aria-label="Pause">
                <img src="/icons/pause.svg" alt="Pause" width={28} height={28} />
              </button>
            ) : (
              <button onClick={play} aria-label="Resume">
                <img src="/icons/play.svg" alt="Resume" width={28} height={28} />
              </button>
            )}
            <button onClick={done} aria-label="Done">
              <img src="/icons/done.svg" alt="Done" width={28} height={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
