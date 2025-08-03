"use client";

import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Project Header */}
      <div className="flex items-center gap-5 mb-8">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-white cursor-pointer overflow-hidden group"
        >
          {project.icon_url ? (
            <img
              src={project.icon_url}
              alt={`${project.name} icon`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{project.name?.charAt(0).toUpperCase()}</span>
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

          {/* Hover overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-80 bg-black/50 flex items-center justify-center transition-opacity">
            <Camera className="w-6 h-6 text-white" aria-hidden />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <p className="text-gray-700 mt-1">{project.description || "No description"}</p>
          <p className="text-sm text-gray-500 mt-2">
            Created at {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {(["members", "timesheets"] as const).map((tabKey) => {
          const label = tabKey[0].toUpperCase() + tabKey.slice(1);
          const active = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`
            pb-2 text-base font-medium focus:outline-none
            ${active
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-700"}
          `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
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

