import React, { useState } from 'react';
import styled from 'styled-components';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Reaction {
  emoji: string;
  users: string[];
}

interface MessageReactionsProps {
  messageId: string;
  sessionId: string;
  characterId: string;
  reactions: Reaction[];
}

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  margin: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`;

const ReactionButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme, $active }) => 
    $active ? `${theme.colors.primary}20` : `${theme.colors.surface}80`};
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  min-height: 28px;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Count = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 16px;
  text-align: center;
`;

const AddReactionButton = styled(ReactionButton)`
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
`;

const EmojiPicker = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[2]};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing[1]};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 10;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const EmojiButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.typography.sizes.base};

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
  }
`;

const defaultEmojis = ['👍', '❤️', '😄', '🎉', '🤔', '👏', '🔥', '💯'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  sessionId,
  characterId,
  reactions,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { currentUser } = useAuth();

  const handleReaction = async (emoji: string) => {
    if (!currentUser) return;

    const messageRef = doc(
      db,
      `chats/${currentUser.uid}/characters/${characterId}/sessions/${sessionId}/messages/${messageId}`
    );

    const existingReaction = reactions.find(r => r.emoji === emoji);
    const hasReacted = existingReaction?.users.includes(currentUser.uid);
    const hasAnyReaction = reactions.some(r => r.users.includes(currentUser.uid));

    try {
      if (hasReacted) {
        // Remove reaction
        await updateDoc(messageRef, {
          reactions: reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, users: r.users.filter(uid => uid !== currentUser.uid) }
              : r
          ).filter(r => r.users.length > 0)
        });
      } else if (!hasAnyReaction) {
        // Add reaction only if user hasn't reacted yet
        if (existingReaction) {
          await updateDoc(messageRef, {
            reactions: reactions.map(r =>
              r.emoji === emoji
                ? { ...r, users: [...r.users, currentUser.uid] }
                : r
            )
          });
        } else {
          await updateDoc(messageRef, {
            reactions: [...reactions, { emoji, users: [currentUser.uid] }]
          });
        }
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }

    setShowPicker(false);
  };

  const hasUserReacted = currentUser && reactions.some(r => r.users.includes(currentUser.uid));

  return (
    <Container>
      {reactions.map((reaction) => (
        <ReactionButton
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          $active={Boolean(currentUser && reaction.users.includes(currentUser.uid))}
          disabled={!!(currentUser && !reaction.users.includes(currentUser.uid) && hasUserReacted)}
          title={hasUserReacted && !reaction.users.includes(currentUser?.uid || '') ? 'You can only add one reaction' : ''}
        >
          {reaction.emoji}
          <Count>{reaction.users.length}</Count>
        </ReactionButton>
      ))}
      
      <div style={{ position: 'relative' }}>
        <AddReactionButton
          onClick={() => setShowPicker(!showPicker)}
          $active={false}
          disabled={!!hasUserReacted}
          title={hasUserReacted ? 'You can only add one reaction' : 'Add reaction'}
        >
          😀 +
        </AddReactionButton>
        
        {showPicker && (
          <EmojiPicker>
            {defaultEmojis.map((emoji) => (
              <EmojiButton
                key={emoji}
                onClick={() => handleReaction(emoji)}
              disabled={!!hasUserReacted}
              >
                {emoji}
              </EmojiButton>
            ))}
          </EmojiPicker>
        )}
      </div>
    </Container>
  );
};

export default MessageReactions;
