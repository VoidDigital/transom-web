import { useState } from 'react';
import { Tag, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotes } from '@/hooks/useNotes';
import { format } from 'date-fns';

interface TagsPanelProps {
  onSelectTag: (tagId: string) => void;
}

export default function TagsPanel({ onSelectTag }: TagsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  
  const { tags, createTag, notes } = useNotes();

  // Filter for regular tags (isPiece: false)
  const regularTags = tags.filter(tag => tag.isPiece === false);
  
  const filteredTags = regularTags.filter(tag => {
    if (!searchQuery) return true;
    return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Count thoughts per tag
  const getThoughtCount = (tagId: string) => {
    return notes.filter(note => note.tags.includes(tagId) && !note.isArchived).length;
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      await createTag(newTagName.trim());
      setNewTagName('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const getTagColor = (tagName: string) => {
    // Generate consistent colors based on tag name
    const colors = [
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    ];
    const hash = tagName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Tags</h2>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                    Create Tag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {filteredTags.length} {filteredTags.length === 1 ? 'tag' : 'tags'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {searchQuery ? 'No tags found' : 'No tags yet'}
            </p>
            <p className="text-sm mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create tags to categorize and organize your thoughts'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Tag
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-3">
              {filteredTags.map(tag => {
                const thoughtCount = getThoughtCount(tag.id);
                
                return (
                  <div
                    key={tag.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
                    onClick={() => onSelectTag(tag.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.name)}`}>
                          <Tag className="h-3 w-3 inline mr-1" />
                          {tag.name}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {thoughtCount} {thoughtCount === 1 ? 'thought' : 'thoughts'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Edit tag functionality
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Delete tag functionality
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                      Created {format(new Date(tag.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}