// src/components/create/GeneratedStory.tsx - Complete updated version

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Save, Volume2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import TextToSpeech from '../common/TextToSpeech';
import type { DreamImage } from '../../types';

interface GeneratedStoryProps {
  title?: string;
  story: string;
  images: DreamImage[];
  onSave: () => void;
}

const GeneratedStory: React.FC<GeneratedStoryProps> = ({ title, story, images, onSave }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [preloadedAudioUrl, setPreloadedAudioUrl] = useState<string | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Preload audio as soon as story is available
  useEffect(() => {
    let cancelled = false;
    
    const preloadAudio = async () => {
      if (!story || story.length === 0) return;
      
      setIsPreloading(true);
      setPreloadError(null);
      
      try {
        // Get user's preferred voice from settings
        const preferences = localStorage.getItem('dreamLogPreferences');
        const parsedPrefs = preferences ? JSON.parse(preferences) : {};
        const voice = parsedPrefs.voice || 'alloy';
        const autoPlay = parsedPrefs.autoPlayAudio !== false; // Default to true
        
        // Generate audio
        const audioBlob = await api.textToSpeech(story, voice, 1.0);
        
        if (!cancelled) {
          // Create URL for the blob
          const url = URL.createObjectURL(audioBlob);
          setPreloadedAudioUrl(url);
          
          // Create and preload the audio element
          const audio = new Audio(url);
          audio.preload = 'auto';
          audioRef.current = audio;
          
          // Set up event handlers
          audio.onplay = () => setIsPlaying(true);
          audio.onpause = () => setIsPlaying(false);
          audio.onended = () => setIsPlaying(false);
          
          // Auto-play if enabled in settings
          if (autoPlay) {
            // Small delay to ensure smooth UI update
            setTimeout(() => {
              if (!cancelled && audio) {
                audio.play().catch(err => {
                  console.log('Auto-play prevented by browser:', err);
                  // Browser may block autoplay - that's okay
                });
              }
            }, 500);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to preload audio:', error);
          setPreloadError('Audio preloading failed');
        }
      } finally {
        if (!cancelled) {
          setIsPreloading(false);
        }
      }
    };
    
    preloadAudio();
    
    // Cleanup
    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (preloadedAudioUrl) {
        URL.revokeObjectURL(preloadedAudioUrl);
      }
    };
  }, [story]);

  useEffect(() => {
    // Scroll to the story when it's rendered
    if (storyRef.current) {
      const elementPosition = storyRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [story]);

  const handleQuickPlay = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div ref={storyRef} className="generated-content" style={{ marginTop: '24px' }}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#4c1d95', marginBottom: '8px' }}>{title}</h2>
          <div style={{ 
            width: '60px', 
            height: '3px', 
            background: 'linear-gradient(to right, #7c3aed, #a78bfa)', 
            margin: '0 auto',
            borderRadius: '2px'
          }} />
        </div>
      )}
      
      <div className="generated-header">
        <h3 className="generated-title">
          <Sparkles style={{ width: '20px', height: '20px' }} />
          Your Fairy Tale
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick play button if audio is preloaded */}
          {preloadedAudioUrl && !isPreloading && (
            <button
              onClick={handleQuickPlay}
              style={{
                background: isPlaying 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                animation: !isPlaying ? 'pulse 2s infinite' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              title={isPlaying ? "Pause audio" : "Audio ready - click to play!"}
            >
              <Volume2 style={{ width: '16px', height: '16px' }} />
              {isPlaying ? 'Pause' : 'Play Audio (Ready!)'}
            </button>
          )}
          
          {/* Loading indicator */}
          {isPreloading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              Preparing audio...
            </div>
          )}
          
          {/* Full TTS controls */}
          <TextToSpeech 
            text={story} 
            showSettings={true}
            preloadedAudioUrl={preloadedAudioUrl}
          />
        </div>
      </div>
      
      <div className="generated-text">
        {story}
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#4c1d95', marginBottom: '16px' }}>
            Story Illustrations
          </h3>
          <div className="images-grid">
            {images.map((image, i) => (
              <div key={i}>
                <div className="image-card">
                  {image.url ? (
                    <img src={image.url} alt={image.description} />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#999'
                    }}>
                      Loading...
                    </div>
                  )}
                </div>
                <p className="image-caption">{image.scene}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="button-group" style={{ marginTop: '32px' }}>
        <button
          onClick={onSave}
          className="primary-button"
          style={{ background: '#10b981' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
        >
          <Save style={{ width: '16px', height: '16px' }} />
          Save to Journal
        </button>
      </div>
      
      {/* Add pulse animation to CSS */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.9;
              transform: scale(1.02);
            }
          }
        `}
      </style>
    </div>
  );
};

export default GeneratedStory;