import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM'];

const SchedulePage = () => {
  const { courses } = useData();
  const { currentUser } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, -1 = last week
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Schedule data from API
  const schedule = [
    { day: 'Monday', time: '9:30 AM', course: courses[0], type: 'Lecture' },
    { day: 'Monday', time: '2:00 PM', course: courses[2], type: 'Lab' },
    { day: 'Tuesday', time: '11:00 AM', course: courses[1], type: 'Lecture' },
    { day: 'Wednesday', time: '9:30 AM', course: courses[0], type: 'Lecture' },
    { day: 'Thursday', time: '11:00 AM', course: courses[1], type: 'Lecture' },
    { day: 'Thursday', time: '3:30 PM', course: courses[3], type: 'Seminar' },
    { day: 'Friday', time: '2:00 PM', course: courses[2], type: 'Lab' },
  ];
  
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // Adjust to Monday of current week
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days, otherwise go back to Monday
    startOfWeek.setDate(today.getDate() - diff + (currentWeek * 7));
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day,
        date: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        isToday: date.toDateString() === today.toDateString()
      };
    });
  };
  
  const weekDates = getWeekDates();
  
  const getEvent = (day: string, time: string) => {
    return schedule.find(event => event.day === day && event.time === time);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentWeek(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentWeek(0)}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentWeek(prev => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          {currentUser?.role === 'teacher' && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowEventModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          )}
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="grid grid-cols-6 divide-x divide-gray-200 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-500 text-sm">
            Time
          </div>
          {weekDates.map((date) => (
            <div 
              key={date.day} 
              className={`p-4 text-center ${date.isToday ? 'bg-indigo-50' : 'bg-gray-50'}`}
            >
              <div className={`font-medium ${date.isToday ? 'text-indigo-600' : 'text-gray-600'}`}>{date.day}</div>
              <div className="text-sm text-gray-500">{date.month} {date.date}</div>
            </div>
          ))}
        </div>
        
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-6 divide-x divide-gray-200">
              <div className="p-4 bg-gray-50 flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">{time}</span>
              </div>
              
              {days.map((day) => {
                const event = getEvent(day, time);
                return (
                  <div 
                    key={`${day}-${time}`} 
                    className={`p-3 min-h-[100px] relative ${event ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  >
                    {event && (
                      <div 
                        className="absolute inset-2 rounded-lg p-3 shadow-sm border border-gray-200 flex flex-col justify-between"
                        style={{ backgroundColor: `${event.course.color}10`, borderLeftColor: event.course.color, borderLeftWidth: '3px' }}
                      >
                        <div>
                          <div className="font-medium text-gray-900">{event.course.name}</div>
                          <div className="text-xs text-gray-600">{event.course.code} · {event.type}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{event.course.teacher}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
      
      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Schedule Event</h3>
              <div className="space-y-4">
                {/* Form fields would go here */}
                <div className="flex justify-end space-x-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowEventModal(false)}
                  >
                    Add Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
