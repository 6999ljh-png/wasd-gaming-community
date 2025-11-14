import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { PersonalPage } from './components/PersonalPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { ForumPage } from './components/ForumPage';
import { FriendsPage } from './components/FriendsPage';
import { UserProfilePage } from './components/UserProfilePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';

export type TabType = 'home' | 'personal' | 'leaderboard' | 'forum' | 'friends' | 'userProfile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [forumRefreshTrigger, setForumRefreshTrigger] = useState(0);

  const handleViewUserProfile = (userId: string) => {
    setViewingUserId(userId);
    setActiveTab('userProfile');
  };

  const handleBackFromProfile = () => {
    setViewingUserId(null);
    setActiveTab('home');
  };

  const handlePostCreated = () => {
    // 切换到论坛页面并刷新
    setActiveTab('forum');
    setForumRefreshTrigger(prev => prev + 1);
  };

  const handleViewPost = (postId: string) => {
    // Navigate to forum page to view the post
    // Note: For external posts, the HomePage will handle opening in new tab
    setActiveTab('forum');
    setForumRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors relative overflow-hidden">
            {/* Animated background gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>
            
            <Navigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              onPostCreated={handlePostCreated}
            />
            
            <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
              {activeTab === 'home' && <HomePage onViewProfile={handleViewUserProfile} onViewPost={handleViewPost} />}
              {activeTab === 'personal' && <PersonalPage />}
              {activeTab === 'leaderboard' && <LeaderboardPage onViewProfile={handleViewUserProfile} />}
              {activeTab === 'forum' && <ForumPage onViewProfile={handleViewUserProfile} key={forumRefreshTrigger} />}
              {activeTab === 'friends' && <FriendsPage />}
              {activeTab === 'userProfile' && viewingUserId && (
                <UserProfilePage userId={viewingUserId} onBack={handleBackFromProfile} />
              )}
            </main>
          </div>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}