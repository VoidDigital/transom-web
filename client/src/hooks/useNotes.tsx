import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { Note, InsertNote, UpdateNote, Tag } from "@shared/schema";
import { isTextReversed, migrateNoteContent } from "@/lib/textMigration";

export const useNotes = (projectId?: string) => {
  const { user, firebaseUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !firebaseUser) {
      setNotes([]);
      setAllNotes([]);
      setLoading(false);
      return;
    }

    // Debug logging to check user data
    console.log("🔍 Firebase User UID:", firebaseUser.uid);
    console.log("🔍 User Email:", firebaseUser.email);
    console.log("🔍 Custom User Data:", user);

    // Use Firebase Auth UID to match iOS app data structure
    const q = query(
      collection(db, "notes"),
      where("userId", "==", firebaseUser.uid),
      orderBy("updatedAt", "desc")
    );

    console.log("🔍 Querying notes with userId:", firebaseUser.uid);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("🔍 Firebase query returned", snapshot.docs.length, "notes");
      
      const notesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("🔍 Note data:", {
          id: doc.id,
          userId: data.userId,
          content: data.content?.substring(0, 50) + "...",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Note;
      });
      
      // Store all notes for comprehensive access
      setAllNotes(notesData);
      
      console.log("🔍 Total notes before filtering:", notesData.length);
      console.log("🔍 Archived notes:", notesData.filter(note => note.isArchived).length);
      
      // Filter client-side to avoid composite index requirements
      let filteredNotes = notesData.filter(note => !note.isArchived);
      
      console.log("🔍 Notes after archive filter:", filteredNotes.length);
      
      if (projectId) {
        filteredNotes = filteredNotes.filter(note => note.projectId === projectId);
      }
      
      setNotes(filteredNotes);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, firebaseUser, projectId]);

  useEffect(() => {
    if (!user) {
      setTags([]);
      return;
    }

    const q = query(
      collection(db, "tags"),
      where("userId", "==", user.id),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tagsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Tag;
      });
      
      setTags(tagsData);
    });

    return unsubscribe;
  }, [user]);

  const filteredNotes = notes.filter(note => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags = activeTagFilters.length === 0 ||
      activeTagFilters.some(tagId => note.tags.includes(tagId));

    return matchesSearch && matchesTags;
  });

  const createNote = async (noteData: InsertNote): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, "notes"), {
      ...noteData,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newNote: Note = {
      id: docRef.id,
      ...noteData,
      userId: user.id,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newNote;
  };

  const updateNote = async (noteId: string, updates: UpdateNote) => {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteNote = async (noteId: string) => {
    await deleteDoc(doc(db, "notes", noteId));
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const createTag = async (tagName: string): Promise<Tag> => {
    if (!user) throw new Error("User not authenticated");

    // Check if tag already exists
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) return existingTag;

    const docRef = await addDoc(collection(db, "tags"), {
      name: tagName,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newTag: Tag = {
      id: docRef.id,
      name: tagName,
      userId: user.id,
      isPiece: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newTag;
  };

  const addTagToNote = async (noteId: string, tagName: string) => {
    const tag = await createTag(tagName);
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    if (!note.tags.includes(tag.id)) {
      await updateNote(noteId, {
        tags: [...note.tags, tag.id],
      });
    }
  };

  const removeTagFromNote = async (noteId: string, tagId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    await updateNote(noteId, {
      tags: note.tags.filter(id => id !== tagId),
    });
  };

  const getTagsForNote = (note: Note): Tag[] => {
    return note.tags.map(tagId => tags.find(tag => tag.id === tagId)).filter(Boolean) as Tag[];
  };

  const addTagFilter = (tagId: string) => {
    if (!activeTagFilters.includes(tagId)) {
      setActiveTagFilters([...activeTagFilters, tagId]);
    }
  };

  const removeTagFilter = (tagId: string) => {
    setActiveTagFilters(activeTagFilters.filter(id => id !== tagId));
  };

  const clearTagFilters = () => {
    setActiveTagFilters([]);
  };

  const archiveNote = async (noteId: string) => {
    await updateNote(noteId, { isArchived: true });
  };

  const unarchiveNote = async (noteId: string) => {
    await updateNote(noteId, { isArchived: false });
  };

  return {
    notes: filteredNotes,
    allNotes,
    selectedNote,
    setSelectedNote,
    tags,
    loading,
    searchQuery,
    setSearchQuery,
    activeTagFilters,
    createNote,
    updateNote,
    deleteNote,
    createTag,
    addTagToNote,
    removeTagFromNote,
    getTagsForNote,
    addTagFilter,
    removeTagFilter,
    clearTagFilters,
    archiveNote,
    unarchiveNote,
  };
};
