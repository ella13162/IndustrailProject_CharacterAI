import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const PageContainer = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${systemFont};
  background: ${({ theme }) => theme.colors.background};
`;

export const ChatWrapper = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
`;

export const Sidebar = styled.div<{ $isOpen: boolean }>`
  width: 320px;
  background: ${({ theme }) => theme.colors.background};
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: hidden;
  flex-shrink: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    position: static;
    transform: none;
  }
`;

export const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.background};
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: calc(100% - 320px);
  }
`;

export const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const SidebarSection = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
`;

export const BackButton = styled.button`
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: 40px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SidebarHeading = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${systemFont};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeaderContainer = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`;

export const CharacterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 180px);
  width: 100%;
  font-family: ${systemFont};
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary + '40'};
  }
`;

export const ChatHistorySection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: ${systemFont};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary + '40'};
  }
`;

export const CharacterItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 0;
  gap: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary + '10' : 'transparent'};
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  min-width: 0;
  width: 100%;
  position: relative;
  font-family: ${systemFont};
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  & > div[role="button"] {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%) !important;
    z-index: 20;
    opacity: 0;
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 4px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.background};

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: rgba(220, 38, 38, 0.1);
      color: rgb(220, 38, 38);
    }

    &:hover:active {
      background: rgba(220, 38, 38, 0.2);
    }

    &:active {
      transform: translateY(-50%) scale(0.95) !important;
    }
  }

  &:hover > div[role="button"] {
    opacity: 1;
  }

  & > div[role="button"]:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.4);
  }
`;

export const CharacterIcon = styled.div<{ $imageUrl?: string; $bgColor?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover`
      : props.$bgColor || '#4B5563'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const CharacterName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${systemFont};
`;

export const CharacterDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  font-family: ${systemFont};
  width: calc(100% - 40px);
`;

export const ChatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
  height: calc(100% - 212px);
  font-family: ${systemFont};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary + '40'};
  }
`;

export const ChatItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 32px 8px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary + '10' : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  font-family: ${systemFont};
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }

  & > div[role="button"] {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%) !important;
    z-index: 20;
    opacity: 0;
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 8px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.secondary};

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: rgba(220, 38, 38, 0.1);
      color: rgb(220, 38, 38);
    }

    &:hover:active {
      background: rgba(220, 38, 38, 0.2);
    }

    &:active {
      transform: translateY(-50%) scale(0.95) !important;
    }
  }

  &:hover > div[role="button"] {
    opacity: 1;
  }

  & > div[role="button"]:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.4);
  }
`;

export const ChatItemContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-right: 8px;
`;

export const ChatTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${systemFont};
`;

export const ChatDate = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${systemFont};
`;

export const ChatInner = styled.div`
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 0 16px;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 24px;
  }
`;

export const ChatHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  flex-shrink: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  position: relative;
  margin: 0;
  padding: 0 24px;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    bottom: -24px;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(to bottom, ${({ theme }) => theme.colors.surface}, transparent);
    pointer-events: none;
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
    font-family: ${systemFont};
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-height: 0;
  height: 100%;
  box-sizing: border-box;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary + '40'};
  }

  .message-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 16px;
    margin-bottom: 8px;
    box-sizing: border-box;

    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: 0 24px;
    }

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 16px;
    }

    .message {
      align-self: flex-start;
      max-width: 65%;
      width: auto;
      box-sizing: border-box;

      &[data-user="true"] {
        align-self: flex-end;
      }

      > div {
        max-width: 100%;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        white-space: pre-wrap;
        display: inline-block;
        width: 100%;
      }
    }

    .reactions {
      align-self: flex-start;
      padding-left: 8px;

      &:has(+ .message[data-user="true"]),
      &:has(~ .message[data-user="true"]) {
        align-self: flex-end;
        padding-right: 8px;
        padding-left: 0;
      }
    }
  }
`;

export const Message = styled.div<{ $isUser: boolean }>`
  position: relative;
  display: inline-block;
  background: ${props =>
    props.$isUser
      ? props.theme.colors.primary
      : props.theme.colors.surface};
  color: ${props =>
    props.$isUser
      ? props.theme.colors.text.inverse
      : props.theme.colors.text.primary};
  padding: 16px 20px;
  border-radius: 24px;
  border: 1px solid ${props =>
    props.$isUser
      ? 'transparent'
      : props.theme.colors.border + '40'};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  line-height: 1.5;
  font-family: ${systemFont};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 0;
  max-width: 100%;
  box-sizing: border-box;

  &[data-typing="true"] {
    padding-right: 48px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: 20px;
      bottom: 18px;
      width: 4px;
      height: 4px;
      background: ${({ $isUser, theme }) => 
        $isUser ? theme.colors.text.inverse : theme.colors.text.primary};
      border-radius: 50%;
      opacity: 0.6;
      box-shadow: 
        -8px 0 0 0 ${({ $isUser, theme }) => 
          $isUser ? theme.colors.text.inverse : theme.colors.text.primary},
        -16px 0 0 0 ${({ $isUser, theme }) => 
          $isUser ? theme.colors.text.inverse : theme.colors.text.primary};
      animation: typing 1.4s infinite linear;
    }
  }

  @keyframes typing {
    0%, 100% {
      opacity: 0.6;
      transform: translateY(0);
    }
    50% {
      opacity: 0.2;
      transform: translateY(-2px);
    }
  }
`;

export const InputContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 16px 24px;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
`;

export const Input = styled.textarea`
  width: 100%;
  padding: 14px 76px 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border + '40'};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  resize: none;
  height: 48px;
  max-height: 200px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${systemFont};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border + '20'};
    cursor: not-allowed;
  }
`;

export const StyledButton = styled.button`
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  height: 38px;
  min-width: 70px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  font-family: ${systemFont};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
    transform: translateY(calc(-50% - 1px));
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const MenuToggle = styled.button`
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 20;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  font-family: ${systemFont};

  &:hover {
    opacity: 0.9;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

export const NewChatButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: ${systemFont};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  &:hover {
    opacity: 0.9;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const NavigationLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${systemFont};
  background: ${({ theme }) => theme.colors.surface};
`;

export const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.fast};
  font-family: ${systemFont};

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
  }
`;
