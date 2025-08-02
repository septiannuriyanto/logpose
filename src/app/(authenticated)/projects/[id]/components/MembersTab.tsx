"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

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
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">
        Active Members <span className="text-gray-400">({activeMembers.length})</span>
      </h2>
      {activeMembers.length === 0 ? (
        <p className="text-gray-500 text-sm">No active members</p>
      ) : (
        <ul className="divide-y">
          {activeMembers.map((m, idx) => (
            <li key={idx} className="py-2 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.full_name || m.email} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{m.full_name || m.email}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{m.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
