import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * WYSIWYG Editor component with image paste support
 * Supports pasting images from clipboard and uploading via toolbar
 */
function WysiwygEditor({ value, onChange, disabled }) {
  const quillRef = useRef(null);

  // Custom image handler for the toolbar button
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', e.target.result);
            quill.setSelection(range.index + 1);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
      // Custom clipboard matcher to handle pasted images
      matchers: [
        ['IMG', (node, delta) => {
          // Keep images as-is when pasting
          return delta;
        }]
      ]
    }
  }), [imageHandler]);

  // Handle paste events to support image pasting from clipboard
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = (e) => {
      // Get clipboard data
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (!items) return;

      // Look for image data in clipboard
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // Prevent Quill's default paste handling for images
          e.preventDefault();
          e.stopPropagation();
          
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              // Get current selection or insert at the beginning
              const range = quill.getSelection(true) || quill.getSelection();
              const index = range ? range.index : 0;
              
              // Insert image as base64 data URL
              quill.insertEmbed(index, 'image', event.target.result);
              // Move cursor after the image
              quill.setSelection(index + 1);
            };
            reader.readAsDataURL(file);
          }
          // Only process the first image found
          break;
        }
      }
    };

    // Get the editor container element
    const editorContainer = quill.root;
    
    // Add paste listener with capture phase to intercept before Quill processes it
    editorContainer.addEventListener('paste', handlePaste, { capture: true });

    return () => {
      editorContainer.removeEventListener('paste', handlePaste, { capture: true });
    };
  }, []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link',
    'image'
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        style={{ 
          minHeight: '400px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      />
    </div>
  );
}

export default WysiwygEditor;
