import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Function to detect if text appears to be reversed due to RTL issues
export function isTextReversed(text: string): boolean {
  if (!text || text.length < 10) return false;
  
  // Remove HTML tags for analysis
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  if (cleanText.length < 10) return false;
  
  // Check for common English patterns that would indicate reversed text
  const reversedPatterns = [
    /^eht\s/, // "the " reversed
    /\ssi\s/, // " is " reversed
    /\sdna\s/, // " and " reversed
    /\sfo\s/, // " of " reversed
    /\snA\s/, // " An " reversed
    /\sa\s.*si\s/, // "a ... is" pattern reversed
  ];
  
  return reversedPatterns.some(pattern => pattern.test(cleanText));
}

// Function to reverse character order while preserving HTML structure
export function reverseText(text: string): string {
  if (!text) return text;
  
  // Handle HTML content by reversing only text nodes
  if (text.includes('<')) {
    return text.replace(/>([^<]+)</g, (match, textContent) => {
      const reversed = textContent.split('').reverse().join('');
      return `>${reversed}<`;
    });
  }
  
  // For plain text, just reverse the characters
  return text.split('').reverse().join('');
}

// Function to migrate a single note's content
export async function migrateNoteContent(noteId: string, currentContent: string): Promise<void> {
  if (!isTextReversed(currentContent)) {
    console.log(`Note ${noteId} does not need migration`);
    return;
  }
  
  const correctedContent = reverseText(currentContent);
  
  try {
    await updateDoc(doc(db, "notes", noteId), {
      content: correctedContent,
      updatedAt: new Date()
    });
    
    console.log(`Successfully migrated note ${noteId}`);
  } catch (error) {
    console.error(`Failed to migrate note ${noteId}:`, error);
    throw error;
  }
}