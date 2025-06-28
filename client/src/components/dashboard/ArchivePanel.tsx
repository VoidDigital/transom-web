import { useState } from 'react';
import { Archive, Trash2, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useArchivedNotes } from '@/hooks/useArchivedNotes';
import { useProjects } from '@/hooks/useProjects';
import { Note } from '@shared/schema';
import { format } from 'date-fns';

interface ArchivePanelProps {
  onSelectNote: (note: Note) => void;
}

export default function ArchivePanel({ onSelectNote }: ArchivePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { archivedNotes, loading, unarchiveNote, deleteNote } = useArchivedNotes();
  const { projects } = useProjects();

  const filteredNotes = archivedNotes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return note.content.toLowerCase().includes(query);
  });

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const handleUnarchive = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unarchiveNote(noteId);
    } catch (error) {
      console.error('Error unarchiving thought:', error);
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this thought? This action cannot be undone.')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Error deleting thought:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-gray-500">Loading archived thoughts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Archive className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Archived Thoughts</h2>
          <Badge variant="secondary" className="ml-auto">
            {archivedNotes.length}
          </Badge>
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
          {filteredNotes.length} {filteredNotes.length === 1 ? 'thought' : 'thoughts'} archived
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
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
                onClick={() => onSelectNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 flex-1 mr-2">
                    {note.content.slice(0, 50) || 'Empty thought'}
                  </h3>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleUnarchive(note.id, e)}
                      className="h-8 w-8 p-0"
                      title="Unarchive thought"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDelete(note.id, e)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {note.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{getProjectName(note.projectId)}</span>
                  <span>Archived {format(new Date(note.updatedAt), 'MMM dd, yyyy')}</span>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tagId, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tagId}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}