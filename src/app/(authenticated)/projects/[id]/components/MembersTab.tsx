"use client";

import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Member {
  user_id: string;
  email: string;
  role: string;
  full_name?: string;
  image_url?: string;
}

interface MembersTabProps {
  projectId: string;
}

export default function MembersTab({ projectId }: MembersTabProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data: memberData } = await supabase
        .from("project_members")
        .select("user_id, role")
        .eq("project_id", projectId);

      const active: Member[] =
        memberData?.map((m) => ({
          user_id: m.user_id,
          email: "",
          full_name: "",
          role: m.role,
        })) || [];

      const userIds = active.map((m) => m.user_id);
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, full_name, image_url")
          .in("id", userIds);

        active.forEach((m) => {
          const p = profilesData?.find((x) => x.id === m.user_id);
          if (p) {
            m.email = p.email;
            m.full_name = p.full_name;
            m.image_url = p.image_url;
          }
        });
      }

      setActiveMembers(active.filter((m) => m.user_id !== user?.id));
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
          {activeMembers.map((m) => (
            <li
              key={m.user_id || m.email}
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
              <span
                className={`
              text-sm font-medium px-3 py-1 rounded-full
              ${m.role === 'admin' || m.role === 'owner'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-green-50 text-green-700'}
            `}
              >
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
