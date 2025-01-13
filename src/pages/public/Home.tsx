import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button } from '../../components/shared/Button';

const HeroSection = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary + '20'}, ${({ theme }) => theme.colors.secondary + '20'});

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  font-weight: ${({ theme }) => theme.typography.weights.bold};

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;

  a {
    text-decoration: none;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 0 2rem;

    a {
      width: 100%;
    }

    button {
      width: 100%;
    }
  }
`;

const FeaturesSection = styled.div`
  padding: 4rem 1rem;
  background-color: ${({ theme }) => theme.colors.white};

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1rem;
    font-size: 1.5rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  p {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    line-height: 1.5;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Home = () => {
  return (
    <div>
      <HeroSection>
        <Title>Welcome to AI Character Chat</Title>
        <Subtitle>
          Experience unique conversations with AI-powered characters. Engage, learn,
          and be entertained through interactive dialogues.
        </Subtitle>
        <ButtonGroup>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
          <Link to="/about">
            <Button $variant="secondary">Learn More</Button>
          </Link>
        </ButtonGroup>
      </HeroSection>

      <FeaturesSection>
        <FeaturesGrid>
          <FeatureCard>
            <h3>Unique Characters</h3>
            <p>Chat with diverse AI personalities, each with their own unique traits and knowledge.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>Real-time Interaction</h3>
            <p>Enjoy seamless, real-time conversations with instant responses.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>Secure & Private</h3>
            <p>Your conversations are protected with enterprise-grade security.</p>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>
    </div>
  );
};

export default Home;
