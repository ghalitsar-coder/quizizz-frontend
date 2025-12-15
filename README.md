# Quizizz Clone - Frontend

Frontend aplikasi Quizizz Clone yang dibangun dengan Next.js, TypeScript, dan Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Real-time:** Socket.io Client
- **State Management:** React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm atau yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` dan sesuaikan dengan konfigurasi backend Anda:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Struktur Folder

```
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard guru
│   │   ├── create/         # Halaman buat quiz
│   │   └── page.tsx        # List quiz
│   ├── host/               # Host room untuk guru
│   │   └── [roomCode]/     # Dynamic route room
│   ├── play/               # Game untuk siswa
│   │   └── [roomCode]/     # Dynamic route room
│   │       ├── live/       # Game arena
│   │       └── page.tsx    # Lobby
│   ├── login/              # Login guru
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   └── ui/                 # shadcn/ui components
├── contexts/               # React Context
│   ├── GameContext.tsx    # Game state management
│   └── SocketContext.tsx  # Socket.io connection
├── types/                  # TypeScript types
│   └── index.ts
└── public/                # Static assets
```

## Fitur Utama

### Untuk Siswa
- ✅ Join game dengan kode room
- ✅ Input nickname
- ✅ Waiting room
- ✅ Game arena dengan timer
- ✅ Answer feedback (benar/salah)
- ✅ Leaderboard real-time

### Untuk Guru
- ✅ Login/Authentication
- ✅ Dashboard quiz management
- ✅ Quiz creator dengan multiple questions
- ✅ Host game room
- ✅ Lobby monitoring (live player join)
- ✅ Game control (start, next, end)
- ✅ Live answer statistics
- ✅ Real-time leaderboard

## Socket Events

Frontend mendengarkan event berikut dari backend:

### Student Events
- `player_joined_success` - Konfirmasi join room
- `game_started` - Game dimulai
- `question_start` - Soal baru dimulai
- `answer_result` - Result jawaban siswa
- `question_end` - Waktu habis
- `update_leaderboard` - Update klasemen
- `game_over` - Game selesai

### Teacher Events  
- `room_created` - Room berhasil dibuat
- `player_joined` - Notifikasi siswa join
- `live_stats` - Statistik jawaban real-time
- `final_results` - Hasil akhir game

Frontend mengirim event:
- `join_room` - Siswa join
- `submit_answer` - Kirim jawaban
- `create_room` - Buat room (guru)
- `start_game` - Mulai game (guru)
- `next_question` - Soal berikutnya (guru)
- `game_over` - Akhiri game (guru)

## Environment Variables

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Deployment

1. Build aplikasi:
```bash
npm run build
```

2. Deploy ke platform pilihan Anda (Vercel, Netlify, dll)

3. Set environment variables di platform deployment

## Notes

- Pastikan backend Socket.io sudah running sebelum menjalankan frontend
- Default port frontend: 3000
- Default port backend: 3001
- CORS sudah dikonfigurasi di backend untuk menerima request dari frontend

## Future Enhancements

- [ ] Implementasi authentication yang lebih robust
- [ ] Upload gambar ke cloud storage
- [ ] Audio feedback untuk jawaban
- [ ] Animasi yang lebih smooth
- [ ] PWA support
- [ ] Multi-language support
- [ ] Admin panel
- [ ] Quiz analytics

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

Open Source - MIT License
