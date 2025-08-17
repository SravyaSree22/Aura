import React from 'react';
import { CheckCircle, XCircle, Clock, Award, TrendingUp, BookOpen } from 'lucide-react';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface QuizResultsProps {
  results: {
    assignment_title: string;
    student_name: string;
    score_percentage: number;
    correct_answers: number;
    total_questions: number;
    time_taken: number;
    submitted_at: string;
    feedback: string;
    detailed_feedback: Record<string, any>;
    improvement_suggestions: string;
    performance_analysis: any;
  };
  onClose?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, onClose }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Award className="w-6 h-6 text-green-600" />;
    if (score >= 80) return <TrendingUp className="w-6 h-6 text-blue-600" />;
    if (score >= 70) return <BookOpen className="w-6 h-6 text-yellow-600" />;
    return <BookOpen className="w-6 h-6 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quiz Results</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getScoreIcon(results.score_percentage)}
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(results.score_percentage)}`}>
                {results.score_percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {results.correct_answers} / {results.total_questions} correct
              </div>
            </div>

            {/* Time Taken */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(results.time_taken)}
              </div>
              <div className="text-sm text-gray-600">Time taken</div>
            </div>

            {/* Assignment Info */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {results.assignment_title}
              </div>
              <div className="text-sm text-gray-600">
                Completed on {new Date(results.submitted_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">{results.feedback}</p>
          </div>
        </CardContent>
      </Card>

      {/* Question Analysis */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Question Analysis</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results.detailed_feedback).map(([questionId, feedback]: [string, any]) => (
              <div
                key={questionId}
                className={`border rounded-lg p-4 ${
                  feedback.status === 'correct' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {feedback.status === 'correct' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Question {parseInt(questionId) + 1}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {feedback.message}
                    </div>
                    {feedback.status === 'incorrect' && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-red-700">Your answer:</span> {feedback.your_answer}
                        <br />
                        <span className="font-medium text-green-700">Correct answer:</span> {feedback.correct_answer}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      {feedback.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
              <div className="text-yellow-900">
                <div className="font-medium mb-2">Areas for Improvement:</div>
                <div className="text-sm space-y-1">
                  {results.improvement_suggestions.split('\n').map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-600">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      {results.performance_analysis && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.performance_analysis.strengths && results.performance_analysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Strengths:</h4>
                  <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                    {results.performance_analysis.strengths.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.performance_analysis.weaknesses && results.performance_analysis.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Areas to Improve:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {results.performance_analysis.weaknesses.map((weakness: string, index: number) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.performance_analysis.recommendations && results.performance_analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                    {results.performance_analysis.recommendations.map((recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizResults;


