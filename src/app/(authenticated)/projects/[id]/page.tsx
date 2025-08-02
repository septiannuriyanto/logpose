"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";
import MembersTab from "./components/MembersTab";
import TimesheetsTab from "./components/TimesheetsTab";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  icon_url?: string | null;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "timesheets">("members");
  const [hoverIcon, setHoverIcon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      setLoading(true);
      const { data } = await supabase.from("projects").select("*").eq("id", id).single();
      setProject(data);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleIconUpload = async (file: File, projectId: string) => {
    const ext = file.type === "image/png" ? "png" : "jpg";
    const filePath = `${projectId}/icon.${ext}`;

    await supabase.storage.from("project-assets").upload(filePath, file, { upsert: true });
    const { data } = supabase.storage.from("project-assets").getPublicUrl(filePath);

    await supabase.from("projects").update({ icon_url: data.publicUrl }).eq("id", projectId);
    setProject((prev) => (prev ? { ...prev, icon_url: data.publicUrl } : prev));
  };

  if (loading) return <div className="p-4">Loading project...</div>;
  if (!project) return <div className="p-4">Project not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
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

      <div className="flex gap-3 border-b">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 ${activeTab === "members" ? "border-b-2 border-indigo-500 font-semibold" : "text-gray-500"}`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("timesheets")}
          className={`px-4 py-2 ${activeTab === "timesheets" ? "border-b-2 border-indigo-500 font-semibold" : "text-gray-500"}`}
        >
          Timesheets
        </button>
      </div>

      {activeTab === "members" && <MembersTab projectId={project.id} />}
      {activeTab === "timesheets" && (
        <TimesheetsTab
          projectId={project.id}
          projectName={project.name}
          projectIcon={project.icon_url}
        />
      )}
    </div>
  );
}

