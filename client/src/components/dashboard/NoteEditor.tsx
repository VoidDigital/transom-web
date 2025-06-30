import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleTextEditor } from "@/components/editor/SimpleTextEditor";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { HtmlContent } from "@/components/ui/html-content";
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
  const [useRichText, setUseRichText] = useState(true); // Rich text working with cursor fix

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
          
          if (content !== note.content) updates.content = content;
          if (selectedProjectId !== note.projectId) updates.projectId = selectedProjectId;

          if (Object.keys(updates).length > 0) {
            await updateNote(note.id, updates);
          }
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Failed to save note:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [note, content, selectedProjectId, hasUnsavedChanges, updateNote]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setHasUnsavedChanges(true);
  };

  const handleAddTag = async () => {
    if (newTag.trim() && note) {
      try {
        await addTagToNote(note.id, newTag.trim());
        setNewTag("");
      } catch (error) {
        console.error("Failed to add tag:", error);
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (note) {
      try {
        await removeTagFromNote(note.id, tagId);
      } catch (error) {
        console.error("Failed to remove tag:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (note && confirm("Are you sure you want to delete this thought?")) {
      try {
        await deleteNote(note.id);
        onBack?.();
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No thought selected</h3>
          <p>Select a thought from the sidebar to start writing</p>
        </div>
      </div>
    );
  }

  const noteTags = getTagsForNote(note);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
          
          {/* Project Selection */}
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-gray-500" />
            <Select value={selectedProjectId} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSaving && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Cloud className="w-4 h-4 animate-pulse" />
              <span>Saving...</span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUseRichText(!useRichText)}
            className="text-xs"
          >
            {useRichText ? "Plain" : "Rich"}
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 lg:p-6">
          {useRichText ? (
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
            />
          ) : (
            <SimpleTextEditor
              content={content}
              onChange={handleContentChange}
            />
          )}
        </div>

        {/* Tags Section */}
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Tags</span>
          </div>
          
          {/* Existing Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {noteTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add New Tag */}
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with metadata */}
      <div className="px-4 lg:px-6 py-2 border-t border-gray-200 text-xs text-gray-500">
        {note.updatedAt && (
          <span>Last edited {formatDistanceToNow(note.updatedAt)} ago</span>
        )}
      </div>
    </div>
  );
}