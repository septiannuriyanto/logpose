"use client";

import { useAuth } from "@/components/AuthProvider";
import CreateProjectModal from "@/components/ui/projects/CreateProjectModal";
import { createClient } from "@/lib/supabase/client";
import {
  Briefcase,
  ClipboardList,
  Crown,
  FolderKanban,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  icon_url: string | null;
  role: string;
  member_count: number;
}

interface Invite {
  invite_id: string;
  status: string;
  created_at: string;
  project_id: string;
  project_name: string;
  project_icon: string | null;
  inviter_email: string | null;
}

type FilterType = "all" | "manager" | "member" | "invites";

export default function ProjectsPage() {
  const supabase = createClient();
  const { user } = useAuth();

  const [openModal, setOpenModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  /** ✅ Fetch Projects via RPC get_user_projects_with_member_count */
  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "get_user_projects_with_member_count",
      { p_user: user.id }
    );

    if (!error && data) {
      const mapped = data.map((p: any) => ({
        id: p.project_id,
        name: p.name,
        description: p.description,
        created_at: p.created_at,
        icon_url: p.icon_url,
        role: p.user_role,
        member_count: p.member_count,
      }));
      setProjects(mapped);
    }

    setLoading(false);
  };

  /** ✅ Fetch Invites via RPC get_user_invites */
  const fetchInvites = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc("get_user_invites", {
      p_user: user.id,
    });

    if (!error && data) {
      setInvites(data as Invite[]);
    }
  };

  const handleAccept = async (invite: Invite) => {
    const confirmAccept = window.confirm(
      `Are you sure you want to accept the invitation to join "${invite.project_name}"?`
    );
    if (!confirmAccept) return;

    await supabase.from("project_members").insert({
      project_id: invite.project_id,
      user_id: user?.id,
      role: "member",
    });
    await supabase.from("invites").delete().eq("id", invite.invite_id);
    fetchProjects();
    fetchInvites();
  };

  const handleReject = async (invite: Invite) => {
    const confirmReject = window.confirm(
      `Are you sure you want to reject the invitation to "${invite.project_name}"?`
    );
    if (!confirmReject) return;

    await supabase
      .from("invites")
      .update({ status: "rejected" })
      .eq("id", invite.invite_id);

    fetchInvites();
  };




  useEffect(() => {
    fetchProjects();
    fetchInvites();
  }, [user]);

  /** ✅ Filtered projects */
  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    return p.role === (filter === "manager" ? "manager" : "member");
  });

  /** ✅ Counts */
  const totalManager = projects.filter((p) => p.role === "manager").length;
  const totalMember = projects.filter((p) => p.role === "member").length;
  const totalAll = projects.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Projects
        </h1>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
        >
          + Create Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all", label: "All", icon: <ClipboardList className="w-4 h-4" />, count: totalAll, style: "indigo" },
          { key: "manager", label: "Managed", icon: <Crown className="w-4 h-4" />, count: totalManager, style: "green" },
          { key: "member", label: "Working", icon: <Briefcase className="w-4 h-4" />, count: totalMember, style: "blue" },
          { key: "invites", label: "Invitations", icon: <Mail className="w-4 h-4" />, count: invites.length, style: "yellow" },
        ].map(({ key, label, icon, count, style }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border
            ${active
                  ? `bg-${style}-100 border-${style}-300 text-${style}-700 font-semibold`
                  : `bg-white text-gray-600 border-gray-200 hover:text-gray-700`}
            ${key === "invites" && count > 0 ? "" : ""}
          `}
            >
              {icon}
              <span>
                {label}
                {typeof count === "number" && !isNaN(count) ? ` (${count})` : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Invites Section */}
      {filter === "invites" ? (
        invites.length === 0 ? (
          <p className="text-gray-600 mt-6">No pending invitations.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {invites.map((invite) => (
              <div
                key={invite.invite_id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                    {invite.project_icon ? (
                      <img
                        src={invite.project_icon}
                        alt={`${invite.project_name} icon`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {invite.project_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {invite.project_name || "Unnamed Project"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Invited by {invite.inviter_email || "Unknown"}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Status: {invite.status}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invite)}
                    className="px-3 py-1 bg-white border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(invite)}
                    className="px-3 py-1 bg-white border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : loading ? (
        <p className="text-gray-600 mt-6">Loading projects…</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-gray-600 mt-6">No projects to show.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {project.icon_url ? (
                    <img
                      src={project.icon_url}
                      alt={`${project.name} icon`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderKanban className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h2>
                    <span className="text-gray-500 text-sm">
                      {project.member_count} member{project.member_count !== 1 && 's'}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                Created on {new Date(project.created_at).toLocaleDateString()}
              </p>
              <span
                className={`inline-block px-2 py-0.5 mt-2 text-xs font-medium rounded ${project.role === "manager"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                  }`}
              >
                {project.role}
              </span>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={fetchProjects}
      />
    </div>
  );
}
