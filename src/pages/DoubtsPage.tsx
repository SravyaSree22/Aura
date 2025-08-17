import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Clock, Filter, MessageCircle, Search, Send } from 'lucide-react';
import { apiService } from '../services/api';

const DoubtsPage = () => {
  const { doubts, courses, submitDoubt } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCourse, setNewQuestionCourse] = useState('');
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});
  
  // Filter doubts
  const filteredDoubts = doubts.filter(doubt => {
    const matchesSearch = doubt.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doubt.status === selectedStatus;
    const matchesCourse = selectedCourse === 'all' || doubt.courseId === selectedCourse;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });
  
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim() || !newQuestionCourse) {
      alert('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitDoubt(newQuestionCourse, newQuestion);
      setNewQuestion('');
      setNewQuestionCourse('');
      setShowNewQuestion(false);
      alert('Your question has been submitted anonymously!');
    } catch {
      // Error handling is done in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (doubtId: string) => {
    const replyText = replyTexts[doubtId];
    if (!replyText?.trim()) {
      alert('Please enter a reply');
      return;
    }

    setIsReplying(prev => ({ ...prev, [doubtId]: true }));
    try {
      await apiService.answerDoubt(doubtId, replyText);
      setReplyTexts(prev => ({ ...prev, [doubtId]: '' }));
      alert('Reply submitted successfully!');
      // Refresh the doubts data
      window.location.reload();
    } catch (error) {
      alert('Failed to submit reply. Please try again.');
    } finally {
      setIsReplying(prev => ({ ...prev, [doubtId]: false }));
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Questions & Doubts</h1>
        {currentUser?.role === 'student' && (
          <Button 
            variant="primary" 
            onClick={() => setShowNewQuestion(!showNewQuestion)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask a Question
          </Button>
        )}
      </div>
      
      {showNewQuestion && currentUser?.role === 'student' && (
        <Card className="border border-indigo-100 bg-indigo-50/30 animate-fadeIn">
          <CardHeader>
            <h3 className="font-medium text-gray-900">Ask a New Question (Anonymous)</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  id="course"
                  value={newQuestionCourse}
                  onChange={(e) => setNewQuestionCourse(e.target.value)}
                  className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
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
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-gray-500">
                  Your question will be submitted anonymously. Teachers will not know who asked.
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowNewQuestion(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Question
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-gray-100' : ''}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedStatus === 'all' ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedStatus('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={selectedStatus === 'pending' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('pending')}
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={selectedStatus === 'answered' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('answered')}
                  >
                    Answered
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {filteredDoubts.length > 0 ? (
            <div className="space-y-6">
              {filteredDoubts.map((doubt) => {
                const course = courses.find(c => c.id === doubt.courseId);
                
                return (
                  <div 
                    key={doubt.id} 
                    className={`border rounded-lg overflow-hidden ${
                      doubt.status === 'pending' ? 'border-yellow-200' : 'border-green-200'
                    }`}
                  >
                    <div className={`p-4 ${
                      doubt.status === 'pending' ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900">
                            {course?.name}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doubt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {doubt.status === 'pending' ? 'Pending' : 'Answered'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          {formatDate(doubt.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white">
                      <p className="text-gray-800">{doubt.question}</p>
                      
                      {doubt.status === 'answered' && doubt.answer && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-medium text-gray-900 mb-1">Answer:</div>
                            <p className="text-gray-800">{doubt.answer}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              Answered on {formatDate(doubt.answerTimestamp!)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {currentUser?.role === 'teacher' && doubt.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <textarea
                              className="flex-grow p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mr-2"
                              rows={2}
                              placeholder="Write your answer..."
                              value={replyTexts[doubt.id] || ''}
                              onChange={(e) => setReplyTexts(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                            ></textarea>
                            <Button 
                              variant="primary"
                              onClick={() => handleSubmitReply(doubt.id)}
                              isLoading={isReplying[doubt.id]}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all' || selectedCourse !== 'all'
                  ? "No questions match your current filters. Try adjusting your search criteria."
                  : currentUser?.role === 'student'
                  ? "You haven't asked any questions yet. Feel free to ask your first question!"
                  : "No questions have been submitted by students yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DoubtsPage;
