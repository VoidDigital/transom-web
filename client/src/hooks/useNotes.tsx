import { useState, useEffect } from "react";
import { 
  ref, 
  query, 
  orderByChild, 
  equalTo,
  onValue, 
  push, 
  update, 
  remove,
  get,
  child
} from "firebase/database";
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
    console.log("🔍 Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log("🔍 Firebase User UID:", firebaseUser.uid);
    console.log("🔍 User Email:", firebaseUser.email);
    console.log("🔍 Custom User Data:", user);

    console.log("🔍 Querying Realtime Database notes with userId:", firebaseUser.uid);
    
    // Check for the specific note ID from iOS in Realtime Database
    get(child(ref(db), `notes/OTrIhzqCu8Qewl3w921`)).then((snapshot) => {
      console.log("🔍 iOS note OTrIhzqCu8Qewl3w921 found:", snapshot.exists());
      if (snapshot.exists()) {
        const noteData = snapshot.val();
        console.log("✅ Connected to correct Firebase project! iOS note data:", {
          userId: noteData.userId,
          content: noteData.content?.substring(0, 50),
          createdAt: noteData.createdAt
        });
        console.log("🔍 Current web user ID:", firebaseUser.uid);
        console.log("🔍 iOS note belongs to user ID:", noteData.userId);
        if (noteData.userId !== firebaseUser.uid) {
          console.log("❌ ACCOUNT MISMATCH: Web app signed in with different Google account than iOS!");
          console.log("❌ Please sign out and sign in with the Google account used in your iOS app");
        }
      } else {
        console.log("❌ Note OTrIhzqCu8Qewl3w921 not found in Realtime Database");
        console.log("❌ Either wrong database or note doesn't exist");
      }
    }).catch(err => console.log("🔍 Realtime Database connection error:", err));

    // Use email-based path matching iOS app format
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    console.log("🔍 Using email key for data path:", emailKey);
    
    // Listen for tags in Realtime Database using email-based path
    const tagsRef = ref(db, `${emailKey}/tags`);
    const unsubscribeTags = onValue(tagsRef, (tagsSnapshot) => {
      if (tagsSnapshot.exists()) {
        const tagsData = tagsSnapshot.val();
        const tagsArray = Object.entries(tagsData).map(([tagId, tagData]: [string, any]) => ({
          id: tagId,
          name: tagData.name || tagId,
          isPiece: tagData.isPiece || false,
          userId: firebaseUser.uid,
          createdAt: tagData.createdAt ? new Date(tagData.createdAt) : new Date(),
          updatedAt: tagData.updatedAt ? new Date(tagData.updatedAt) : new Date()
        })) as Tag[];
        setTags(tagsArray);
        console.log("🔍 Loaded", tagsArray.length, "tags from Firebase");
      } else {
        setTags([]);
        console.log("🔍 No tags found in Firebase");
      }
    });

    // Listen for thoughts in Realtime Database using email-based path (matching iOS app)
    const thoughtsRef = ref(db, `${emailKey}/thoughts`);
    const unsubscribe = onValue(thoughtsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        console.log("🔍 No notes found in Realtime Database");
        setNotes([]);
        setAllNotes([]);
        setLoading(false);
        return;
      }

      const allNotesData = snapshot.val();
      console.log("🔍 Realtime Database returned", Object.keys(allNotesData).length, "total notes");
      
      // Process notes data - no need to filter by userId since we're already in user's email path
      const userNotes = Object.entries(allNotesData || {})
        .map(([noteId, noteData]: [string, any]) => {
          console.log("🔍 iOS Thought data:", {
            id: noteId,
            text: noteData.text?.substring(0, 50) + "...",
            createdAt: noteData.createdAt,
            updatedAt: noteData.updatedAt,
            isArchived: noteData.isArchived,
            tags: noteData.tags,
            tagNames: noteData.tagNames
          });
          
          // Map iOS data structure to web app structure
          return {
            id: noteId,
            title: noteData.title || "", // iOS doesn't seem to have titles, use empty string
            content: noteData.text || "", // iOS uses "text", web app uses "content"
            userId: firebaseUser.uid, // Use current user ID
            projectId: noteData.projectId || null,
            tags: noteData.tags || [],
            tagNames: noteData.tagNames || "", // iOS uses tilde-separated tag names
            isArchived: noteData.isArchived || false,
            createdAt: noteData.createdAt ? new Date(Math.floor(noteData.createdAt) > 1e10 ? Math.floor(noteData.createdAt) : Math.floor(noteData.createdAt * 1000)) : new Date(),
            updatedAt: noteData.updatedAt ? new Date(Math.floor(noteData.updatedAt) > 1e10 ? Math.floor(noteData.updatedAt) : Math.floor(noteData.updatedAt * 1000)) : new Date(Math.floor(noteData.createdAt) > 1e10 ? Math.floor(noteData.createdAt) : Math.floor(noteData.createdAt * 1000))
          } as Note;
        });

      // Check for notes that need text migration (run in background)
      const migrationPromises = userNotes
        .filter((note: Note) => isTextReversed(note.content))
        .map(async (note: Note) => {
          console.log("🔧 Auto-migrating reversed text for note:", note.id);
          try {
            await migrateNoteContent(note.id, note.content, user.email);
            console.log("✅ Successfully migrated note:", note.id);
          } catch (error) {
            console.error("❌ Failed to migrate note:", note.id, error);
          }
        });
      
      // Run migrations in background without blocking UI
      if (migrationPromises.length > 0) {
        Promise.all(migrationPromises).then(() => {
          console.log("🎉 All text migrations completed");
        });
      }
      
      // Store all notes for comprehensive access
      setAllNotes(userNotes);
      
      console.log("🔍 Total notes before filtering:", userNotes.length);
      console.log("🔍 Archived notes:", userNotes.filter((note: Note) => note.isArchived).length);
      
      // Filter client-side
      let filteredNotes = userNotes.filter((note: Note) => !note.isArchived);
      
      console.log("🔍 Notes after archive filter:", filteredNotes.length);
      console.log("🔍 Filtering details:", {
        total: userNotes.length,
        archived: userNotes.filter((n: Note) => n.isArchived).length,
        visible: filteredNotes.length
      });
      
      if (projectId) {
        filteredNotes = filteredNotes.filter((note: Note) => note.projectId === projectId);
      }
      
      setNotes(filteredNotes);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeTags();
    };
  }, [user, firebaseUser, projectId]);

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
    if (!user || !firebaseUser) throw new Error("User not authenticated");

    // Use email-based path matching iOS app structure
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    const thoughtsRef = ref(db, `${emailKey}/thoughts`);
    const newNoteRef = push(thoughtsRef);
    
    // Convert web app format to iOS format
    const thoughtToSave = {
      text: noteData.content, // iOS uses "text" instead of "content"
      isArchived: false,
      tags: noteData.tags || [],
      createdAt: Date.now(), // Use milliseconds as integer for consistency
      updatedAt: Date.now(),
    };

    await update(newNoteRef, thoughtToSave);

    const newNote: Note = {
      id: newNoteRef.key!,
      ...noteData,
      userId: firebaseUser.uid,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newNote;
  };

  const updateNote = async (noteId: string, updates: UpdateNote) => {
    if (!firebaseUser) throw new Error("User not authenticated");
    
    // Use email-based path matching iOS app structure
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    const noteRef = ref(db, `${emailKey}/thoughts/${noteId}`);
    
    // Convert web app updates to iOS format
    const thoughtUpdates: any = {
      updatedAt: Date.now(), // Use milliseconds as integer for consistency
    };
    
    if (updates.content !== undefined) {
      thoughtUpdates.text = updates.content; // iOS uses "text"
    }
    if (updates.isArchived !== undefined) {
      thoughtUpdates.isArchived = updates.isArchived;
    }
    if (updates.tags !== undefined) {
      thoughtUpdates.tags = updates.tags;
    }
    
    await update(noteRef, thoughtUpdates);
  };

  const deleteNote = async (noteId: string) => {
    if (!firebaseUser) throw new Error("User not authenticated");
    
    // Use email-based path matching iOS app structure
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    const noteRef = ref(db, `${emailKey}/thoughts/${noteId}`);
    await remove(noteRef);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const createTag = async (tagName: string): Promise<Tag> => {
    if (!user || !firebaseUser) throw new Error("User not authenticated");

    // Check if tag already exists
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) return existingTag;

    const tagsRef = ref(db, 'tags');
    const newTagRef = push(tagsRef);
    
    const tagToSave = {
      name: tagName,
      userId: firebaseUser.uid,
      isPiece: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await update(newTagRef, tagToSave);

    const newTag: Tag = {
      id: newTagRef.key!,
      name: tagName,
      userId: firebaseUser.uid,
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
