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
  writeBatch,
  getDocs
} from "firebase/firestore";
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

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.id),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
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

    const docRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      userId: user.id,
      noteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newProject: Project = {
      id: docRef.id,
      ...projectData,
      userId: user.id,
      noteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newProject;
  };

  const updateProject = async (projectId: string, updates: Partial<InsertProject>) => {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteProject = async (projectId: string) => {
    // Delete all notes in the project first
    const notesQuery = query(
      collection(db, "notes"),
      where("projectId", "==", projectId)
    );
    
    const notesSnapshot = await getDocs(notesQuery);
    const batch = writeBatch(db);
    
    notesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete the project
    batch.delete(doc(db, "projects", projectId));
    
    await batch.commit();
    
    // Clear selected project if it was deleted
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const updateProjectNoteCount = async (projectId: string, noteCount: number) => {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, { noteCount });
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
