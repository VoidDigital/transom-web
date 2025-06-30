import { useState, useEffect } from 'react'

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

  useEffect(() => {
    setText(htmlToText(content));
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Convert to iOS HTML format and send to parent
    const iosHtml = textToIOSHtml(newText);
    console.log('🔍 Text input:', newText);
    console.log('🔍 iOS HTML output:', iosHtml);
    onChange(iosHtml);
  };

  return (
    <div className="w-full h-full">
      <textarea
        value={text}
        onChange={handleChange}
        className="w-full h-full p-4 text-base leading-relaxed border-none outline-none resize-none bg-white"
        placeholder="Start writing your thought..."
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}