import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const SettingsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[8]};
  max-width: 800px;
  margin: 0 auto;
`;

const SettingsSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const OptionGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ToggleLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Settings = () => {
  const { colorMode, setColorMode, fontSize, setFontSize } = useTheme();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [markdownEnabled, setMarkdownEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return null;
  }

  const handleExportHistory = async () => {
    setLoading(true);
    try {
      // Implementation for exporting chat history
      const response = await fetch(`/api/export-history?userId=${currentUser.uid}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <SettingsSection>
        <SectionTitle>Appearance</SectionTitle>
        
        <OptionGroup>
          <Label htmlFor="theme">Theme</Label>
          <Select
            id="theme"
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as 'light' | 'dark' | 'system')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </OptionGroup>

        <OptionGroup>
          <Label htmlFor="fontSize">Font Size</Label>
          <Select
            id="fontSize"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </Select>
        </OptionGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Preferences</SectionTitle>
        
        <ToggleContainer>
          <ToggleLabel>Enable Notifications</ToggleLabel>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <ToggleSlider />
          </Toggle>
        </ToggleContainer>

        <ToggleContainer>
          <ToggleLabel>Enable Sound Effects</ToggleLabel>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <ToggleSlider />
          </Toggle>
        </ToggleContainer>

        <ToggleContainer>
          <ToggleLabel>Enable Markdown Formatting</ToggleLabel>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={markdownEnabled}
              onChange={(e) => setMarkdownEnabled(e.target.checked)}
            />
            <ToggleSlider />
          </Toggle>
        </ToggleContainer>

        <OptionGroup>
          <Label htmlFor="language">Language</Label>
          <Select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
          </Select>
        </OptionGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Account</SectionTitle>
        <OptionGroup>
          <Label>Email</Label>
          <div>{currentUser.email}</div>
        </OptionGroup>
        
        <OptionGroup>
          <Label>Chat History</Label>
          <Button onClick={handleExportHistory} disabled={loading}>
            {loading ? 'Exporting...' : 'Export Chat History'}
          </Button>
        </OptionGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Keyboard Shortcuts</SectionTitle>
        <OptionGroup>
          <Label>Send Message</Label>
          <div>Enter</div>
        </OptionGroup>
        <OptionGroup>
          <Label>New Line</Label>
          <div>Shift + Enter</div>
        </OptionGroup>
        <OptionGroup>
          <Label>Search Messages</Label>
          <div>Ctrl/Cmd + F</div>
        </OptionGroup>
        <OptionGroup>
          <Label>Quick Character Switch</Label>
          <div>Ctrl/Cmd + [1-9]</div>
        </OptionGroup>
      </SettingsSection>
    </SettingsContainer>
  );
};

export default Settings;
