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
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-8 space-y-6">
      <h1 className="text-3xl font-semibold text-black">My Profile</h1>

      {error && (
        <div
          role="alert"
          className="flex items-start bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg"
        >
          <span className="text-base">{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg"
        >
          <span className="text-base">{success}</span>
        </div>
      )}

      <div className="flex space-x-6 items-center">
        {profile?.image_url && (
          <img
            src={profile.image_url}
            alt="Profile"
            className="w-20 h-20 rounded-md object-cover border"
          />
        )}

        <div className="space-y-2">
          <div>
            <span className="block font-semibold text-black text-base">
              Email:
            </span>
            <div className="text-black">{profile?.email}</div>
          </div>
          <div>
            <span className="block font-semibold text-black text-base">
              Member since:
            </span>
            <div className="text-black">
              {new Date(profile!.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {profile?.banner_url && (
        <img
          src={profile.banner_url}
          alt="Banner"
          className="w-full h-36 rounded-md object-cover mt-4"
        />
      )}

      <form onSubmit={update}>
        <div>
          <label className="block font-semibold text-black text-base">
            Full Name:
          </label>

          {editing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500"
            />
          ) : (
            <div className="mt-1 text-gray-700">{profile?.full_name || '—'}</div>
          )}
        </div>

        <div>
          <label className="block font-semibold text-black text-base">
            Biography:
          </label>

          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500"
              rows={3}
            />
          ) : (
            <div className="mt-1 text-gray-600">
              {profile?.bio || <span className="italic">No bio set</span>}
            </div>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          {editing && (
            <>
              <button
                key="save-btn"
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
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
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
              >
                Cancel
              </button>
            </>
          )}

          {!editing && (
            <button
              key="edit-btn"
              type="button"
              onClick={() => {
                setEditing(true);
                setError(null);
                setSuccess('');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>

      <button
        onClick={signOut}
        className="mt-4 w-full text-center text-red-600 hover:text-red-800"
      >
        Sign out
      </button>
    </div>
  )
}
