import React, { useState, useRef, useEffect } from 'react';
import { useEmotion } from '../../context/EmotionContext';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Camera, Smile, Frown, Meh, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: string;
}

const EmotionDetector = () => {
  const { addEmotion } = useEmotion();
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Emotion mapping based on MediaPipe facial recognition
  const emotionMap = {
    'happy': { icon: Smile, color: 'text-green-500', bgColor: 'bg-green-100' },
    'sad': { icon: Frown, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    'angry': { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
    'surprised': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    'neutral': { icon: Meh, color: 'text-gray-500', bgColor: 'bg-gray-100' },
    'fear': { icon: AlertCircle, color: 'text-purple-500', bgColor: 'bg-purple-100' },
    'disgust': { icon: Frown, color: 'text-orange-500', bgColor: 'bg-orange-100' }
  };

  const startDetection = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsConnected(true);
        setIsDetecting(true);
        
        // Start emotion detection loop
        detectEmotion();
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  };

  const stopDetection = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
    setIsConnected(false);
    setCurrentEmotion('');
    setConfidence(0);
  };

  const detectEmotion = async () => {
    if (!isDetecting || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Send to backend for emotion detection using MediaPipe
      const response = await fetch('/api/emotions/detect/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({
          image_data: imageData.data,
          width: canvas.width,
          height: canvas.height
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const { emotion, confidence: conf } = result;
        
        setCurrentEmotion(emotion);
        setConfidence(conf);

        // Add to emotion history
        const newEmotionData: EmotionData = {
          emotion,
          confidence: conf,
          timestamp: new Date().toISOString()
        };

        setEmotionHistory(prev => [...prev.slice(-9), newEmotionData]);

        // Send to emotion context for tracking
        addEmotion(emotion, conf);

      } else {
        console.error('Emotion detection failed');
      }
    } catch (err) {
      console.error('Error detecting emotion:', err);
    }

    // Continue detection loop
    if (isDetecting) {
      setTimeout(detectEmotion, 1000); // Detect every second
    }
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const getEmotionIcon = (emotion: string) => {
    const emotionData = emotionMap[emotion as keyof typeof emotionMap];
    if (!emotionData) return Meh;
    return emotionData.icon;
  };

  const getEmotionColor = (emotion: string) => {
    const emotionData = emotionMap[emotion as keyof typeof emotionMap];
    if (!emotionData) return 'text-gray-500';
    return emotionData.color;
  };

  const getEmotionBgColor = (emotion: string) => {
    const emotionData = emotionMap[emotion as keyof typeof emotionMap];
    if (!emotionData) return 'bg-gray-100';
    return emotionData.bgColor;
  };

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Real-time Emotion Detection
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Feed */}
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Overlay for current emotion */}
                {currentEmotion && (
                  <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      {React.createElement(getEmotionIcon(currentEmotion), {
                        className: `w-5 h-5 ${getEmotionColor(currentEmotion)}`
                      })}
                      <div>
                        <div className="font-medium capitalize">{currentEmotion}</div>
                        <div className="text-xs text-gray-500">
                          {Math.round(confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connection status */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    isConnected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isConnected ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex space-x-2">
                {!isDetecting ? (
                  <Button
                    onClick={startDetection}
                    variant="primary"
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Detection
                  </Button>
                ) : (
                  <Button
                    onClick={stopDetection}
                    variant="outline"
                    className="flex-1"
                  >
                    Stop Detection
                  </Button>
                )}
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Emotion History */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent Emotions</h4>
              
              {emotionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Meh className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No emotions detected yet</p>
                  <p className="text-sm">Start detection to see your emotions</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {emotionHistory.slice().reverse().map((data, index) => {
                    const Icon = getEmotionIcon(data.emotion);
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${getEmotionBgColor(data.emotion)}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${getEmotionColor(data.emotion)}`} />
                          <div>
                            <div className="font-medium capitalize">{data.emotion}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(data.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {Math.round(data.confidence * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Emotion Statistics */}
          {emotionHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Emotion Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(emotionMap).map(([emotion, { icon: Icon, color, bgColor }]) => {
                  const count = emotionHistory.filter(h => h.emotion === emotion).length;
                  const percentage = emotionHistory.length > 0 
                    ? Math.round((count / emotionHistory.length) * 100) 
                    : 0;
                  
                  return (
                    <div key={emotion} className={`p-3 rounded-lg ${bgColor}`}>
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <div className="flex-1">
                          <div className="font-medium capitalize text-sm">{emotion}</div>
                          <div className="text-xs text-gray-600">{count} times</div>
                        </div>
                        <div className={`text-sm font-bold ${color}`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionDetector;
