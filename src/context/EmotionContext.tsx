import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Emotion } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface EmotionContextType {
  emotions: Emotion[];
  currentEmotion: Emotion | null;
  detectEmotion: (imageSrc?: string) => void;
  addEmotion: (emotion: string, confidence: number) => void;
  isDetecting: boolean;
}

const EmotionContext = createContext<EmotionContextType>({
  emotions: [],
  currentEmotion: null,
  detectEmotion: () => {},
  addEmotion: () => {},
  isDetecting: false,
});

function useEmotion() {
  return useContext(EmotionContext);
}

function EmotionProvider({ children }: { children: ReactNode }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const fetchEmotions = async () => {
      // Don't fetch emotions while auth is still loading
      if (authLoading) {
        return;
      }
      
      // Only fetch emotions if user is authenticated
      if (!currentUser) {
        return;
      }

      try {
        const response = await apiService.getEmotions();
        if (response.data) {
          setEmotions(response.data as Emotion[]);
        }
      } catch (error) {
        console.error('Error fetching emotions:', error);
      }
    };

    fetchEmotions();
  }, [currentUser, authLoading]); // Re-fetch when user or auth loading state changes

  useEffect(() => {
    // Set the most recent emotion as current
    if (emotions.length > 0) {
      const sorted = [...emotions].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setCurrentEmotion(sorted[0]);
    }
  }, [emotions]);

  const detectEmotion = async () => {
    setIsDetecting(true);
    
    try {
      const response = await apiService.detectEmotion();
      if (response.data) {
        setEmotions(prev => [response.data as Emotion, ...prev]);
        setCurrentEmotion(response.data as Emotion);
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const addEmotion = (emotion: string, confidence: number) => {
    const newEmotion: Emotion = {
      id: Date.now(), // Temporary ID for frontend
      timestamp: new Date().toISOString(),
      emotion: emotion,
      confidence
    };
    
    setEmotions(prev => [newEmotion, ...prev]);
    setCurrentEmotion(newEmotion);
  };

  const value = {
    emotions,
    currentEmotion,
    detectEmotion,
    addEmotion,
    isDetecting,
  };

  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
}

export { useEmotion, EmotionProvider };
