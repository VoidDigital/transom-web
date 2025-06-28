import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Note, UpdateNote } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Share, Trash2, Cloud, Plus, X, Folder, Tag } from "lucide-react";

interface NoteEditorProps {
  note: Note | null;
  onBack?: () => void;
}

export default function NoteEditor({ note, onBack }: NoteEditorProps) {
  const { projects, selectedProject } = useProjects();
  const { 
    updateNote, 
    deleteNote, 
    tags, 
    getTagsForNote, 
    addTagToNote, 
    removeTagFromNote 
  } = useNotes(selectedProject?.id);
  
  const [content, setContent] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(selectedProject?.id || "");
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setSelectedProjectId(note.projectId);
      setHasUnsavedChanges(false);
    }
  }, [note]);

  useEffect(() => {
    if (!note) return;

    const timeoutId = setTimeout(async () => {
      if (hasUnsavedChanges) {
        try {
          setIsSaving(true);
          const updates: UpdateNote = {};
          
          if (title !== note.title) updates.title = title;
          if (content !== note.content) updates.content = content;
          
          if (Object.keys(updates).length > 0) {
            await updateNote(note.id, updates);
          }
          
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Error saving note:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [note, title, content, hasUnsavedChanges, updateNote]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim() && note) {
      try {
        await addTagToNote(note.id, newTag.trim());
        setNewTag("");
      } catch (error) {
        console.error("Error adding tag:", error);
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (note) {
      try {
        await removeTagFromNote(note.id, tagId);
      } catch (error) {
        console.error("Error removing tag:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (note && confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(note.id);
        onBack?.();
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-slate-500 text-center">
          Select a note to start editing, or create a new one
        </p>
      </div>
    );
  }

  const noteTags = getTagsForNote(note);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note title..."
                className="text-lg font-semibold border-none shadow-none p-0 focus-visible:ring-0"
              />
              <p className="text-sm text-slate-500">
                Last edited {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <Cloud className={`w-4 h-4 ${isSaving ? 'text-blue-500' : 'text-emerald-500'}`} />
              <span>{isSaving ? 'Saving...' : 'Saved'}</span>
            </div>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {noteTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1.5 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleAddTag}
            placeholder="Add tag..."
            className="h-auto px-2.5 py-1 text-xs border-dashed w-20 min-w-20 focus:w-32 transition-all"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
}
