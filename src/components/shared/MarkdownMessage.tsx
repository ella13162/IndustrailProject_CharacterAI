import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeProps extends React.ComponentProps<'code'> {
  inline?: boolean;
  className?: string;
}

const MarkdownContainer = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  width: 100%;
  min-width: 0;
  max-width: 100%;

  p {
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    &:last-child {
      margin-bottom: 0;
    }
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
  }

  * {
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: ${({ theme }) => theme.spacing[4]};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }

  ul, ol {
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    padding-left: ${({ theme }) => theme.spacing[6]};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: opacity ${({ theme }) => theme.transitions.fast};

    &:hover {
      opacity: 0.8;
    }
  }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    padding-left: ${({ theme }) => theme.spacing[4]};
    margin: ${({ theme }) => theme.spacing[4]} 0;
    font-style: italic;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  code {
    font-family: ${({ theme }) => theme.typography.monoFontFamily};
    padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: 0.9em;
  }

  pre {
    margin: ${({ theme }) => theme.spacing[4]} 0;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    overflow: hidden;

    code {
      padding: 0;
      background: none;
    }
  }

  img {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    margin: ${({ theme }) => theme.spacing[4]} 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${({ theme }) => theme.spacing[4]} 0;
  }

  th, td {
    padding: ${({ theme }) => theme.spacing[2]};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.surface};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }
`;

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const { colorMode } = useTheme();

  return (
    <MarkdownContainer>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={colorMode === 'dark' ? vscDarkPlus as any : vs as any}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownMessage;
