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
      
      // Extract and clean iOS HTML content
      if (content.includes('<!DOCTYPE html') || content.includes('<body>')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const bodyContent = doc.body;
        
        if (bodyContent) {
          // Remove unwanted elements
          const unwantedElements = bodyContent.querySelectorAll('style, script, meta');
          unwantedElements.forEach(el => el.remove());
          
          // Keep iOS span classes but add CSS to style them properly
          processedContent = bodyContent.innerHTML
            .replace(/<p[^>]*>/gi, '<p>') // Clean p tags but keep them as p
            .replace(/<\/p>/gi, '</p>'); // Keep closing p tags
        }
      }
      
      editorRef.current.innerHTML = processedContent;
      
      // Force LTR direction after content update
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
    }
  }, [content, isUpdating]);

  // Simple direction enforcement
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const enforceDirection = () => {
        editor.style.direction = 'ltr';
        editor.style.textAlign = 'left';
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
      
      // Save cursor position before processing
      const selection = window.getSelection();
      let range = null;
      let cursorOffset = 0;
      
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        // Get text offset from start of editor
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT
        );
        
        let node;
        while (node = walker.nextNode()) {
          if (node === range.startContainer) {
            cursorOffset += range.startOffset;
            break;
          }
          cursorOffset += node.textContent?.length || 0;
        }
      }
      
      // Convert web HTML back to iOS-compatible format
      let webContent = editorRef.current.innerHTML;
      
      // Convert standard HTML formatting to iOS span classes
      const iosCompatibleContent = webContent
        .replace(/<div>/gi, '<p>') // Convert div to p for iOS
        .replace(/<\/div>/gi, '</p>')
        .replace(/<b>/gi, '<span class="s4">') // Bold to s4
        .replace(/<\/b>/gi, '</span>')
        .replace(/<i>/gi, '<span class="s3">') // Italic to s3
        .replace(/<\/i>/gi, '</span>')
        .replace(/<u>/gi, '<span class="s2">') // Underline to s2
        .replace(/<\/u>/gi, '</span>');
      
      onChange(iosCompatibleContent);
      
      // Restore cursor position after a small delay
      setTimeout(() => {
        if (editorRef.current && range && selection) {
          const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT
          );
          
          let currentOffset = 0;
          let targetNode = null;
          let targetOffset = 0;
          
          let node;
          while (node = walker.nextNode()) {
            const nodeLength = node.textContent?.length || 0;
            if (currentOffset + nodeLength >= cursorOffset) {
              targetNode = node;
              targetOffset = cursorOffset - currentOffset;
              break;
            }
            currentOffset += nodeLength;
          }
          
          if (targetNode) {
            try {
              range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
              range.setEnd(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (e) {
              // If cursor restoration fails, just focus the editor
              editorRef.current.focus();
            }
          }
        }
        setIsUpdating(false);
      }, 0);
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
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar - Only iOS app features: Bold, Italic, Underline, Bulleted Lists */}
      <div className="border-b bg-gray-50 p-2 flex gap-1 flex-shrink-0">
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
        className="w-full h-full p-0 focus:outline-none [&_p]:mb-4 [&_p]:leading-relaxed [&_b]:font-bold [&_i]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-1 [&_.s2]:underline [&_.s3]:italic [&_.s4]:font-bold"
        style={{ 
          direction: 'ltr', 
          textAlign: 'left',
          background: '#fff',
          border: 'none',
          minHeight: '100%'
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}