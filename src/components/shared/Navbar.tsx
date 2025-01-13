import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from './Button';

const NavContainer = styled.nav`
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const NavLinks = styled.div<{ $isOpen?: boolean }>`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${({ theme }) => theme.colors.background};
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    gap: 1rem;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.text.primary)};
  text-decoration: none;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.5rem 0;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Navbar = () => {
  const { currentUser, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/">AI Character Chat</Logo>
        <MobileContainer>
          <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </MenuButton>
          <NavLinks $isOpen={isMenuOpen}>
            {currentUser ? (
              // Protected routes
              <>
                <NavLink to="/dashboard" $active={isActive('/dashboard')}>
                  Dashboard
                </NavLink>
                <NavLink to="/chat" $active={isActive('/chat')}>
                  Chat
                </NavLink>
                <NavLink to="/profile" $active={isActive('/profile')}>
                  Profile
                </NavLink>
                <NavLink to="/settings" $active={isActive('/settings')}>
                  Settings
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" $active={isActive('/admin')}>
                    Admin
                  </NavLink>
                )}
                <Button $variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              // Public routes
              <>
                <NavLink to="/about" $active={isActive('/about')}>
                  About
                </NavLink>
                <NavLink to="/contact" $active={isActive('/contact')}>
                  Contact
                </NavLink>
                <AuthButtons>
                  <Button $variant="secondary" onClick={() => handleNavigation('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => handleNavigation('/signup')}>
                    Sign Up
                  </Button>
                </AuthButtons>
              </>
            )}
          </NavLinks>
        </MobileContainer>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
