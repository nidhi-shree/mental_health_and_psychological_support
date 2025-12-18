import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, RefreshCw, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const quickReplies = [
  "I'm feeling anxious 😰",
  "I can't sleep 😴",
  "I'm overwhelmed 🤯",
  "Just need to vent 🗣️",
  "How can I relax? 🧘",
  "I feel lonely 😔",
];

export default function TalkToSupport() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello. I'm Embrace. I'm here to listen, support, and help you navigate your feelings. How are you doing right now?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tempTranscript, setTempTranscript] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, tempTranscript]);

  // --- VOICE LOGIC ---
  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    setTempTranscript("");
    setIsListening(true);

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
      setTempTranscript(transcript);
    };

    recognitionRef.current.onend = () => { if(isListening) recognitionRef.current.start(); };
    recognitionRef.current.start();
  };

  const stopAndAccept = () => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); }
    setIsListening(false);
    if (tempTranscript.trim()) setInputValue((prev) => (prev ? prev + " " : "") + tempTranscript.trim());
    setTempTranscript("");
  };

  const stopAndCancel = () => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); }
    setIsListening(false);
    setTempTranscript("");
  };

  // --- MESSAGING LOGIC ---
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), content: content.trim(), isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat/talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        content: data.reply || "I'm listening...", 
        isUser: false, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        content: "I'm having trouble connecting to the cloud, but I'm still here.", 
        isUser: false, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // --- HELPER: Render text with clickable links ---
  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
        <>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a 
                            key={i} 
                            href={part} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="underline text-blue-400 hover:text-blue-300 font-medium break-all"
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background flex flex-col md:flex-row font-sans">
      
      {/* ---------------------------------- */}
      {/* LEFT SIDE: 3D COMPANION (Iframe)   */}
      {/* ---------------------------------- */}
      <div className="hidden md:flex w-5/12 h-full relative items-center justify-center bg-black overflow-hidden">
        
        {/* The 3D Scene via Iframe - Scaled up and Shifted to Center */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.35, x: -40 }} // Shifted left (-40px) to center the off-center blob
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full relative z-0"
        >
             <iframe 
                src='https://my.spline.design/aiblob-X4ems56peeIxj9JvDjZYWC7z/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                title="AI Companion"
                className="w-full h-full pointer-events-auto"
                style={{ background: 'transparent' }}
             />
        </motion.div>
        
        {/* Magic Overlay: Radial Gradient to blend edges into black */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_20%,#000000_90%)] pointer-events-none" />

        {/* Bottom Text Area */}
        <div className="absolute bottom-12 left-0 right-0 z-20 p-8 text-center pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
            >
                <h2 className="text-4xl font-light text-white tracking-widest mb-2 font-serif opacity-90">EMBRACE</h2>
                <p className="text-white/50 text-sm font-light tracking-wide uppercase">
                    Your quiet companion
                </p>
            </motion.div>
        </div>
      </div>

      {/* ---------------------------------- */}
      {/* RIGHT SIDE: CHAT INTERFACE         */}
      {/* ---------------------------------- */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 relative">
        
        {/* 1. Chat Header */}
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-indigo-100">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">AI</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">Wellness Chat</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Secure Connection</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-purple-600 rounded-full" onClick={() => setMessages([])}>
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>
        </div>

        {/* 2. Messages Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            {messages.map((msg) => (
                <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.isUser ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {msg.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        {/* Bubble */}
                        <div className={`
                            px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap
                            ${msg.isUser 
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-zinc-100 dark:border-zinc-700'}
                        `}>
                            {renderMessageWithLinks(msg.content)}
                            <p className={`text-[10px] mt-2 text-right opacity-70 ${msg.isUser ? 'text-purple-100' : 'text-slate-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}

            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-zinc-100 dark:border-zinc-700 flex gap-1 items-center h-10 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </motion.div>
            )}
            
            <div ref={messagesEndRef} />
        </div>

        {/* 3. Input Area (Fixed Bottom) */}
        <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
            
            {/* Quick Replies */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
                {quickReplies.map((reply, i) => (
                    <button
                        key={i}
                        onClick={() => sendMessage(reply)}
                        className="whitespace-nowrap px-4 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-zinc-700 transition-colors"
                    >
                        {reply}
                    </button>
                ))}
            </div>

            {/* Voice UI Overlay */}
            <AnimatePresence>
                {isListening && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-24 left-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 shadow-xl text-white flex items-center justify-between z-20"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative">
                                <span className="absolute inset-0 rounded-full bg-white/20 animate-ping"></span>
                                <div className="relative bg-white/20 rounded-full p-2"><Mic className="w-4 h-4" /></div>
                            </div>
                            <span className="text-sm font-medium animate-pulse">{tempTranscript || "Listening..."}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button size="icon" variant="ghost" onClick={stopAndCancel} className="h-8 w-8 text-white/70 hover:bg-white/20 rounded-full"><X className="w-4 h-4" /></Button>
                            <Button size="icon" onClick={stopAndAccept} className="h-8 w-8 bg-white text-purple-600 hover:bg-white/90 rounded-full shadow-md"><Send className="w-4 h-4 ml-0.5" /></Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text Input */}
            <form onSubmit={handleSubmit} className="flex gap-3 items-end relative">
                <div className="relative flex-1 group">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type how you feel..."
                        className="pl-5 pr-12 py-6 rounded-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus-visible:ring-indigo-500 text-base shadow-inner transition-all group-hover:bg-slate-100"
                        disabled={isTyping || isListening}
                    />
                    <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={startDictation}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-colors rounded-full h-9 w-9"
                        disabled={isListening}
                    >
                        <Mic className="w-5 h-5" />
                    </Button>
                </div>

                <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!inputValue.trim() || isTyping}
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 shrink-0 transition-transform hover:scale-105 active:scale-95"
                >
                    <Send className="w-5 h-5 ml-0.5 text-white" />
                </Button>
            </form>
        </div>

      </div>
    </div>
  );
}