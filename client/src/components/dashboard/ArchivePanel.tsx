import { useState } from 'react';
import { Archive, Trash2, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HtmlContent } from '@/components/ui/html-content';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@shared/schema';
import { format } from 'date-fns';

interface ArchivePanelProps {
  onSelectNote: (note: Note) => void;
}

export default function ArchivePanel({ onSelectNote }: ArchivePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { allNotes, loading, updateNote, deleteNote } = useNotes();

  // Get archived notes from the main notes hook
  const archivedNotes = allNotes.filter(note => note.isArchived);

  const filteredNotes = archivedNotes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return note.content.toLowerCase().includes(query);
  });

  const handleUnarchive = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateNote(noteId, { isArchived: false });
    } catch (error) {
      console.error('Error unarchiving note:', error);
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this thought?')) {
      return;
    }
    try {
      await deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col h-full">
        <div className="p-4 lg:p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Archive</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading archived thoughts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Archive</h2>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search archived thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {archivedNotes.length} {archivedNotes.length === 1 ? 'thought' : 'thoughts'} archived
          {searchQuery && ` (${filteredNotes.length} shown)`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {searchQuery ? 'No archived thoughts found' : 'No archived thoughts'}
            </p>
            <p className="text-sm">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Archived thoughts will appear here when you archive them'
              }
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {format(new Date(note.updatedAt), 'MMM dd')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleUnarchive(note.id, e)}
                      className="h-6 w-6 p-0"
                      title="Unarchive thought"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDelete(note.id, e)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}