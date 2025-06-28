import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, InsertProject } from "@shared/schema";
import { PenTool, Search, Plus, Folder, LogOut } from "lucide-react";

interface SidebarProps {
  onCreateNote: () => void;
}

export default function Sidebar({ onCreateNote }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { projects, selectedProject, setSelectedProject, createProject } = useProjects();
  const { setSearchQuery } = useNotes(selectedProject?.id);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: InsertProject) => {
    try {
      const newProject = await createProject(data);
      setSelectedProject(newProject);
      setShowCreateProject(false);
      form.reset();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  if (!user) return null;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Transom</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search notes and tags..."
              className="pl-10"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* New Note Button */}
        <Button onClick={onCreateNote} className="w-full mb-6">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>

        {/* Projects List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Projects
            </h3>
            <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <Plus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Novel Draft" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Brief description..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Create Project
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-colors duration-150 ${
                selectedProject?.id === project.id
                  ? "bg-slate-50 border border-slate-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <Folder className="w-4 h-4 text-slate-400 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {project.name}
                </p>
                <p className="text-xs text-slate-500">
                  {project.noteCount} notes
                </p>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-medium text-sm">
              {user.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-500">Writer</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="h-auto p-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
