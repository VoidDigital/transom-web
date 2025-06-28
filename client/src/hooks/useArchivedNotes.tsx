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
  const { user } = useAuth();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setArchivedNotes([]);
      setLoading(false);
      return;
    }

    // For now, let's fetch without the isArchived filter to avoid index issues
    // We'll filter on the client side temporarily
    let q;
    if (projectId) {
      q = query(
        collection(db, "notes"),
        where("userId", "==", user.id),
        where("projectId", "==", projectId),
        orderBy("updatedAt", "desc")
      );
    } else {
      q = query(
        collection(db, "notes"),
        where("userId", "==", user.id),
        orderBy("updatedAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData: Note[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Client-side filter for archived notes
        if (data.isArchived === true) {
          notesData.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            projectId: data.projectId,
            userId: data.userId,
            tags: data.tags || [],
            isArchived: data.isArchived ?? false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        }
      });
      setArchivedNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, projectId]);

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