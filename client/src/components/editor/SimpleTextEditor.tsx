import React from 'react';

interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function SimpleTextEditor({ content, onChange }: SimpleTextEditorProps) {
  // Extract plain text from HTML content (from iOS app)
  const getPlainText = (htmlContent: string) => {
    if (!htmlContent) return '';
    
    // If it's complex HTML from iOS, extract only the body text content
    if (htmlContent.includes('<!DOCTYPE html') || htmlContent.includes('<body>')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const bodyContent = doc.body;
      
      if (bodyContent) {
        // Remove style and script elements
        const unwantedElements = bodyContent.querySelectorAll('style, script, meta');
        unwantedElements.forEach(el => el.remove());
        
        // Process text content while preserving paragraph structure
        const paragraphs = bodyContent.querySelectorAll('p');
        let plainText = '';
        
        paragraphs.forEach((p, index) => {
          const text = p.textContent || p.innerText || '';
          if (text.trim() && !text.includes('{') && !text.includes('margin:') && !text.includes('font:')) {
            plainText += text.trim();
            // Add line break between paragraphs, but not after the last one
            if (index < paragraphs.length - 1) {
              plainText += '\n\n';
            }
          }
        });
        
        // Fallback: if no paragraphs found, get all text content
        if (!plainText.trim()) {
          const allText = bodyContent.textContent || bodyContent.innerText || '';
          // Filter out CSS rules
          const lines = allText.split('\n');
          plainText = lines
            .filter(line => {
              const trimmed = line.trim();
              return trimmed && 
                     !trimmed.includes('{') && 
                     !trimmed.includes('margin:') && 
                     !trimmed.includes('font:') &&
                     !trimmed.includes('color:') &&
                     !trimmed.includes('font-family:');
            })
            .join('\n');
        }
        
        return plainText.trim();
      }
    }
    
    // For simple HTML, strip tags but preserve text flow
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store as plain text for now (will update to match iOS HTML schema later)
    onChange(e.target.value);
  };

  const displayText = getPlainText(content);

  return (
    <textarea
      value={displayText}
      onChange={handleChange}
      className="w-full h-full resize-none focus:outline-none"
      style={{ 
        direction: 'ltr', 
        textAlign: 'left',
        border: 'none',
        padding: 0,
        margin: 0,
        background: '#fff'
      }}
      dir="ltr"
      placeholder="Start writing your thought..."
    />
  );
}