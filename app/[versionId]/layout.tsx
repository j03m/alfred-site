import React from 'react';
import { getRegistry } from '@/lib/api';
import VersionSelector from '@/app/components/VersionSelector';
import { notFound } from 'next/navigation';

// Tell Next.js which versions to build statically
export async function generateStaticParams() {
  const registry = await getRegistry();
  return Object.keys(registry.versions).map((versionId) => ({
    versionId,
  }));
}

export default async function VersionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const registry = await getRegistry();
  const versions = Object.values(registry.versions);
  const activeVersion = registry.versions[versionId];

  if (!activeVersion) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Global Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
               <span className="text-white font-bold text-lg">A</span>
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  Alfred
                </h1>
                {activeVersion && (
                  <span className="text-xs text-slate-500 font-medium">
                    {activeVersion.model_type}
                  </span>
                )}
             </div>
          </div>

          <div>
            <VersionSelector activeVersionId={versionId} versions={versions} />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
