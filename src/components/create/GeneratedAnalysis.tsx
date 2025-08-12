// src/components/create/GeneratedAnalysis.tsx - Cleaner integration

import React, { useEffect, useRef, useState } from 'react';
import { Brain, Save, Volume2, VolumeX, Loader2, Settings } from 'lucide-react';
import { api } from '../../services/api';
import TextToSpeech from '../common/TextToSpeech';

interface GeneratedAnalysisProps {
  title?: string;
  analysis: string;
  onSave: () => void;
}

const GeneratedAnalysis: React.FC<GeneratedAnalysisProps> = ({ title, analysis, onSave }) => {
  const analysisRef = useRef<HTMLDivElement>(null);
  const [preloadedAudioUrl, setPreloadedAudioUrl] = useState<string | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Preload audio as soon as analysis is available
  useEffect(() => {
    let cancelled = false;
    
    const preloadAudio = async () => {
      if (!analysis || analysis.length === 0) return;
      
      setIsPreloading(true);
      setPreloadError(null);
      
      try {
        // Get user's preferred voice from settings
        const preferences = localStorage.getItem('dreamLogPreferences');
        const parsedPrefs = preferences ? JSON.parse(preferences) : {};
        const voice = parsedPrefs.voice || 'alloy';
        const autoPlay = parsedPrefs.autoPlayAudio !== false; // Default to true
        
        // Generate audio
        const audioBlob = await api.textToSpeech(analysis, voice, 1.0);
        
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
  }, [analysis]);

  useEffect(() => {
    // Scroll to the analysis when it's rendered
    if (analysisRef.current) {
      const elementPosition = analysisRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [analysis]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div ref={analysisRef} className="generated-content" style={{ 
      marginTop: '24px',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
    }}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#4338ca', marginBottom: '8px' }}>{title}</h2>
          <div style={{ 
            width: '60px', 
            height: '3px', 
            background: 'linear-gradient(to right, #4f46e5, #818cf8)', 
            margin: '0 auto',
            borderRadius: '2px'
          }} />
        </div>
      )}
      
      <div className="generated-header">
        <h3 className="generated-title" style={{ color: '#4338ca' }}>
          <Brain style={{ width: '20px', height: '20px' }} />
          Dream Analysis
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Show loading state */}
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
          
          {/* Show preloaded audio controls */}
          {preloadedAudioUrl && !isPreloading && (
            <>
              <button
                onClick={handlePlayPause}
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
              
              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  title="Stop reading"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setShowAudioSettings(!showAudioSettings)}
                className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Audio settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Show regular TTS component only if audio is not preloaded */}
          {!preloadedAudioUrl && !isPreloading && (
            <TextToSpeech 
              text={analysis} 
              showSettings={true}
            />
          )}
        </div>
      </div>
      
      {/* Show audio settings if toggled */}
      {showAudioSettings && preloadedAudioUrl && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#e0e7ff',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#4338ca'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Note:</strong> Audio has been pre-generated using your preferred voice settings. 
            To change voice or speed, please update your preferences in Settings and generate a new analysis.
          </p>
        </div>
      )}
      
      <div className="generated-text">
        {analysis}
      </div>

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

export default GeneratedAnalysis;