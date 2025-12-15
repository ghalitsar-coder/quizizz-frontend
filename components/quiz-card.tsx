"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Users,
  Clock,
} from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { Quiz } from "@/types";

const gradients = [
  "from-purple-500 via-pink-500 to-red-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-green-500 via-emerald-500 to-cyan-500",
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-rose-500 via-fuchsia-500 to-violet-500",
];

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onDelete: (id: string) => void;
}

export function QuizCard({ quiz, index, onDelete }: QuizCardProps) {
  const router = useRouter();
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const gradient = gradients[index % gradients.length];

  const handleCreateRoom = async () => {
    if (!socket) {
      toast.error("Tidak terhubung ke server");
      return;
    }

    if (!user?.id) {
      toast.error("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    socket.emit("create_room", {
      quizId: quiz.id,
      userId: user.id,
    });

    socket.once(
      "room_created",
      (data: {
        roomCode: string;
        quizTitle?: string;
        questionCount?: number;
      }) => {
        toast.success(`Room berhasil dibuat! Kode: ${data.roomCode}`);
        router.push(`/host/${data.roomCode}`);
      }
    );
  };

  const handleEdit = () => {
    router.push(`/dashboard/edit/${quiz.id}`);
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus quiz ini?")) {
      onDelete(quiz.id);
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Colorful Header */}
      <div
        className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-bold text-xl line-clamp-2 drop-shadow-lg">
            {quiz.title}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="pt-4 pb-4 px-4 space-y-3">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {quiz.questions?.length || 0} Soal
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-green-500" />
            <span className="font-medium">
              {new Date(quiz.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />~
            {(quiz.questions?.length || 0) * 15}s
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Multi-player
          </Badge>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleCreateRoom}
          className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold shadow-md`}
          size="lg"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Host Game
        </Button>
      </CardContent>
    </Card>
  );
}
