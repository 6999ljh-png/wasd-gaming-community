import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  experience: number;
  stats: {
    gamesCount: number;
    postsCount: number;
    commentsCount: number;
    likesReceived: number;
  };
  accessToken?: string;
}

interface UserContextType {
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Check for OAuth callback in URL hash
    const checkAuthCallback = async () => {
      try {
        // Get session from Supabase (this handles the OAuth callback automatically)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsCheckingAuth(false);
          return;
        }

        if (session?.access_token) {
          // Fetch user data from backend
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/user`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setCurrentUser({ 
              ...userData.user, 
              accessToken: session.access_token 
            });
            
            // Clean up URL hash after successful login
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          } else {
            console.error('Failed to fetch user data');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthCallback();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/user`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({ 
            ...userData.user, 
            accessToken: session.access_token 
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}