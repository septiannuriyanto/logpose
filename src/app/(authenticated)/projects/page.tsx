"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateProjectModal from "@/components/ui/projects/CreateProjectModal";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  ClipboardList,
  Crown,
  Briefcase,
  FolderKanban,
  Mail,
} from "lucide-react";

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Create Project
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            filter === "all"
              ? "bg-indigo-100 text-indigo-700 border-indigo-300"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>All ({totalAll})</span>
        </button>
        <button
          onClick={() => setFilter("manager")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            filter === "manager"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Managed ({totalManager})</span>
        </button>
        <button
          onClick={() => setFilter("member")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            filter === "member"
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Working ({totalMember})</span>
        </button>
        <button
          onClick={() => setFilter("invites")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border relative ${
            filter === "invites"
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Invitations</span>
          {invites.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {invites.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {filter === "invites" ? (
        invites.length === 0 ? (
          <div className="text-gray-500 mt-6">No pending invitations.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.invite_id}
                className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                    {invite.project_icon ? (
                      <img
                        src={invite.project_icon}
                        alt="Project Icon"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {invite.project_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {invite.project_name || "Unnamed Project"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Invited by {invite.inviter_email || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Invited at{" "}
                      {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: {invite.status}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invite)}
                    className="bg-white border border-green-500 text-green-500 px-3 py-1 rounded hover:bg-green-300 hover:text-white transition-all duration-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(invite)}
                    className="bg-white border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-300 hover:text-white transition-all duration-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : loading ? (
        <p className="text-gray-500 mt-6">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <div className="text-gray-500 mt-6">No projects to show.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white shadow rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                {project.icon_url ? (
                  <img
                    src={project.icon_url}
                    alt={project.name}
                    className="w-10 h-10 rounded bg-gray-100 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">{project.name}</h2>
                    <span className="text-xs text-gray-500">
                      {project.member_count} members
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
              <p
                className={`text-xs mt-1 px-2 py-0.5 inline-block rounded ${
                  project.role === "manager"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {project.role}
              </p>
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
