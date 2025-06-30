import { useState, useEffect } from "react";
import { 
  ref, 
  onValue, 
  set, 
  remove
} from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { Note, UpdateNote } from "@shared/schema";

export const useArchivedNotes = (projectId?: string) => {
  const { user, firebaseUser } = useAuth();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firebaseUser) {
      setArchivedNotes([]);
      setLoading(false);
      return;
    }

    // Use email-based path matching iOS app format
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    const notesRef = ref(db, `${emailKey}/notes`);

    const unsubscribe = onValue(notesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setArchivedNotes([]);
        setLoading(false);
        return;
      }

      const allNotesData = Object.entries(snapshot.val() || {}).map(([noteId, data]: [string, any]) => {
        return {
          id: noteId,
          content: data.content,
          projectId: data.projectId,
          userId: data.userId,
          tags: data.tags || [],
          isArchived: data.isArchived ?? false,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        } as Note;
      });

      // Filter for archived notes and optionally by project
      let filteredNotes = allNotesData.filter(note => note.isArchived === true);
      
      if (projectId) {
        filteredNotes = filteredNotes.filter(note => note.projectId === projectId);
      }
      
      setArchivedNotes(filteredNotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firebaseUser, projectId]);

  const updateNote = async (noteId: string, updates: UpdateNote) => {
    if (!user || !firebaseUser) throw new Error("User not authenticated");
    
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    const noteRef = ref(db, `${emailKey}/notes/${noteId}`);
    await set(noteRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const unarchiveNote = async (noteId: string) => {
    await updateNote(noteId, { isArchived: false });
  };

  const deleteNote = async (noteId: string) => {
    if (!user || !firebaseUser) throw new Error("User not authenticated");
    
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    await remove(ref(db, `${emailKey}/notes/${noteId}`));
  };

  return {
    archivedNotes,
    loading,
    unarchiveNote,
    deleteNote,
  };
};