import React, { useState, useEffect, useCallback } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  children?: (displayedText: string) => React.ReactNode;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ 
  text, 
  speed = 25,
  onComplete,
  children
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const typeText = useCallback(() => {
    let currentIndex = 0;
    let currentText = '';
    let isProcessingMarkdown = false;
    let markdownBuffer = '';
    let timeoutId: NodeJS.Timeout;

    const typeNextCharacter = () => {
      if (currentIndex >= text.length) {
        setIsComplete(true);
        onComplete?.();
        return;
      }

      const char = text[currentIndex];

      // Handle markdown special characters
      if (char === '`' || char === '*' || char === '_' || char === '>' || char === '#') {
        isProcessingMarkdown = true;
        markdownBuffer += char;
      } else if (isProcessingMarkdown) {
        markdownBuffer += char;
        
        // Check if we should end markdown processing
        if (
          (markdownBuffer.startsWith('```') && markdownBuffer.endsWith('```')) ||
          (markdownBuffer.startsWith('`') && char === '`') ||
          (markdownBuffer.startsWith('**') && markdownBuffer.endsWith('**')) ||
          (markdownBuffer.startsWith('*') && char === '*') ||
          (markdownBuffer.startsWith('__') && markdownBuffer.endsWith('__')) ||
          (markdownBuffer.startsWith('_') && char === '_') ||
          (markdownBuffer.startsWith('>') && char === ' ') ||
          (markdownBuffer.startsWith('#') && char === ' ')
        ) {
          currentText += markdownBuffer;
          setDisplayedText(currentText);
          isProcessingMarkdown = false;
          markdownBuffer = '';
        }
      } else {
        currentText += char;
        setDisplayedText(currentText);
      }

      currentIndex++;
      timeoutId = setTimeout(typeNextCharacter, speed);
    };

    // Start typing immediately
    requestAnimationFrame(typeNextCharacter);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text, speed, onComplete]);

  useEffect(() => {
    // Start with empty text but show immediately
    setDisplayedText('');
    setIsComplete(false);
    const cleanup = typeText();
    
    return () => {
      cleanup();
      setDisplayedText('');
      setIsComplete(false);
    };
  }, [text, typeText]);

  // Ensure we always return a ReactElement
  return children ? 
    <>{children(displayedText)}</> : 
    <span>{displayedText}</span>;
};

export default React.memo(TypingEffect);
