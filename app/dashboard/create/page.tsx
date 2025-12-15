"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface QuestionForm {
  qText: string;
  imageUrl: string;
  options: [string, string, string, string];
  correctAnswerIdx: number;
  duration: number;
  points: number;
}

export default function QuizCreatorPage() {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      qText: "",
      imageUrl: "",
      options: ["", "", "", ""],
      correctAnswerIdx: 0,
      duration: 15,
      points: 20,
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        qText: "",
        imageUrl: "",
        options: ["", "", "", ""],
        correctAnswerIdx: 0,
        duration: 15,
        points: 20,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("Quiz harus memiliki minimal 1 soal");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: string | number
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const validateQuiz = (): boolean => {
    if (!quizTitle.trim()) {
      toast.error("Judul quiz tidak boleh kosong");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.qText.trim()) {
        toast.error(`Soal ${i + 1}: Teks soal tidak boleh kosong`);
        return false;
      }

      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(
            `Soal ${i + 1}: Opsi ${String.fromCharCode(
              65 + j
            )} tidak boleh kosong`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateQuiz()) return;

    setIsSaving(true);

    try {
      // TODO: Replace with actual API call
      const quizData = {
        title: quizTitle,
        questions: questions.map((q, idx) => ({
          id: `q-${idx}`,
          ...q,
        })),
        userId: "user1", // TODO: Get from auth
        createdAt: new Date(),
      };

      console.log("Saving quiz:", quizData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Quiz berhasil disimpan!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Gagal menyimpan quiz");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Buat Quiz Baru</h1>
                <p className="text-sm text-muted-foreground">
                  {questions.length} Soal
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? "Menyimpan..." : "Simpan Quiz"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quiz Title */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Judul Quiz</Label>
              <Input
                id="quizTitle"
                placeholder="Contoh: Matematika Kelas 5 - Pecahan"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Soal {qIndex + 1}</CardTitle>
                  <CardDescription>
                    Isi pertanyaan dan opsi jawaban
                  </CardDescription>
                </div>
                {questions.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor={`qText-${qIndex}`}>Teks Soal</Label>
                <Textarea
                  id={`qText-${qIndex}`}
                  placeholder="Masukkan pertanyaan..."
                  value={question.qText}
                  onChange={(e) =>
                    updateQuestion(qIndex, "qText", e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* Image URL (Optional) */}
              <div className="space-y-2">
                <Label htmlFor={`imageUrl-${qIndex}`}>
                  URL Gambar (Opsional)
                </Label>
                <Input
                  id={`imageUrl-${qIndex}`}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={question.imageUrl}
                  onChange={(e) =>
                    updateQuestion(qIndex, "imageUrl", e.target.value)
                  }
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <Label>Opsi Jawaban</Label>
                <RadioGroup
                  value={question.correctAnswerIdx.toString()}
                  onValueChange={(value) =>
                    updateQuestion(qIndex, "correctAnswerIdx", parseInt(value))
                  }
                >
                  {["A", "B", "C", "D"].map((label, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={optIndex.toString()}
                        id={`q${qIndex}-opt${optIndex}`}
                      />
                      <Label
                        htmlFor={`q${qIndex}-opt${optIndex}`}
                        className="font-normal w-8"
                      >
                        {label}
                      </Label>
                      <Input
                        placeholder={`Opsi ${label}`}
                        value={question.options[optIndex]}
                        onChange={(e) =>
                          updateOption(qIndex, optIndex, e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Pilih radio button untuk menandai jawaban yang benar
                </p>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`duration-${qIndex}`}>Durasi (detik)</Label>
                  <Select
                    value={question.duration.toString()}
                    onValueChange={(value) =>
                      updateQuestion(qIndex, "duration", parseInt(value))
                    }
                  >
                    <SelectTrigger id={`duration-${qIndex}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 detik</SelectItem>
                      <SelectItem value="10">10 detik</SelectItem>
                      <SelectItem value="15">15 detik</SelectItem>
                      <SelectItem value="30">30 detik</SelectItem>
                      <SelectItem value="60">60 detik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`points-${qIndex}`}>Poin</Label>
                  <Input
                    id={`points-${qIndex}`}
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(
                        qIndex,
                        "points",
                        parseInt(e.target.value) || 20
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Question Button */}
        <Button
          onClick={addQuestion}
          variant="outline"
          className="w-full h-16 text-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tambah Soal
        </Button>
      </div>
    </div>
  );
}
