import { formatDistanceToNow } from "date-fns";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HtmlContent } from "@/components/ui/html-content";
import { Note } from "@shared/schema";
import { ArrowUpDown, Filter, X } from "lucide-react";

interface NotesPanelProps {
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
}

export default function NotesPanel({ onSelectNote, onCreateNote }: NotesPanelProps) {
  const { 
    allNotes: notes, 
    selectedNote, 
    tags, 
    activeTagFilters, 
    getTagsForNote, 
    addTagFilter, 
    removeTagFilter 
  } = useNotes(); // Remove project filtering to show all thoughts

  const getPreviewText = (content: string) => {
    // For HTML content, extract plain text for preview
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "just now";
    } else if (diffMinutes < 60) {
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }
  };

  // Filter out archived thoughts and sort by updatedAt (most recent first)
  const activeNotes = notes
    .filter(note => !note.isArchived)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const availableTags = tags.filter(tag => 
    !activeTagFilters.includes(tag.id) &&
    activeNotes.some(note => note.tags.includes(tag.id))
  );

  return (
    <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Thoughts
            </h2>
            <p className="text-sm text-slate-500">
              {activeNotes.length} thoughts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2">
          {activeTagFilters.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <Badge key={tagId} variant="default" className="text-xs">
                {tag.name}
                <button
                  onClick={() => removeTagFilter(tagId)}
                  className="ml-1.5 hover:text-primary-foreground/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          
          {availableTags.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addTagFilter(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs px-2 py-1 border border-dashed border-slate-300 rounded-full bg-transparent"
              defaultValue=""
            >
              <option value="">Add filter</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {activeNotes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 mb-4">No thoughts yet</p>
            <Button onClick={onCreateNote} size="sm">
              Create your first thought
            </Button>
          </div>
        ) : (
          activeNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`group w-full p-4 lg:p-6 text-left border-b border-slate-100 transition-colors duration-150 ${
                selectedNote?.id === note.id
                  ? "bg-primary/5 border-l-4 border-l-primary"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3 min-w-0">
                <div className="flex-1 text-sm text-slate-600 mr-4 min-w-0">
                  <div className="relative max-h-[60px] overflow-hidden break-words leading-relaxed">
                    <HtmlContent 
                      content={note.content}
                      className="[&>*]:text-sm [&>*]:text-slate-600 [&>*]:break-words [&>*]:leading-relaxed [&>*]:m-0"
                    />
                    <div className={`absolute bottom-0 left-0 right-0 h-6 pointer-events-none transition-colors duration-150 ${
                      selectedNote?.id === note.id
                        ? "bg-gradient-to-t from-primary/5 to-transparent"
                        : "bg-gradient-to-t from-white to-transparent group-hover:from-slate-50"
                    }`}></div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                  {formatTimeAgo(note.updatedAt)}
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
