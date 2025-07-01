import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkingTextEditor } from "@/components/editor/WorkingTextEditor";
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
    createNote,
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
  const [showCreatedDate, setShowCreatedDate] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Using TipTap editor only for troubleshooting

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setSelectedProjectId(note.projectId);
      setHasUnsavedChanges(false);
      // For newly created thoughts, show "Created" initially
      setShowCreatedDate(!note.updatedAt || note.createdAt === note.updatedAt);
    }
  }, [note]);

  // Real-time timestamp updates every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Custom formatting function that replaces "less than a minute ago" with "just now"
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeAgo = formatDistanceToNow(date);
    return timeAgo === 'less than a minute' ? 'just now' : timeAgo;
  };

  // Handle clicking on timestamp to cycle between created/updated
  const handleTimestampClick = () => {
    setShowCreatedDate(!showCreatedDate);
  };

  // Get the appropriate timestamp text
  const getTimestampText = () => {
    if (!note) return '';
    
    if (showCreatedDate) {
      return `Created ${formatTimestamp(note.createdAt)} ago`;
    } else {
      const updateTime = note.updatedAt || note.createdAt;
      return `Last edited ${formatTimestamp(updateTime)} ago`;
    }
  };

  // Clean up empty thoughts when navigating away
  useEffect(() => {
    return () => {
      if (note && !content.trim()) {
        // Only delete real notes, temporary notes just disappear
        if (!note.id.startsWith('temp-')) {
          deleteNote(note.id).catch(console.error);
        }
      }
    };
  }, [note, content, deleteNote]);

  useEffect(() => {
    if (!note) return;

    const timeoutId = setTimeout(async () => {
      if (hasUnsavedChanges) {
        try {
          setIsSaving(true);
          
          // If content is empty, handle deletion
          if (!content.trim()) {
            // Only delete if it's a real note (not temporary)
            if (!note.id.startsWith('temp-')) {
              await deleteNote(note.id);
            }
            onBack?.();
            return;
          }
          
          // If this is a temporary note, create it in the database
          if (note.id.startsWith('temp-')) {
            const newNoteData = {
              content: content,
              userId: note.userId,
              projectId: selectedProjectId,
              tags: note.tags,
            };
            await createNote(newNoteData);
            // Note: The note will be refreshed through the useNotes hook
          } else {
            // Update existing note
            const updates: UpdateNote = {};
            
            if (content !== note.content) updates.content = content;
            if (selectedProjectId !== note.projectId) updates.projectId = selectedProjectId;

            if (Object.keys(updates).length > 0) {
              await updateNote(note.id, updates);
            }
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
  }, [note, content, selectedProjectId, hasUnsavedChanges, updateNote, deleteNote, createNote, onBack]);

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
          {note && (
            <button 
              onClick={handleTimestampClick}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {getTimestampText()}
            </button>
          )}
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
            disabled
            className="text-xs"
          >
            Text Editor
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
          <WorkingTextEditor
            content={content}
            onChange={handleContentChange}
            autoFocus={note?.id.startsWith('temp-')}
          />
        </div>

        {/* Project and Tags Section */}
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
          <div className="flex gap-6">
            {/* Project Section */}
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Project</span>
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

            {/* Tag Section */}
            <div className="flex items-center space-x-2 flex-1">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tag</span>
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
            </div>
          </div>

          {/* Existing Tags */}
          {noteTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
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
          )}
        </div>
      </div>

    </div>
  );
}