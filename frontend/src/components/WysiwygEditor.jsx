import React, { useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * WYSIWYG Editor component with image paste support
 * Supports pasting images from clipboard and uploading via toolbar
 */
function WysiwygEditor({ value, onChange, disabled }) {
  const quillRef = useRef(null);

  // Custom image handler for the toolbar button
  const imageHandler = () => {
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
  };

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
  }), []);

  // Handle paste events to support image pasting
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData?.items;

      if (!items) return;

      // Check if clipboard contains an image
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          
          const file = items[i].getAsFile();
          const reader = new FileReader();

          reader.onload = (event) => {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', event.target.result);
            quill.setSelection(range.index + 1);
          };

          reader.readAsDataURL(file);
          break;
        }
      }
    };

    const editorElement = quill.root;
    editorElement.addEventListener('paste', handlePaste);

    return () => {
      editorElement.removeEventListener('paste', handlePaste);
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
