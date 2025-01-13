import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.sizes.base};
    line-height: ${props => props.theme.typography.lineHeights.normal};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1 {
    font-size: ${props => props.theme.typography.sizes.h1};
    font-weight: ${props => props.theme.typography.weights.bold};
    line-height: ${props => props.theme.typography.lineHeights.tight};
    margin-bottom: ${props => props.theme.spacing[4]};
  }

  h2 {
    font-size: ${props => props.theme.typography.sizes.h2};
    font-weight: ${props => props.theme.typography.weights.semibold};
    line-height: ${props => props.theme.typography.lineHeights.tight};
    margin-bottom: ${props => props.theme.spacing[3]};
  }

  h3 {
    font-size: ${props => props.theme.typography.sizes['2xl']};
    font-weight: ${props => props.theme.typography.weights.semibold};
    line-height: ${props => props.theme.typography.lineHeights.tight};
    margin-bottom: ${props => props.theme.spacing[2]};
  }

  p {
    margin-bottom: ${props => props.theme.spacing[4]};
    line-height: ${props => props.theme.typography.lineHeights.relaxed};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.fast};

    &:hover {
      color: ${props => props.theme.colors.secondary};
    }
  }

  button {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.sizes.base};
    cursor: pointer;
  }

  input, textarea, select {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.sizes.base};
  }

  ::selection {
    background-color: ${props => `${props.theme.colors.primary}40`};
    color: ${props => props.theme.colors.text.primary};
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.full};
    
    &:hover {
      background: ${props => props.theme.colors.text.secondary};
    }
  }

  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
  }
`;
