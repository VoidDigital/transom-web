import { Tag } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

interface TagsPanelProps {
  onSelectTag: (tagId: string) => void;
}

export default function TagsPanel({ onSelectTag }: TagsPanelProps) {
  const { allNotes } = useNotes();

  // Extract unique tags from thoughts that have them
  const tags = allNotes
    .flatMap(note => note.tags)
    .filter(tag => tag && tag.trim() !== "")
    .reduce((acc: { id: string; name: string; thoughtCount: number }[], tagId) => {
      const existingTag = acc.find(t => t.id === tagId);
      if (existingTag) {
        existingTag.thoughtCount++;
      } else {
        acc.push({
          id: tagId,
          name: tagId, // Use tagId as name for now
          thoughtCount: 1
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.thoughtCount - a.thoughtCount); // Sort by thought count descending

  return (
    <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tags</h2>
            <p className="text-sm text-slate-500">{tags.length} tags</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No tags yet</p>
            <p className="text-sm">
              Tags will appear here when thoughts are tagged
            </p>
          </div>
        ) : (
          tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.id)}
              className="group w-full h-16 px-4 lg:px-6 text-left border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between h-full min-w-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">
                    {tag.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {tag.thoughtCount} {tag.thoughtCount === 1 ? 'thought' : 'thoughts'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Tag className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}