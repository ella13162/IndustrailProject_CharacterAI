import React, { useState, useEffect } from 'react';
import * as S from './styles/ProfileStyles';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { format } from 'date-fns';
import { useAICharacter } from '../../contexts/AICharacterContext';


interface UserStats {
  totalChats: number;
  totalMessages: number;
  characterStats: {
    [key: string]: number;
  };
  favoriteCharacter: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  characterId?: string;
}

const Profile = () => {
  const { currentUser } = useAuth();
  const { characters } = useAICharacter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [stats, setStats] = useState<UserStats>({
    totalChats: 0,
    totalMessages: 0,
    characterStats: {},
    favoriteCharacter: ''
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch user stats
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Get basic user data
          const userData = userDoc.data();
          setDisplayName(userData.displayName || currentUser.displayName || '');

          // Get stats directly from the user document
          const userStats: UserStats = userData.stats || {
            totalChats: 0,
            totalMessages: 0,
            characterStats: {},
            favoriteCharacter: 'None'
          };

          // If there are character stats, get the character name instead of just ID
          if (userStats.favoriteCharacter && userStats.favoriteCharacter !== 'None') {
            const characterName = characters.find(
              char => char.id === userStats.favoriteCharacter
            )?.name || userStats.favoriteCharacter;
            
            setStats({
              ...userStats,
              favoriteCharacter: characterName
            });
          } else {
            setStats(userStats);
          }
        }

        // Fetch recent activity
        const activityRef = collection(db, `users/${currentUser.uid}/activity`);
        const activityQuery = query(
          activityRef,
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitySnapshot = await getDocs(activityQuery);
        
        const activities = activitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as RecentActivity[];
        
        setRecentActivity(activities);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setStatus({
          type: 'error',
          message: 'Failed to load user data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, characters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      // Update display name in Firebase Auth
      await updateProfile(currentUser, {
        displayName: displayName
      });

      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date()
      });

      // Log activity
      const activityRef = doc(db, `users/${currentUser.uid}/activity`, Date.now().toString());
      await setDoc(activityRef, {
        type: 'PROFILE_UPDATE',
        description: 'Updated profile information',
        timestamp: new Date()
      });

      setStatus({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({
          type: null,
          message: ''
        });
      }, 3000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    }
  };

  if (loading) {
    return <S.LoadingSpinner>Loading...</S.LoadingSpinner>;
  }

  return (
    <S.ProfileContainer>
      {status.type && (
        <S.Message $type={status.type}>{status.message}</S.Message>
      )}

      <S.ProfileSection>
        <h2>Account Information</h2>
        {isEditing ? (
          <S.Form onSubmit={handleSubmit}>
            <S.FormGroup>
              <S.Label>Display Name</S.Label>
              <S.Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </S.FormGroup>
            <S.FormGroup>
              <S.Label>Email</S.Label>
              <S.Input
                type="email"
                value={currentUser?.email || ''}
                disabled
              />
            </S.FormGroup>
            <S.ButtonGroup>
              <Button type="submit">Save Changes</Button>
              <Button type="button" $variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </S.ButtonGroup>
          </S.Form>
        ) : (
          <>
            <p><strong>Display Name:</strong> {currentUser?.displayName || 'Not set'}</p>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <Button $variant="secondary" onClick={() => setIsEditing(true)} style={{ marginTop: '1rem' }}>
              Edit Profile
            </Button>
          </>
        )}
      </S.ProfileSection>

      <S.ProfileSection>
        <h2>Activity Overview</h2>
        <S.StatsGrid>
          <S.StatCard>
            <h3>Total Chats</h3>
            <p>{stats.totalChats}</p>
          </S.StatCard>
          <S.StatCard>
            <h3>Total Messages</h3>
            <p>{stats.totalMessages}</p>
          </S.StatCard>
          <S.StatCard>
            <h3>Favorite Character</h3>
            <p>{stats.favoriteCharacter || 'None'}</p>
          </S.StatCard>
        </S.StatsGrid>
      </S.ProfileSection>

      <S.ProfileSection>
        <h2>Recent Activity</h2>
        <S.RecentActivityList>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <S.ActivityItem key={activity.id}>
                <h4>{activity.type}</h4>
                <p>{activity.description}</p>
                <p className="timestamp">{format(activity.timestamp, 'MMM d, yyyy h:mm a')}</p>
              </S.ActivityItem>
            ))
          ) : (
            <p>No recent activity</p>
          )}
        </S.RecentActivityList>
      </S.ProfileSection>
    </S.ProfileContainer>
  );
};

export default Profile;
