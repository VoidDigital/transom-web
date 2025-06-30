import { useMemo } from 'react';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className = "" }: HtmlContentProps) {
  const cleanHtml = useMemo(() => {
    if (!content) return '';
    
    // Check if content is HTML (starts with DOCTYPE or HTML tags)
    const isHtml = content.includes('<!DOCTYPE') || content.includes('<html>') || content.includes('<p>') || content.includes('<div>');
    
    console.log("🎨 HtmlContent processing:", {
      isHtml,
      contentPreview: content.substring(0, 100) + "...",
      contentLength: content.length
    });
    
    if (!isHtml) {
      // If it's plain text, return as-is
      return content;
    }
    
    // For HTML content, extract the body content and clean it up
    let cleanedContent = content;
    
    // Remove DOCTYPE declaration
    cleanedContent = cleanedContent.replace(/<!DOCTYPE[^>]*>/gi, '');
    
    // Remove html, head, meta tags but keep the content
    cleanedContent = cleanedContent.replace(/<\/?html[^>]*>/gi, '');
    cleanedContent = cleanedContent.replace(/<head[\s\S]*?<\/head>/gi, '');
    cleanedContent = cleanedContent.replace(/<\/?meta[^>]*>/gi, '');
    
    // Extract body content if it exists, or use all content if no body tag
    const bodyMatch = cleanedContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      cleanedContent = bodyMatch[1];
    } else {
      // For simpler HTML, just clean up tag remnants
      cleanedContent = cleanedContent.replace(/<\/?body[^>]*>/gi, '');
    }
    
    // Clean up iOS-specific font styling and replace with web-safe alternatives
    cleanedContent = cleanedContent.replace(/font-family:\s*['"]?SFProDisplay-Regular['"]?/gi, 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    cleanedContent = cleanedContent.replace(/font-family:\s*['"]?SFProDisplay-Semibold['"]?/gi, 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 600');
    
    // Ensure reasonable font sizes
    cleanedContent = cleanedContent.replace(/font-size:\s*18\.00px/gi, 'font-size: 16px');
    cleanedContent = cleanedContent.replace(/font-size:\s*([0-9]+)\.00px/gi, 'font-size: $1px');
    
    // Add some basic styling for better readability
    cleanedContent = cleanedContent.trim();
    
    return cleanedContent;
  }, [content]);

  // For plain text content, render as simple text
  if (!content.includes('<')) {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  // For HTML content, render safely
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
      style={{
        lineHeight: '1.6',
        color: 'inherit'
      }}
    />
  );
}