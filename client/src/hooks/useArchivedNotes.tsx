import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc
} from "firebase/firestore";
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

    // Use Firebase Auth UID to match iOS app data structure
    const q = query(
      collection(db, "notes"),
      where("userId", "==", firebaseUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          projectId: data.projectId,
          userId: data.userId,
          tags: data.tags || [],
          isArchived: data.isArchived ?? false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
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
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const unarchiveNote = async (noteId: string) => {
    await updateNote(noteId, { isArchived: false });
  };

  const deleteNote = async (noteId: string) => {
    await deleteDoc(doc(db, "notes", noteId));
  };

  return {
    archivedNotes,
    loading,
    unarchiveNote,
    deleteNote,
  };
};