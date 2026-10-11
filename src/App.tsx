import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { ExploreView } from './components/ExploreView';
import { ReelsViewer } from './components/ReelsViewer';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { CommunitiesView } from './components/CommunitiesView';
import { DirectMessages } from './components/DirectMessages';
import { NotificationsView } from './components/NotificationsView';
import { MembershipModal } from './components/MembershipModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { UploadReelModal } from './components/UploadReelModal';
import { AuthModal } from './components/AuthModal';
import { Story, User } from './types';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('feed');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectUser, setInspectUser] = useState<User | null>(null);

  // Modals
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isUploadReelOpen, setIsUploadReelOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      setInspectUser(null); // views own profile
    }
  };

  const handleSelectUser = (targetUser: User) => {
    setInspectUser(targetUser);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] flex flex-col font-sans selection:bg-[#7928ca] selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={() => setActiveTab('explore')}
        onOpenMessages={() => setActiveTab('messages')}
        onOpenNotifications={() => setActiveTab('notifications')}
        onOpenMembership={() => setIsMembershipOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveTab('feed');
          }}
          onOpenMembership={() => setIsMembershipOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto">
          {activeTab === 'feed' && (
            <Feed
              selectedCategory={selectedCategory}
              onSelectStory={(story) => setSelectedStory(story)}
              onOpenCreateStory={() => setIsCreateStoryOpen(true)}
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              onSelectUser={handleSelectUser}
              onSelectTag={(tag) => {
                setSelectedCategory('All');
                setActiveTab('feed');
              }}
            />
          )}

          {activeTab === 'reels' && (
            <ReelsViewer onOpenUpload={() => setIsUploadReelOpen(true)} />
          )}

          {activeTab === 'communities' && <CommunitiesView />}

          {activeTab === 'messages' && <DirectMessages />}

          {activeTab === 'notifications' && <NotificationsView />}

          {activeTab === 'profile' && (
            <ProfileView
              targetUser={inspectUser}
              onOpenMembership={() => setIsMembershipOpen(true)}
            />
          )}

          {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenCreate={() => {
          setActiveTab('feed');
          // Focus composer or open story
          setIsCreateStoryOpen(true);
        }}
      />

      {/* Modals */}
      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
      />

      <StoryViewerModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onCreated={() => {
          // Feed will reload stories on next render
        }}
      />

      <UploadReelModal
        isOpen={isUploadReelOpen}
        onClose={() => setIsUploadReelOpen(false)}
        onUploaded={() => {
          setActiveTab('reels');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
