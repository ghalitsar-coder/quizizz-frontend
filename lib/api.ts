import type { Quiz } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get fetch options with credentials
function getFetchOptions(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
}

export const quizApi = {
  // Get all quizzes for current user
  async getQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${API_URL}/api/quizzes`, getFetchOptions());

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    return response.json();
  },

  // Get single quiz by ID
  async getQuiz(id: string): Promise<Quiz> {
    const response = await fetch(`${API_URL}/api/quizzes/${id}`, getFetchOptions());

    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }

    return response.json();
  },

  // Create new quiz
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    const response = await fetch(
      `${API_URL}/api/quizzes`,
      getFetchOptions({
        method: 'POST',
        body: JSON.stringify(quiz),
      })
    );

    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }

    return response.json();
  },

  // Update quiz
  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const response = await fetch(
      `${API_URL}/api/quizzes/${id}`,
      getFetchOptions({
        method: 'PUT',
        body: JSON.stringify(quiz),
      })
    );

    if (!response.ok) {
      throw new Error('Failed to update quiz');
    }

    return response.json();
  },

  // Delete quiz
  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/quizzes/${id}`,
      getFetchOptions({
        method: 'DELETE',
      })
    );

    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }
  },
};
