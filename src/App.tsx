import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { PersonalPage } from './components/PersonalPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { ForumPage } from './components/ForumPage';
import { FriendsPage } from './components/FriendsPage';
import { UserProfilePage } from './components/UserProfilePage';
import { BookmarksPage } from './components/BookmarksPage';
import { MatchmakingPage } from './components/MatchmakingPage';
import { FriendsSidebar } from './components/FriendsSidebar';
import { InstallPWA } from './components/InstallPWA';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';
import { AddFriendDialog } from './components/AddFriendDialog';
import { registerServiceWorker, trackAppInstall } from './utils/registerServiceWorker';

export type TabType = 'home' | 'personal' | 'leaderboard' | 'forum' | 'friends' | 'bookmarks' | 'userProfile' | 'matchmaking';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [forumRefreshTrigger, setForumRefreshTrigger] = useState(0);
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);

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

  useEffect(() => {
    registerServiceWorker();
    trackAppInstall();
  }, []);

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
            
            <main className="relative z-10">
              {/* Two column layout for home page */}
              {activeTab === 'home' && (
                <>
                  <div className="container mx-auto px-4 py-8 max-w-7xl lg:mr-[340px]">
                    <HomePage onViewProfile={handleViewUserProfile} onViewPost={handleViewPost} />
                  </div>
                  {/* Fixed right sidebar */}
                  <div className="hidden lg:block fixed top-20 right-0 w-[320px] h-[calc(100vh-5rem)] overflow-auto p-4">
                    <FriendsSidebar 
                      onViewProfile={handleViewUserProfile} 
                      onAddFriend={() => setIsAddFriendDialogOpen(true)}
                    />
                  </div>
                </>
              )}
              
              {activeTab !== 'home' && (
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                  {activeTab === 'personal' && <PersonalPage />}
                  {activeTab === 'leaderboard' && <LeaderboardPage onViewProfile={handleViewUserProfile} />}
                  {activeTab === 'forum' && <ForumPage onViewProfile={handleViewUserProfile} key={forumRefreshTrigger} />}
                  {activeTab === 'friends' && <FriendsPage />}
                  {activeTab === 'bookmarks' && <BookmarksPage onViewProfile={handleViewUserProfile} />}
                  {activeTab === 'matchmaking' && <MatchmakingPage />}
                  {activeTab === 'userProfile' && viewingUserId && (
                    <UserProfilePage userId={viewingUserId} onBack={handleBackFromProfile} />
                  )}
                </div>
              )}
            </main>

            {/* Add Friend Dialog */}
            <AddFriendDialog 
              open={isAddFriendDialogOpen}
              onOpenChange={setIsAddFriendDialogOpen}
            />

            {/* Install PWA */}
            <InstallPWA />
          </div>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}