import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useNotes } from '@/hooks/useNotes';
import { useProjects } from '@/hooks/useProjects';
import { Note, Project } from '@shared/schema';

interface SearchPanelProps {
  onSelectNote: (note: Note) => void;
}

export default function SearchPanel({ onSelectNote }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  const { notes, allTags } = useNotes();
  const { projects } = useProjects();

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }

    // Project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(note => note.projectId === selectedProject);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.every(tagId => note.tagIds?.includes(tagId))
      );
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(note => 
        new Date(note.updatedAt) >= dateRange.from!
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(note => 
        new Date(note.updatedAt) <= dateRange.to!
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedProject, selectedTags, dateRange, sortBy]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProject('all');
    setSelectedTags([]);
    setDateRange({});
    setSortBy('updated');
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const getTagName = (tagId: string) => {
    return allTags.find(t => t.id === tagId)?.name || 'Unknown Tag';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Search Notes</h2>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Project Filter */}
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateRange.from ? format(dateRange.from, 'MMM dd') : 'Any Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => setDateRange({ from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: 'updated' | 'created' | 'title') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Latest</SelectItem>
              <SelectItem value="created">Newest</SelectItem>
              <SelectItem value="title">A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by tags:</p>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag.id)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No notes found</p>
            <p className="text-sm">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                onClick={() => onSelectNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {note.title || 'Untitled'}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {format(new Date(note.updatedAt), 'MMM dd')}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {note.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {getProjectName(note.projectId)}
                  </span>
                  
                  {note.tagIds && note.tagIds.length > 0 && (
                    <div className="flex gap-1">
                      {note.tagIds.slice(0, 3).map(tagId => (
                        <Badge key={tagId} variant="outline" className="text-xs">
                          {getTagName(tagId)}
                        </Badge>
                      ))}
                      {note.tagIds.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tagIds.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}