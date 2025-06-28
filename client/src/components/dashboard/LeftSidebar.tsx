import { StickyNote, Folder, Tag, Archive, Settings, PenTool, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface LeftSidebarProps {
  currentView: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences';
  onViewChange: (view: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences') => void;
  onCreateThought: () => void;
}

export default function LeftSidebar({ currentView, onViewChange, onCreateThought }: LeftSidebarProps) {
  const { user } = useAuth();

  const navigationItems = [
    {
      id: 'thoughts' as const,
      icon: StickyNote,
      label: 'Thoughts',
      description: 'All your notes and ideas'
    },
    {
      id: 'projects' as const,
      icon: Folder,
      label: 'Projects',
      description: 'Project-based organization'
    },
    {
      id: 'tags' as const,
      icon: Tag,
      label: 'Tags',
      description: 'Categorize your thoughts'
    },
    {
      id: 'archive' as const,
      icon: Archive,
      label: 'Archive',
      description: 'Archived thoughts'
    },
    {
      id: 'preferences' as const,
      icon: Settings,
      label: 'Preferences',
      description: 'Settings and account'
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
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
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
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
                  <p className={`text-xs ${
                    isActive 
                      ? 'text-primary/70' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}