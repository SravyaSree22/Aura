import React, { useState } from 'react';
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';

const DoubtForm = () => {
  const { courses, submitDoubt } = useData();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }
    
    if (!question.trim()) {
      setError('Please enter your question');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await submitDoubt(selectedCourse, question);
      setSuccessMessage('Your question has been submitted anonymously!');
      setSelectedCourse('');
      setQuestion('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError('Failed to submit your question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="font-medium text-gray-900">Ask a Question Anonymously</h3>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-700">
              Select Course
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="question" className="block mb-2 text-sm font-medium text-gray-700">
              Your Question
            </label>
            <textarea
              id="question"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
          
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Question
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500">
        Your questions are submitted anonymously. Teachers will not know who asked the question.
      </CardFooter>
    </Card>
  );
};

export default DoubtForm;
