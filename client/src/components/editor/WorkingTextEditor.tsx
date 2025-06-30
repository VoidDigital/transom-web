import { useState, useEffect, useRef } from 'react'

interface WorkingTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Convert HTML to plain text for editing
function htmlToText(html: string): string {
  if (!html) return '';
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content
  return tempDiv.textContent || tempDiv.innerText || '';
}

// Convert plain text to iOS HTML format
function textToIOSHtml(text: string): string {
  if (!text.trim()) return '<p><span class="s1"></span></p>';
  
  // Split by lines and wrap each in paragraph with iOS span
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return '<p><span class="s1"></span></p>';
  
  return lines.map(line => `<p><span class="s1">${line}</span></p>`).join('');
}

export function WorkingTextEditor({ content, onChange }: WorkingTextEditorProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number>(0);

  useEffect(() => {
    const newText = htmlToText(content);
    if (newText !== text) {
      setText(newText);
      // Restore cursor position after content update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        }
      }, 0);
    }
  }, [content, text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Store cursor position
    cursorPositionRef.current = cursorPosition;
    setText(newText);
    
    // Convert to iOS HTML format and send to parent
    const iosHtml = textToIOSHtml(newText);
    onChange(iosHtml);
  };

  return (
    <div className="w-full h-full">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="w-full h-full p-4 text-base leading-relaxed border-none outline-none resize-none bg-white"
        placeholder="Start writing your thought..."
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}