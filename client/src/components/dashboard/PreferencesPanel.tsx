import { useState } from 'react';
import { Settings, User, LogOut, Moon, Sun, Monitor, Bell, Database, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useArchivedNotes } from '@/hooks/useArchivedNotes';

export default function PreferencesPanel() {
  const { user, signOut } = useAuth();
  const { notes, tags } = useNotes();
  const { archivedNotes } = useArchivedNotes();
  
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'txt'>('csv');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const projectTags = tags.filter(tag => tag.isPiece === true);
  const regularTags = tags.filter(tag => tag.isPiece === false);

  const getFilteredThoughts = () => {
    let filteredThoughts = [...notes];
    
    if (includeArchived) {
      filteredThoughts = [...filteredThoughts, ...archivedNotes];
    }

    // Filter by selected projects
    if (selectedProjects.length > 0) {
      filteredThoughts = filteredThoughts.filter(note => 
        note.tags.some(tagId => selectedProjects.includes(tagId))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filteredThoughts = filteredThoughts.filter(note => 
        note.tags.some(tagId => selectedTags.includes(tagId))
      );
    }

    return filteredThoughts;
  };

  const exportToCSV = (thoughts: any[]) => {
    const headers = ['Title', 'Content', 'Created Date', 'Modified Date', 'Projects', 'Tags', 'Status'];
    const rows = thoughts.map(thought => {
      const thoughtProjects = thought.tags
        .map((tagId: string) => projectTags.find(tag => tag.id === tagId)?.name)
        .filter(Boolean)
        .join('; ');
      
      const thoughtTags = thought.tags
        .map((tagId: string) => regularTags.find(tag => tag.id === tagId)?.name)
        .filter(Boolean)
        .join('; ');

      return [
        `"${thought.title.replace(/"/g, '""')}"`,
        `"${thought.content.replace(/<[^>]*>/g, '').replace(/"/g, '""')}"`,
        new Date(thought.createdAt).toLocaleDateString(),
        new Date(thought.updatedAt).toLocaleDateString(),
        `"${thoughtProjects}"`,
        `"${thoughtTags}"`,
        thought.isArchived ? 'Archived' : 'Active'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transom-thoughts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToTXT = (thoughts: any[]) => {
    const content = thoughts.map(thought => {
      const thoughtProjects = thought.tags
        .map((tagId: string) => projectTags.find(tag => tag.id === tagId)?.name)
        .filter(Boolean);
      
      const thoughtTags = thought.tags
        .map((tagId: string) => regularTags.find(tag => tag.id === tagId)?.name)
        .filter(Boolean);

      return [
        `Title: ${thought.title}`,
        `Created: ${new Date(thought.createdAt).toLocaleDateString()}`,
        `Modified: ${new Date(thought.updatedAt).toLocaleDateString()}`,
        thoughtProjects.length > 0 ? `Projects: ${thoughtProjects.join(', ')}` : '',
        thoughtTags.length > 0 ? `Tags: ${thoughtTags.join(', ')}` : '',
        `Status: ${thought.isArchived ? 'Archived' : 'Active'}`,
        '',
        thought.content.replace(/<[^>]*>/g, ''),
        '',
        '---',
        ''
      ].filter(Boolean).join('\n');
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transom-thoughts-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const thoughts = getFilteredThoughts();
    
    if (thoughts.length === 0) {
      alert('No thoughts match your selection criteria.');
      return;
    }

    if (exportFormat === 'csv') {
      exportToCSV(thoughts);
    } else {
      exportToTXT(thoughts);
    }
    
    setShowExportDialog(false);
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-500" />
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account settings and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <Badge variant="secondary">Connected</Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-gray-500">Sign out of your Transom account</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how Transom looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Editor Section */}
        <Card>
          <CardHeader>
            <CardTitle>Editor Settings</CardTitle>
            <CardDescription>
              Configure your writing experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Auto-save</Label>
                <p className="text-sm text-gray-500">Automatically save changes as you write</p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-gray-500">Get notified about sync status and updates</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Storage
            </CardTitle>
            <CardDescription>
              Manage your thoughts and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
                <p className="text-sm text-gray-500">Active Thoughts</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{archivedNotes.length}</p>
                <p className="text-sm text-gray-500">Archived Thoughts</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-gray-500">Download your thoughts as spreadsheet or text file</p>
              </div>
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Export Thoughts
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Export Thoughts</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Format Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Export Format</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={exportFormat === 'csv' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExportFormat('csv')}
                          className="flex-1"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-1" />
                          Spreadsheet (.csv)
                        </Button>
                        <Button
                          variant={exportFormat === 'txt' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExportFormat('txt')}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Text File (.txt)
                        </Button>
                      </div>
                    </div>

                    {/* Project Selection */}
                    {projectTags.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Projects (optional)</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {projectTags.map(project => (
                            <div key={project.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`project-${project.id}`}
                                checked={selectedProjects.includes(project.id)}
                                onCheckedChange={() => toggleProject(project.id)}
                              />
                              <Label 
                                htmlFor={`project-${project.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {project.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tag Selection */}
                    {regularTags.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tags (optional)</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {regularTags.map(tag => (
                            <div key={tag.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tag-${tag.id}`}
                                checked={selectedTags.includes(tag.id)}
                                onCheckedChange={() => toggleTag(tag.id)}
                              />
                              <Label 
                                htmlFor={`tag-${tag.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {tag.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Include Archived */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-archived"
                        checked={includeArchived}
                        onCheckedChange={setIncludeArchived}
                      />
                      <Label htmlFor="include-archived" className="text-sm cursor-pointer">
                        Include archived thoughts
                      </Label>
                    </div>

                    {/* Export Button */}
                    <Button onClick={handleExport} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export {getFilteredThoughts().length} Thoughts
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Transom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transom Web Interface v1.0.0
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A responsive web interface for writers to manage thoughts, projects, and tags.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Syncs seamlessly with your iOS app through Firebase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}