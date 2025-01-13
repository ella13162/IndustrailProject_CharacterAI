import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loading: true,
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Checking admin status for user:', currentUser.uid);
        
        // Get the admin document
        const adminRef = doc(db, 'admin', 'admin');
        const adminDoc = await getDoc(adminRef);

        console.log('Admin doc exists:', adminDoc.exists());
        
        if (adminDoc.exists()) {
          // Check if current user's UID exists in the admin document
          const adminData = adminDoc.data();
          console.log('Admin doc data:', adminData);
          
          // Ensure the users array exists
          if (!adminData.users) {
            console.log('Creating users array in admin document');
            await setDoc(adminRef, { users: ['tNH5nqd5ZRYcK0Kq67QfbAvtDUD2'] }, { merge: true });
            setIsAdmin(currentUser.uid === 'tNH5nqd5ZRYcK0Kq67QfbAvtDUD2');
          } else {
            const adminUsers = adminData.users;
            console.log('Admin users array:', adminUsers);
            console.log('Current user in admin array:', adminUsers.includes(currentUser.uid));
            setIsAdmin(adminUsers.includes(currentUser.uid));
          }
        } else {
          console.log('Creating admin document');
          // Create the admin document with the initial admin user
          await setDoc(adminRef, {
            users: ['tNH5nqd5ZRYcK0Kq67QfbAvtDUD2']
          });
          setIsAdmin(currentUser.uid === 'tNH5nqd5ZRYcK0Kq67QfbAvtDUD2');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  return (
    <AdminContext.Provider value={{ isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
