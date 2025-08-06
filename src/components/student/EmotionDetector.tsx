import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Camera, CameraOff, RefreshCcw } from 'lucide-react';
import { useEmotion } from '../../context/EmotionContext';

const EmotionDetector = () => {
  const webcamRef = useRef<Webcam>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { detectEmotion, isDetecting, currentEmotion } = useEmotion();
  
  const toggleCamera = () => {
    setShowCamera(prev => !prev);
  };
  
  const capture = () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    detectEmotion(imageSrc);
  };
  
  const getEmotionDisplay = () => {
    if (!currentEmotion) return 'No data yet';
    
    const emotionMap = {
      normal: { text: 'Normal', color: 'text-gray-600', bg: 'bg-gray-100' },
      focused: { text: 'Focused', color: 'text-green-600', bg: 'bg-green-100' },
      tired: { text: 'Tired', color: 'text-orange-600', bg: 'bg-orange-100' },
      stressed: { text: 'Stressed', color: 'text-red-600', bg: 'bg-red-100' },
    };
    
    const emotion = emotionMap[currentEmotion.status];
    
    return (
      <span className={`${emotion.bg} ${emotion.color} px-2 py-1 rounded-full text-sm font-medium`}>
        {emotion.text}
      </span>
    );
  };
  
  const getEmotionFeedback = () => {
    if (!currentEmotion) return null;
    
    switch(currentEmotion.status) {
      case 'normal':
        return 'You seem to be doing well!';
      case 'focused':
        return 'Great! You\'re in a productive state of focus.';
      case 'tired':
        return 'Consider taking a short break to recharge.';
      case 'stressed':
        return 'Try some deep breathing exercises to reduce stress.';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Emotion Detector</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCamera}
          className="flex items-center"
        >
          {showCamera ? <CameraOff size={16} className="mr-1" /> : <Camera size={16} className="mr-1" />}
          {showCamera ? 'Hide Camera' : 'Show Camera'}
        </Button>
      </CardHeader>
      
      <CardContent>
        {showCamera ? (
          <div className="relative rounded-lg overflow-hidden bg-gray-900 mb-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 320,
                height: 240,
                facingMode: "user"
              }}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 right-2">
              <Button
                onClick={capture}
                isLoading={isDetecting}
                size="sm"
                className="flex items-center"
                disabled={isDetecting}
              >
                <RefreshCcw size={16} className="mr-1" />
                Detect Emotion
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 mb-4">
            <div className="text-center">
              <CameraOff size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Camera is turned off</p>
              <p className="text-xs text-gray-400 mt-1">Enable camera to detect emotions</p>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Current Emotional State:</div>
          <div className="flex items-center justify-between">
            <div>{getEmotionDisplay()}</div>
            <div className="text-xs text-gray-500">
              {currentEmotion && new Date(currentEmotion.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {currentEmotion && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
            <div className="font-medium mb-1">Feedback:</div>
            <p>{getEmotionFeedback()}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500">
        Emotion detection helps tailor learning recommendations to your current state.
      </CardFooter>
    </Card>
  );
};

export default EmotionDetector;
