import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAICharacter } from '../../contexts/AICharacterContext';
import { Button } from '../../components/shared/Button';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const CharacterCard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CharacterName = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const CharacterDescription = styled.p`
  color: #666;
  margin: 0;
  flex-grow: 1;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;

  h1 {
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
`;

const Dashboard = () => {
  const { characters, setCurrentCharacter } = useAICharacter();
  const navigate = useNavigate();

  const handleCharacterSelect = (character: any) => {
    setCurrentCharacter(character);
    navigate('/chat');
  };

  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Welcome to AI Character Chat</h1>
        <p>Choose a character to start an engaging conversation</p>
      </WelcomeSection>
      
      <CharacterGrid>
        {characters.map((character) => (
          <CharacterCard key={character.id}>
            <CharacterName>{character.name}</CharacterName>
            <CharacterDescription>{character.description}</CharacterDescription>
            <Button onClick={() => handleCharacterSelect(character)}>
              Chat Now
            </Button>
          </CharacterCard>
        ))}
      </CharacterGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
