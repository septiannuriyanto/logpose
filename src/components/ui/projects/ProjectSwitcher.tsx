'use client';

import { createClient } from '@/lib/supabase/client';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';

interface Project {
  id: string;
  name: string;
}

interface ProjectSwitcherProps {
  userId: string;
  selectedProjectId?: string;
  onChange: (projectId: string) => void;
  disabled?: boolean;
}

export default function ProjectSwitcherCombobox({
  userId,
  selectedProjectId,
  onChange,
  disabled = false,
}: ProjectSwitcherProps) {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Load projects on mount or when user changes
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('project_members')
        .select('project_id(id, name)')
        .eq('user_id', userId);
      if (!error && data) {
        const list: Project[] = data.map((row: any) => ({
          id: row.project_id.id,
          name: row.project_id.name,
        }));
        setProjects(list);
        const sel = list.find((p) => p.id === selectedProjectId) ?? null;
        setSelected(sel);
        setQuery(sel?.name ?? '');
      }
    }
    load();
  }, [supabase, userId, selectedProjectId]);

  const filtered = query.trim() === ''
    ? projects
    : projects.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

  const handleSelect = (proj: Project | null) => {
    setSelected(proj);
    onChange(proj?.id ?? '');
    setQuery(proj?.name ?? '');
  };

  const handleFocus = () => {
    setSelected(null)
    onChange('');
    setQuery('');
    btnRef.current?.click();
  }

  return (
    <Combobox
      value={selected}
      onChange={handleSelect}
      nullable
      disabled={disabled}
      by="id"
    >
      {({ open }) => (
        <div className="relative w-full sm:w-69">
          <div className="flex items-center border rounded-md bg-white py-1 px-2">
            <ComboboxInput
              className={`
                flex-grow bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
              placeholder="Select Project"
              displayValue={(proj: Project | null) => proj?.name ?? ''}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => {
                btnRef.current?.click();
              }}
              onFocus={handleFocus}
              autoComplete="off"
            />
            <ComboboxButton
              ref={btnRef}
              className="focus:outline-none p-1"
              disabled={disabled}
            >
              <svg
                className="w-5 h-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M19 9l-7 7-7-7"
                  clipRule="evenodd"
                />
              </svg>
            </ComboboxButton>
          </div>

          <ComboboxOptions
            static
            className={`
              absolute z-10 mt-1 max-h-60 w-full overflow-auto
              bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5
              ${open ? '' : 'hidden'}
            `}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No projects found…</div>
            ) : (
              filtered.map((proj) => (
                <ComboboxOption
                  key={proj.id}
                  value={proj}
                  className={({ active }) =>
                    `px-3 py-2 cursor-pointer select-none ${active ? 'bg-green-500 text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected: isSel }) => (
                    <span className={isSel ? 'font-semibold' : 'font-normal'}>
                      {proj.name}
                    </span>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      )}
    </Combobox>
  );
}
