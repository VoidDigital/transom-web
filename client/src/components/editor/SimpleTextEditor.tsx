import React from 'react';

interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function SimpleTextEditor({ content, onChange }: SimpleTextEditorProps) {
  // Extract plain text from HTML content (from iOS app)
  const getPlainText = (htmlContent: string) => {
    if (!htmlContent) return '';
    
    // If it's complex HTML from iOS, extract text content
    if (htmlContent.includes('<!DOCTYPE html') || htmlContent.includes('<body>')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const bodyContent = tempDiv.querySelector('body') || tempDiv;
      return bodyContent.textContent || bodyContent.innerText || '';
    }
    
    // For simple HTML, strip tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Wrap plain text in div for HTML storage
    onChange(`<div>${e.target.value}</div>`);
  };

  return (
    <textarea
      value={getPlainText(content)}
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