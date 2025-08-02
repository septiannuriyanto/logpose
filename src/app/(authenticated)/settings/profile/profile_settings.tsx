"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { User, Pencil, Camera } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  image_url: string | null;
  banner_url: string | null;
  bio: string | null;
}

export default function ProfileSettings() {
  const supabase = createClient();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [hoverBio, setHoverBio] = useState(false);
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [hoverBanner, setHoverBanner] = useState(false);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [uploadingField, setUploadingField] = useState<null | "image_url" | "banner_url">(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, image_url, banner_url, bio")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setNewBio(data?.bio || "");
    };
    fetchProfile();
  }, [user]);

  const handleSaveBio = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({ bio: newBio }).eq("id", profile.id);
    setProfile((prev) => (prev ? { ...prev, bio: newBio } : prev));
    setIsEditingBio(false);
  };

  const handleUpload = async (file: File, field: "image_url" | "banner_url") => {
    if (!user || !file) return;
    setUploadingField(field);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const filename = field === "image_url" ? `avatar.${ext}` : `banner.${ext}`;
      const path = `${user.id}/${filename}`;

      const { error } = await supabase.storage
        .from("profile-assets")
        .upload(path, file, { upsert: true });

      if (error) {
        alert("Upload failed: " + error.message);
        return;
      }

      const { data } = supabase.storage.from("profile-assets").getPublicUrl(path);
      await supabase.from("profiles").update({ [field]: data.publicUrl }).eq("id", user.id);
      setProfile((prev) => (prev ? { ...prev, [field]: data.publicUrl } : prev));
    } finally {
      setTimeout(() => setUploadingField(null), 400); // fade-out spinner
    }
  };

  if (!profile) {
    return <div className="p-6 text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="p-6">
      <div className="border border-gray-300/50 rounded-xl bg-white shadow-sm overflow-hidden min-h-[80vh] flex flex-col">
        
        {/* 🔹 Banner */}
        <div
          className="relative h-48 bg-gradient-to-r from-indigo-100 to-purple-100 group"
          onMouseEnter={() => setHoverBanner(true)}
          onMouseLeave={() => setHoverBanner(false)}
        >
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt="Banner"
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-100 to-purple-200" />
          )}

          {/* Spinner overlay Banner */}
          {uploadingField === "banner_url" && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40">
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"></path>
              </svg>
            </div>
          )}

          {hoverBanner && uploadingField !== "banner_url" && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30">
              <button
                className="p-2 rounded-full bg-white/80 hover:bg-white transition"
                onClick={() => bannerInputRef.current?.click()}
              >
                <Camera className="w-5 h-5 text-gray-700" />
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "banner_url");
                }}
              />
            </div>
          )}

          {/* 🔹 Avatar */}
          <div
            className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 group"
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
          >
            <div className="relative w-32 h-32 z-50">
              {profile.image_url ? (
                <img
                  src={profile.image_url}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover bg-gray-100 transition-opacity duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  <User className="w-14 h-14 text-gray-500" />
                </div>
              )}

              {/* Spinner overlay Avatar */}
              {uploadingField === "image_url" && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center z-50">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"></path>
                  </svg>
                </div>
              )}

              {hoverAvatar && uploadingField !== "image_url" && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center z-40">
                  <button
                    className="p-2 rounded-full bg-white/80 hover:bg-white transition"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5 text-gray-700" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "image_url");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 Profile Info */}
        <div className="pt-24 pb-8 px-6 text-center flex-1">
          <h2 className="text-2xl font-bold">{profile.full_name || "No Name"}</h2>
          <p className="text-gray-500 text-sm mt-1">{profile.email || "No Email"}</p>

          {/* 🔹 Bio dengan edit */}
          <div
            className="mt-4 flex items-center justify-center gap-2 group"
            onMouseEnter={() => setHoverBio(true)}
            onMouseLeave={() => setHoverBio(false)}
          >
            {profile.bio ? (
              <p className="text-gray-700 text-base">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">No bio yet</p>
            )}
            {hoverBio && (
              <button
                className="p-1 rounded-full hover:bg-gray-100 transition"
                onClick={() => setIsEditingBio(true)}
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Modal Edit Bio */}
      {isEditingBio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Bio</h3>
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsEditingBio(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBio}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
