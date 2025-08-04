'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useCallback, useRef, useState } from 'react'
import DialogModal from '../DialogModal'

export type InviteMemberModalProps = {
  open: boolean
  user: User | null
  projectId: string
  onClose: () => void
}

export default function InviteMemberModal({
  open,
  user,
  projectId,
  onClose,
}: InviteMemberModalProps) {
  const supabase = createClient()
  const formRef = useRef<HTMLFormElement>(null);

  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null)
    if (!email.trim()) {
      setError('Please enter an email')
      return
    }
    setBusy(true)

    const { data: emailData, error: emailError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (emailError) throw emailError;

    if (emailData === null) {
      setError('Please enter a valid email')
      setBusy(false)
      return;
    }

    const { error } = await supabase.from("invites").insert({
      project_id: projectId,
      user_id: emailData?.id,
      invited_by: user?.id,
      status: "pending"
    });

    setBusy(false)
    if (error) {
      setError(error.message || 'Invite failed')
    } else {
      setEmail('')
      onClose?.()
    }
  }, [supabase, projectId, email])

  const reset = () => {
    setEmail('')
    onClose?.()
  }

  return (
    <DialogModal title='Invite a Member' open={open} onClose={onClose} isLoading={busy}>
      <form ref={formRef} onSubmit={handleSend} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoComplete="off"
            className="mt-2 w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 focus:outline-none"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="reset"
            onClick={reset}
            disabled={busy}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!email.trim() || busy}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {busy ? 'Inviting…' : 'Send Invite'}
          </button>
        </div>
      </form>
    </DialogModal>
  )
}
