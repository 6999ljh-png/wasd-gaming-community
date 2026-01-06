import { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getSupabaseClient } from '../utils/supabase/client';
import { motion } from 'motion/react';

interface MatchChatProps {
  matchId: string;
  opponent: any;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export function MatchChat({ matchId, opponent }: MatchChatProps) {
  const { currentUser } = useUser();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Subscribe to chat channel
    const channel = supabase.channel(`match_chat:${matchId}`);

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    scrollToBottom();

    // Broadcast
    const channel = supabase.channel(`match_chat:${matchId}`);
    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });
  };

  return (
    <div className="flex flex-col h-[400px] w-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{t('chat.title')}</span>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8">
              {t('chat.startMessage')}
            </div>
          )}
          
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="w-8 h-8 border border-slate-700">
                  <AvatarImage src={isMe ? currentUser?.avatar : opponent?.avatar} />
                  <AvatarFallback>{isMe ? currentUser?.name?.[0] : opponent?.name?.[0]}</AvatarFallback>
                </Avatar>
                
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('chat.placeholder')}
          className="bg-slate-950/50 border-slate-800 focus-visible:ring-purple-500/50"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!newMessage.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
