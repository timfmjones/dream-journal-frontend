// src/components/settings/SettingsView.tsx

import React, { useState, useEffect } from 'react';
import { User, LogOut, Download, Upload, Trash2, Image, Volume2 } from 'lucide-react';
import { useDreams } from '../../hooks/useDreams';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { StoryTone, StoryLength, UserStats } from '../../types';
import { TONE_OPTIONS, LENGTH_OPTIONS } from '../../utils/constants';

interface SettingsViewProps {
  onShowAuth: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onShowAuth }) => {
  const { dreams } = useDreams();
  const { user, isGuest, logout } = useAuth();
  const [storyTone, setStoryTone] = useState<StoryTone>('whimsical');
  const [storyLength, setStoryLength] = useState<StoryLength>('medium');
  const [generateImages, setGenerateImages] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true); // Default to true for better UX
  const [preferredVoice, setPreferredVoice] = useState('alloy');
  const [stats, setStats] = useState<UserStats | null>(null);

  // Voice options
  const voiceOptions = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
    { id: 'echo', name: 'Echo', description: 'Warm and conversational' },
    { id: 'fable', name: 'Fable', description: 'Expressive and dynamic' },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
    { id: 'nova', name: 'Nova', description: 'Friendly and upbeat' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft and gentle' }
  ];

  useEffect(() => {
    if (user && !isGuest) {
      loadUserStats();
    }
    
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('dreamLogPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setStoryTone(preferences.tone || 'whimsical');
      setStoryLength(preferences.length || 'medium');
      setGenerateImages(preferences.generateImages !== false);
      setAutoPlayAudio(preferences.autoPlayAudio !== false); // Default to true
      setPreferredVoice(preferences.voice || 'alloy');
    }
  }, [user, isGuest]);

  const loadUserStats = async () => {
    try {
      const userStats = await api.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleClearDreams = () => {
    if (confirm('Are you sure you want to clear all dreams? This cannot be undone.')) {
      localStorage.removeItem('dreamLogDreams');
      window.location.reload();
    }
  };

  const savePreferences = (preferences: { 
    tone: StoryTone; 
    length: StoryLength; 
    generateImages: boolean;
    autoPlayAudio: boolean;
    voice: string;
  }) => {
    localStorage.setItem('dreamLogPreferences', JSON.stringify(preferences));
  };

  const handleToneChange = (tone: StoryTone) => {
    setStoryTone(tone);
    savePreferences({ tone, length: storyLength, generateImages, autoPlayAudio, voice: preferredVoice });
  };

  const handleLengthChange = (length: StoryLength) => {
    setStoryLength(length);
    savePreferences({ tone: storyTone, length, generateImages, autoPlayAudio, voice: preferredVoice });
  };

  const handleGenerateImagesChange = (generate: boolean) => {
    setGenerateImages(generate);
    savePreferences({ tone: storyTone, length: storyLength, generateImages: generate, autoPlayAudio, voice: preferredVoice });
  };

  const handleAutoPlayChange = (autoPlay: boolean) => {
    setAutoPlayAudio(autoPlay);
    savePreferences({ tone: storyTone, length: storyLength, generateImages, autoPlayAudio: autoPlay, voice: preferredVoice });
  };

  const handleVoiceChange = (voice: string) => {
    setPreferredVoice(voice);
    savePreferences({ tone: storyTone, length: storyLength, generateImages, autoPlayAudio, voice });
  };

  // Calculate local stats for guest users
  const getLocalStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const dreamsThisMonth = dreams.filter(dream => {
      const dreamDate = new Date(dream.date);
      return dreamDate.getMonth() === currentMonth && dreamDate.getFullYear() === currentYear;
    }).length;

    const favoriteDreams = dreams.filter(dream => dream.isFavorite).length;

    return {
      totalDreams: dreams.length,
      dreamsThisMonth,
      favoriteDreams
    };
  };

  const localStats = getLocalStats();

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your dream journal experience</p>
      </div>

      <div className="settings-card">
        {/* Account Section */}
        <div className="settings-section">
          <h3>Account</h3>
          {user && !isGuest ? (
            <div>
              <div className="account-info">
                <div className="account-details">
                  <div className="account-avatar">
                    <User style={{ width: '24px', height: '24px', color: '#999' }} />
                  </div>
                  <div className="account-text">
                    <div className="account-name">{user.displayName || 'User'}</div>
                    <div className="account-email">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="nav-button"
                  style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  Sign Out
                </button>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
                Your dreams are synced across all your devices
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: '#fef3c7', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                  You're in guest mode. Dreams are saved locally only.
                </p>
              </div>
              <button
                onClick={onShowAuth}
                className="primary-button"
              >
                <User style={{ width: '16px', height: '16px' }} />
                Sign In for Free Account
              </button>
            </div>
          )}
        </div>

        {/* Story Preferences */}
        <div className="settings-section">
          <h3>Story Preferences</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Default Story Tone</label>
              <select
                value={storyTone}
                onChange={(e) => handleToneChange(e.target.value as StoryTone)}
                className="select-input"
              >
                {TONE_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Default Story Length</label>
              <select
                value={storyLength}
                onChange={(e) => handleLengthChange(e.target.value as StoryLength)}
                className="select-input"
              >
                {LENGTH_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Story Length</label>
            <div style={{ position: 'relative', paddingTop: '8px' }}>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={storyLength === 'short' ? 0 : storyLength === 'medium' ? 1 : 2}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleLengthChange(value === 0 ? 'short' : value === 1 ? 'medium' : 'long');
                }}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${((storyLength === 'short' ? 0 : storyLength === 'medium' ? 1 : 2) / 2) * 100}%, #e0e0e0 ${((storyLength === 'short' ? 0 : storyLength === 'medium' ? 1 : 2) / 2) * 100}%, #e0e0e0 100%)`,
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Short</span>
                <span style={{ fontSize: '12px', color: '#666' }}>Medium</span>
                <span style={{ fontSize: '12px', color: '#666' }}>Long</span>
              </div>
            </div>
          </div>

          <div className="image-toggle-container">
            <div className="image-toggle-label">
              <Image style={{ width: '16px', height: '16px' }} />
              <div>
                <div style={{ fontWeight: '500' }}>Generate Illustrations by Default</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  Automatically create AI-generated images when generating fairy tales
                </div>
              </div>
            </div>
            <div 
              className={`toggle-switch ${generateImages ? 'active' : ''}`}
              onClick={() => handleGenerateImagesChange(!generateImages)}
            >
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
            {generateImages ? 'AI illustrations will be generated with your stories' : 'Stories will be created without illustrations to save time'}
          </p>
        </div>

        {/* Audio Preferences - NEW SECTION */}
        <div className="settings-section">
          <h3>Audio Preferences</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Preferred Voice</label>
            <select
              value={preferredVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="select-input"
            >
              {voiceOptions.map(({ id, name, description }) => (
                <option key={id} value={id}>{name} - {description}</option>
              ))}
            </select>
          </div>

          <div className="image-toggle-container" style={{ background: '#f3e8ff' }}>
            <div className="image-toggle-label">
              <Volume2 style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
              <div>
                <div style={{ fontWeight: '500' }}>Auto-Play Stories</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  Automatically read stories aloud when generated
                </div>
              </div>
            </div>
            <div 
              className={`toggle-switch ${autoPlayAudio ? 'active' : ''}`}
              onClick={() => handleAutoPlayChange(!autoPlayAudio)}
            >
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#7c3aed', marginTop: '8px', fontStyle: 'italic' }}>
            {autoPlayAudio ? '🔊 Stories will begin playing automatically as soon as they\'re ready' : '🔇 You\'ll need to click play to hear your stories'}
          </p>

          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#e0e7ff', 
            borderRadius: '8px',
            fontSize: '13px',
            color: '#4c1d95'
          }}>
            <strong>💡 Pro tip:</strong> Your stories will load faster with auto-play enabled because audio generation starts immediately!
          </div>
        </div>

        {/* Dream Statistics */}
        <div className="settings-section">
          <h3>Dream Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Dreams Saved</div>
              <div className="stat-value">{user && !isGuest && stats ? stats.totalDreams : localStats.totalDreams}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Dreams This Month</div>
              <div className="stat-value">{user && !isGuest && stats ? stats.dreamsThisMonth : localStats.dreamsThisMonth}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Favorite Dreams</div>
              <div className="stat-value">{user && !isGuest && stats ? stats.favoriteDreams : localStats.favoriteDreams}</div>
            </div>
          </div>
          
          {user && !isGuest && stats && stats.averageLucidity !== null && stats.averageLucidity !== undefined && (
            <div style={{ marginTop: '16px' }}>
              <div className="form-label">Average Lucidity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '6px', background: '#e0e0e0', borderRadius: '3px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(stats.averageLucidity / 5) * 100}%`,
                    background: '#7c3aed',
                    borderRadius: '3px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', color: '#666', minWidth: '40px' }}>
                  {stats.averageLucidity.toFixed(1)}/5
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h3>Data Management</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="nav-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download style={{ width: '16px', height: '16px' }} />
              Export Dreams
            </button>
            <button className="nav-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload style={{ width: '16px', height: '16px' }} />
              Import Dreams
            </button>
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>
              Danger Zone
            </h4>
            <button
              onClick={handleClearDreams}
              className="nav-button"
              style={{ 
                color: '#ef4444', 
                borderColor: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
              Clear All Dreams
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section" style={{ borderBottom: 'none' }}>
          <h3>About</h3>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
            DreamSprout transforms your dreams into magical fairy tales and provides insightful analysis using AI. 
            Record your dreams through text or voice, choose to generate a fairy tale with or without illustrations, 
            get dream analysis, or simply save your dream for later.
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Version 2.2 - Enhanced with auto-play audio and voice preferences
          </p>
          
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#" style={{ fontSize: '14px', color: '#7c3aed', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ fontSize: '14px', color: '#7c3aed', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#" style={{ fontSize: '14px', color: '#7c3aed', textDecoration: 'none' }}>Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;