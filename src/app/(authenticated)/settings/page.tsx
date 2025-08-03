'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Profile {
  id: string
  full_name: string
  email: string
  image_url: string | null
  banner_url: string | null
  bio: string | null
  created_at: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    ; (async () => {
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession()

      if (sessionErr || !session || !session.user?.id) {
        setError('You must be signed in to view your profile.')
        return
      }

      const { data, error: profErr } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          bio,
          image_url,
          banner_url,
          created_at
        `)
        .eq('id', session.user.id)
        .maybeSingle()

      if (profErr) {
        setError(profErr.message)
      } else if (data) {
        setProfile(data)
        setFullName(data.full_name)
        setBio(data.bio ?? '')
      }
    })()
  }, [supabase])

  const update = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setError(null)
    setSuccess('')

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), bio: bio.trim() || null })
      .eq('id', profile.id)

    if (updErr) {
      setError(updErr.message)
    } else {
      setSuccess('Saved successfully.')
      setEditing(false)
      setProfile(prev => (prev ? { ...prev, full_name: fullName.trim(), bio: bio.trim() || null } : prev))
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile && !error) {
    return <div className="p-6">Loading…</div>
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 mt-10 rounded-xl shadow-sm space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      {error && (
        <div
          role="alert"
          className="flex items-start bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md"
        >
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md"
        >
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="flex items-center space-x-5">
        {profile?.image_url && (
          <img
            src={profile.image_url}
            alt="Profile"
            className="w-20 h-20 rounded-lg object-cover border"
          />
        )}
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email:
            </label>
            <p className="text-gray-800 text-sm">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Member since:
            </label>
            <p className="text-gray-800 text-sm">
              {new Date(profile!.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {profile?.banner_url && (
        <img
          src={profile.banner_url}
          alt="Banner"
          className="w-full h-36 rounded-lg object-cover"
        />
      )}

      <form onSubmit={update} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Name
          </label>
          {editing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
            />
          ) : (
            <p className="text-sm text-gray-800">{profile?.full_name || "—"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Biography
          </label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
              rows={3}
            />
          ) : (
            <p className="text-sm text-gray-700">
              {profile?.bio || <span className="italic text-gray-400">No bio set</span>}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                key="save-btn"
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                disabled={fullName.trim().length === 0}
              >
                Save
              </button>
              <button
                key="cancel-btn"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFullName(profile?.full_name ?? '');
                  setBio(profile?.bio ?? '');
                  setError(null);
                  setSuccess('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              key="edit-btn"
              type="button"
              onClick={() => {
                setEditing(true);
                setError(null);
                setSuccess('');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>

      <button
        onClick={signOut}
        className="block w-full text-center text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Sign out
      </button>
    </div>
  )
}
