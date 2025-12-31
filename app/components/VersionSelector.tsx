import React from 'react';
import Link from 'next/link';
import { RegistryVersion } from '@/lib/api';
import { ChevronDown } from 'lucide-react';

interface VersionSelectorProps {
  activeVersionId: string;
  versions: RegistryVersion[];
}

export default function VersionSelector({ activeVersionId, versions }: VersionSelectorProps) {
  // Find active version details
  const active = versions.find(v => v.id === activeVersionId);

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors">
        <span className="font-medium text-sm">{active?.name || activeVersionId}</span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {/* Dropdown Menu (Hidden by default, shown on group-hover) */}
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50">
        <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
          Select Version
        </div>
        {versions.map((v) => (
          <Link
            key={v.id}
            href={`/${v.id}`}
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              v.id === activeVersionId 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="font-medium">{v.name}</div>
            <div className="text-xs opacity-75 truncate">{v.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
