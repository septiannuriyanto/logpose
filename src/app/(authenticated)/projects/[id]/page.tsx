"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Camera,User as UserIcon } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  project_creator: string;
  icon_url?: string | null;
}

interface Member {
  user_id: string;
  email: string;
  role: string;
  status?: string; // accepted / pending / rejected
  full_name?: string;
  image_url?: string; // optional profile image URL
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [hoverIcon, setHoverIcon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isInviting, setIsInviting] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInviting) inputRef.current?.focus();
  }, [isInviting]);

  /** ✅ Fetch project + members + invites */
  useEffect(() => {
  if (!id) return;

  const fetchData = async () => {
    setLoading(true);
    console.log("[DEBUG] Project ID:", id);

    // 🔹 Ambil project
    const { data: proj, error: projErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    console.log("[DEBUG] Project:", proj, projErr);
    setProject(proj);

    // 🔹 Ambil active members
    const { data: memberData, error: memberErr } = await supabase
      .from("project_members")
      .select("user_id, role")
      .eq("project_id", id);
    console.log("[DEBUG] project_members:", memberData, memberErr);

    const active: Member[] =
      memberData?.map((m) => ({
        user_id: m.user_id,
        email: "",
        full_name: "",
        role: m.role,
        status: "accepted",
      })) || [];

    // 🔹 Ambil invitations
    const { data: inviteData, error: inviteErr } = await supabase
      .from("invites")
      .select("user_id, status")
      .eq("project_id", id);
    console.log("[DEBUG] invites:", inviteData, inviteErr);

    const activeIds = new Set(active.map((m) => m.user_id));
    const invites: Member[] =
      inviteData
        ?.filter((i) => !activeIds.has(i.user_id))
        .map((i) => ({
          user_id: i.user_id,
          email: "",
          full_name: "",
          role: "member",
          status: i.status,
        })) || [];

    // 🔹 Ambil profile
    const userIds = [...active.map((m) => m.user_id), ...invites.map((i) => i.user_id)];
    console.log("[DEBUG] All user IDs:", userIds);

    if (userIds.length > 0) {
      const { data: profilesData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      console.log("[DEBUG] profiles:", profilesData, profileErr);

      active.forEach((m) => {
        const p = profilesData?.find((x) => x.id === m.user_id);
        if (p) {
          m.email = p.email;
          m.full_name = p.full_name;
        }
      });

      invites.forEach((i) => {
        const p = profilesData?.find((x) => x.id === i.user_id);
        if (p) {
          i.email = p.email;
          i.full_name = p.full_name;
        }
      });
    }

    console.log("[DEBUG] Final Active Members:", active);
    console.log("[DEBUG] Final Invitations:", invites);

    setActiveMembers(active.filter((m) => m.user_id !== user?.id));
    setInvitations(invites.filter((m) => m.user_id !== user?.id));

    setLoading(false);
  };

  fetchData();
}, [id]);


  /** ✅ Auto-suggest email */
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (inputEmail.length < 2) {
        setSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .ilike("email", `%${inputEmail}%`)
        .limit(5);

      if (data) {
        const filtered = data.filter((d) => d.id !== user?.id);
        setSuggestions(
          filtered.map((d) => ({
            user_id: d.id,
            email: d.email,
            full_name: d.full_name,
            role: "member",
          }))
        );
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [inputEmail]);

  /** ✅ Invite user */
  const addInvite = async (m: Member) => {
    if (!project) return;

    await supabase.from("invites").insert({
      project_id: project.id,
      user_id: m.user_id,
      invited_by: user?.id,
      status: "pending",
    });

    setInvitations([...invitations, { ...m, status: "pending" }]);
    setInputEmail("");
    setSuggestions([]);
    setIsInviting(false);
  };

  /** ✅ Delete invite */
  const deleteInvite = async (userId: string) => {
    if (!project) return;
    await supabase
      .from("invites")
      .delete()
      .eq("project_id", project.id)
      .eq("user_id", userId);

    setInvitations((prev) => prev.filter((m) => m.user_id !== userId));
  };

  /** ✅ Upload icon */
  const handleIconUpload = async (file: File, projectId: string) => {
    if (!file) return;
    const ext = file.type === "image/png" ? "png" : "jpg";
    const filePath = `${projectId}/icon.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("project-assets")
      .upload(filePath, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      alert(`Failed to upload icon: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage
      .from("project-assets")
      .getPublicUrl(filePath);

    await supabase.from("projects").update({ icon_url: data.publicUrl }).eq("id", projectId);

    setProject((prev) => (prev ? { ...prev, icon_url: data.publicUrl } : prev));
  };

  if (loading) return <div className="p-4">Loading project...</div>;
  if (!project) return <div className="p-4">Project not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* 🔹 Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="relative w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-white cursor-pointer overflow-hidden"
          onMouseEnter={() => setHoverIcon(true)}
          onMouseLeave={() => setHoverIcon(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          {project.icon_url ? (
            <img src={project.icon_url} alt="Project Icon" className="w-full h-full object-cover" />
          ) : (
            <span>{project.name.charAt(0).toUpperCase()}</span>
          )}
          {hoverIcon && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file && project?.id) {
                await handleIconUpload(file, project.id);
              }
            }}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description || "No description"}</p>
          <p className="text-sm text-gray-400 mt-2">
            Created at {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 🔹 Active Members Panel */}
      <div className="bg-white rounded-lg shadow p-4">
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-lg font-semibold">
      Active Members <span className="text-gray-400">({activeMembers.length})</span>
    </h2>
    {!isInviting ? (
      <button
        onClick={() => setIsInviting(true)}
        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
      >
        + Invite
      </button>
    ) : (
      <button
        onClick={() => {
          setIsInviting(false);
          setInputEmail("");
          setSuggestions([]);
        }}
        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
      >
        Cancel
      </button>
    )}
  </div>

  {isInviting && (
    <div className="relative mb-4">
      <input
        ref={inputRef}
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
        placeholder="Type email to invite..."
        className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s.user_id}
              onClick={() => addInvite(s)}
              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
            >
              <p className="font-medium">{s.full_name || s.email}</p>
              <p className="text-xs text-gray-500">{s.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )}

  {activeMembers.length === 0 ? (
    <p className="text-gray-500 text-sm">No active members</p>
  ) : (
    <ul className="divide-y">
      {activeMembers.map((m, idx) => (
        <li key={idx} className="py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* ✅ Avatar with lazy-loading */}
            {m.image_url ? (
              <img
                src={m.image_url}
                alt={m.full_name || m.email}
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
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
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            {m.role}
          </span>
        </li>
      ))}
    </ul>
  )}
</div>

      {/* 🔹 Invitations Panel */}
      <div className="bg-white rounded-lg shadow p-4">
  <h2 className="text-lg font-semibold mb-3">
    Invitations <span className="text-gray-400">({invitations.length})</span>
  </h2>

  {invitations.length === 0 ? (
    <p className="text-gray-500 text-sm">No pending or rejected invitations</p>
  ) : (
    <ul className="divide-y">
      {invitations.map((m, idx) => (
        <li key={idx} className="py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* ✅ Avatar with lazy-loading */}
            {m.image_url ? (
              <img
                src={m.image_url}
                alt={m.full_name || m.email}
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
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

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                m.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {m.status}
            </span>
            {m.status === "pending" && (
              <button
                onClick={() => {
                  if (confirm(`Delete invite for ${m.full_name || m.email}?`)) {
                    deleteInvite(m.user_id);
                  }
                }}
                className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-2 py-1 rounded-full transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
}
