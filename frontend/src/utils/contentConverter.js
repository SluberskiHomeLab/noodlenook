import Showdown from 'showdown';
import TurndownService from 'turndown';

// Convert Markdown to HTML
export function markdownToHtml(markdown) {
  const converter = new Showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    simpleLineBreaks: false,
    openLinksInNewWindow: false,
    backslashEscapesHTMLTags: true
  });
  return converter.makeHtml(markdown);
}

// Convert HTML to Markdown
export function htmlToMarkdown(html) {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });
  return turndownService.turndown(html);
}
