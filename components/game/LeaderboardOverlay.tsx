import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardPlayer {
  name: string;
  score: number;
  rank: number;
}

interface LeaderboardOverlayProps {
  leaderboard: LeaderboardPlayer[];
  currentUserName: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return null;
  }
};

const getRankBgColor = (rank: number, isCurrentUser: boolean) => {
  if (isCurrentUser) return 'bg-game-blue';
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    case 2:
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    case 3:
      return 'bg-gradient-to-r from-amber-600 to-amber-700';
    default:
      return 'bg-white/10';
  }
};

export const LeaderboardOverlay: React.FC<LeaderboardOverlayProps> = ({
  leaderboard,
  currentUserName,
}) => {
  const { topPlayers, showDivider, currentUser } = useMemo(() => {
    const userIndex = leaderboard.findIndex((p) => p.name === currentUserName);
    const userRank = userIndex + 1;
    const top5 = leaderboard.slice(0, 5);

    if (userRank > 5 && userIndex !== -1) {
      return {
        topPlayers: top5,
        showDivider: true,
        currentUser: {
          ...leaderboard[userIndex],
          rank: userRank,
        },
      };
    }

    return {
      topPlayers: top5,
      showDivider: false,
      currentUser: null,
    };
  }, [leaderboard, currentUserName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in p-4">
      <div className="w-full max-w-md bg-game-card rounded-3xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {topPlayers.map((player) => {
            const isCurrentUser = player.name === currentUserName;
            return (
              <div
                key={player.rank}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  getRankBgColor(player.rank, isCurrentUser),
                  isCurrentUser && 'ring-2 ring-white scale-[1.02]'
                )}
              >
                {/* Rank */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {getRankIcon(player.rank) || (
                    <span className="text-lg font-bold text-white">
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <span
                    className={cn(
                      'text-lg font-semibold text-white',
                      isCurrentUser && 'underline'
                    )}
                  >
                    {player.name}
                    {isCurrentUser && ' (Kamu)'}
                  </span>
                </div>

                {/* Score */}
                <span className="text-xl font-bold text-white">
                  {player.score} pt
                </span>
              </div>
            );
          })}

          {/* Divider and Current User */}
          {showDivider && currentUser && (
            <>
              <div className="flex items-center justify-center py-2">
                <span className="text-white/50 text-2xl">• • •</span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl',
                  'bg-game-blue ring-2 ring-white'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {currentUser.rank}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-white underline">
                    {currentUser.name} (Kamu)
                  </span>
                </div>
                <span className="text-xl font-bold text-white">
                  {currentUser.score} pt
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
