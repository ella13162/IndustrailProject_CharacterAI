import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { format } from 'date-fns';

import { db } from '../../config/firebase';
import { openai } from '../../config/openai';
import { useAuth } from '../../contexts/AuthContext';
import { useAICharacter } from '../../contexts/AICharacterContext';
import { useTheme } from 'styled-components';
import type { Character } from '../../contexts/AICharacterContext';
import { ResizableSections } from '../../components/shared/ResizableSections';
import TypingEffect from '../../components/shared/TypingEffect';
import MarkdownMessage from '../../components/shared/MarkdownMessage';
import MessageReactions from '../../components/shared/MessageReactions';
import CreateCharacterModal from '../../components/shared/CreateCharacterModal';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { Button } from '../../components/shared/Button';

import {
  PageContainer,
  ChatWrapper,
  Sidebar,
  NewChatButton,
  SidebarContent,
  SidebarSection,
  SidebarHeading,
  HeaderContainer,
  CharacterList,
  CharacterItem,
  CharacterIcon,
  CharacterName,
  CharacterDescription,
  ChatList,
  ChatItem,
  ChatItemContent,
  ChatTitle,
  ChatDate,
  ChatContainer,
  ChatHeader,
  ChatMessages,
  Message,
  InputContainer,
  Input,
  StyledButton,
  MenuToggle,
  NavigationLinks,
  NavLink,
  ChatHistorySection,
  BackButton,
  systemFont,
  ChatInner
} from './ChatStyles';

interface ChatMessage {
  id: string;
  prompt?: string;
  response?: string;
  timestamp: any;
  reactions?: Reaction[];
  isNew?: boolean;
  isTypingComplete?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: any;
}

interface Reaction {
  emoji: string;
  users: string[];
}

