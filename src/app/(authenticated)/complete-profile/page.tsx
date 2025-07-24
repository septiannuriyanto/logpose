'use client';

import { useState } from 'react';
import { useAuth } from '../authContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CompleteProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
    });

    if (error) {
      alert('Gagal menyimpan profil: ' + error.message);
    } else {
       await refreshProfile(); 
      router.push('/dashboard'); // atau ke mana pun setelah complete
    }

    setLoading(false);
  };

  return (
    <div className="p-8 gap-4">
      <h1 className="text-xl font-bold mb-4">Lengkapi Profil</h1>
      <input
        type="text"
        placeholder="Nama depan"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="mb-2 p-2 border"
      />
      <input
        type="text"
        placeholder="Nama belakang"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="mb-4 p-2 border"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Menyimpan...' : 'Simpan Profil'}
      </button>
    </div>
  );
}
