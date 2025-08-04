"use client";

import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import InviteMemberModal from "./InviteMemberModal";

type Member = {
  id: string;
  full_name: string;
  email: string;
  image_url: string | null;
  role: string;
};

export default function MembersTab({ projectId, creatorId }: { projectId: string, creatorId: string }) {
  const supabase = createClient();
  const { user } = useAuth();

  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .rpc("get_project_members", { project_id_arg: projectId })
      .then(({ data, error }) => {
        if (error) {
          console.error("RPC error:", error);
          return;
        }
        const members = (Array.isArray(data) ? data : []).map((row: any) => ({
          id: row.member_id,
          full_name: row.full_name,
          email: row.email,
          role: row.role,
          image_url: row.image_url || null,
        }));

        setActiveMembers(members);
      });
  }, [projectId, user, supabase]);

  const reset = () => {
    setInviteOpen(false)
  }

  const isCurrentUser = (id: string) => {
    return user?.id === id
  }

  const isOwner = (id: string) => {
    return creatorId === user?.id
  }

  const handleRemove = async (memberId: string) => {
    setLoadingIds((prev) => new Set(prev).add(memberId))

    const { data, error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', memberId)
      .select();

    if (error) {
      console.error("Failed to delete:", error);
    } else {
      setActiveMembers(prev =>
        prev.filter(member => member.id !== memberId)
      );
    }

    setLoadingIds((prev) => {
      const set = new Set(prev);
      set.delete(memberId)
      return set;
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <header className="flex items-center justify-between border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-900">
          Active Members
          <span className="ml-2 text-gray-500">({activeMembers.length})</span>
        </h2>
        <button
          onClick={() => {
            setInviteOpen(true);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md shadow-sm transition"
        >
          + Invite Member
        </button>
      </header>

      {activeMembers.length === 0 ? (
        <p className="text-gray-500 text-sm">No active members</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activeMembers.map((m) => {
            const initial = (m.full_name || m.email)?.[0]?.toUpperCase()
            const updating = m.id && loadingIds.has(m.id)
            return (
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
                      <div className="text-gray-500 font-medium">{initial}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold leading-tight">
                      {m.full_name || m.email}
                    </p>
                    <p className="text-gray-600 text-sm leading-tight">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {m.role === "manager" && (
                    <span className="text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {m.role}
                    </span>
                  )}

                  {isOwner(m.id) && !isCurrentUser(m.id) && (
                    <button
                      disabled={!!updating}
                      onClick={() => handleRemove(m.id!)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${updating
                          ? 'bg-red-200 text-red-400 cursor-not-allowed pointer-events-none'
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }
                        disabled:bg-red-200 disabled:text-red-400 disabled:cursor-not-allowed`}
                    >
                      {updating ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <InviteMemberModal
        user={user}
        projectId={projectId}
        open={inviteOpen}
        onClose={reset} />
    </div>
  );
}
