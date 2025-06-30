import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import { Extension } from '@tiptap/core'
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline as UnderlineIcon, List } from "lucide-react"
import { useEffect } from 'react'

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Custom extension to handle space bar explicitly
const SpaceHandler = Extension.create({
  name: 'spaceHandler',
  
  addKeyboardShortcuts() {
    return {
      'Space': () => {
        return this.editor.commands.insertContent(' ')
      },
    }
  },
})

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in bullet list to avoid conflicts
        bulletList: false,
        listItem: false,
      }),
      Underline,
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      ListItem,
      SpaceHandler,
    ],
    content: convertToTipTapFormat(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      console.log('🔍 TipTap Raw HTML:', html)
      const iosCompatibleHtml = convertToIOSFormat(html)
      console.log('🔍 iOS Compatible HTML:', iosCompatibleHtml)
      console.log('🔍 Space count in iOS HTML:', (iosCompatibleHtml.match(/ /g) || []).length)
      onChange(iosCompatibleHtml)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const tipTapContent = convertToTipTapFormat(content)
      editor.commands.setContent(tipTapContent, false)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-gray-800">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[200px] focus-within:outline-none"
      />
    </div>
  )
}

// Convert iOS HTML format to TipTap-compatible format
function convertToTipTapFormat(iosHtml: string): string {
  if (!iosHtml) return ''
  
  // Remove DOCTYPE and HTML wrapper if present
  let content = iosHtml
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .trim()

  // Convert iOS span classes to standard HTML
  content = content
    .replace(/<span class="s4">/gi, '<strong>') // Bold
    .replace(/<span class="s3">/gi, '<em>') // Italic  
    .replace(/<span class="s2">/gi, '<u>') // Underline
    .replace(/<span class="s1">/gi, '') // Regular text - remove wrapper
    .replace(/<\/span>/gi, (match, offset, string) => {
      // Close the appropriate tag based on what we opened
      const before = string.substring(0, offset)
      if (before.lastIndexOf('<strong>') > before.lastIndexOf('</strong>')) {
        return '</strong>'
      } else if (before.lastIndexOf('<em>') > before.lastIndexOf('</em>')) {
        return '</em>'
      } else if (before.lastIndexOf('<u>') > before.lastIndexOf('</u>')) {
        return '</u>'
      }
      return '' // s1 spans are removed
    })

  return content
}

// Convert TipTap HTML back to iOS-compatible format
function convertToIOSFormat(tipTapHtml: string): string {
  if (!tipTapHtml) return ''

  // First, handle text formatting by converting elements to iOS span classes
  let iosHtml = tipTapHtml
    .replace(/<strong>([^<]*)<\/strong>/gi, '<span class="s4">$1</span>')
    .replace(/<em>([^<]*)<\/em>/gi, '<span class="s3">$1</span>')
    .replace(/<u>([^<]*)<\/u>/gi, '<span class="s2">$1</span>')

  // Wrap any remaining unformatted text in s1 spans
  iosHtml = iosHtml.replace(/>([^<]*)</g, (match, textContent) => {
    if (textContent && !textContent.includes('span class=')) {
      return `><span class="s1">${textContent}</span><`
    }
    return match
  })

  return iosHtml
}