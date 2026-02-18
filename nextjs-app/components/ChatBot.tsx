
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ChatBot = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI assistant. I can help you with questions about student performance, risk analysis, and academic insights. What would you like to know?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Check if user is authenticated
        if (!session?.user) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "Please log in to use the chatbot. User authentication is required.",
                sender: 'bot',
                timestamp: new Date(),
                error: true
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        const messageToSend = inputMessage.trim();

        const userMessage = {
            id: Date.now(),
            text: messageToSend,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageToSend,
                    user_email: session.user.email
                }),
            });

            const data = await response.json();

            const botResponse = {
                id: Date.now() + 1,
                text: data.response,
                sender: 'bot',
                timestamp: new Date(),
                followUpQuestions: data.follow_up_questions
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I encountered an error processing your request. Please try again later.",
                sender: 'bot',
                timestamp: new Date(),
                error: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const askFollowUpQuestion = (question: string) => {
        setInputMessage(question);
        inputRef.current?.focus();
    };

    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
                    aria-label="Open AI Assistant"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 text-slate-800">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <h3 className="font-semibold text-lg">AI Assistant</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                                aria-label="Close chat"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-blue-100 mt-1">
                            Ask me about student performance, risk analysis, or academic insights
                        </p>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
                        {messages.map((message: any) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : message.error
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : 'bg-white border border-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.text}</p>

                                    {message.sender === 'bot' && !message.error && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                                        <div className="mt-2 text-slate-700">
                                            <p className="text-xs font-medium text-gray-500 mb-1">Suggested questions:</p>
                                            <div className="space-y-1">
                                                {message.followUpQuestions.map((question: string, index: number) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => askFollowUpQuestion(question)}
                                                        className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors text-slate-700 hover:text-slate-900"
                                                    >
                                                        💬 {question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`mt-1 text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                                        }`}>
                                        {formatTimestamp(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <span className="text-sm text-gray-600">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                        <div className="flex items-end space-x-2">
                            <div className="flex-1">
                                <textarea
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask a question..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                                    rows={2}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-3 flex flex-wrap gap-2 text-slate-700">
                            <button
                                onClick={() => setInputMessage("How many students are at risk and why?")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                            >
                                📊 Risk Analysis
                            </button>
                            <button
                                onClick={() => setInputMessage("What is my current performance status?")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                            >
                                📈 My Performance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
