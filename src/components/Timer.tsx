import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Timer({ projectId, userId }: { projectId: string, userId: string }) {
  const supabase = createClient();

  const [running, setRunning] = useState(false)
  const [task, setTask] = useState('')
  const [start, setStart] = useState<Date | null>(null)
  let intervalId: ReturnType<typeof setInterval> | undefined

  useEffect(() => {
    if (running) {
      intervalId = setInterval(() => {
        // Optional: update elapsed UI
      }, 1000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [running])

  const handleStart = async () => {
    setStart(new Date())
    setRunning(true)
    await supabase
      .from('time_entries')
      .insert({ task_name: task, start_time: new Date(), project_id: projectId, user_id: userId })
  }
  const handleStop = async () => {
    setRunning(false)
    const end = new Date()
    // update last entry
    const { data } = await supabase
      .from('time_entries')
      .select('id,start_time')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('start_time', { ascending: false })
      .limit(1)
    if (data?.[0]) {
      const duration = (end.getTime() - new Date(data[0].start_time).getTime()) / 1000
      await supabase
        .from('time_entries')
        .update({ end_time: end, duration })
        .eq('id', data[0].id)
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={task}
        onChange={e => setTask(e.target.value)}
        placeholder="Task name"
        className="border rounded px-2 py-1 w-full"
      />
      {!running ? (
        <button onClick={handleStart} className="btn-blue">Start</button>
      ) : (
        <button onClick={handleStop} className="btn-red">Stop</button>
      )}
    </div>
  )
}
