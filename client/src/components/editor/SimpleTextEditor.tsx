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
        
        // Get only the text content from paragraphs and spans
        const textElements = bodyContent.querySelectorAll('p, span, div');
        let plainText = '';
        
        textElements.forEach(el => {
          const text = el.textContent || '';
          if (text.trim() && !text.includes('{') && !text.includes('margin:')) {
            plainText += text.trim() + '\n';
          }
        });
        
        // Fallback to full body text if no specific elements found
        if (!plainText.trim()) {
          plainText = bodyContent.textContent || bodyContent.innerText || '';
        }
        
        return plainText.trim();
      }
    }
    
    // For simple HTML, strip tags
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
  console.log('🔍 SimpleTextEditor - Final display text:', displayText);

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