import { Folder } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

interface ProjectsPanelProps {
  onSelectProject: (projectId: string) => void;
}

export default function ProjectsPanel({ onSelectProject }: ProjectsPanelProps) {
  const { allNotes, tags } = useNotes();

  // Projects are tags with isPiece=true
  const projectTags = tags.filter(tag => tag.isPiece === true);
  
  // Calculate thought count for each project
  const projects = projectTags.map(tag => {
    const thoughtCount = allNotes.filter(note => note.tags.includes(tag.id)).length;
    return {
      id: tag.id,
      name: tag.name,
      thoughtCount
    };
  }).sort((a, b) => b.thoughtCount - a.thoughtCount); // Sort by thought count descending

  return (
    <div className="w-full lg:w-96 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
            <p className="text-sm text-slate-500">{projects.length} projects</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">
              Projects will appear here when thoughts are assigned to them
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group w-full h-16 px-4 lg:px-6 text-left border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between h-full min-w-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {project.thoughtCount} {project.thoughtCount === 1 ? 'thought' : 'thoughts'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Folder className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}