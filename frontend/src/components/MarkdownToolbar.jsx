import React from 'react';
import { Bold, Italic, Heading, Link as LinkIcon, List, ListOrdered, Code, Quote } from 'lucide-react';

function MarkdownToolbar({ onInsert }) {
  const toolbarButtons = [
    { icon: Heading, label: 'H1', syntax: '# ', prefix: '# ' },
    { icon: Heading, label: 'H2', syntax: '## ', prefix: '## ' },
    { icon: Heading, label: 'H3', syntax: '### ', prefix: '### ' },
    { icon: Bold, label: 'Bold', syntax: '**text**', prefix: '**', suffix: '**' },
    { icon: Italic, label: 'Italic', syntax: '*text*', prefix: '*', suffix: '*' },
    { icon: LinkIcon, label: 'Link', syntax: '[text](url)', prefix: '[', suffix: '](url)' },
    { icon: List, label: 'Unordered List', syntax: '- ', prefix: '- ' },
    { icon: ListOrdered, label: 'Ordered List', syntax: '1. ', prefix: '1. ' },
    { icon: Code, label: 'Code Block', syntax: '```\ncode\n```', prefix: '```\n', suffix: '\n```' },
    { icon: Quote, label: 'Quote', syntax: '> ', prefix: '> ' },
  ];

  const handleButtonClick = (button) => {
    onInsert(button.prefix, button.suffix || '');
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

export default MarkdownToolbar;
