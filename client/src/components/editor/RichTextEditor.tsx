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
      editorRef.current.innerHTML = content;
      // Force text direction after content update
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
    }
  }, [content, isUpdating]);

  // Add additional text direction enforcement
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const enforceDirection = (e: Event) => {
        // Force styles immediately
        editor.style.direction = 'ltr';
        editor.style.textAlign = 'left';
        editor.style.unicodeBidi = 'bidi-override';
        
        // Force cursor position and selection to maintain LTR
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // Ensure selection maintains LTR direction
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }, 0);
      };
      
      const handleBeforeInput = (e: Event) => {
        enforceDirection(e);
      };
      
      editor.addEventListener('input', enforceDirection);
      editor.addEventListener('keydown', enforceDirection);
      editor.addEventListener('paste', enforceDirection);
      editor.addEventListener('beforeinput', handleBeforeInput);
      editor.addEventListener('focus', enforceDirection);
      
      return () => {
        editor.removeEventListener('input', enforceDirection);
        editor.removeEventListener('keydown', enforceDirection);
        editor.removeEventListener('paste', enforceDirection);
        editor.removeEventListener('beforeinput', handleBeforeInput);
        editor.removeEventListener('focus', enforceDirection);
      };
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      // Force text direction on every input
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'bidi-override';
      
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
    // Force LTR direction on every keystroke
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
    }
    
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
        className="ltr-wrapper" 
        dir="ltr" 
        style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none ltr-forced"
          style={{ 
            direction: 'ltr', 
            textAlign: 'left',
            unicodeBidi: 'bidi-override',
            writingMode: 'horizontal-tb'
          }}
          dir="ltr"
          lang="en"
          suppressContentEditableWarning={true}
          data-placeholder="Start writing your thought..."
        />
      </div>
    </div>
  );
}