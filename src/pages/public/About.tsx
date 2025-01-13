import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[8]};
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[16]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.h1};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.h2};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-4px);
  }
`;

const CharacterName = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const CharacterDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  &:before {
    content: "•";
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const About = () => {
  return (
    <Container>
      <Hero>
        <Title>Meet Our AI Characters</Title>
        <Subtitle>
          Engage in meaningful conversations with unique AI personalities, each bringing their own expertise and perspective.
        </Subtitle>
      </Hero>

      <Section>
        <SectionTitle>Available Characters</SectionTitle>
        <Grid>
          <Card>
            <CharacterName>Elon</CharacterName>
            <CharacterDescription>
              A tech visionary and entrepreneur with expertise in electric vehicles, space exploration, and innovation.
            </CharacterDescription>
            <FeatureList>
              <FeatureItem>Deep knowledge of technology and innovation</FeatureItem>
              <FeatureItem>Insights on entrepreneurship and leadership</FeatureItem>
              <FeatureItem>Perspective on future technologies</FeatureItem>
            </FeatureList>
          </Card>

          <Card>
            <CharacterName>Taylor</CharacterName>
            <CharacterDescription>
              A creative artist with deep understanding of music, songwriting, and emotional expression.
            </CharacterDescription>
            <FeatureList>
              <FeatureItem>Creative writing and songwriting expertise</FeatureItem>
              <FeatureItem>Emotional intelligence and empathy</FeatureItem>
              <FeatureItem>Understanding of the music industry</FeatureItem>
            </FeatureList>
          </Card>

          <Card>
            <CharacterName>Joe Biden</CharacterName>
            <CharacterDescription>
              A political figure with extensive knowledge of American politics, policy, and governance.
            </CharacterDescription>
            <FeatureList>
              <FeatureItem>Deep understanding of American politics</FeatureItem>
              <FeatureItem>Policy and governance expertise</FeatureItem>
              <FeatureItem>Historical political context</FeatureItem>
            </FeatureList>
          </Card>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>How It Works</SectionTitle>
        <Grid>
          <Card>
            <CharacterName>1. Choose a Character</CharacterName>
            <CharacterDescription>
              Select from our diverse range of AI characters, each with their own unique personality and expertise.
            </CharacterDescription>
          </Card>

          <Card>
            <CharacterName>2. Start a Conversation</CharacterName>
            <CharacterDescription>
              Begin chatting with your chosen character. They'll respond in their unique voice while maintaining context.
            </CharacterDescription>
          </Card>

          <Card>
            <CharacterName>3. Learn and Engage</CharacterName>
            <CharacterDescription>
              Gain insights, explore ideas, and engage in meaningful conversations tailored to each character's expertise.
            </CharacterDescription>
          </Card>
        </Grid>
      </Section>
    </Container>
  );
};

export default About;
