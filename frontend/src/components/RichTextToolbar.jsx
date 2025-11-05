import React from 'react';
import { Bold, Italic, Heading, Link as LinkIcon, List, ListOrdered, Code, Quote } from 'lucide-react';

function RichTextToolbar({ onInsert }) {
  const toolbarButtons = [
    { icon: Heading, label: 'H1', prefix: '<h1>', suffix: '</h1>' },
    { icon: Heading, label: 'H2', prefix: '<h2>', suffix: '</h2>' },
    { icon: Heading, label: 'H3', prefix: '<h3>', suffix: '</h3>' },
    { icon: Bold, label: 'Bold', prefix: '<strong>', suffix: '</strong>' },
    { icon: Italic, label: 'Italic', prefix: '<em>', suffix: '</em>' },
    { icon: LinkIcon, label: 'Link', prefix: '<a href="url">', suffix: '</a>' },
    { icon: List, label: 'Unordered List', prefix: '<ul>\n  <li>', suffix: '</li>\n</ul>' },
    { icon: ListOrdered, label: 'Ordered List', prefix: '<ol>\n  <li>', suffix: '</li>\n</ol>' },
    { icon: Code, label: 'Code Block', prefix: '<pre><code>', suffix: '</code></pre>' },
    { icon: Quote, label: 'Quote', prefix: '<blockquote>', suffix: '</blockquote>' },
  ];

  const handleButtonClick = (button) => {
    onInsert(button.prefix, button.suffix);
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      padding: '0.75rem',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem'
    }}>
      {toolbarButtons.map((button, index) => {
        const Icon = button.icon;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleButtonClick(button)}
            className="btn-secondary"
            style={{
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              minWidth: 'auto'
            }}
            title={button.label}
          >
            <Icon size={16} />
            {button.label.includes('H') ? button.label : null}
          </button>
        );
      })}
    </div>
  );
}

export default RichTextToolbar;
