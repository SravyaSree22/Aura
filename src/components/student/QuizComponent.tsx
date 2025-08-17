import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Clock, CheckCircle, AlertCircle, Trophy, BookOpen } from 'lucide-react';
import { apiService } from '../../services/api';
import { QuizQuestion } from '../../types';

interface QuizComponentProps {
  assignmentId: string;
  questions: QuizQuestion[];
  onComplete: (result: any) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ assignmentId, questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeStarted, setTimeStarted] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    setTimeStarted(Date.now());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);
      const response = await apiService.submitQuiz(assignmentId, answers, timeTaken);

      if (response.error) {
        throw new Error(response.error);
      }

      setQuizResult(response.data);
      setShowResults(true);
      onComplete(response.data);
    } catch (error) {
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    const questionId = questions[index].id.toString();
    if (answers[questionId]) {
      return 'answered';
    }
    return 'unanswered';
  };

  if (showResults && quizResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quiz Results</h3>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-600">
                  {quizResult.score.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{quizResult.correct_answers}</div>
                <div className="text-sm text-green-600">Correct Answers</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{quizResult.total_questions - quizResult.correct_answers}</div>
                <div className="text-sm text-red-600">Incorrect Answers</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{formatTime(quizResult.time_taken)}</div>
                <div className="text-sm text-blue-600">Time Taken</div>
              </div>
            </div>

            {quizResult.feedback && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-indigo-900 mb-2">Feedback</h4>
                <p className="text-indigo-800">{quizResult.feedback}</p>
              </div>
            )}

            {quizResult.performance_analysis && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Performance Analysis</h4>
                
                {quizResult.performance_analysis.strengths && quizResult.performance_analysis.strengths.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Your Strengths
                    </h5>
                    <ul className="text-green-800 space-y-1">
                      {quizResult.performance_analysis.strengths.map((strength: string, index: number) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {quizResult.performance_analysis.weaknesses && quizResult.performance_analysis.weaknesses.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h5 className="font-medium text-red-900 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Areas for Improvement
                    </h5>
                    <ul className="text-red-800 space-y-1">
                      {quizResult.performance_analysis.weaknesses.map((weakness: string, index: number) => (
                        <li key={index}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {quizResult.performance_analysis.recommendations && quizResult.performance_analysis.recommendations.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Recommendations
                    </h5>
                    <ul className="text-blue-800 space-y-1">
                      {quizResult.performance_analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length} / {questions.length} answered
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {currentQ.question_text}
              </h4>
              
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const optionText = currentQ[`option_${option.toLowerCase()}` as keyof QuizQuestion] as string;
                  const isSelected = answers[currentQ.id.toString()] === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(currentQ.id, option)}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {option}
                        </div>
                        <span className="font-medium">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                      index === currentQuestion
                        ? 'bg-indigo-500 text-white'
                        : getQuestionStatus(index) === 'answered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || Object.keys(answers).length < questions.length}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNextQuestion}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizComponent;
