import React from 'react';

interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function SimpleTextEditor({ content, onChange }: SimpleTextEditorProps) {
  // Extract plain text from HTML content (from iOS app)
  const getPlainText = (htmlContent: string) => {
    console.log('🔍 SimpleTextEditor - Input content:', htmlContent);
    
    if (!htmlContent) return '';
    
    // If it's complex HTML from iOS, extract text content
    if (htmlContent.includes('<!DOCTYPE html') || htmlContent.includes('<body>')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const bodyContent = tempDiv.querySelector('body') || tempDiv;
      const plainText = bodyContent.textContent || bodyContent.innerText || '';
      console.log('🔍 SimpleTextEditor - Extracted from complex HTML:', plainText);
      return plainText;
    }
    
    // For simple HTML, strip tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    console.log('🔍 SimpleTextEditor - Extracted from simple HTML:', plainText);
    return plainText;
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
      className="w-full min-h-[200px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      style={{ 
        direction: 'ltr', 
        textAlign: 'left'
      }}
      dir="ltr"
      placeholder="Start writing your thought..."
    />
  );
}