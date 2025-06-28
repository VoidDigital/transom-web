import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PenTool, StickyNote, Folder, Search, User, Archive } from "lucide-react";

interface MobileNavigationProps {
  currentView: 'notes' | 'projects' | 'search' | 'archive' | 'profile';
  onViewChange: (view: 'notes' | 'projects' | 'search' | 'archive' | 'profile') => void;
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
            onClick={() => onViewChange('notes')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'notes' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <StickyNote className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Notes</span>
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
            onClick={() => onViewChange('search')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'search' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs">Search</span>
          </button>
          <button
            onClick={() => onViewChange('profile')}
            className={`flex flex-col items-center py-2 ${
              currentView === 'profile' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
