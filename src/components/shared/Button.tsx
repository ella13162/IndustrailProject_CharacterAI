import styled from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'danger' | 'success';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
  $loading?: boolean;
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme, $size }) => 
    $size === 'sm' ? `${theme.spacing[1]} ${theme.spacing[3]}` :
    $size === 'lg' ? `${theme.spacing[3]} ${theme.spacing[6]}` :
    `${theme.spacing[2]} ${theme.spacing[4]}`};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme, $size }) => 
    $size === 'sm' ? theme.typography.sizes.sm :
    $size === 'lg' ? theme.typography.sizes.lg :
    theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: ${({ disabled, $loading }) => (disabled || $loading ? 'not-allowed' : 'pointer')};
  transition: all ${({ theme }) => theme.transitions.fast};
  opacity: ${({ disabled, $loading }) => (disabled || $loading ? 0.6 : 1)};
  position: relative;
  
  background: ${({ theme, $variant = 'primary' }) => 
    $variant === 'secondary' ? theme.colors.surface :
    $variant === 'danger' ? theme.colors.error :
    $variant === 'success' ? theme.colors.success :
    theme.colors.primary};
    
  color: ${({ theme, $variant = 'primary' }) => 
    $variant === 'secondary' ? theme.colors.text.primary :
    theme.colors.text.inverse};
    
  border: 1px solid ${({ theme, $variant = 'primary' }) => 
    $variant === 'secondary' ? theme.colors.border :
    $variant === 'danger' ? theme.colors.error :
    $variant === 'success' ? theme.colors.success :
    theme.colors.primary};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
    
    background: ${({ theme, $variant = 'primary' }) => 
      $variant === 'secondary' ? `${theme.colors.surface}` :
      $variant === 'danger' ? `${theme.colors.error}dd` :
      $variant === 'success' ? `${theme.colors.success}dd` :
      `${theme.colors.primary}dd`};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme, $variant = 'primary' }) => 
      $variant === 'secondary' ? `${theme.colors.border}40` :
      $variant === 'danger' ? `${theme.colors.error}40` :
      $variant === 'success' ? `${theme.colors.success}40` :
      `${theme.colors.primary}40`};
  }

  ${({ $loading }) => $loading && `
    color: transparent !important;
    pointer-events: none;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin: -8px 0 0 -8px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: button-loading-spinner 0.75s linear infinite;
    }

    @keyframes button-loading-spinner {
      from {
        transform: rotate(0turn);
      }
      to {
        transform: rotate(1turn);
      }
    }
  `}
`;

Button.defaultProps = {
  $variant: 'primary',
  $size: 'md',
  $fullWidth: false,
  $loading: false,
  disabled: false,
};
