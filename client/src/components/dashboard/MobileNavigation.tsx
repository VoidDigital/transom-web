import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PenTool, StickyNote, Folder, Tag, Archive, Settings } from "lucide-react";

interface MobileNavigationProps {
  currentView: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences';
  onViewChange: (view: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences') => void;
  onCreateNote: () => void;
}

export default function MobileNavigation({ 
  currentView, 
  onViewChange, 
  onCreateNote 
}: MobileNavigationProps) {
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <PenTool className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Transom</h1>
          </div>
          <Button onClick={onCreateNote} size="sm">
            <PenTool className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden bg-white border-t border-slate-200 px-6 py-3">
        <div className="flex justify-around">
          <button
            onClick={() => onViewChange('thoughts')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'thoughts' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <StickyNote className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Thoughts</span>
          </button>
          <button
            onClick={() => onViewChange('projects')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'projects' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Folder className="w-5 h-5 mb-1" />
            <span className="text-xs">Projects</span>
          </button>
          <button
            onClick={() => onViewChange('tags')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'tags' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Tag className="w-5 h-5 mb-1" />
            <span className="text-xs">Tags</span>
          </button>
          <button
            onClick={() => onViewChange('archive')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'archive' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Archive className="w-5 h-5 mb-1" />
            <span className="text-xs">Archive</span>
          </button>
          <button
            onClick={() => onViewChange('preferences')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'preferences' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}
