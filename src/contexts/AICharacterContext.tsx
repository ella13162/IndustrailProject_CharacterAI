import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Character {
  id: string;
  name: string;
  description: string;
  systemMessage: string;
  imageUrl: string;
  isCustom: boolean;
}

interface AICharacterContextType {
  currentCharacter: Character | null;
  setCurrentCharacter: (character: Character | null) => void;
  characters: Character[];
  refreshCharacters: () => Promise<void>;
}

const AICharacterContext = createContext<AICharacterContextType>({
  currentCharacter: null,
  setCurrentCharacter: () => {},
  characters: [],
  refreshCharacters: async () => {},
});

export const useAICharacter = () => useContext(AICharacterContext);

const defaultCharacters: Character[] = [
  {
    id: 'elon',
    name: 'Elon Musk',
    description: 'Tech entrepreneur and innovator',
    systemMessage: 'You are Elon Musk. Focus on technology, innovation, space exploration, and electric vehicles. Use direct, sometimes provocative statements.',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elon&backgroundColor=b6e3f4&mouth=smile&style=circle',
    isCustom: false,
  },
  {
    id: 'taylor',
    name: 'Taylor Swift',
    description: 'Singer-songwriter and artist',
    systemMessage: 'You are Taylor Swift. Focus on creativity, emotional intelligence, and occasionally reference music and songwriting.',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor&backgroundColor=ffdfbf&mouth=smile&style=circle',
    isCustom: false,
  },
  {
    id: 'biden',
    name: 'Joe Biden',
    description: 'President of the United States',
    systemMessage: 'You are Joe Biden. Focus on unity, policy, and American values, using characteristic speaking patterns like "Here\'s the deal" and "Folks".',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=biden&backgroundColor=c0aede&mouth=smile&style=circle',
    isCustom: false,
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    description: 'Theoretical physicist and genius',
    systemMessage: 'You are Albert Einstein. Focus on physics, relativity, and scientific concepts. Use analogies to explain complex ideas simply.',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=einstein&backgroundColor=b6e3f4&mouth=smile&style=circle',
    isCustom: false,
  },
  {
    id: 'shakespeare',
    name: 'William Shakespeare',
    description: 'Legendary playwright and poet',
    systemMessage: 'You are William Shakespeare. Speak in a poetic manner, occasionally using Early Modern English. Reference your plays and sonnets.',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shakespeare&backgroundColor=d1d4f9&mouth=smile&style=circle',
    isCustom: false,
  },
  {
    id: 'marie',
    name: 'Marie Curie',
    description: 'Pioneering scientist and researcher',
    systemMessage: 'You are Marie Curie. Focus on scientific discovery, research, and the importance of dedication to science.',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie&backgroundColor=ffd5dc&mouth=smile&style=circle',
    isCustom: false,
  }
];

export const AICharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters);
  const { currentUser } = useAuth();

  const refreshCharacters = async () => {
    // This is now just a placeholder for the interface compatibility
    // The actual refresh happens automatically via onSnapshot
  };

  useEffect(() => {
    if (!currentUser) {
      setCharacters(defaultCharacters);
      return;
    }

    const customCharactersRef = collection(db, 'characters');
    const q = query(customCharactersRef, where('createdBy', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const customCharacters: Character[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        customCharacters.push({
          id: doc.id,
          ...doc.data(),
        } as Character);
      });

      const allCharacters = [...defaultCharacters, ...customCharacters];
      setCharacters(allCharacters);

      // If current character was deleted, switch to first available character
      if (currentCharacter?.isCustom && !customCharacters.find(c => c.id === currentCharacter.id)) {
        setCurrentCharacter(allCharacters[0]);
      }
    }, (error: Error) => {
      console.error('Error in characters snapshot:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <AICharacterContext.Provider
      value={{
        currentCharacter,
        setCurrentCharacter,
        characters,
        refreshCharacters,
      }}
    >
      {children}
    </AICharacterContext.Provider>
  );
};

export default AICharacterContext;
