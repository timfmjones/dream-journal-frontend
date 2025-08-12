// src/components/common/TextToSpeech.tsx - Updated to accept preloaded audio

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Settings, Loader2 } from 'lucide-react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

interface TextToSpeechProps {
  text: string;
  className?: string;
  showSettings?: boolean;
  preloadedAudioUrl?: string | null; // NEW PROP
  onAudioReady?: (audioUrl: string) => void; // NEW PROP
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  text, 
  className = '', 
  showSettings = false,
  preloadedAudioUrl,
  onAudioReady
}) => {
  const {
    isSupported,
    isLoading,
    isSpeaking,
    isPaused,
    error,
    voices,
    selectedVoice,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    cleanup
  } = useTextToSpeech();

  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isUsingPreloaded, setIsUsingPreloaded] = useState(false);
  
  // Store the text being spoken to restart if needed
  const currentTextRef = useRef(text);
  currentTextRef.current = text;
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle preloaded audio
  useEffect(() => {
    if (preloadedAudioUrl && !preloadedAudioRef.current) {
      const audio = new Audio(preloadedAudioUrl);
      audio.preload = 'auto';
      preloadedAudioRef.current = audio;
      
      // Notify parent when audio is ready
      if (onAudioReady) {
        onAudioReady(preloadedAudioUrl);
      }
    }

    return () => {
      if (preloadedAudioRef.current) {
        preloadedAudioRef.current.pause();
        preloadedAudioRef.current = null;
      }
    };
  }, [preloadedAudioUrl, onAudioReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!isSupported) {
    return null;
  }

  const handlePlayPause = () => {
    // If we have preloaded audio and haven't played yet, use it
    if (preloadedAudioRef.current && !isSpeaking && !isUsingPreloaded) {
      setIsUsingPreloaded(true);
      
      // Set up event handlers
      preloadedAudioRef.current.onplay = () => {
        // You might want to update state here
      };
      
      preloadedAudioRef.current.onended = () => {
        setIsUsingPreloaded(false);
      };
      
      preloadedAudioRef.current.play();
      return;
    }

    if (!isSpeaking) {
      // Start speaking
      speak(currentTextRef.current, { speed });
    } else if (isPaused) {
      // Resume if paused
      resume();
    } else {
      // Pause if speaking
      pause();
    }
  };

  const handleStop = () => {
    if (preloadedAudioRef.current && isUsingPreloaded) {
      preloadedAudioRef.current.pause();
      preloadedAudioRef.current.currentTime = 0;
      setIsUsingPreloaded(false);
    } else {
      stop();
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoiceId = e.target.value;
    setVoice(newVoiceId);
    
    // If currently speaking, restart with new voice
    if (isSpeaking) {
      stop();
      setTimeout(() => {
        speak(currentTextRef.current, { voice: newVoiceId, speed });
      }, 100);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    
    // If currently speaking, restart with new speed
    if (isSpeaking) {
      stop();
      setTimeout(() => {
        speak(currentTextRef.current, { speed: newSpeed });
      }, 100);
    }
  };

  // Show special indicator if audio is preloaded
  const showPreloadedIndicator = preloadedAudioUrl && !isUsingPreloaded && !isSpeaking;

  // Debug info
  const getButtonLabel = () => {
    if (showPreloadedIndicator) return 'Read Aloud (Ready!)';
    if (isLoading) return 'Loading...';
    if (!isSpeaking && !isUsingPreloaded) return 'Read Aloud';
    if (isPaused) return 'Resume';
    return 'Pause';
  };

  return (
    <div className={`text-to-speech-controls ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={showPreloadedIndicator ? {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            animation: 'pulse 2s infinite'
          } : {}}
          title={getButtonLabel()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </>
          ) : !isSpeaking && !isUsingPreloaded ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">{showPreloadedIndicator ? 'Play (Ready!)' : 'Read Aloud'}</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-4 h-4" />
              <span className="text-sm">Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              <span className="text-sm">Pause</span>
            </>
          )}
        </button>

        {(isSpeaking || isUsingPreloaded) && (
          <button
            onClick={handleStop}
            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
            title="Stop reading"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        )}

        {showSettings && (
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Voice settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {showVoiceSettings && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voice
            </label>
            <select
              value={selectedVoice.id}
              onChange={handleVoiceChange}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #6b46c1 0%, #6b46c1 ${((speed - 0.25) / 3.75) * 100}%, #e5e7eb ${((speed - 0.25) / 3.75) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0.25x</span>
              <span>1.0x</span>
              <span>2.0x</span>
              <span>4.0x</span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> This feature uses OpenAI's advanced text-to-speech technology for natural-sounding voices. 
              {showPreloadedIndicator && ' Audio has been pre-loaded for instant playback!'}
            </p>
          </div>

          {!showPreloadedIndicator && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Changing voice or speed will restart the reading from the beginning.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;