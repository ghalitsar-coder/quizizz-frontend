import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useGame } from '@/contexts/GameContext';

interface UseGameSocketOptions {
  roomCode: string;
}

export const useGameSocket = ({ roomCode }: UseGameSocketOptions) => {
  const { socket, isConnected, emit } = useSocket();
  const {
    setGameState,
    setCurrentQuestion,
    setAnswerResult,
    setLeaderboard,
    setSelectedAnswer,
    playerName,
    setScore,
    setTotalQuestions,
  } = useGame();

  const answerStartTime = useRef<number>(0);

  // Handle incoming socket events
  useEffect(() => {
    if (!socket) return;

    // Question starts
    socket.on('question_start', (data) => {
      console.log('Question started:', data);
      setCurrentQuestion({
        qIndex: data.qIndex,
        qText: data.qText,
        imageUrl: data.imageUrl,
        options: data.options,
        duration: data.duration,
        points: data.points || 20,
      });
      setSelectedAnswer(null);
      setAnswerResult(null);
      setGameState('PLAYING');
      answerStartTime.current = Date.now();
    });

    // Answer result (private feedback)
    socket.on('answer_result', (data) => {
      console.log('Answer result:', data);
      setAnswerResult({
        isCorrect: data.isCorrect,
        scoreEarned: data.scoreEarned,
        currentTotal: data.currentTotal,
        correctAnswerIdx: data.correctAnswerIdx,
      });
      setScore(data.currentTotal);
      setGameState('FEEDBACK');
    });

    // Question ends (time up)
    socket.on('question_end', (data) => {
      console.log('Question ended:', data);
      setAnswerResult({
        isCorrect: false,
        scoreEarned: 0,
        currentTotal: 0,
        correctAnswerIdx: data.correctAnswerIdx,
      });
      setGameState('FEEDBACK');
    });

    // Leaderboard update
    socket.on('update_leaderboard', (data) => {
      console.log('Leaderboard updated:', data);
      setLeaderboard(data.leaderboard || data);
      // Show leaderboard after short delay
      setTimeout(() => {
        setGameState('LEADERBOARD');
      }, 2000);
    });

    // Game over
    socket.on('final_results', (data) => {
      console.log('Game over:', data);
      setLeaderboard(data.top3 || []);
      setGameState('RESULT');
    });

    // Error handling
    socket.on('error_message', (data) => {
      console.error('Socket error:', data.msg);
    });

    return () => {
      socket.off('question_start');
      socket.off('answer_result');
      socket.off('question_end');
      socket.off('update_leaderboard');
      socket.off('final_results');
      socket.off('error_message');
    };
  }, [
    socket,
    setGameState,
    setCurrentQuestion,
    setAnswerResult,
    setLeaderboard,
    setSelectedAnswer,
    setScore,
    setTotalQuestions,
  ]);

  // Submit answer
  const submitAnswer = useCallback(
    (answerIdx: number) => {
      const timeElapsed = (Date.now() - answerStartTime.current) / 1000;
      emit('submit_answer', {
        roomCode,
        answerIdx,
        timeElapsed,
        clientTimestamp: Date.now(),
      });
    },
    [emit, roomCode]
  );

  // Rejoin room on reconnect
  useEffect(() => {
    if (isConnected && roomCode && playerName) {
      emit('rejoin_room', { roomCode, nickname: playerName });
    }
  }, [isConnected, roomCode, playerName, emit]);

  return {
    submitAnswer,
    isConnected,
  };
};
