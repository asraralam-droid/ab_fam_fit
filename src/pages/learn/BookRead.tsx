import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
const DUMMY_PDF =
'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const bookMeta: Record<
  string,
  {
    title: string;
  }> =
{
  'book-1': {
    title: 'Authentic Foundation'
  },
  'book-2': {
    title: 'The Practice'
  },
  'book-3': {
    title: 'Maintaining the Lifestyle'
  }
};
export function BookRead() {
  const navigate = useNavigate();
  const { id } = useParams();
  const title = id && bookMeta[id]?.title || 'JAB Book';
  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-surface z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center flex-1 px-2 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Reading
          </span>
          <h1 className="text-sm font-bold text-text truncate max-w-full">
            {title}
          </h1>
        </div>
        <a
          href={DUMMY_PDF}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => toast.success('Opening PDF in new tab')}
          className="p-2 -mr-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <Download className="w-5 h-5" />
        </a>
      </div>

      <div className="flex-1 bg-surface-2 overflow-hidden">
        <iframe
          src={`${DUMMY_PDF}#toolbar=0&navpanes=0&view=FitH`}
          title={title}
          className="w-full h-full border-0 bg-white" />
        
      </div>
    </div>);

}