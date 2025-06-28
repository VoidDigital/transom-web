import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useNotes } from "@/hooks/useNotes";
import Sidebar from "@/components/dashboard/Sidebar";
import NotesPanel from "@/components/dashboard/NotesPanel";
import NoteEditor from "@/components/dashboard/NoteEditor";
import MobileNavigation from "@/components/dashboard/MobileNavigation";
import { Loading } from "@/components/ui/loading";
import { Note, InsertNote } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedProject } = useProjects();
  const { createNote, selectedNote, setSelectedNote } = useNotes(selectedProject?.id);
  
  const [mobileView, setMobileView] = useState<'notes' | 'projects' | 'search' | 'profile'>('notes');
  const [showEditor, setShowEditor] = useState(false);

  const handleCreateNote = async () => {
    if (!selectedProject || !user) return;

    try {
      const newNoteData: InsertNote = {
        title: "Untitled Note",
        content: "",
        projectId: selectedProject.id,
        tags: [],
      };

      const newNote = await createNote(newNoteData);
      setSelectedNote(newNote);
      setShowEditor(true);
    } catch (error) {
      console.error("Error creating note:", error);
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

  if (!user) {
    return <Loading message="Loading your workspace..." />;
  }

  // Mobile layout
  const isMobile = window.innerWidth < 1024;
  
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <MobileNavigation
          currentView={mobileView}
          onViewChange={setMobileView}
          onCreateNote={handleCreateNote}
        />
        
        <main className="flex-1">
          {showEditor && selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onBack={handleBackToNotes}
            />
          ) : (
            <div className="h-full">
              {mobileView === 'notes' && (
                <NotesPanel
                  onSelectNote={handleSelectNote}
                  onCreateNote={handleCreateNote}
                />
              )}
              {mobileView === 'projects' && (
                <div className="p-4">
                  {/* Project management for mobile */}
                  <h2 className="text-lg font-semibold mb-4">Projects</h2>
                  {/* Add project list here */}
                </div>
              )}
              {mobileView === 'search' && (
                <div className="p-4">
                  {/* Search interface for mobile */}
                  <h2 className="text-lg font-semibold mb-4">Search</h2>
                  {/* Add search interface here */}
                </div>
              )}
              {mobileView === 'profile' && (
                <div className="p-4">
                  {/* Profile/settings for mobile */}
                  <h2 className="text-lg font-semibold mb-4">Profile</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen flex">
      <Sidebar onCreateNote={handleCreateNote} />
      
      <main className="flex-1 flex">
        <NotesPanel
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
        />
        
        <NoteEditor note={selectedNote} />
      </main>
    </div>
  );
}
