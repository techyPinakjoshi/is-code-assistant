import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResponseDisplayProps {
  isLoading: boolean;
  error: string | null;
  response: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ isLoading, error, response }) => {
  if (isLoading) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="h-2 bg-slate-200 rounded w-4/6"></div>
            </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700">
        <h3 className="font-bold mb-2">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-200">
      <ReactMarkdown
        children={response}
        remarkPlugins={[remarkGfm]}
        components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3 border-b pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 my-4 pl-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 my-4 pl-4" {...props} />,
            p: ({node, ...props}) => <p className="leading-relaxed my-4" {...props} />,
            code: ({node, inline, ...props}) => inline ? 
              <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm" {...props} /> :
              <pre className="bg-slate-800 text-white p-4 rounded-md my-4 overflow-x-auto"><code {...props} /></pre>,
            table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-sm border-collapse border border-slate-300" {...props} /></div>,
            thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
            th: ({node, ...props}) => <th className="border border-slate-300 px-4 py-2 text-left font-semibold" {...props} />,
            td: ({node, ...props}) => <td className="border border-slate-300 px-4 py-2" {...props} />,
        }}
      />
    </div>
  );
};

export default ResponseDisplay;