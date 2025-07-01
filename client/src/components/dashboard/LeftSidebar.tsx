import { StickyNote, Folder, Tag, Archive, Settings, PenTool, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';

interface LeftSidebarProps {
  currentView: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences';
  onViewChange: (view: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences') => void;
  onCreateThought: () => void;
  selectedProjectId?: string | null;
  selectedTagId?: string | null;
}

export default function LeftSidebar({ currentView, onViewChange, onCreateThought, selectedProjectId, selectedTagId }: LeftSidebarProps) {
  const { user, signOut } = useAuth();
  const { allNotes, tags } = useNotes();

  // Calculate counts for each section
  const activeNotes = allNotes.filter(note => !note.isArchived);
  const thoughtsCount = activeNotes.length;
  
  // Projects are tags with isPiece=true
  const projectsCount = tags.filter(tag => tag.isPiece === true).length;
  
  // Regular tags (not projects)
  const tagsCount = tags.filter(tag => tag.isPiece !== true).length;
  
  const archiveCount = allNotes.filter(note => note.isArchived).length;

  const navigationItems = [
    {
      id: 'thoughts' as const,
      icon: StickyNote,
      label: 'Thoughts',
      count: thoughtsCount
    },
    {
      id: 'projects' as const,
      icon: Folder,
      label: 'Projects',
      count: projectsCount
    },
    {
      id: 'tags' as const,
      icon: Tag,
      label: 'Tags',
      count: tagsCount
    },
    {
      id: 'archive' as const,
      icon: Archive,
      label: 'Archive',
      count: archiveCount
    }
  ];

  const accountItem = {
    id: 'preferences' as const,
    icon: Settings,
    label: 'Account Settings',
    count: null
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <PenTool className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Transom</h1>
        </div>
        
        <Button 
          onClick={onCreateThought} 
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Thought
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col">
        {/* Main Navigation Items */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            
            // Determine if this item should be highlighted
            let isActive = currentView === item.id;
            
            // Override highlighting for filtered views
            if (currentView === 'thoughts') {
              if (selectedProjectId && item.id === 'projects') {
                isActive = true; // Highlight Projects when filtering by project
              } else if (selectedTagId && item.id === 'tags') {
                isActive = true; // Highlight Tags when filtering by tag
              } else if ((selectedProjectId || selectedTagId) && item.id === 'thoughts') {
                isActive = false; // Don't highlight Thoughts when filtering
              }
            }
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                    {item.label}
                  </p>
                </div>
                {item.count !== null && (
                  <span className="text-xs" style={{ color: '#c0c0c0' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Account Settings - Separated at bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
          {(() => {
            const Icon = accountItem.icon;
            const isActive = currentView === accountItem.id;
            
            return (
              <button
                onClick={() => onViewChange(accountItem.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                    {accountItem.label}
                  </p>
                </div>
              </button>
            );
          })()}
        </div>
      </nav>
    </div>
  );
}