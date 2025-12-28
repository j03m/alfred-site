import React from 'react';
import ReactMarkdown from 'react-markdown';

interface CommentarySectionProps {
  content: string;
}

export default function CommentarySection({ content }: CommentarySectionProps) {
  if (!content) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 italic">
            No commentary available for this month.
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Manager Commentary</h3>
      <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
