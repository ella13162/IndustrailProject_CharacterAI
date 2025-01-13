import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import * as S from '../styles/AdminStyles';
import { useAdmin } from '../../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface AdminUser {
  id: string;
  email: string;
  createdAt: any;
  lastActive?: any;
  isBanned?: boolean;
  banReason?: string;
  stats?: {
    totalChats: number;
    totalMessages: number;
  };
}

interface UserWithAction extends AdminUser {
  action?: 'password' | 'ban';
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserWithAction | null>(null);
  const [banReason, setBanReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const functions = getFunctions();

  const fetchUsers = async () => {
    try {
      setError('');
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q).catch(error => {
        console.error('Error in getDocs:', error);
        throw error;
      });
      
      const getUserEmails = httpsCallable(functions, 'getUserEmails');
      const emailsResult = await getUserEmails();
      const emailMap = (emailsResult.data as { users: Array<{ uid: string; email: string }> }).users.reduce((acc: Record<string, string>, user) => {
        acc[user.uid] = user.email;
        return acc;
      }, {});
      
      const usersData: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          email: emailMap[doc.id] || 'Email not found',
          ...userData,
          stats: {
            totalChats: userData.stats?.totalChats || 0,
            totalMessages: userData.stats?.totalMessages || 0,
          }
        } as AdminUser);
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      throw error;
    }
  };

  useEffect(() => {
    if (adminLoading) {
      setLoading(true);
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }

    const loadUsers = async () => {
      try {
        setError('');
        setLoading(true);
        await fetchUsers();
      } catch (error) {
        console.error('Error in loadUsers:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin, adminLoading, navigate]);

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      setError('');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: true,
        banReason: reason,
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isBanned: true, banReason: reason }
          : user
      ));
      
      setSelectedUser(null);
      setBanReason('');
    } catch (error) {
      console.error('Error banning user:', error);
      setError('Failed to ban user. Please try again.');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      setError('');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: false,
        banReason: null,
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isBanned: false, banReason: undefined }
          : user
      ));
    } catch (error) {
      console.error('Error unbanning user:', error);
      setError('Failed to unban user. Please try again.');
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      setError('');
      const resetPassword = httpsCallable(functions, 'resetUserPassword');
      await resetPassword({ uid: userId, newPassword });
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error?.message?.includes('Password must be at least')) {
        setError('Password must be at least 6 characters long');
      } else if (error?.message?.includes('User not found')) {
        setError('User not found. Please refresh the page.');
      } else if (error?.message?.includes('Invalid user ID')) {
        setError('Invalid user ID. Please refresh the page.');
      } else {
        setError(error?.message || 'Failed to reset password. Please try again.');
      }
    }
  };

  if (adminLoading || loading) {
    return <S.LoadingContainer>Loading...</S.LoadingContainer>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <S.Container>
      <S.Title>Admin Dashboard</S.Title>
      
      {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
      
      <S.Section>
        <S.SectionTitle>User Management</S.SectionTitle>
        <S.UserList>
          {users.map(user => (
            <S.UserCard key={user.id}>
              <S.UserInfo>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Status:</strong>
                  <S.StatusBadge $status={user.isBanned ? 'banned' : 'active'}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </S.StatusBadge>
                </div>
                {user.stats && (
                  <div>
                    <strong>Activity:</strong> {user.stats.totalMessages} messages in {user.stats.totalChats} chats
                  </div>
                )}
                {user.isBanned && user.banReason && (
                  <div>
                    <strong>Ban Reason:</strong> {user.banReason}
                  </div>
                )}
              </S.UserInfo>
              
              <S.UserActions>
                {!user.isBanned ? (
                  <S.Button 
                    onClick={() => setSelectedUser({ ...user, action: 'ban' })}
                    $variant="danger"
                  >
                    Ban User
                  </S.Button>
                ) : (
                  <S.Button 
                    onClick={() => handleUnbanUser(user.id)}
                    $variant="success"
                  >
                    Unban User
                  </S.Button>
                )}
                <S.Button 
                  onClick={() => setSelectedUser({ ...user, action: 'password' })}
                  $variant="primary"
                >
                  Reset Password
                </S.Button>
              </S.UserActions>
            </S.UserCard>
          ))}
        </S.UserList>
      </S.Section>

      {selectedUser && (
        <S.Modal>
          <S.ModalContent>
            <S.ModalHeader>
              {selectedUser.action === 'password' ? 'Reset Password' : 'Ban User'}
            </S.ModalHeader>
            
            {selectedUser.action === 'password' ? (
              <>
                <S.Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <S.Button
                  onClick={() => handleResetPassword(selectedUser.id, newPassword)}
                  $variant="primary"
                >
                  Reset Password
                </S.Button>
              </>
            ) : (
              <>
                <S.Input
                  type="text"
                  placeholder="Ban Reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
                <S.Button
                  onClick={() => handleBanUser(selectedUser.id, banReason)}
                  $variant="danger"
                  disabled={!banReason.trim()}
                >
                  Confirm Ban
                </S.Button>
              </>
            )}
            
            <S.ModalButtonGroup>
              <S.Button onClick={() => setSelectedUser(null)} $variant="secondary">
                Cancel
              </S.Button>
            </S.ModalButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}
    </S.Container>
  );
};

export default AdminDashboard;
