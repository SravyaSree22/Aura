import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { BookOpen, CircleHelp, FileText, MessageSquare, Search, Send, ThumbsUp } from 'lucide-react';
import { apiService } from '../services/api';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_active: boolean;
}

const HelpSupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Load FAQs from API
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await apiService.getFAQs();
        if (response.data) {
          setFaqs(response.data as FAQ[]);
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
      }
    };

    loadFAQs();
  }, []);

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Guide data from API
  const guides = [
    {
      id: 1,
      title: "Getting Started with AURA",
      description: "Learn the basics of navigating the platform and setting up your profile.",
      icon: <BookOpen className="w-6 h-6 text-indigo-500" />,
    },
    {
      id: 2,
      title: "Understanding Emotion Detection",
      description: "A comprehensive guide to how our emotion detection technology works.",
      icon: <CircleHelp className="w-6 h-6 text-blue-500" />,
    },
    {
      id: 3,
      title: "Submitting Assignments",
      description: "Step-by-step guide to submitting assignments and receiving feedback.",
      icon: <FileText className="w-6 h-6 text-green-500" />,
    },
    {
      id: 4,
      title: "Asking Anonymous Questions",
      description: "How to use the anonymous doubt feature effectively.",
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
    },
  ];
  
  // Handle contact form input changes
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await apiService.submitContactMessage(contactForm);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMessage({ type: 'success', text: 'Your message has been sent! Our support team will get back to you soon.' });
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
      
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeTab === 'faq' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('faq')}
            >
              <CircleHelp className="w-4 h-4 mr-1" />
              Frequently Asked Questions
            </Button>
            <Button 
              variant={activeTab === 'guides' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('guides')}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              User Guides
            </Button>
            <Button 
              variant={activeTab === 'contact' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('contact')}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Contact Support
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100"
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <span className="ml-2 text-gray-500">
                          {expandedFaq === faq.id ? '−' : '+'}
                        </span>
                      </button>
                      
                      {expandedFaq === faq.id && (
                        <div className="p-4 bg-white animate-fadeIn">
                          <p className="text-gray-700">{faq.answer}</p>
                          <div className="mt-3 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Was this helpful?
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-1 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50">
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CircleHelp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching questions found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Try adjusting your search terms or browse all FAQs by clearing the search.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                  <div key={guide.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      {guide.icon}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-gray-600 mb-4">{guide.description}</p>
                    <Button variant="outline" size="sm">
                      Read Guide
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mt-8">
                <div className="flex items-start">
                  <div className="mr-4">
                    <BookOpen className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Need more detailed documentation?</h3>
                    <p className="text-gray-600 mb-4">
                      Our comprehensive documentation covers all aspects of the AURA platform, from basic usage to advanced features.
                    </p>
                    <Button variant="primary" size="sm">
                      View Full Documentation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Our Support Team</h3>
                  <p className="text-gray-600 mb-6">
                    Have a question that&apos;s not covered in our FAQs or guides? Our support team is here to help.
                    Fill out the form, and we&apos;ll get back to you as soon as possible.
                  </p>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        name="name"
                        label="Your Name"
                        value={contactForm.name}
                        onChange={handleContactInputChange}
                        required
                      />
                      <Input
                        type="email"
                        name="email"
                        label="Email Address"
                        value={contactForm.email}
                        onChange={handleContactInputChange}
                        required
                      />
                    </div>
                    
                    <Input
                      type="text"
                      name="subject"
                      label="Subject"
                      value={contactForm.subject}
                      onChange={handleContactInputChange}
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={contactForm.message}
                        onChange={handleContactInputChange}
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      ></textarea>
                    </div>
                    
                    <Button type="submit" variant="primary" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Message'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                  {message && (
                    <div className={`mt-4 p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {message.text}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Other Ways to Reach Us</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                      <p className="text-gray-600">support@aura.edu</p>
                      <p className="text-xs text-gray-500 mt-1">Typical response time: 24 hours</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Live Chat</h4>
                      <p className="text-gray-600">Available Monday to Friday, 9 AM - 5 PM EST</p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">
                          Start Live Chat
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-xs text-gray-500 mt-1">Available for premium subscribers</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Connect With Us</h4>
                      <div className="flex space-x-4">
                        <a href="#" className="text-gray-500 hover:text-indigo-600">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-indigo-600">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-indigo-600">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HelpSupportPage;
