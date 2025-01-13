import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface SessionContextType {
  resetTimer: () => void;
}

const SessionContext = createContext<SessionContextType>({
  resetTimer: () => {},
});

export const useSession = () => useContext(SessionContext);

interface SessionProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ 
  children, 
  timeoutMinutes = 30 // Default timeout of 30 minutes
}) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const resetTimer = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    if (!currentUser) return;

    // Check for inactivity every minute
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeoutMilliseconds = timeoutMinutes * 60 * 1000;

      if (timeSinceLastActivity >= timeoutMilliseconds) {
        // Session timeout
        signOut();
        navigate('/login', { 
          state: { 
            message: 'Your session has expired due to inactivity. Please log in again.' 
          } 
        });
      }
    }, 60000); // Check every minute

    // Reset timer on user activity
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'mousemove',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [currentUser, lastActivity, navigate, signOut, timeoutMinutes]);

  // Reset timer on route changes
  useEffect(() => {
    resetTimer();
  }, [window.location.pathname]);

  return (
    <SessionContext.Provider value={{ resetTimer }}>
      {children}
    </SessionContext.Provider>
  );
};
