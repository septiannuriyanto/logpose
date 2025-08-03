'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
}

interface ProjectSwitcherProps {
  userId: string;
  selectedProjectId: string;
  onChange: (newProjectId: string) => void;
  disabled?: boolean;
}

export default function ProjectSwitcher({
  userId,
  selectedProjectId,
  onChange,
  disabled = false,
}: ProjectSwitcherProps) {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from('project_members')
        .select('project_id ( id, name )')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading projects:', error);
      } else if (data) {
        const formatted = data.map((row: any) => ({
          id: row.project_id.id,
          name: row.project_id.name,
        }));
        setProjects(formatted);
      }

      setLoading(false);
    }

    loadProjects();
  }, [userId, supabase]);

  if (loading) {
    return <p className="text-sm text-gray-600">Loading projects...</p>;
  }

  return (
    <select
      value={selectedProjectId}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="
        w-full text-base text-black placeholder-gray-500
        border border-gray-300 rounded-md px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
      "
    >
      <option value="">Select project...</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
