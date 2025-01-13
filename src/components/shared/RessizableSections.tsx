import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface ResizableSectionsProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
`;

const Section = styled.div<{ $height: string }>`
  height: ${props => props.$height};
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: height, transform;
  transition: height 0.15s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ResizeHandle = styled.div<{ $isDragging: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 16px;
  margin-top: -8px;
  cursor: row-resize;
  background: transparent;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &::before {
    content: '';
    width: ${({ $isDragging }) => ($isDragging ? '48px' : '40px')};
    height: 4px;
    background: ${({ theme, $isDragging }) => 
      $isDragging ? theme.colors.primary : theme.colors.border};
    border-radius: 2px;
    opacity: ${({ $isDragging }) => ($isDragging ? 1 : 0)};
    transition: all 0.2s ease;
  }

  &:hover::before {
    opacity: 0.8;
    width: 48px;
  }

  &:active::before {
    opacity: 1;
    width: 48px;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const ResizableSections: React.FC<ResizableSectionsProps> = ({
  topContent,
  bottomContent
}) => {
  const [topHeight, setTopHeight] = useState('60%');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    const container = containerRef.current;
    if (container) {
      const topSection = container.firstElementChild as HTMLElement;
      startHeightRef.current = topSection.offsetHeight;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerHeight = container.offsetHeight;
      const delta = e.clientY - startYRef.current;
      const newHeight = startHeightRef.current + delta;
      
      // Convert to percentage and clamp between 30% and 70%
      const percentage = Math.max(30, Math.min(70, (newHeight / containerHeight) * 100));
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (container.firstElementChild instanceof HTMLElement) {
          container.firstElementChild.style.height = `${percentage}%`;
        }
        if (container.lastElementChild instanceof HTMLElement) {
          container.lastElementChild.style.height = `${100 - percentage}%`;
        }
      });
    };

    const handleMouseUp = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const topSection = container.firstElementChild as HTMLElement;
      const percentage = (topSection.offsetHeight / container.offsetHeight) * 100;
      
      // Update state after drag ends
      requestAnimationFrame(() => {
        setTopHeight(`${percentage}%`);
        setIsDragging(false);
      });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (!isDragging) {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
  }, [isDragging]);

  // Reset sections when content changes
  useEffect(() => {
    setTopHeight('60%');
  }, [topContent, bottomContent]);

  return (
    <Container ref={containerRef}>
      <Section $height={topHeight}>
        {topContent}
      </Section>
      
      <ResizeHandle $isDragging={isDragging} onMouseDown={handleMouseDown} />
      
      <Section $height={`calc(100% - ${topHeight})`}>
        {bottomContent}
      </Section>
    </Container>
  );
};

export default ResizableSections;
