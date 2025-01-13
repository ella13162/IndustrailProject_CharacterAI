import React from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $type: 'error' | 'warning' }>`
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  background: ${({ $type, theme }) => 
    $type === 'error' 
      ? `${theme.colors.error}10`
      : `${theme.colors.warning}10`
  };
  color: ${({ $type, theme }) => 
    $type === 'error' 
      ? theme.colors.error
      : theme.colors.warning
  };
  border: 1px solid ${({ $type, theme }) => 
    $type === 'error' 
      ? theme.colors.error
      : theme.colors.warning
  };
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid currentColor;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  margin-left: auto;

  &:hover {
    opacity: 0.8;
  }
`;

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning';
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  type = 'error',
  onRetry 
}) => {
  return (
    <Container $type={type}>
      <span>{message}</span>
      {onRetry && (
        <RetryButton onClick={onRetry}>
          Retry
        </RetryButton>
      )}
    </Container>
  );
};

export default ErrorMessage;
