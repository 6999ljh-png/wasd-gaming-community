import { createContext, useContext, useState, ReactNode } from 'react';

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
