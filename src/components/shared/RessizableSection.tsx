import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface ResizableSectionProps {
  children: React.ReactNode;
  defaultHeight: string;
  minHeight: string;
  maxHeight: string;
}

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
`;

interface ContentProps {
  $height: string;
  $isResizing?: boolean;
}

const Content = styled.div<ContentProps>`
  height: ${props => props.$height};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: ${props => props.$isResizing ? 'none' : 'height 0.2s ease'};
`;

const ResizeHandle = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  margin: -3px 0;
  background: transparent;
  cursor: row-resize;
  transition: background 0.2s;
  z-index: 10;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }

  &:active {
    background: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background: ${({ theme }) => theme.colors.border};
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::before,
  &:active::before {
    opacity: 1;
  }
`;

export const ResizableSection: React.FC<ResizableSectionProps> = ({
  children,
  defaultHeight,
  minHeight,
  maxHeight
}) => {
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = containerRef.current?.clientHeight || 0;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Get the resizable sections container (two levels up from the current container)
      const sectionsContainer = containerRef.current?.parentElement?.parentElement;
      if (!sectionsContainer) return;

      const containerRect = sectionsContainer.getBoundingClientRect();
      const delta = e.clientY - startYRef.current;
      const newHeight = startHeightRef.current + delta;

      // Convert minHeight and maxHeight from percentages to pixels
      const minHeightPx = (parseFloat(minHeight) / 100) * containerRect.height;
      const maxHeightPx = (parseFloat(maxHeight) / 100) * containerRect.height;

      // Clamp the height between minHeight and maxHeight
      const clampedHeight = Math.max(minHeightPx, Math.min(maxHeightPx, newHeight));
      const clampedPercentage = (clampedHeight / containerRect.height) * 100;

      setHeight(`${clampedPercentage}%`);

      // Prevent text selection and scrolling while dragging
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, minHeight, maxHeight]);

  return (
    <Container ref={containerRef}>
      <Content 
        $height={height}
        $isResizing={isDragging}
      >
        {children}
      </Content>
      <ResizeHandle 
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </Container>
  );
};