interface UserStats {
  totalChats: number;
  totalMessages: number;
  characterStats: {
    [key: string]: number;
  };
  favoriteCharacter: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showingCharacters, setShowingCharacters] = useState(true);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [typingMessage, setTypingMessage] = useState<{id: string, text: string, onComplete: () => void} | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{message: string, retryFn: () => void} | null>(null);

  const { currentUser } = useAuth();
  const { currentCharacter, setCurrentCharacter, characters, refreshCharacters } = useAICharacter();
  const theme = useTheme();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (typingMessage) {
        scrollToBottom();
      }
    }, 100);

    scrollToBottom();
    return () => clearInterval(interval);
  }, [messages, typingMessage]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCharacterSelect = async (characterId: string) => {
    // Don't do anything if selecting the same character
    if (currentCharacter?.id === characterId) {
      setShowingCharacters(false);
      return;
    }

    const selectedCharacter = characters.find((c) => c.id === characterId);
    if (!selectedCharacter || !currentUser) return;

    try {
      setCurrentCharacter(selectedCharacter);
      setCurrentSessionId('');
      setMessages([]);
      setShowingCharacters(false);
      
      const sessionsRef = collection(
        db,
        `chats/${currentUser.uid}/characters/${selectedCharacter.id}/sessions`
      );
      const sessionsSnapshot = await getDocs(query(sessionsRef, orderBy('timestamp', 'desc')));
      
      if (!sessionsSnapshot.empty) {
        setCurrentSessionId(sessionsSnapshot.docs[0].id);
      }
    } catch (error) {
      console.error('Error in character selection:', error);
    }
  };

  const handleDeleteCharacter = async (e: React.MouseEvent, characterId: string) => {
    e.stopPropagation();
    if (!currentUser) return;

    try {
      // If we're deleting the current character, switch to the first default character
      if (currentCharacter?.id === characterId) {
        setShowingCharacters(false); // Hide character list
        setMessages([]); // Clear messages
        setCurrentSessionId(''); // Clear current session
      }
      
      await deleteDoc(doc(db, 'characters', characterId));
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const handleNewChat = async () => {
    if (!currentUser || !currentCharacter) return;

    try {
      const sessionRef = collection(
        db,
        `chats/${currentUser.uid}/characters/${currentCharacter.id}/sessions`
      );
      const newSessionDoc = await addDoc(sessionRef, {
        title: `New Chat with ${currentCharacter.name}`,
        timestamp: serverTimestamp(),
        lastMessage: 'Starting conversation...',
      });

      setCurrentSessionId(newSessionDoc.id);
      setMessages([]);

      const messageRef = collection(
        db,
        `chats/${currentUser.uid}/characters/${currentCharacter.id}/sessions/${newSessionDoc.id}/messages`
      );

      // Add a placeholder message first
      const messageDoc = await addDoc(messageRef, {
        response: '',
        timestamp: serverTimestamp(),
        isTypingComplete: false,
        reactions: [],
        isNew: true,
        shouldType: true,
      });

      // Get AI response
      const greeting = await getAIResponse('Give a brief greeting and introduction as your character.', currentCharacter);

      // First update with the response but keep isTypingComplete false
      await updateDoc(messageDoc, {
        response: greeting,
        isTypingComplete: false,
      });

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            email: currentUser.email,
            createdAt: serverTimestamp(),
            stats: {
              totalChats: 1,
              totalMessages: 0,
              characterStats: {}
            }
          });
        } else {
          const currentStats = userDoc.data().stats || {};
          await updateDoc(userRef, {
            'stats.totalChats': (currentStats.totalChats || 0) + 1,
            lastActive: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error updating user stats:', error);
      }

    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentUser || !currentCharacter || !currentSessionId || typingMessage) return;

    const userInput = input.trim();
    setInput('');
    setNetworkError(null);
    setApiError(null);

    try {
      const messageRef = collection(
        db,
        `chats/${currentUser.uid}/characters/${currentCharacter.id}/sessions/${currentSessionId}/messages`
      );

      // Add user message
      await addDoc(messageRef, {
        prompt: userInput,
        timestamp: serverTimestamp(),
        reactions: [],
      });

      // Add placeholder AI message
      const aiMessageRef = await addDoc(messageRef, {
        response: '',
        timestamp: serverTimestamp(),
        isTypingComplete: false,
        reactions: [],
        isNew: true,
        shouldType: true,
      });

      // Get AI response
      const aiResponse = await getAIResponse(userInput, currentCharacter);

      // First update with the response but keep isTypingComplete false
      await updateDoc(aiMessageRef, {
        response: aiResponse,
        isTypingComplete: false,
      });

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            email: currentUser.email,
            createdAt: serverTimestamp(),
            stats: {
              totalChats: 0,
              totalMessages: 0,
              characterStats: {}
            }
          });
        }
        
        const currentStats = userDoc.exists() ? userDoc.data().stats || {} : {};
        
        await updateDoc(userRef, {
          'stats.totalMessages': (currentStats.totalMessages || 0) + 2,
          [`stats.characterStats.${currentCharacter.id}`]: (currentStats.characterStats?.[currentCharacter.id] || 0) + 2,
          lastActive: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating user stats:', error);
      }

    } catch (error) {
      console.error('Error in handleSend:', error);
    }
  };

  const getAIResponse = async (userInput: string, character: Character) => {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `${character.systemMessage}\n\nFormat your responses using markdown when appropriate:
- Use **bold** for emphasis
- Use *italics* for subtle emphasis
- Use \`code\` for technical terms or commands
- Use \`\`\`code blocks\`\`\` for longer code snippets or examples
- Use > for quotes or important statements
- Use bullet points or numbered lists when listing items
- Use ### for section headers when organizing longer responses

Keep your responses natural and conversational while incorporating these markdown elements where they make sense.`
          },
          { role: 'user', content: userInput },
        ],
        temperature: 0.9,
        max_tokens: 250,
      });

      const response = completion.choices[0]?.message?.content;
      if (typeof response !== 'string') {
        throw new Error('Invalid response from OpenAI');
      }

      return response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I apologize, but I'm having trouble responding right now.";
    }
  };

  const characterListContent = (
    <CharacterList>
      {characters.map((char) => (
        <CharacterItem
          key={char.id}
          $active={currentCharacter?.id === char.id}
          onClick={() => handleCharacterSelect(char.id)}
        >
          <CharacterIcon 
            $imageUrl={char.imageUrl}
            $bgColor={char.isCustom ? '#4B5563' : '#2563EB'}
          >
            {!char.imageUrl && char.name[0]}
          </CharacterIcon>
          <div style={{ flex: 1, minWidth: 0 }}>
            <CharacterName>{char.name}</CharacterName>
            {char.description && (
              <CharacterDescription>
                {char.description}
              </CharacterDescription>
            )}
          </div>
          {char.isCustom && (
            <div 
              onClick={(e) => handleDeleteCharacter(e, char.id)}
              role="button"
              aria-label="Delete character"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </CharacterItem>
      ))}
    </CharacterList>
  );

  useEffect(() => {
    if (!currentUser || !currentCharacter || !currentSessionId) return;

    const q = query(
      collection(
        db,
        `chats/${currentUser.uid}/characters/${currentCharacter.id}/sessions/${currentSessionId}/messages`
      ),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: ChatMessage[] = [];
      let hasNewMessage = false;

      snapshot.forEach((doc) => {
        const messageData = doc.data();
        console.log('Message data:', messageData); // Debug log
        
        if (messageData.prompt || messageData.response) {
          const message: ChatMessage = {
            id: doc.id,
            prompt: messageData.prompt,
            response: messageData.response,
            timestamp: messageData.timestamp,
            reactions: messageData.reactions || [],
            isNew: messageData.isNew,
            isTypingComplete: messageData.isTypingComplete
          };

          if (message.response && !message.isTypingComplete) {
            if (!typingMessage || typingMessage.id !== doc.id) {
              hasNewMessage = true;
              setTypingMessage({
                id: doc.id,
                text: message.response,
                onComplete: async () => {
                  setTypingMessage(null);
                  await updateDoc(doc.ref, { 
                    isTypingComplete: true,
                    isNew: false
                  });
                  // Ensure one final scroll after typing completes
                  setTimeout(scrollToBottom, 50);
                }
              });
            }
          }

          newMessages.push(message);
        }
      });

      console.log('All messages:', newMessages); // Debug log
      setMessages(newMessages);
      if (hasNewMessage || messages.length !== newMessages.length) {
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [currentUser, currentCharacter, currentSessionId, typingMessage]);

  useEffect(() => {
    if (!currentUser || !currentCharacter) return;

    const sessionsRef = collection(
      db,
      `chats/${currentUser.uid}/characters/${currentCharacter.id}/sessions`
    );
    const q = query(sessionsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions: ChatSession[] = [];
      snapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
        } as ChatSession);
      });
      setChatSessions(sessions);

      if (!currentSessionId && sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      }
    });

    return () => unsubscribe();
  }, [currentUser, currentCharacter]);

  useEffect(() => {
    setMessages([]);
  }, [currentCharacter?.id, currentSessionId]);

  return (
    <PageContainer>
      <ChatWrapper>
        <MenuToggle onClick={toggleSidebar}>
          {isSidebarOpen ? '✕' : '☰'}
        </MenuToggle>
        <Sidebar $isOpen={isSidebarOpen}>
          <SidebarContent>
            {showingCharacters ? (
              <SidebarSection>
                <HeaderContainer>
                  <SidebarHeading>Characters</SidebarHeading>
                  {currentUser && (
                    <Button 
                      onClick={() => setShowCreateCharacter(true)}
                      $variant="primary"
                      $size="sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      New Character
                    </Button>
                  )}
                </HeaderContainer>
                {characterListContent}
                <NavigationLinks>
                  <NavLink to="/">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Home
                  </NavLink>
                  <NavLink to="/dashboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Dashboard
                  </NavLink>
                  <NavLink to="/profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Profile
                  </NavLink>
                  <NavLink to="/settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Settings
                  </NavLink>
                </NavigationLinks>
              </SidebarSection>
            ) : (
              <SidebarSection>
                <BackButton onClick={() => {
                  setShowingCharacters(true);
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to Characters
                </BackButton>
                <HeaderContainer>
                  <SidebarHeading>Chat History</SidebarHeading>
                </HeaderContainer>
                <ChatList>
                  {chatSessions.map((session) => (
                    <ChatItem
                      key={session.id}
                      $active={currentSessionId === session.id}
                      onClick={() => setCurrentSessionId(session.id)}
                    >
                      <ChatItemContent>
                        <ChatTitle>{session.title}</ChatTitle>
                        <ChatDate>
                          {session.timestamp?.toDate() 
                            ? format(session.timestamp.toDate(), 'MMM d, h:mm a')
                            : 'Just now'}
                        </ChatDate>
                      </ChatItemContent>
                      <div
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (currentUser && currentCharacter) {
                            const sessionRef = doc(
                              db,
                              `chats/${currentUser.uid}/characters/${currentCharacter.id}/sessions/${session.id}`
                            );
                            deleteDoc(sessionRef);
                          }
                        }}
                        role="button"
                        aria-label="Delete chat session"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </ChatItem>
                  ))}
                </ChatList>
                {currentCharacter && (
                  <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <NewChatButton 
                      onClick={handleNewChat} 
                      type="button"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      New Chat
                    </NewChatButton>
                  </div>
                )}
                <NavigationLinks>
                  <NavLink to="/">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Home
                  </NavLink>
                  <NavLink to="/dashboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Dashboard
                  </NavLink>
                  <NavLink to="/profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Profile
                  </NavLink>
                  <NavLink to="/settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Settings
                  </NavLink>
                </NavigationLinks>
              </SidebarSection>
            )}
          </SidebarContent>
        </Sidebar>

        <ChatContainer>
          {currentCharacter ? (
            <ChatInner>
              <ChatHeader>
                <h2>
                  <CharacterIcon 
                    $imageUrl={currentCharacter.imageUrl}
                    $bgColor={currentCharacter.isCustom ? '#4B5563' : '#2563EB'}
                  >
                    {!currentCharacter.imageUrl && currentCharacter.name[0]}
                  </CharacterIcon>
                  Chat with {currentCharacter.name}
                </h2>
              </ChatHeader>

              <ChatMessages>
                {networkError && (
                  <ErrorMessage
                    message={networkError}
                    type="warning"
                  />
                )}
                {apiError && (
                  <ErrorMessage
                    message={apiError.message}
                    type="error"
                    onRetry={apiError.retryFn}
                  />
                )}
                {currentSessionId ? (
                  messages.map((message) => (
                    <React.Fragment key={message.id}>
                      <div className="message-container">
                        {message.prompt && (
                          <>
                            <Message $isUser={true} data-user="true" className="message">
                              <MarkdownMessage content={message.prompt || ''} />
                            </Message>
                            {currentUser && (
                              <div className="reactions">
                                <MessageReactions
                                  messageId={message.id}
                                  sessionId={currentSessionId}
                                  characterId={currentCharacter?.id || ''}
                                  reactions={message.reactions || []}
                                />
                              </div>
                            )}
                          </>
                        )}
                        {message.response && (
                          <>
                            <Message 
                              $isUser={false}
                              data-typing={typingMessage?.id === message.id}
                              data-user="false"
                              className="message"
                            >
                              {typingMessage?.id === message.id ? (
                                <TypingEffect 
                                  text={typingMessage.text} 
                                  onComplete={typingMessage.onComplete}
                                  speed={20}
                                >
                                  {(displayedText) => (
                                    <MarkdownMessage content={displayedText} />
                                  )}
                                </TypingEffect>
                              ) : (
                                <MarkdownMessage content={message.response} />
                              )}
                            </Message>
                            {!typingMessage?.id && currentUser && (
                              <div className="reactions">
                                <MessageReactions
                                  messageId={message.id}
                                  sessionId={currentSessionId}
                                  characterId={currentCharacter?.id || ''}
                                  reactions={message.reactions || []}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <Message $isUser={false}>
                    Click "New Chat" to start a conversation with {currentCharacter.name}.
                  </Message>
                )}
                <div ref={messagesEndRef} />
              </ChatMessages>

              <InputContainer>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentSessionId ? "Type your message... (Markdown supported)" : "Start a new chat to begin messaging"}
                  onKeyDown={handleKeyPress}
                  disabled={!currentSessionId}
                />
                <StyledButton 
                  onClick={handleSend} 
                  disabled={!input.trim() || !currentSessionId}
                >
                  Send
                </StyledButton>
                {input.trim() && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '100%', 
                    right: 24, 
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'gray',
                    fontFamily: systemFont,
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    Markdown: **bold**, *italic*, `code`, ```code blocks```, {'>'}quotes
                  </div>
                )}
              </InputContainer>
            </ChatInner>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.lg,
              textAlign: 'center',
              padding: theme.spacing[6]
            }}>
              Select a character from the sidebar to start chatting
            </div>
          )}
        </ChatContainer>
      </ChatWrapper>

      {showCreateCharacter && (
        <CreateCharacterModal
          onClose={() => setShowCreateCharacter(false)}
          onCreated={() => {
            setShowCreateCharacter(false);
            refreshCharacters();
          }}
        />
      )}
    </PageContainer>
  );
};

export default Chat;
