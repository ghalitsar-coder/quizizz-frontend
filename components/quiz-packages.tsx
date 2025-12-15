'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Sparkles, Package, Loader2 } from 'lucide-react';
import { QuizCard } from '@/components/quiz-card';
import { toast } from 'sonner';
import { quizApi } from '@/lib/api';

export function QuizPackages() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch quizzes using TanStack Query
  const { data: quizzes = [], isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizApi.getQuizzes,
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: quizApi.deleteQuiz,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz berhasil dihapus');
    },
    onError: (error) => {
      console.error('Error deleting quiz:', error);
      toast.error('Gagal menghapus quiz');
    },
  });

  const handleDeleteQuiz = async (quizId: string) => {
    deleteQuizMutation.mutate(quizId);
  };

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="p-8 text-center border-destructive">
          <p className="text-destructive">Error loading quizzes: {(error as Error).message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['quizzes'] })}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Quiz Packages
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </h2>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Quiz Packages
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </h2>
            <p className="text-sm text-muted-foreground">
              {quizzes.length} quiz tersedia
            </p>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/create')}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Buat Quiz Baru
        </Button>
      </div>

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-muted rounded-full">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Belum ada quiz</h3>
            <p className="text-muted-foreground max-w-md">
              Mulai dengan membuat quiz pertama Anda dan bagikan dengan siswa
            </p>
            <Button 
              onClick={() => router.push('/dashboard/create')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mt-2"
            >
              <Plus className="mr-2 h-5 w-5" />
              Buat Quiz Pertama
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={index}
              onDelete={handleDeleteQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
}
