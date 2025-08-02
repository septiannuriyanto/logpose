// pages/settings.tsx (atau sesuai foldermu)

import ProfileSettings from "./profile/profile_settings";

export default function SettingsPage() {
  return (
    <main className="p-6 space-y-6">

      <ProfileSettings />
      {/* nanti bisa tambah komponen settings lain di sini */}
    </main>
  );
}
