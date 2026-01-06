import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceCallProps {
  channelId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ],
};

export function VoiceCall({ channelId, recipientId, recipientName, recipientAvatar }: VoiceCallProps) {
  const { currentUser } = useUser();
  const { t } = useLanguage();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Virtual state for UI mainly
  
  const supabase = getSupabaseClient();
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Supabase Realtime for Signaling
    const channel = supabase.channel(`call_signaling:${channelId}`);
    
    channel
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (!currentUser || payload.senderId === currentUser.id) return;

        try {
          if (payload.type === 'offer') {
            handleIncomingCall(payload);
          } else if (payload.type === 'answer') {
            handleAnswer(payload);
          } else if (payload.type === 'ice-candidate') {
            handleNewICECandidate(payload);
          } else if (payload.type === 'hangup') {
            endCall(false); // Don't emit hangup again
            toast.info(t('voice.callEnded'));
          }
        } catch (err) {
          console.error('Signaling error:', err);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      cleanup();
      supabase.removeChannel(channel);
    };
  }, [channelId, currentUser]);

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setStatus('idle');
    setIsMuted(false);
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(e => console.error("Auto-play failed", e));
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const sendSignal = (payload: any) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'signal',
      payload: { ...payload, senderId: currentUser?.id }
    });
  };

  const startCall = async () => {
    try {
      setStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({ type: 'offer', sdp: offer });
      
      // Timeout if no answer
      setTimeout(() => {
        if (status === 'calling') {
          endCall();
          toast.info(t('voice.noAnswer'));
        }
      }, 30000);

    } catch (err) {
      console.error('Error starting call:', err);
      toast.error(t('voice.micPermissionError'));
      setStatus('idle');
    }
  };

  const handleIncomingCall = async (payload: any) => {
    if (status !== 'idle') return; // Busy
    setStatus('incoming');
    // Store offer temporarily? We just use the signaling state since we process on accept.
    // Ideally we store the offer sdp to setRemoteDescription later, 
    // but simplified flow: we just wait for user to click Accept, then we process.
    // Actually, for WebRTC we need to handle it properly.
    // Let's attach the offer to a temporary ref or process it immediately if we were auto-answering (which we aren't).
    
    // We'll store the SDP in a property on the component instance (ref) to use when answered
    (window as any).pendingOffer = payload.sdp;
  };

  const acceptCall = async () => {
    try {
      const pendingOffer = (window as any).pendingOffer;
      if (!pendingOffer) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSignal({ type: 'answer', sdp: answer });
      setStatus('connected');
      
      delete (window as any).pendingOffer;
    } catch (err) {
      console.error('Error accepting call:', err);
      toast.error(t('voice.connectionError'));
      endCall();
    }
  };

  const handleAnswer = async (payload: any) => {
    if (!peerConnection.current) return;
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      setStatus('connected');
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  const handleNewICECandidate = async (payload: any) => {
    if (!peerConnection.current) return;
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  };

  const endCall = (emit = true) => {
    if (emit) {
      sendSignal({ type: 'hangup' });
    }
    cleanup();
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Render Logic
  return (
    <>
      <audio ref={remoteAudioRef} autoPlay />
      
      {/* Call Button (When Idle) */}
      {status === 'idle' && (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={startCall}
          className="bg-green-500/10 text-green-400 hover:bg-green-500/20 gap-2 border border-green-500/20"
        >
          <Phone className="w-4 h-4" />
          {t('voice.call')}
        </Button>
      )}

      {/* Incoming Call Modal */}
      <AnimatePresence>
        {status === 'incoming' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-4 md:right-8 z-50 bg-slate-900 border border-purple-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <Avatar className="w-12 h-12 border-2 border-purple-500 animate-pulse">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-bold text-white">{recipientName}</p>
              <p className="text-xs text-purple-300">{t('voice.incoming')}</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" className="bg-green-500 hover:bg-green-600 rounded-full" onClick={acceptCall}>
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="destructive" className="rounded-full" onClick={() => endCall()}>
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call UI (Overlay or Embedded) */}
      {(status === 'calling' || status === 'connected') && (
        <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-full border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {status === 'calling' && <span className="text-xs text-slate-400 px-2 animate-pulse">{t('voice.calling')}</span>}
          
          {status === 'connected' && (
             <span className="flex items-center gap-2 px-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-xs text-green-400">{t('voice.connected')}</span>
             </span>
          )}

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 rounded-full ${isMuted ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-white'}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => endCall()}
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
}
