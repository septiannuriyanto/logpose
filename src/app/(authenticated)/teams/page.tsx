'use client';
import React from 'react';

interface TeamMember {
  name: string;
  role: string;
  children?: TeamMember[];
}

const teamHierarchy: TeamMember = {
  name: 'Arif Nugroho',
  role: 'Engineering Manager',
  children: [
    {
      name: 'Sari Aulia',
      role: 'Frontend Lead',
      children: [
        { name: 'Rina Putri', role: 'Frontend Developer' },
        { name: 'Andi Mahendra', role: 'Frontend Intern' },
      ],
    },
    {
      name: 'Bagus Pratama',
      role: 'Backend Lead',
      children: [
        { name: 'Dinda Yuliani', role: 'Backend Developer' },
      ],
    },
  ],
};

function MemberNode({ member }: { member: TeamMember }) {
  return (
    <div className="ml-6 mt-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-4 py-3 border-l-4 border-indigo-500">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
      </div>

      {member.children && (
        <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-4 mt-4 space-y-2">
          {member.children.map((child, idx) => (
            <MemberNode key={idx} member={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <main className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Team Hierarchy</h1>
        <MemberNode member={teamHierarchy} />
      </div>
    </main>
  );
}
