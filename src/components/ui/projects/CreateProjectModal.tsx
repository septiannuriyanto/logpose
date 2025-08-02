"use client";

import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";

interface Member {
  user_id: string;
  email: string;
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [inputEmail, setInputEmail] = useState("");
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ✅ Fokus pada input nama ketika modal dibuka
  useEffect(() => {
    if (open && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  // ✅ Tutup modal jika klik di luar konten
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

    // ✅ Tutup modal jika tekan ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);


  // ✅ Reset semua state ketika modal ditutup
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setMembers([]);
      setInputEmail("");
      setSuggestions([]);
      setLoading(false);
    }
  }, [open]);

  // ✅ Auto-suggest dengan debounce
  useEffect(() => {
    if (!open) return;
    if (inputEmail.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", `%${inputEmail}%`)
        .limit(5);

      if (data) {
        setSuggestions(
          data
            .filter((d) => d.id !== user?.id)
            .map((d) => ({ user_id: d.id, email: d.email }))
        );
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputEmail, open]);

  // ✅ Klik luar menutup suggestion
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addMember = (m: Member) => {
    if (!members.find((mem) => mem.user_id === m.user_id)) {
      setMembers([...members, m]);
    }
    setInputEmail("");
    setSuggestions([]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.user_id !== id));
  };

  const handleCreate = async () => {
  if (!name.trim()) return;
  setLoading(true);

  // Buat project dulu
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name,
      description,
      project_creator: user?.id,
    })
    .select()
    .single();

  if (error) {
    setLoading(false);
    alert("Error creating project");
    return;
  }

  // ✅ Upload icon jika ada
  if (iconFile) {
    const ext = iconFile.type === "image/png" ? "png" : "jpg";
    const filePath = `${project.id}/icon.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("project-assets")
      .upload(filePath, iconFile, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("project-assets").getPublicUrl(filePath);
      await supabase.from("projects").update({ icon_url: data.publicUrl }).eq("id", project.id);
    }
  }

  if (members.length > 0) {
    await supabase.from("invites").insert(
      members.map((m) => ({
        project_id: project.id,
        user_id: m.user_id,
        invited_by: user?.id,
        status: "pending",
      }))
    );
  }

  setLoading(false);
  onClose();
  if (onCreated) onCreated();
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4" ref={modalRef}>
        <h2 className="text-xl font-bold">Create New Project</h2>
{/* Project Icon */}
<div>
  <label className="block text-sm font-medium">Project Icon</label>
  <div
    className="mt-1 w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-white text-lg font-bold cursor-pointer overflow-hidden relative"
    onClick={() => fileInputRef.current?.click()}
  >
    {iconFile ? (
      <img src={URL.createObjectURL(iconFile)} alt="Preview" className="w-full h-full object-cover" />
    ) : (
      <span>{name ? name.charAt(0).toUpperCase() : "+"}</span>
    )}
    <input
      type="file"
      ref={fileInputRef}
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) setIconFile(file);
      }}
    />
  </div>
</div>

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium">Project Name</label>
          <input
          ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: Website Redesign"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Invite Members */}
        <div>
          <label className="block text-sm font-medium">Invite Members</label>
          <div className="relative mt-1">
            <input
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Type email to search..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* 🔽 Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-50 max-h-40 overflow-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.user_id}
                    onClick={() => addMember(s)}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                  >
                    {s.email}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected Members */}
          {members.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {members.map((m) => (
                <span
                  key={m.user_id}
                  className="bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1 text-sm"
                >
                  {m.email}
                  <button
                    onClick={() => removeMember(m.user_id)}
                    className="text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating..." : "+ Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
