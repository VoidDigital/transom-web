import { ChevronLeft } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@shared/schema';
import { HtmlContent } from '@/components/ui/html-content';
import { Badge } from '@/components/ui/badge';

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
  const { allNotes, getTagsForNote } = useNotes();

  // Filter notes based on the selected project or tag using tagNames field
  const filteredNotes = allNotes
    .filter(note => !note.isArchived) // Only show non-archived notes
    .filter(note => {
      // Check if the tag name exists in the tilde-separated tagNames field
      const tagNames = note.tagNames || '';
      const tagList = tagNames.split('~').filter(tag => tag.trim() !== '');
      return tagList.includes(filterName);
    })
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
          <div className="p-8 text-center">
            <p className="text-slate-500 mb-4">No thoughts found</p>
            <p className="text-sm text-slate-400">
              No thoughts are tagged with "{filterName}" yet.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="group w-full h-20 px-4 lg:px-6 text-left border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between h-full min-w-0">
                <div className="flex-1 text-sm text-slate-600 mr-4 min-w-0 flex items-center">
                  <div className="w-full line-clamp-3 break-words leading-relaxed">
                    <HtmlContent 
                      content={note.content.trim()}
                      className="[&>*]:text-sm [&>*]:text-slate-600 [&>*]:break-words [&>*]:leading-relaxed [&>*]:m-0"
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                  {formatTimeAgo(note.updatedAt || note.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {getTagsForNote(note).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}