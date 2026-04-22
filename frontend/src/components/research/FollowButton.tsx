// Follow Button Component
// Allows users to follow/unfollow paths for dashboard updates

import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';
import { PathRole } from '@/types/research';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  role: PathRole;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function FollowButton({ role, className, variant = 'outline' }: FollowButtonProps) {
  const { isFollowing, followPath, unfollowPath } = useUserPreferences();
  const following = isFollowing(role);

  const handleClick = () => {
    if (following) {
      unfollowPath(role);
    } else {
      followPath(role);
    }
  };

  return (
    <Button
      variant={following ? 'default' : variant}
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      {following ? (
        <>
          <Check className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Follow Updates
        </>
      )}
    </Button>
  );
}
