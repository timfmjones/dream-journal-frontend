// src/components/layout/Header.tsx

import React from 'react';
import { Home, Book, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import type { ViewType } from '../../types';

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onAuthClick }) => {
  const { user, isGuest } = useAuth();

  const navItems = [
    { id: 'create' as ViewType, label: 'Home', icon: Home },
    { id: 'journal' as ViewType, label: 'Journal', icon: Book },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings }
  ];

  return (
    <header style={{
      background: 'linear-gradient(135deg, #e6e6fa 0%, #f8f8ff 100%)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      overflow: 'hidden' // Prevent any overflow
    }}>
      <div style={{
        width: '100%',
        maxWidth: '100vw', // Never exceed viewport width
        padding: '12px 16px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%'
        }}>
          {/* Logo section */}
          <div style={{ 
            flex: '0 0 auto',
            minWidth: 0 // Allow logo to shrink if needed
          }}>
            <Logo size="small" showText={false} /> {/* Hide text on mobile to save space */}
          </div>
          
          {/* Navigation section */}
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            flex: '1 1 auto',
            minWidth: 0, // Allow nav to shrink
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              flex: '1 1 auto',
              minWidth: 0
            }}>
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  style={{
                    background: currentView === id ? '#7c3aed' : 'transparent',
                    color: currentView === id ? 'white' : '#666',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    whiteSpace: 'nowrap',
                    flex: '0 1 auto',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                  title={label} // Add tooltip for accessibility
                >
                  <Icon style={{ 
                    width: '16px', 
                    height: '16px',
                    flexShrink: 0 
                  }} />
                  <span style={{
                    display: window.innerWidth > 400 ? 'inline' : 'none'
                  }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Auth section */}
            <div style={{ 
              flex: '0 0 auto',
              marginLeft: '4px'
            }}>
              {user && !isGuest ? (
                <button
                  onClick={() => onViewChange('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    transition: 'all 0.2s'
                  }}
                  title={user.displayName || user.email || 'Account'}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                </button>
              ) : (
                <button
                  onClick={onAuthClick}
                  style={{
                    background: '#7c3aed',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;