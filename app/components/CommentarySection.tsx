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
      <div className="max-w-none">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-slate-900 mt-8 mb-4 border-b pb-2 border-slate-200" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 border-b pb-2 border-slate-100" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3" {...props} />,
            p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-6" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-6 space-y-3 text-slate-600" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-6 space-y-3 text-slate-600" {...props} />,
            li: ({node, ...props}) => <li className="pl-2" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-200 pl-4 italic my-6 text-slate-700" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
