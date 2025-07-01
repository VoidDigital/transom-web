import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import LeftSidebar from "@/components/dashboard/LeftSidebar";
import NotesPanel from "@/components/dashboard/NotesPanel";
import NoteEditor from "@/components/dashboard/NoteEditor";
import ProjectsPanel from "@/components/dashboard/ProjectsPanel";
import TagsPanel from "@/components/dashboard/TagsPanel";
import ArchivePanel from "@/components/dashboard/ArchivePanel";
import PreferencesPanel from "@/components/dashboard/PreferencesPanel";
import FilteredNotesPanel from "@/components/dashboard/FilteredNotesPanel";
import MobileNavigation from "@/components/dashboard/MobileNavigation";
import { Loading } from "@/components/ui/loading";
import { Note, InsertNote } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { createNote, selectedNote, setSelectedNote } = useNotes();
  const { selectedProject } = useProjects();
  
  const [currentView, setCurrentView] = useState<'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences'>('thoughts');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedFilterName, setSelectedFilterName] = useState<string>('');

  const handleCreateThought = async () => {
    if (!user) return;

    try {
      const newNoteData: InsertNote = {
        content: "",
        userId: user.id,
        projectId: selectedProject?.id || "",
        tags: [],
      };

      const newNote = await createNote(newNoteData);
      setSelectedNote(newNote);
      setShowEditor(true);
    } catch (error) {
      console.error("Error creating thought:", error);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleBackToNotes = () => {
    setShowEditor(false);
    setSelectedNote(null);
  };

  const handleSelectProject = (projectId: string, projectName?: string) => {
    console.log("Selected project:", projectId);
    setSelectedProjectId(projectId);
    setSelectedTagId(null); // Clear tag selection
    setSelectedFilterName(projectName || projectId);
    setCurrentView('thoughts'); // Switch to thoughts view to show filtered results
  };

  const handleSelectTag = (tagId: string, tagName?: string) => {
    console.log("Selected tag:", tagId);
    setSelectedTagId(tagId);
    setSelectedProjectId(null); // Clear project selection
    setSelectedFilterName(tagName || tagId);
    setCurrentView('thoughts'); // Switch to thoughts view to show filtered results
  };

  const handleViewChange = (view: 'thoughts' | 'projects' | 'tags' | 'archive' | 'preferences') => {
    setCurrentView(view);
    
    // Always close editor and clear selected note when navigating to top-level sections
    setShowEditor(false);
    setSelectedNote(null);
    
    // Clear filters when switching to non-thoughts views
    if (view !== 'thoughts') {
      setSelectedProjectId(null);
      setSelectedTagId(null);
      setSelectedFilterName('');
    }
  };

  const handleBackFromFilter = () => {
    setSelectedProjectId(null);
    setSelectedTagId(null);
    setSelectedFilterName('');
    // Stay in thoughts view but show all thoughts
  };



  if (!user) {
    return <Loading message="Loading your workspace..." />;
  }

  // Force desktop layout for now to test left sidebar
  // TODO: Re-enable mobile detection later

  // Desktop two-panel layout
  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden flex bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <LeftSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onCreateThought={handleCreateThought}
        selectedProjectId={selectedProjectId}
        selectedTagId={selectedTagId}
      />
      
      {/* Right Panel */}
      <div className="flex-1 flex ml-64">
        {showEditor && selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onBack={handleBackToNotes}
          />
        ) : (
          <div className="flex-1 bg-white dark:bg-gray-900">
            {currentView === 'thoughts' && selectedProjectId && (
              <FilteredNotesPanel
                onSelectNote={handleSelectNote}
                onCreateNote={handleCreateThought}
                filterType="project"
                filterId={selectedProjectId}
                filterName={selectedFilterName}
                onBack={handleBackFromFilter}
              />
            )}
            {currentView === 'thoughts' && selectedTagId && (
              <FilteredNotesPanel
                onSelectNote={handleSelectNote}
                onCreateNote={handleCreateThought}
                filterType="tag"
                filterId={selectedTagId}
                filterName={selectedFilterName}
                onBack={handleBackFromFilter}
              />
            )}
            {currentView === 'thoughts' && !selectedProjectId && !selectedTagId && (
              <NotesPanel
                onSelectNote={handleSelectNote}
                onCreateNote={handleCreateThought}
              />
            )}
            {currentView === 'projects' && (
              <ProjectsPanel onSelectProject={handleSelectProject} />
            )}
            {currentView === 'tags' && (
              <TagsPanel onSelectTag={handleSelectTag} />
            )}
            {currentView === 'archive' && (
              <ArchivePanel onSelectNote={handleSelectNote} />
            )}
            {currentView === 'preferences' && (
              <PreferencesPanel />
            )}
          </div>
        )}
      </div>
    </div>
  );
}