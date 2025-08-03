"use client";

import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface MembersTabProps {
  projectId: string;
}

type Member = {
  project_id: string;
  role: string;
  joined_at: string;
  id: string;
  full_name: string;
  email: string;
  image_url: string | null;
}

export default function MembersTab({ projectId }: MembersTabProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.rpc('get_project_members', {
        project_id_arg: projectId
      });
      console.log(data)

      if (error) {
        console.error('RPC error:', error);
        return;
      }

      const active: Member[] = (data ?? []).map((m: Member) => ({
        user_id: m.id,
        email: m.email,
        full_name: m.full_name,
        image_url: m.image_url,
        role: m.role
      }));

      setActiveMembers(active);
    };

    fetchMembers();
  }, [projectId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <header className="flex items-center justify-between border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-900">
          Active Members
          <span className="ml-2 text-gray-500">({activeMembers.length})</span>
        </h2>
      </header>

      {activeMembers.length === 0 ? (
        <p className="text-gray-500 text-sm">No active members</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activeMembers.map((m: Member) => (
            <li
              key={m.id || m.email}
              className="py-3 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.full_name || m.email}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-500 text-base">
                      {m.full_name?.[0]?.toUpperCase() || m.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold leading-tight">
                    {m.full_name || m.email}
                  </p>
                  <p className="text-gray-600 text-sm leading-tight">{m.email}</p>
                </div>
              </div>
              {m.role === 'manager' && (
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {m.role}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
