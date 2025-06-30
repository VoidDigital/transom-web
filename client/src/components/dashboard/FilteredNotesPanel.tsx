import { ChevronLeft } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@shared/schema';
import { HtmlContent } from '@/components/ui/html-content';

interface FilteredNotesPanelProps {
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  filterType: 'project' | 'tag';
  filterId: string;
  filterName: string;
  onBack: () => void;
}

export default function FilteredNotesPanel({ 
  onSelectNote, 
  onCreateNote, 
  filterType, 
  filterId, 
  filterName,
  onBack 
}: FilteredNotesPanelProps) {
  const { allNotes } = useNotes();

  // Filter notes based on the selected project or tag
  const filteredNotes = allNotes
    .filter(note => !note.isArchived) // Only show non-archived notes
    .filter(note => note.tags.includes(filterId))
    .sort((a, b) => {
      const aTime = a.updatedAt?.getTime() || a.createdAt?.getTime() || 0;
      const bTime = b.updatedAt?.getTime() || b.createdAt?.getTime() || 0;
      return bTime - aTime; // Most recently updated first
    });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">{filterName}</h2>
            <p className="text-sm text-slate-500">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'thought' : 'thoughts'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No thoughts found</p>
            <p className="text-sm">
              No thoughts are tagged with "{filterName}" yet.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="group w-full px-4 lg:px-6 text-left border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="py-4 min-h-[80px] flex flex-col justify-center">
                <div 
                  className="text-slate-700 text-sm leading-relaxed break-words line-clamp-3"
                  style={{ 
                    height: '65px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  <HtmlContent content={note.content} />
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  {formatTimeAgo(note.updatedAt || note.createdAt)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}