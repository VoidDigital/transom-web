import { useState, useEffect, useRef } from 'react'

interface WorkingTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Convert HTML to plain text for editing
function htmlToText(html: string): string {
  if (!html) return '';
  
  // Handle full iOS HTML documents
  if (html.includes('<!DOCTYPE html')) {
    // Parse the full HTML document
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract text from the body, handling Apple-converted-space spans
    const body = doc.body;
    if (body) {
      // Replace Apple-converted-space spans with regular spaces
      const appleSpans = body.querySelectorAll('span.Apple-converted-space');
      appleSpans.forEach(span => {
        span.replaceWith(' ');
      });
      
      // Get text content while preserving line breaks
      let text = '';
      const paragraphs = body.querySelectorAll('p');
      
      paragraphs.forEach((p, index) => {
        const pText = p.textContent || p.innerText || '';
        
        // Add the paragraph text (empty or not)
        text += pText.trim();
        
        // Add line break after each paragraph except the last one
        if (index < paragraphs.length - 1) {
          text += '\n';
        }
      });
      
      return text;
    }
  }
  
  // Handle simple HTML fragments
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Replace Apple-converted-space spans with regular spaces
  const appleSpans = tempDiv.querySelectorAll('span.Apple-converted-space');
  appleSpans.forEach(span => {
    span.replaceWith(' ');
  });
  
  // Get text content
  return tempDiv.textContent || tempDiv.innerText || '';
}

// Convert plain text to iOS HTML format (matching exact iOS structure)
function textToIOSHtml(text: string): string {
  if (!text.trim()) {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="Content-Style-Type" content="text/css"><title></title><meta name="Generator" content="Cocoa HTML Writer"><style type="text/css">p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 18.0px 'SF Pro Display'; color: #383838; -webkit-text-stroke: #383838}span.s1 {font-family: 'SFProDisplay-Regular'; font-weight: normal; font-style: normal; font-size: 18.00px; font-kerning: none}</style></head><body><p class="p1"><span class="s1"></span></p></body></html>`;
  }
  
  // Convert spaces to Apple-converted-space spans and handle line breaks
  const processedText = text
    .replace(/ /g, '<span class="Apple-converted-space"> </span>')
    .replace(/\n/g, '</span></p><p class="p1"><span class="s1">');
  
  // Build the complete iOS HTML structure
  const bodyContent = `<p class="p1"><span class="s1">${processedText}</span></p>`;
  
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="Content-Style-Type" content="text/css"><title></title><meta name="Generator" content="Cocoa HTML Writer"><style type="text/css">p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 18.0px 'SF Pro Display'; color: #383838; -webkit-text-stroke: #383838}span.s1 {font-family: 'SFProDisplay-Regular'; font-weight: normal; font-style: normal; font-size: 18.00px; font-kerning: none}</style></head><body>${bodyContent}</body></html>`;
}

export function WorkingTextEditor({ content, onChange }: WorkingTextEditorProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserTypingRef = useRef(false);

  useEffect(() => {
    // Only update text if user is not currently typing
    if (!isUserTypingRef.current) {
      const newText = htmlToText(content);
      setText(newText);
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Mark that user is typing to prevent external updates
    isUserTypingRef.current = true;
    setText(newText);
    
    // Convert to iOS HTML format and send to parent
    const iosHtml = textToIOSHtml(newText);
    onChange(iosHtml);
    
    // Reset typing flag after a brief delay
    setTimeout(() => {
      isUserTypingRef.current = false;
    }, 100);
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