'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, PlayCircle, SkipForward, StopCircle, Trophy, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import type { QuestionStartPayload, AnswerStats, LeaderboardEntry } from '@/types';

export default function HostRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  const roomCode = params.roomCode as string;
  const [gameStatus, setGameStatus] = useState<'LOBBY' | 'PLAYING' | 'ENDED'>('LOBBY');
  const [players, setPlayers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStartPayload | null>(null);
  const [answerStats, setAnswerStats] = useState<AnswerStats>({ a: 0, b: 0, c: 0, d: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for player joined
    socket.on('player_joined', (data: { name: string; totalPlayers: number; players?: string[] }) => {
      console.log('Player joined:', data);
      if (data.players) {
        setPlayers(data.players);
      } else {
        setPlayers(prev => [...prev, data.name]);
      }
      toast.success(`${data.name} bergabung! Total: ${data.totalPlayers}`);
    });

    // Listen for question_start (when host starts game)
    socket.on('question_start', (data: QuestionStartPayload) => {
      console.log('Question started:', data);
      setCurrentQuestion(data);
      setGameStatus('PLAYING');
      setAnswerStats({ a: 0, b: 0, c: 0, d: 0 });
    });

    // Listen for live stats
    socket.on('live_stats', (data: AnswerStats) => {
      console.log('Live stats:', data);
      setAnswerStats(data);
    });

    // Listen for leaderboard updates
    socket.on('update_leaderboard', (data: { leaderboard: LeaderboardEntry[] }) => {
      console.log('Leaderboard updated:', data);
      setLeaderboard(data.leaderboard);
    });

    // Listen for game over
    socket.on('final_results', (data: { winner: string; top3: LeaderboardEntry[] }) => {
      console.log('Game ended:', data);
      toast.success(`Game selesai! Pemenang: ${data.winner}`);
      setGameStatus('ENDED');
    });

    return () => {
      socket.off('player_joined');
      socket.off('question_start');
      socket.off('live_stats');
      socket.off('update_leaderboard');
      socket.off('final_results');
    };
  }, [socket, isConnected]);

  const handleStartGame = () => {
    if (!socket) {
      toast.error('Tidak terhubung ke server');
      return;
    }

    if (players.length === 0) {
      toast.error('Belum ada pemain yang bergabung');
      return;
    }

    socket.emit('start_game', { roomCode });
    toast.success('Game dimulai!');
  };

  const handleNextQuestion = () => {
    if (!socket) return;
    
    socket.emit('next_question', { roomCode });
  };

  const handleEndGame = () => {
    if (!confirm('Apakah Anda yakin ingin mengakhiri game?')) {
      return;
    }

    if (!socket) return;

    socket.emit('game_over', { roomCode });
    toast.success('Game diakhiri');
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const maxStats = Math.max(answerStats.a, answerStats.b, answerStats.c, answerStats.d, 1);

  // Render Lobby View
  if (gameStatus === 'LOBBY') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold">Room Lobby</CardTitle>
              <CardDescription className="text-2xl font-bold mt-2">
                Kode Room: <span className="text-primary">{roomCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-6 w-6" />
                <span className="text-2xl font-bold">{players.length} Pemain</span>
              </div>
              <Button 
                onClick={handleStartGame} 
                size="lg" 
                className="text-xl px-8 py-6"
                disabled={players.length === 0}
              >
                <PlayCircle className="mr-2 h-6 w-6" />
                Start Game
              </Button>
            </CardContent>
          </Card>

          {/* Players Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Pemain yang Bergabung</CardTitle>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Belum ada pemain...</p>
                  <p className="text-sm">Minta siswa memasukkan kode: <strong>{roomCode}</strong></p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {players.map((player, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-4 rounded-lg text-center font-semibold"
                    >
                      {player}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Game Control View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto py-4">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Room Code</CardDescription>
              <CardTitle className="text-2xl">{roomCode}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pemain</CardDescription>
              <CardTitle className="text-2xl">{players.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Soal</CardDescription>
              <CardTitle className="text-2xl">
                {currentQuestion ? `${currentQuestion.qIndex}` : '-'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Soal Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">{currentQuestion.qText}</h3>
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium"
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live Answer Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Live Answer Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['a', 'b', 'c', 'd'] as const).map((key, idx) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Opsi {String.fromCharCode(65 + idx)}</span>
                    <span className="font-bold">{answerStats[key]}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        idx === 0 ? 'bg-red-500' :
                        idx === 1 ? 'bg-blue-500' :
                        idx === 2 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(answerStats[key] / maxStats) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-right">Skor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.slice(0, 10).map((player, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant={idx === 0 ? 'default' : 'outline'}>
                          {idx + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell className="text-right font-bold">{player.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 justify-center">
              <Button onClick={handleNextQuestion} size="lg">
                <SkipForward className="mr-2 h-5 w-5" />
                Next Question
              </Button>
              <Button onClick={handleEndGame} variant="destructive" size="lg">
                <StopCircle className="mr-2 h-5 w-5" />
                End Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
