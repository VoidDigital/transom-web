import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isUpdating) {
      // Process HTML content from iOS app
      let processedContent = content;
      
      // Extract text content from complex HTML structures like iOS exports
      if (content.includes('<!DOCTYPE html') || content.includes('<body>')) {
        // Create temporary DOM element to parse complex HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Extract text content while preserving basic formatting
        const bodyContent = tempDiv.querySelector('body') || tempDiv;
        processedContent = bodyContent.innerHTML || bodyContent.textContent || '';
        
        // Clean up extra styling but keep basic formatting
        processedContent = processedContent
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
          .replace(/<meta[^>]*>/gi, '') // Remove meta tags
          .replace(/class="[^"]*"/gi, '') // Remove class attributes
          .replace(/style="[^"]*"/gi, '') // Remove inline styles
          .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1') // Unwrap spans
          .replace(/<p[^>]*>/gi, '<div>') // Convert p to div
          .replace(/<\/p>/gi, '</div>'); // Convert p to div
      }
      
      editorRef.current.innerHTML = processedContent;
      
      // Force text direction after content update
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
    }
  }, [content, isUpdating]);

  // Simple text direction enforcement
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const enforceDirection = () => {
        editor.style.direction = 'ltr';
        editor.style.textAlign = 'left';
        editor.style.unicodeBidi = 'embed';
      };
      
      editor.addEventListener('input', enforceDirection);
      editor.addEventListener('keydown', enforceDirection);
      editor.addEventListener('focus', enforceDirection);
      
      // Set initial direction
      enforceDirection();
      
      return () => {
        editor.removeEventListener('input', enforceDirection);
        editor.removeEventListener('keydown', enforceDirection);
        editor.removeEventListener('focus', enforceDirection);
      };
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      setIsUpdating(true);
      onChange(editorRef.current.innerHTML);
      setTimeout(() => setIsUpdating(false), 0);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
    
    // Fix RTL issue by intercepting character input
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && /[a-zA-Z0-9\s]/.test(e.key)) {
      e.preventDefault();
      
      // Insert character with proper LTR context
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create a span with explicit LTR direction
        const span = document.createElement('span');
        span.style.direction = 'ltr';
        span.style.unicodeBidi = 'embed';
        span.textContent = e.key;
        
        range.insertNode(span);
        
        // Move cursor after the inserted character
        range.setStartAfter(span);
        range.setEndAfter(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleInput();
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar - Only iOS app features: Bold, Italic, Underline, Bulleted Lists */}
      <div className="border-b bg-gray-50 p-2 flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand('underline')}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 w-8 p-0"
          title="Bulleted List"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{ 
          direction: 'ltr', 
          textAlign: 'left',
          unicodeBidi: 'embed',
          writingMode: 'horizontal-tb'
        }}
        dir="ltr"
        lang="en"
        suppressContentEditableWarning={true}
        data-placeholder="Start writing your thought..."
      />
    </div>
  );
}