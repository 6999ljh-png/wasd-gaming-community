import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Send, Search, ArrowLeft, MoreVertical } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface DirectMessagesPageProps {
  user: any;
  accessToken: string;
}

export function DirectMessagesPage({ user, accessToken }: DirectMessagesPageProps) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/messages/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            recipientId: selectedConversation.userId,
            content: newMessage,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        loadConversations(); // Refresh conversations list
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="mb-3 text-slate-900 dark:text-white">{t('messages.title') || 'Messages'}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t('messages.search') || 'Search conversations...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-8rem)]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p>{t('messages.noConversations') || 'No conversations yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    selectedConversation?.userId === conversation.userId
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : ''
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.userAvatar} />
                    <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-900 dark:text-white truncate">
                        {conversation.userName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-white dark:bg-slate-900`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.userAvatar} />
                  <AvatarFallback>{selectedConversation.userName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-slate-900 dark:text-white">{selectedConversation.userName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  <p>{t('messages.noMessages') || 'No messages yet. Start the conversation!'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSent = message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isSent
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSent ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t('messages.typeMessage') || 'Type a message...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-slate-900 dark:text-white">{t('messages.selectConversation') || 'Select a conversation'}</h3>
              <p>{t('messages.selectConversationDesc') || 'Choose a conversation to start messaging'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
