import { Tag } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

interface TagsPanelProps {
  onSelectTag: (tagId: string) => void;
}

export default function TagsPanel({ onSelectTag }: TagsPanelProps) {
  const { notes } = useNotes();

  return (
    <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tags</h2>
            <p className="text-sm text-slate-500">0 tags</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 text-center text-gray-500">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Tags Coming Soon</p>
          <p className="text-sm mb-4">
            Tag organization will be available when the iOS app adds tag support.
            For now, all thoughts are stored together.
          </p>
          <p className="text-xs text-gray-400">
            Total thoughts: {notes.filter(note => !note.isArchived).length}
          </p>
        </div>
      </div>
    </div>
  );
}