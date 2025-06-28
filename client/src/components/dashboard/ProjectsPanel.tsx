import { useState } from 'react';
import { Folder, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotes } from '@/hooks/useNotes';
import { format } from 'date-fns';

interface ProjectsPanelProps {
  onSelectProject: (projectId: string) => void;
}

export default function ProjectsPanel({ onSelectProject }: ProjectsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const { tags, createTag, notes } = useNotes();

  // Filter for project tags (isPiece: true)
  const projectTags = tags.filter(tag => tag.isPiece === true);
  
  const filteredProjects = projectTags.filter(project => {
    if (!searchQuery) return true;
    return project.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Count thoughts per project
  const getThoughtCount = (projectId: string) => {
    return notes.filter(note => note.tags.includes(projectId) && !note.isArchived).length;
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await createTag(newProjectName.trim());
      setNewProjectName('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </p>
            <p className="text-sm mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first project to organize your thoughts'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredProjects.map(project => {
              const thoughtCount = getThoughtCount(project.id);
              
              return (
                <div
                  key={project.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{thoughtCount} {thoughtCount === 1 ? 'thought' : 'thoughts'}</span>
                          <span>Updated {format(new Date(project.updatedAt), 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Edit project functionality
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Delete project functionality
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {thoughtCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {thoughtCount} active {thoughtCount === 1 ? 'thought' : 'thoughts'}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}