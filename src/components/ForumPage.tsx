import { DiscussionBoard } from './DiscussionBoard';

interface ForumPageProps {
  onViewProfile: (userId: string) => void;
}

export function ForumPage({ onViewProfile }: ForumPageProps) {
  return <DiscussionBoard onViewProfile={onViewProfile} />;
}