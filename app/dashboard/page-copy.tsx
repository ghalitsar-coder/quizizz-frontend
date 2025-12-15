'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, PlayCircle, BookOpen, Calendar, Trash2 } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import type { Quiz } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { socket } = useSocket();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/quizzes');
      // const data = await response.json();
      
      // Mock data for now
      const mockQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'Matematika Kelas 5 - Pecahan',
          questions: [],
          createdAt: new Date('2024-12-01'),
          userId: 'user1'
        },
        {
          id: '2',
          title: 'IPA - Sistem Tata Surya',
          questions: [],
          createdAt: new Date('2024-12-10'),
          userId: 'user1'
        }
      ];
      
      setQuizzes(mockQuizzes);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Gagal memuat data quiz');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch quizzes from API
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRoom = async (quizId: string) => {
    if (!socket) {
      toast.error('Tidak terhubung ke server');
      return;
    }

    // Emit create_room event
    socket.emit('create_room', {
      quizId,
      userId: 'user1' // TODO: Replace with actual user ID from auth
    });

    // Listen for room_created response
    socket.once('room_created', (data: { roomCode: string; quizTitle?: string; questionCount?: number }) => {
      console.log('Room created:', data);
      toast.success(`Room berhasil dibuat! Kode: ${data.roomCode}`);
      router.push(`/host/${data.roomCode}`);
    });
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus quiz ini?')) {
      return;
    }

    try {
      // TODO: API call to delete quiz
      console.log('Deleting quiz:', quizId);
      toast.success('Quiz berhasil dihapus');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Gagal menghapus quiz');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Guru</h1>
              <p className="text-muted-foreground mt-1">Kelola quiz dan mulai sesi permainan</p>
            </div>
            <Button onClick={() => router.push('/dashboard/create')} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Buat Quiz Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {quizzes.length === 0 ? (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Belum ada quiz</h2>
              <p className="text-muted-foreground">
                Mulai dengan membuat quiz pertama Anda
              </p>
              <Button onClick={() => router.push('/dashboard/create')} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Buat Quiz Baru
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(quiz.createdAt).toLocaleDateString('id-ID')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    {quiz.questions?.length || 0} Soal
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleCreateRoom(quiz.id)} 
                      className="flex-1"
                      variant="default"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Host Game
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
