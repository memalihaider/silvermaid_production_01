
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Check,
  CheckCheck,
  Image as ImageIcon,
  X,
  MoreVertical,
  Trash2,
  Edit,
  EyeOff,
  CheckCircle,
  Reply,
  Copy,
  ReplyAll,
  ChevronRight,
  Menu,
  Briefcase,
  Users,
  Search,
  User,
  Mail,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession, type SessionData, logout } from '@/lib/auth';
import { EmployeeSidebar } from '../_components/sidebar';

// Employee Interface
interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

// Message Interface
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'employee' | 'admin';
  recipientRole: 'admin' | 'employee';
  recipientId?: string;
  recipientName?: string;
  timestamp: any;
  read: boolean;
  readBy?: string[];
  status: 'sent' | 'delivered' | 'seen';
  collection: 'employeeMessages' | 'employeeReplies';
  imageBase64?: string;
  imageName?: string;
  deletedFor?: string[];
  deletedForEveryone?: boolean;
  edited?: boolean;
  replyToId?: string;
  replyToContent?: string;
  replyToSender?: string;
}

export default function EmployeeChatPage() {
  const router = useRouter();
  
  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Get session on mount
  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/employee');
      return;
    }
    setSession(storedSession);
    
    // Fetch logged-in employee
    fetchLoggedInEmployee(storedSession);
  }, [router]);

  // ============================================
  // FETCH LOGGED-IN EMPLOYEE ONLY
  // ============================================
  const fetchLoggedInEmployee = async (sessionData: SessionData) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching logged-in employee for chat...');
      
      let employeeData: Employee | null = null;
      
      // Try by employeeId first
      if (sessionData.employeeId) {
        const employeeDoc = await getDocs(query(
          collection(db, 'employees'), 
          where('__name__', '==', sessionData.employeeId)
        ));
        
        if (!employeeDoc.empty) {
          const data = employeeDoc.docs[0].data();
          employeeData = {
            id: employeeDoc.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            department: data.department || '',
            position: data.position || ''
          };
          console.log('✅ Found employee by ID:', employeeData.name);
        }
      }
      
      // If not found by ID, try by email
      if (!employeeData && sessionData.user.email) {
        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, where('email', '==', sessionData.user.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          employeeData = {
            id: snapshot.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            department: data.department || '',
            position: data.position || ''
          };
          console.log('✅ Found employee by email:', employeeData.name);
        }
      }
      
      if (employeeData) {
        console.log('✅ Setting logged-in employee:', employeeData.name);
        setLoggedInEmployee(employeeData);
        setSelectedEmployee(employeeData);
      } else {
        console.log('❌ No employee found for logged-in user');
        setLoggedInEmployee(null);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching logged-in employee:', error);
      setLoading(false);
    }
  };

  // ============================================
  // FETCH MESSAGES FOR SELECTED EMPLOYEE
  // ============================================
  useEffect(() => {
    if (!selectedEmployee?.id) {
      setMessages([]);
      return;
    }

    console.log('🔍 Setting up messages for employee:', selectedEmployee.id);

    // Messages sent by this employee
    const employeeMessagesQuery = query(
      collection(db, 'employeeMessages'),
      where('senderId', '==', selectedEmployee.id)
    );

    // Replies from admin to this employee
    const adminRepliesQuery = query(
      collection(db, 'employeeReplies'),
      where('recipientId', '==', selectedEmployee.id)
    );

    const unsubscribeEmployeeMessages = onSnapshot(employeeMessagesQuery, (snapshot) => {
      const employeeMsgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          collection: 'employeeMessages'
        };
      }) as Message[];
      
      setMessages(prev => {
        const replies = prev.filter(m => m.collection === 'employeeReplies');
        const allMsgs = [...employeeMsgs, ...replies];
        return allMsgs.sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    const unsubscribeAdminReplies = onSnapshot(adminRepliesQuery, (snapshot) => {
      const replyMsgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          collection: 'employeeReplies'
        };
      }) as Message[];
      
      setMessages(prev => {
        const employeeMsgs = prev.filter(m => m.collection === 'employeeMessages');
        const allMsgs = [...employeeMsgs, ...replyMsgs];
        return allMsgs.sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    return () => {
      unsubscribeEmployeeMessages();
      unsubscribeAdminReplies();
    };
  }, [selectedEmployee?.id]);

  // ✅ Scroll to bottom on new messages - ONLY IF AT BOTTOM
  useEffect(() => {
    if (messagesScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesScrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      
      if (isAtBottom) {
        messagesScrollRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  // ============================================
  // MESSAGE ACTIONS
  // ============================================
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Image size should be less than 1MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearReply = () => {
    setReplyingTo(null);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Send message to admin
  const handleSendMessage = async () => {
    if (!selectedEmployee?.id) {
      alert('Employee profile not found');
      return;
    }

    if (!newMessage.trim() && !selectedImage) {
      alert('Please enter a message or select an image');
      return;
    }

    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      let imageBase64 = null;
      let imageName = null;

      if (selectedImage) {
        imageBase64 = await convertImageToBase64(selectedImage);
        imageName = selectedImage.name;
        clearSelectedImage();
      }

      const messageData: any = {
        content: messageContent,
        senderId: selectedEmployee.id,
        senderName: selectedEmployee.name,
        senderEmail: selectedEmployee.email,
        senderRole: 'employee',
        recipientRole: 'admin',
        timestamp: serverTimestamp(),
        read: false,
        status: 'sent',
        readBy: [],
        deliveredTo: [],
        deletedFor: [],
        deletedForEveryone: false,
        edited: false,
        createdAt: new Date().toISOString()
      };

      if (imageBase64) {
        messageData.imageBase64 = imageBase64;
        messageData.imageName = imageName;
      }

      if (replyingTo) {
        messageData.replyToId = replyingTo.id;
        messageData.replyToContent = replyingTo.content || '';
        messageData.replyToSender = replyingTo.senderName || 'Someone';
      }

      await addDoc(collection(db, 'employeeMessages'), messageData);
      clearReply();
      
    } catch (error) {
      console.error('❌ Send error:', error);
      alert('Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // Copy message
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Message copied!');
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // Delete for me
  const handleDeleteForMe = async (message: Message) => {
    if (!selectedEmployee?.id) return;
    
    try {
      const messageRef = doc(db, message.collection, message.id);
      const deletedFor = message.deletedFor || [];
      
      if (!deletedFor.includes(selectedEmployee.id)) {
        await updateDoc(messageRef, { 
          deletedFor: [...deletedFor, selectedEmployee.id] 
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Delete for everyone
  const handleDeleteForEveryone = async (message: Message) => {
    if (!confirm('Delete for everyone? This cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, message.collection, message.id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Edit message
  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      const messageRef = doc(db, editingMessage.collection, editingMessage.id);
      await updateDoc(messageRef, {
        content: editContent,
        edited: true,
        editedAt: serverTimestamp()
      });
      
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessage(message);
    setEditContent(message.content || '');
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  // Format time
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isToday(date)) return format(date, 'hh:mm a');
      if (isYesterday(date)) return `Yesterday ${format(date, 'hh:mm a')}`;
      return format(date, 'dd/MM/yy hh:mm a');
    } catch {
      return '';
    }
  };

  // Filter out deleted messages
  const visibleMessages = messages.filter(msg => {
    const deletedFor = msg.deletedFor || [];
    return !deletedFor.includes(selectedEmployee?.id) && !msg.deletedForEveryone;
  });

  // Group messages by date
  const groupedMessages = visibleMessages.reduce((groups: any, msg) => {
    try {
      const date = msg.timestamp?.toDate 
        ? format(msg.timestamp.toDate(), 'yyyy-MM-dd')
        : format(new Date(msg.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    } catch {
      const date = format(new Date(), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    }
    return groups;
  }, {});

  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login/employee');
  };

  // Get user initials
  const getUserInitials = () => {
    if (!session?.user?.name) return 'E';
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!loggedInEmployee) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Employee Not Found</h2>
            <p className="text-slate-400 mb-6">No employee profile linked to your account.</p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Employee Sidebar */}
      <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* ✅ Main Content - Full height with flex column */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ✅ Header - Fixed at top */}
        <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700 shrink-0">
          <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Employee Chat</h1>
                <p className="text-sm text-slate-400">
                  Chatting as: <span className="text-violet-400 font-semibold">{loggedInEmployee.name}</span>
                </p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-900/30 border border-violet-700 rounded-lg">
                <Mail className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">{session?.user.email}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Chat Container - Takes remaining height, no overflow */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full h-full overflow-hidden">
          <Card className="bg-slate-800 border-slate-700 shadow-xl h-full flex flex-col overflow-hidden">
            
            {/* ✅ Profile Info - Fixed section */}
            <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-5 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                    YOUR PROFILE
                  </label>
                  
                  <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-violet-500/30">
                    <Avatar className="w-16 h-16 rounded-xl border-2 border-violet-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl">
                        {loggedInEmployee.name?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{loggedInEmployee.name}</h2>
                      <p className="text-sm text-slate-400 mt-1">{loggedInEmployee.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {loggedInEmployee.department && (
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {loggedInEmployee.department}
                          </Badge>
                        )}
                        {loggedInEmployee.position && (
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {loggedInEmployee.position}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 px-4 py-2 bg-violet-500/10 rounded-2xl border border-violet-500/20 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-300">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Messages Area - Scrollable (takes remaining height) */}
            <div className="flex-1 bg-slate-900/50 min-h-0 overflow-hidden">
              <ScrollArea 
                ref={messagesScrollRef}
                className="h-full w-full"
              >
                <div className="px-6 py-6">
                  {visibleMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                      <div className="w-24 h-24 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mb-4">
                        <MessageCircle className="w-12 h-12 text-violet-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
                      <p className="text-slate-400 text-center">
                        Start a conversation with admin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                        <div key={date}>
                          <div className="flex justify-center mb-4">
                            <span className="bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-full">
                              {formatDateHeader(date)}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {(dateMessages as Message[]).map((msg) => {
                              const isMe = msg.senderRole === 'employee';
                              
                              return (
                                <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                  
                                  {!isMe && (
                                    <Avatar className="w-8 h-8 ring-2 ring-slate-700 shrink-0">
                                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                                        A
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  
                                  <div className={cn("max-w-xs lg:max-w-md", isMe ? "order-2" : "order-1")}>
                                    <div className={cn(
                                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group/message",
                                      isMe 
                                        ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-none" 
                                        : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                                    )}>
                                      {!isMe && (
                                        <p className="text-xs font-semibold text-violet-400 mb-1">
                                          Admin
                                        </p>
                                      )}
                                      {isMe && (
                                        <p className="text-xs font-semibold text-violet-300 mb-1">
                                          You
                                        </p>
                                      )}
                                      
                                      {msg.replyToId && (
                                        <div className="mb-2 pl-2 border-l-3 border-violet-400 bg-slate-700/50 p-2 rounded-lg text-xs">
                                          <p className="text-violet-400 font-semibold">
                                            Replying to {msg.replyToSender}
                                          </p>
                                          <p className="text-slate-300 line-clamp-2">
                                            {msg.replyToContent || '📷 Image'}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {editingMessage?.id === msg.id ? (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            ref={editInputRef}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="flex-1 bg-slate-700 border-slate-600 text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && handleEditMessage()}
                                          />
                                          <Button size="sm" onClick={handleEditMessage} className="bg-violet-600 hover:bg-violet-700">Save</Button>
                                          <Button size="sm" variant="ghost" onClick={cancelEditing} className="text-slate-400 hover:text-white">Cancel</Button>
                                        </div>
                                      ) : (
                                        <>
                                          {msg.content && (
                                            <p className="whitespace-pre-wrap break-words leading-relaxed mb-2">
                                              {msg.content}
                                              {msg.edited && (
                                                <span className="text-[10px] text-slate-400 ml-1 italic">
                                                  (edited)
                                                </span>
                                              )}
                                            </p>
                                          )}
                                          
                                          {msg.imageBase64 && (
                                            <div className="mb-2 rounded-lg overflow-hidden border border-slate-700">
                                              <img 
                                                src={msg.imageBase64} 
                                                alt={msg.imageName}
                                                className="max-w-full h-auto max-h-64 object-contain"
                                              />
                                            </div>
                                          )}
                                        </>
                                      )}
                                      
                                      <div className={cn(
                                        "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                        isMe ? "text-slate-300" : "text-slate-400"
                                      )}>
                                        <span>{formatMessageTime(msg.timestamp)}</span>
                                        {isMe && msg.status === 'sent' && <Check className="w-3 h-3" />}
                                        {isMe && msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                                        {isMe && msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                      </div>

                                      {editingMessage?.id !== msg.id && (
                                        <div className="absolute -top-2 -right-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600">
                                                <MoreVertical className="w-4 h-4 text-slate-300" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                              <DropdownMenuItem onClick={() => setReplyingTo(msg)} className="text-slate-300 hover:text-white hover:bg-violet-500/20">
                                                <Reply className="w-4 h-4 mr-2" /> Reply
                                              </DropdownMenuItem>
                                              {msg.content && (
                                                <DropdownMenuItem onClick={() => handleCopyMessage(msg.content)} className="text-slate-300 hover:text-white hover:bg-violet-500/20">
                                                  <Copy className="w-4 h-4 mr-2" /> Copy
                                                </DropdownMenuItem>
                                              )}
                                              {isMe && (
                                                <>
                                                  <DropdownMenuItem onClick={() => startEditing(msg)} className="text-slate-300 hover:text-white hover:bg-violet-500/20">
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => handleDeleteForMe(msg)} className="text-slate-300 hover:text-white hover:bg-violet-500/20">
                                                    <EyeOff className="w-4 h-4 mr-2" /> Delete for me
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem 
                                                    onClick={() => handleDeleteForEveryone(msg)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                  >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete for everyone
                                                  </DropdownMenuItem>
                                                </>
                                              )}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isMe && (
                                    <Avatar className="w-8 h-8 ring-2 ring-slate-700 shrink-0">
                                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                                        {loggedInEmployee.name?.charAt(0) || 'E'}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* ✅ Message Input - Fixed at bottom */}
            <div className="bg-slate-800/80 backdrop-blur-xl border-t border-slate-700 px-6 py-1 shrink-0">
              
              {replyingTo && (
                <div className="mb-3 p-3 bg-slate-700 rounded-lg flex items-center gap-3 border-l-4 border-violet-500">
                  <ReplyAll className="w-4 h-4 text-violet-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-violet-400">
                      Replying to {replyingTo.senderName}
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-1">
                      {replyingTo.content || '📷 Image'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearReply} className="text-slate-400 hover:text-white shrink-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {imagePreview && (
                <div className="mb-3 p-2 bg-slate-700 rounded-lg flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-600 shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm text-slate-300 truncate">
                    {selectedImage?.name}
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelectedImage} className="text-slate-400 hover:text-white shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-3 py-3">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-slate-600 hover:border-violet-500 hover:bg-violet-500/10 shrink-0" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                </Button>
                
                <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-700 hover:border-violet-500/30 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20">
                  <div className="flex items-center px-4">
                    {replyingTo && <ReplyAll className="w-4 h-4 text-violet-400 mr-2 shrink-0" />}
                    <MessageCircle className="w-5 h-5 text-slate-500 shrink-0" />
                    <Input
                      ref={replyInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message admin..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="border-0 bg-transparent px-3 py-5 focus-visible:ring-0 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() && !selectedImage || isSending}
                  className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-2xl shadow-lg shadow-violet-600/20 shrink-0"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}