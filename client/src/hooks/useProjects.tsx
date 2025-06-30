import { useState, useEffect } from "react";
import { 
  ref, 
  onValue, 
  push, 
  set, 
  remove,
  get
} from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { Project, InsertProject } from "@shared/schema";

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // Use email-based path matching iOS app format
    const emailKey = user.email.replace(/\./g, '▦');
    const projectsRef = ref(db, `${emailKey}/projects`);

    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectsData = Object.entries(snapshot.val() || {}).map(([projectId, data]: [string, any]) => {
        return {
          id: projectId,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        } as Project;
      });
      
      setProjects(projectsData);
      
      // Auto-select first project if none selected
      if (!selectedProject && projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [user, selectedProject]);

  const createProject = async (projectData: InsertProject): Promise<Project> => {
    if (!user) throw new Error("User not authenticated");

    const emailKey = user.email.replace(/\./g, '▦');
    const projectsRef = ref(db, `${emailKey}/projects`);
    const newProjectRef = push(projectsRef);

    const newProject: Project = {
      id: newProjectRef.key!,
      ...projectData,
      userId: user.id,
      noteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await set(newProjectRef, {
      ...newProject,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
    });

    return newProject;
  };

  const updateProject = async (projectId: string, updates: Partial<InsertProject>) => {
    if (!user) throw new Error("User not authenticated");
    
    const emailKey = user.email.replace(/\./g, '▦');
    const projectRef = ref(db, `${emailKey}/projects/${projectId}`);
    await set(projectRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const emailKey = user.email.replace(/\./g, '▦');
    
    // Delete all notes in the project first
    const notesRef = ref(db, `${emailKey}/notes`);
    const notesSnapshot = await get(notesRef);
    
    if (notesSnapshot.exists()) {
      const notesData = notesSnapshot.val();
      const projectNotes = Object.entries(notesData).filter(([_, noteData]: [string, any]) => 
        noteData.projectId === projectId
      );
      
      // Delete each note
      for (const [noteId] of projectNotes) {
        await remove(ref(db, `${emailKey}/notes/${noteId}`));
      }
    }
    
    // Delete the project
    await remove(ref(db, `${emailKey}/projects/${projectId}`));
    
    // Clear selected project if it was deleted
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const updateProjectNoteCount = async (projectId: string, noteCount: number) => {
    if (!user) throw new Error("User not authenticated");
    
    const emailKey = user.email.replace(/\./g, '▦');
    const projectRef = ref(db, `${emailKey}/projects/${projectId}`);
    await set(projectRef, { noteCount });
  };

  return {
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    createProject,
    updateProject,
    deleteProject,
    updateProjectNoteCount,
  };
};
