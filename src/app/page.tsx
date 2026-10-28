'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Play,
  RotateCcw,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  Video,
  X,
  Zap,
} from 'lucide-react';
import questionnaireSeed from '@/config/questionnaire.seed.json';

type AppTab = 'KUESIONER' | 'VIDEO' | 'CHATBOT' | 'MODUL';

/**
 * Logo TepatTes — Adaptif | Aman | Mandiri
 */
function TepatTesLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="TepatTes"
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: Math.max(6, Math.round(size * 0.22)),
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  );
}

// Alias kompatibilitas
const SenyapMark = TepatTesLogo;

// Data Video Edukasi (Slot yang disiapkan - video masih tahap pembuatan)
interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  status: string;
}

const educationalVideos: VideoItem[] = [
  {
    id: 'VID-01',
    title: 'Pengenalan Aplikasi & Panduan Mandiri',
    category: 'Dasar & Navigasi',
    duration: '03:15',
    description:
      'Memahami tujuan aplikasi, cara mengakses kuesioner, modul materi, serta menjaga privasi penuh selama belajar.',
    status: 'Tahap Pembuatan',
  },
  {
    id: 'VID-02',
    title: 'Mengenal HIV, Mitos vs Fakta & Pencegahan',
    category: 'Kesehatan Reproduksi',
    duration: '04:00',
    description:
      'Penjelasan ilmiah mengenai virus HIV, cara penularan yang sebenarnya, mitos yang keliru, dan pentingnya skrining dini.',
    status: 'Tahap Pembuatan',
  },
  {
    id: 'VID-03',
    title: 'Tutorial Penggunaan Alat Skrining Mandiri (OraQuick®)',
    category: 'Panduan Praktis',
    duration: '03:45',
    description:
      'Langkah-langkah persiapan, teknik usap mukosa gusi tanpa jarum, waktu tunggu 20–40 menit, dan cara membaca garis hasil.',
    status: 'Tahap Pembuatan',
  },
  {
    id: 'VID-04',
    title: 'Memahami Hasil Tes, Masa Jendela & Layanan Rujukan',
    category: 'Interpretasi & Rujukan',
    duration: '03:30',
    description:
      'Arti hasil Nonreaktif, Reaktif, atau Invalid, penjelasan masa jendela 12 minggu, serta akses pendampingan konseling ramah remaja.',
    status: 'Tahap Pembuatan',
  },
];

// Data Modul Materi
interface ModuleItem {
  id: string;
  code: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  sections: Array<{ heading: string; body: string }>;
  keyTakeaways: string[];
}

const modulesData: ModuleItem[] = [
  {
    id: 'MOD-01',
    code: 'Modul 1',
    title: 'Dasar HIV, IMS & Pencegahan Komprehensif',
    category: 'Kesehatan Dasar',
    readTime: '5 menit baca',
    summary:
      'Membedakan HIV dan AIDS, memahami cara penularan berbasis bukti ilmiah, membantah mitos stigma, dan prinsip hidup sehat.',
    sections: [
      {
        heading: '1. Apa Itu HIV & AIDS?',
        body: 'HIV (Human Immunodeficiency Virus) adalah virus yang menyerang sistem pertahanan tubuh manusia, khususnya sel darah putih CD4. Tanpa pengobatan, HIV dapat berkembang menjadi AIDS (Acquired Immunodeficiency Syndrome). Namun dengan terapi Antiretroviral (ARV) yang teratur, jumlah virus dapat ditekan hingga tidak terdeteksi, sehingga penderita tetap dapat hidup produktif, sehat, dan tidak menularkan virus (konsep U=U: Undetectable = Untransmittable).',
      },
      {
        heading: '2. Cara Penularan vs Mitos yang Keliru',
        body: 'HIV HANYA menular melalui darah, cairan seksual (sperma, cairan vagina), dan ASI dari orang yang terinfeksi ke dalam aliran darah orang lain. HIV TIDAK menular melalui bersalaman, berpelukan, alat makan bersama, kolam renang, dudukan toilet, gigitan nyamuk, atau berbicara bersama.',
      },
      {
        heading: '3. Langkah Pencegahan Mandiri',
        body: 'Menghindari perilaku berisiko seperti hubungan seksual tanpa pengaman dan penggunaan jarum suntik bersama secara tidak steril. Meningkatkan literasi kesehatan reproduksi dan melakukan skrining rutin merupakan langkah bijak melindungi diri dan orang tercinta.',
      },
    ],
    keyTakeaways: [
      'HIV menyerang sel CD4, namun dapat dikontrol dengan terapi ARV.',
      'HIV tidak menular lewat pergaulan sehari-hari, alat makan, atau gigitan serangga.',
      'Deteksi dini memberikan kesempatan penanganan medis terbaik.',
    ],
  },
  {
    id: 'MOD-02',
    code: 'Modul 2',
    title: 'Panduan Skrining Mandiri Kit OraQuick®',
    category: 'Panduan Praktis',
    readTime: '6 menit baca',
    summary:
      'Metode skrining oral tanpa jarum suntik, persiapan puasa makan/minum, teknik usap gusi atas & bawah, dan aturan waktu baca.',
    sections: [
      {
        heading: '1. Mengapa Mengusap Gusi?',
        body: 'Kit OraQuick® HIV Self-Test mendeteksi antibodi terhadap HIV yang keluar pada cairan mukosa transudat gusi (oral fluid). Metode ini sangat nyaman karena tidak memerlukan suntikan jarum darah.',
      },
      {
        heading: '2. Persiapan Sebelum Melakukan Tes',
        body: 'Pastikan Anda tidak makan, minum, merokok, mengunyah permen karet, sikat gigi, atau memakai obat kumur selama minimal 15–30 menit sebelum tes dilakukan. Simpan alat pada suhu ruang (2–30°C) dan periksa tanggal kedaluwarsa.',
      },
      {
        heading: '3. Langkah Penggunaan 4 Tahap',
        body: '1) Buka tabung developer vial dan letakkan tegak pada dudukan. 2) Pegang alat tes pada pegangannya (jangan sentuh bantalan pipih). 3) Usap bantalan pipih 1 kali sepanjang gusi atas luar dan 1 kali sepanjang gusi bawah luar. 4) Masukkan alat ke tabung cairan dan tunggu 20–40 menit.',
      },
    ],
    keyTakeaways: [
      'Puasa makan dan minum 15–30 menit sebelum tes sangat krusial.',
      'Hanya perlu satu usapan lembut pada gusi atas dan gusi bawah.',
      'Waktu baca yang valid adalah tepat antara menit ke-20 hingga ke-40.',
    ],
  },
  {
    id: 'MOD-03',
    code: 'Modul 3',
    title: 'Interpretasi Garis Hasil & Masa Jendela (Window Period)',
    category: 'Interpretasi Hasil',
    readTime: '5 menit baca',
    summary:
      'Cara akurat membedakan hasil Nonreaktif, Reaktif, atau Invalid, serta memahami makna masa jendela 12 minggu.',
    sections: [
      {
        heading: '1. Cara Membaca Garis Kontrol (C) dan Garis Tes (T)',
        body: '• Nonreaktif (Negatif): Muncul 1 garis merah muda kemerahan pada huruf C, dan TIDAK ADA garis pada huruf T. \n• Reaktif (Skrining Positif Awal): Muncul 2 garis, yaitu satu garis pada huruf C dan satu garis pada huruf T (meskipun garis T terlihat sangat samar). \n• Invalid (Tidak Sah): Tidak muncul garis pada huruf C sama sekali. Tes harus diulang menggunakan kit baru.',
      },
      {
        heading: '2. Memahami Masa Jendela (Window Period)',
        body: 'Masa jendela adalah jarak waktu antara saat kemungkinan terpapar virus hingga tubuh memproduksi antibodi yang cukup untuk dideteksi oleh alat tes. Untuk tes cairan oral, masa jendela dapat mencapai hingga 12 minggu (3 bulan). Jika hasil Anda Nonreaktif namun terdapat risiko dalam 12 minggu terakhir, ulangi tes setelah genap 12 minggu.',
      },
      {
        heading: '3. Tindak Lanjut Hasil Reaktif',
        body: 'Hasil reaktif pada skrining mandiri adalah tes awal (triase) dan BUKAN vonis akhir. Anda disarankan melakukan tes konfirmasi di fasilitas kesehatan (Puskesmas/Rumah Sakit) dengan pendampingan konselor ramah remaja.',
      },
    ],
    keyTakeaways: [
      '1 Garis di C = Nonreaktif (Negatif).',
      '2 Garis (C dan T) = Reaktif (perlu tes konfirmasi fasyankes).',
      'Tanpa garis di C = Invalid (tes tidak sah, harus diulang).',
      'Perhatikan masa jendela 12 minggu sebelum menyimpulkan hasil negatif permanen.',
    ],
  },
  {
    id: 'MOD-04',
    code: 'Modul 4',
    title: 'Privasi, Kerahasiaan & Layanan Dukungan Ramah Remaja',
    category: 'Privasi & Rujukan',
    readTime: '4 menit baca',
    summary:
      'Hak atas kerahasiaan medis, layanan konseling PKPR di Puskesmas, dan cara mendapatkan pendampingan tanpa rasa takut.',
    sections: [
      {
        heading: '1. Hak Kerahasiaan Anda',
        body: 'Kesehatan adalah hak mendasar setiap individu. Berdasarkan undang-undang perlindungan data pribadi dan pedoman kesehatan reproduksi, seluruh riwayat konsultasi dan skrining Anda bersifat rahasia dan terlindungi.',
      },
      {
        heading: '2. Apa Itu Layanan PKPR?',
        body: 'Pelayanan Kesehatan Peduli Remaja (PKPR) adalah program khusus di Puskesmas yang menyediakan ruang konseling privat, bebas stigma, dan didampingi tenaga medis yang ramah terhadap remaja. Anda dapat berkonsultasi mengenai keluhan fisik, kesehatan reproduksi, maupun kecemasan psikologis.',
      },
      {
        heading: '3. Menghadapi Kecemasan',
        body: 'Merasa cemas adalah hal yang wajar. Mengambil langkah untuk mencari tahu status kesehatan Anda adalah bukti keberanian dan tanggung jawab terhadap masa depan Anda sendiri.',
      },
    ],
    keyTakeaways: [
      'Setiap remaja berhak mendapatkan layanan kesehatan tanpa diskriminasi.',
      'PKPR di Puskesmas memberikan ruang aman dan rahasia untuk berkonsultasi.',
      'Anda tidak sendiri, selalu ada pendamping profesional yang siap membantu.',
    ],
  },
];

// Tipe & Definisi Konstruk Kuesioner Penelitian Resmi (Azzam, 2026)
type ConstructCode = 'PT' | 'SE' | 'INT' | 'HS';

interface QuestionnaireItemMeta {
  code: string;
  dimension: string;
  text: string;
  constructCode: ConstructCode;
  constructName: string;
  scaleType: string;
  scaleLabels: Record<string, string>;
  shortLabels: Record<string, string>;
}

// Flat list seluruh butir instrumen (30 butir)
const allOfficialQuestions: QuestionnaireItemMeta[] = questionnaireSeed.constructs.flatMap(
  (c) =>
    c.items.map((it) => ({
      ...it,
      constructCode: c.code as ConstructCode,
      constructName: c.name,
      scaleType: c.scaleType,
      scaleLabels: c.scaleLabels as Record<string, string>,
      shortLabels: c.shortLabels as Record<string, string>,
    }))
);

const generateRandomUsername = () => {
  const prefixes = [
    'Sahabat',
    'Anonim',
    'Remaja',
    'Kawan',
    'Bintang',
    'Senyap',
    'Lentera',
    'Cahaya',
    'Mentari',
    'Pelindung',
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

export default function SenyapWebApp() {
  // Autentikasi User
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');
  const [randomUsername, setRandomUsername] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<'INTERVENTION' | 'CONTROL'>('INTERVENTION');
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    token: string;
    groupAllocation: 'INTERVENTION' | 'CONTROL';
    clusterCode: string;
  }>({
    name: 'Pengguna',
    token: 'ID-REMAJA-001',
    groupAllocation: 'INTERVENTION',
    clusterCode: 'CLUSTER-INT-01',
  });

  // Buat username acak awal saat halaman dimuat
  useEffect(() => {
    if (!randomUsername) {
      const generated = generateRandomUsername();
      setRandomUsername(generated);
      setLoginUsername(generated);
    }
  }, [randomUsername]);

  // Handler Acak Ulang Username
  const handleRegenerateUsername = () => {
    const generated = generateRandomUsername();
    setRandomUsername(generated);
    setLoginUsername(generated);
    setIsCopied(false);
    showToast('Username acak baru telah dibuat.');
  };

  // Handler Salin Username
  const handleCopyUsername = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(randomUsername);
      setIsCopied(true);
      showToast('Username acak berhasil disalin!');
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // Navigasi Tab Utama (Urutan: Kuesioner -> Video Edukasi -> Chatbot -> Modul)
  const [activeTab, setActiveTab] = useState<AppTab>('KUESIONER');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Tema Light & Dark
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Notifikasi Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Kuesioner State (Sesuai Instrumen Penelitian Resmi Azzam, 2026)
  const [demographics, setDemographics] = useState({
    measurementPhase: '',
    age: '',
    gender: '',
    grade: '',
    priorHivInfo: '',
    sharedDevice: '',
  });

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    // Mulai dengan jawaban kosong (0 = belum diisi) untuk tampilan user baru
    const init: Record<string, number> = {};
    questionnaireSeed.constructs.forEach((c) => {
      c.items.forEach((item) => {
        init[item.code] = 0;
      });
    });
    return init;
  });

  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState<boolean>(false);
  const [activeConstructFilter, setActiveConstructFilter] = useState<'ALL' | ConstructCode>('ALL');

  // State Adaptasi Mockup Mobile (Sesuai Referensi Desain HP)
  const [simulatedDay, setSimulatedDay] = useState<'H0' | 'H1' | 'H4' | 'H8' | 'H10'>('H0');
  const [questionnaireSubTab, setQuestionnaireSubTab] = useState<'PRE_POST' | 'MICRO_CHECKIN' | 'TACT_PLAN'>('PRE_POST');
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(257); // 04:17

  // Timer Sesi Berjalan
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 257));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(sessionSeconds / 60);
    const secs = sessionSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [sessionSeconds]);

  // Handler Isi Cepat Jawaban Simulasi (Auto Fill 30 Butir)
  const handleQuickFillAnswers = () => {
    const newAnswers: Record<string, number> = {};
    questionnaireSeed.constructs.forEach((c) => {
      c.items.forEach((item) => {
        newAnswers[item.code] = Math.random() > 0.35 ? 4 : 5;
      });
    });
    setAnswers(newAnswers);
    showToast('⚡ Jawaban simulasi 30 butir berhasil diisi otomatis!');
  };

  // Handler Pilih Simulasi Hari
  const handleSelectSimDay = (day: 'H0' | 'H1' | 'H4' | 'H8' | 'H10') => {
    setSimulatedDay(day);
    if (day === 'H0') {
      setDemographics((prev) => ({ ...prev, measurementPhase: 'Pretest (T0 - Pengukuran Awal)' }));
      setQuestionnaireSubTab('PRE_POST');
    } else if (day === 'H10') {
      setDemographics((prev) => ({ ...prev, measurementPhase: 'Posttest (T1 - Hari ke-14)' }));
      setQuestionnaireSubTab('PRE_POST');
    } else {
      setQuestionnaireSubTab('MICRO_CHECKIN');
    }
    showToast(`Simulasi hari berpindah ke: ${day}`);
  };

  // Perhitungan Skor Subskala & Total (Live Validation & Score Tracker)
  const questionnaireScores = useMemo(() => {
    const calcSub = (code: string) => {
      const construct = questionnaireSeed.constructs.find((c) => c.code === code);
      if (!construct) return 0;
      return construct.items.reduce((acc, it) => acc + (answers[it.code] || 0), 0);
    };

    const pt = calcSub('PT'); // Privacy Trust (8-40)
    const se = calcSub('SE'); // Self-Efficacy (8-40)
    const int = calcSub('INT'); // Intention (6-30)
    const hs = calcSub('HS'); // Help-Seeking Readiness (8-40)
    const total = pt + se + int + hs; // Total Komposit (30-150)
    const totalQuestions = allOfficialQuestions.length; // 30
    const answeredCount = Object.keys(answers).filter((k) => (answers[k] || 0) > 0).length;

    return {
      pt,
      se,
      int,
      hs,
      total,
      totalQuestions,
      answeredCount,
    };
  }, [answers]);

  // Chatbot State
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'user' | 'assistant'; text: string; time: string }>
  >([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Halo! Saya asisten pintar TepatTes. Anda dapat bertanya apa pun seputar materi kesehatan, cara penggunaan alat skrining mandiri, atau perlindungan privasi Anda. Semua percakapan di sini 100% aman dan rahasia.',
      time: 'Baru saja',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Modul State
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  // Inisialisasi Tema & Sesi dari LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('senyap_theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
      }

      const savedUser = localStorage.getItem('senyap_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser({
            name: parsed.name || 'Pengguna',
            token: parsed.token || 'ID-REMAJA-001',
            groupAllocation: parsed.groupAllocation === 'CONTROL' ? 'CONTROL' : 'INTERVENTION',
            clusterCode: parsed.clusterCode || (parsed.groupAllocation === 'CONTROL' ? 'CLUSTER-CTL-01' : 'CLUSTER-INT-01'),
          });
          setIsAuthenticated(true);
        } catch {
          // ignore
        }
      }

      // Tidak memuat data kuesioner dari localStorage — aplikasi selalu mulai bersih (user baru)
    }
  }, []);

  // Handler Ganti Tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('senyap_theme', newTheme);
    showToast(`Beralih ke Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Handler Pendaftaran dengan Username Acak Otomatis
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmedPass = signupPassword.trim();
    const trimmedConfirm = signupConfirmPassword.trim();

    if (trimmedPass.length < 4) {
      setAuthError('Kata sandi minimal 4 karakter.');
      return;
    }

    if (trimmedConfirm && trimmedPass !== trimmedConfirm) {
      setAuthError('Konfirmasi kata sandi tidak sesuai.');
      return;
    }

    const clusterCode = selectedCluster === 'INTERVENTION' ? 'CLUSTER-INT-01' : 'CLUSTER-CTL-01';
    const userData = {
      name: randomUsername,
      token: randomUsername,
      groupAllocation: selectedCluster,
      clusterCode,
    };

    // Simpan ke daftar akun terdaftar di localStorage
    try {
      const existingRaw = localStorage.getItem('senyap_registered_accounts');
      const accounts = existingRaw ? JSON.parse(existingRaw) : [];
      accounts.push({
        username: randomUsername.toLowerCase(),
        displayName: randomUsername,
        password: trimmedPass,
        token: randomUsername,
        groupAllocation: selectedCluster,
        clusterCode,
      });
      localStorage.setItem('senyap_registered_accounts', JSON.stringify(accounts));
    } catch {
      // ignore
    }

    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('senyap_user', JSON.stringify(userData));

    // Bersihkan data kuesioner/jawaban lama agar user baru selalu mulai dari kondisi bersih
    localStorage.removeItem('senyap_questionnaire_submission');
    localStorage.removeItem('senyap_answers');

    // Reset state kuesioner ke kondisi bersih
    const cleanAnswers: Record<string, number> = {};
    questionnaireSeed.constructs.forEach((c) => {
      c.items.forEach((item) => {
        cleanAnswers[item.code] = 0;
      });
    });
    setAnswers(cleanAnswers);
    setDemographics({ measurementPhase: '', age: '', gender: '', grade: '', priorHivInfo: '', sharedDevice: '' });
    setQuestionnaireSubmitted(false);

    // Siapkan loginUsername jika nanti pengguna logout
    setLoginUsername(randomUsername);
    setActiveTab('KUESIONER');
    showToast(
      `Akun ${randomUsername} berhasil dibuat sebagai ${
        selectedCluster === 'INTERVENTION' ? 'Kelompok Intervensi (X=1)' : 'Kelompok Kontrol (X=0)'
      }!`
    );
  };

  // Handler Masuk dengan Username Acak & Password
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmedUser = loginUsername.trim();
    const trimmedPass = loginPassword.trim();

    if (!trimmedUser) {
      setAuthError('Silakan masukkan nama pengguna acak Anda.');
      return;
    }
    if (!trimmedPass) {
      setAuthError('Silakan masukkan kata sandi Anda.');
      return;
    }

    // Periksa kecocokan akun
    let matched = false;
    let displayName = trimmedUser;
    let matchedAllocation: 'INTERVENTION' | 'CONTROL' = 'INTERVENTION';
    let matchedCluster = 'CLUSTER-INT-01';

    try {
      const existingRaw = localStorage.getItem('senyap_registered_accounts');
      if (existingRaw) {
        const accounts: Array<{
          username: string;
          displayName: string;
          password: string;
          token: string;
          groupAllocation?: 'INTERVENTION' | 'CONTROL';
          clusterCode?: string;
        }> = JSON.parse(existingRaw);
        const acc = accounts.find(
          (a) =>
            a.username.toLowerCase() === trimmedUser.toLowerCase() ||
            a.displayName.toLowerCase() === trimmedUser.toLowerCase()
        );
        if (acc) {
          if (acc.password === trimmedPass) {
            matched = true;
            displayName = acc.displayName;
            matchedAllocation = acc.groupAllocation === 'CONTROL' ? 'CONTROL' : 'INTERVENTION';
            matchedCluster =
              acc.clusterCode ||
              (matchedAllocation === 'CONTROL' ? 'CLUSTER-CTL-01' : 'CLUSTER-INT-01');
          } else {
            setAuthError('Kata sandi yang Anda masukkan salah.');
            return;
          }
        }
      }
    } catch {
      // ignore
    }

    if (!matched && trimmedPass.length < 4) {
      setAuthError('Kata sandi minimal 4 karakter.');
      return;
    }

    const userData = {
      name: displayName,
      token: displayName,
      groupAllocation: matchedAllocation,
      clusterCode: matchedCluster,
    };

    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('senyap_user', JSON.stringify(userData));
    setActiveTab('KUESIONER');
    showToast(`Selamat datang kembali, ${displayName}!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('senyap_user');
    setLoginPassword('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setActiveTab('KUESIONER');
    showToast('Anda telah keluar dari aplikasi.');
  };

  // Submit Kuesioner Penelitian (Siap untuk sinkronisasi Supabase)
  const handleQuestionnaireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionnaireSubmitted(true);

    const submissionPayload = {
      token: currentUser.token,
      username: currentUser.name,
      groupAllocation: currentUser.groupAllocation,
      groupAllocationX: currentUser.groupAllocation === 'INTERVENTION' ? 1 : 0,
      clusterCode: currentUser.clusterCode,
      submittedAt: new Date().toISOString(),
      demographics,
      answers,
      scores: {
        privacyTrust: questionnaireScores.pt,
        selfEfficacy: questionnaireScores.se,
        intention: questionnaireScores.int,
        helpSeeking: questionnaireScores.hs,
        totalComposite: questionnaireScores.total,
      },
      instrument: {
        version: questionnaireSeed.version,
        title: questionnaireSeed.title,
        peneliti: questionnaireSeed.peneliti,
      },
      readyForSupabaseSync: true,
    };

    try {
      localStorage.setItem('senyap_questionnaire_submission', JSON.stringify(submissionPayload));
    } catch {
      // ignore
    }

    showToast('Kuesioner penelitian berhasil disimpan! Melanjutkan ke Video Edukasi...');
    setTimeout(() => {
      setActiveTab('VIDEO');
    }, 700);
  };

  // Kirim Pesan Chatbot
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || chatLoading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: textToSend,
      time: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: currentUser.token,
          message: textToSend,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText =
          data.reply ||
          data.turn?.reply ||
          'Halo! Ada hal lain yang ingin kamu tanyakan atau diskusikan? Ceritakan saja ya!';
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            time: 'Baru saja',
          },
        ]);
      } else {
        // Fallback cerdas jika server offline
        const fallbackAnswers: Record<string, string> = {
          default:
            'Terima kasih atas pertanyaannya. Skrining mandiri HIV (OraQuick®) mendeteksi antibodi melalui usapan gusi atas dan bawah. Hasil dibaca antara menit ke-20 hingga ke-40. Seluruh informasi Anda dijamin rahasia.',
          penularan:
            'HIV hanya menular lewat kontak cairan tubuh tertentu seperti darah atau hubungan seksual tanpa pengaman. HIV tidak menular melalui alat makan, toilet, berpelukan, atau gigitan nyamuk.',
          privasi:
            'Aplikasi ini dirancang dengan perlindungan privasi tinggi. Identitas Anda menggunakan kode samaran anonim sehingga tidak ada pihak luar yang mengetahui data Anda.',
        };

        const lower = textToSend.toLowerCase();
        let fallback = fallbackAnswers.default;
        if (lower.includes('tular') || lower.includes('nyamuk') || lower.includes('makan')) {
          fallback = fallbackAnswers.penularan;
        } else if (lower.includes('privasi') || lower.includes('aman') || lower.includes('rahasia')) {
          fallback = fallbackAnswers.privasi;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: fallback,
            time: 'Baru saja',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: 'Halo! Mohon maaf ada kendala jaringan sesaat. Namun Anda tetap dapat membaca ringkasan materi di menu Modul untuk panduan lengkap.',
          time: 'Baru saja',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =========================================================================
  // 1. TAMPILAN JIKA PENGGUNA BELUM LOGIN (Halaman SignUp & SignIn)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        {/* Toggle Tema di Pojok Atas */}
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10 }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title="Ganti Tema Terang/Gelap"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </div>

        <div className="auth-container">
          {/* Kolom Samping Kiri: Logo & Identitas Brand */}
          <div className="auth-brand-side">
            <div className="auth-brand-header">
              <div className="auth-brand-logo-wrap">
                <TepatTesLogo size={154} className="auth-brand-logo-img" />
              </div>
              <div className="auth-brand-text">
                <h1 className="auth-brand-title">TepatTes</h1>
                <div className="auth-brand-badge">
                  Adaptif · Aman · Mandiri
                </div>
                <p className="auth-brand-desc">
                  Skrining Mandiri & Intervensi Adaptif Berbasis Perlindungan Privasi
                </p>
              </div>
            </div>
          </div>

          {/* Kartu Form Masuk / Daftar */}
          <div className="panel" style={{ padding: '28px 24px' }}>
            {/* Pilihan Tab Masuk / Daftar */}
            <div
              className="segmented"
              style={{ width: '100%', marginBottom: 20, display: 'flex' }}
            >
              <button
                type="button"
                style={{ flex: 1 }}
                aria-pressed={authTab === 'LOGIN'}
                onClick={() => {
                  setAuthTab('LOGIN');
                  setAuthError(null);
                }}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                style={{ flex: 1 }}
                aria-pressed={authTab === 'SIGNUP'}
                onClick={() => {
                  setAuthTab('SIGNUP');
                  setAuthError(null);
                }}
              >
                Daftar Akun Baru
              </button>
            </div>

            {authError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-control)',
                  background: 'var(--pill-negative-bg)',
                  color: 'var(--pill-negative-ink)',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                  border: '1px solid var(--pill-negative-border)',
                }}
              >
                {authError}
              </div>
            )}

            {/* Form Pendaftaran dengan Username Acak Otomatis */}
            {authTab === 'SIGNUP' ? (
              <form onSubmit={handleSignUpSubmit} style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Lock size={14} color="var(--accent)" />
                      <span>Username Acak Otomatis</span>
                    </label>
                    <span className="pill teal" style={{ height: 20, fontSize: 11 }}>
                      100% Rahasia & Anonim
                    </span>
                  </div>

                  {/* Card Display Username Acak */}
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-inner)',
                      background: 'var(--raised)',
                      border: '1.5px solid var(--accent-track)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                        ID Pengguna Anda:
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: 'var(--accent)',
                          fontFamily: 'var(--font-code)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {randomUsername || 'Membuat username...'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={handleCopyUsername}
                        className="btn"
                        style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                        title="Salin username acak"
                      >
                        {isCopied ? (
                          <Check size={13} color="var(--positive)" />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRegenerateUsername}
                        className="btn"
                        style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                        title="Ganti kombinasi username acak lainnya"
                      >
                        <RotateCcw size={13} />
                        <span>Acak Ulang</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bagian Pilihan Klaster Penelitian */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-inner)',
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Sparkles size={14} color="var(--accent)" />
                      <span>Pilihan Klaster Penelitian</span>
                    </label>
                    <span
                      className="pill teal"
                      style={{ height: 20, fontSize: 11, padding: '0 6px', fontWeight: 700 }}
                    >
                      Protokol Skripsi (N=130)
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {/* Opsi 1: Kelompok Intervensi */}
                    <button
                      type="button"
                      onClick={() => setSelectedCluster('INTERVENTION')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-inner)',
                        border:
                          selectedCluster === 'INTERVENTION'
                            ? '2px solid var(--accent)'
                            : '1.5px solid var(--border)',
                        background:
                          selectedCluster === 'INTERVENTION'
                            ? 'var(--accent-soft)'
                            : 'var(--raised)',
                        color:
                          selectedCluster === 'INTERVENTION'
                            ? 'var(--accent)'
                            : 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 13 }}>
                          1. Kelompok Intervensi
                        </span>
                        <span
                          className="pill teal"
                          style={{
                            height: 18,
                            fontSize: 10.5,
                            padding: '0 5px',
                            fontWeight: 800,
                          }}
                        >
                          X = 1
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          lineHeight: 1.35,
                        }}
                      >
                        Sistem JITAI (DP1–DP3), Chatbot AI, Kit OraQuick® & Rujukan Aktif
                      </span>
                    </button>

                    {/* Opsi 2: Kelompok Kontrol */}
                    <button
                      type="button"
                      onClick={() => setSelectedCluster('CONTROL')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-inner)',
                        border:
                          selectedCluster === 'CONTROL'
                            ? '2px solid #0d9488'
                            : '1.5px solid var(--border)',
                        background:
                          selectedCluster === 'CONTROL'
                            ? 'rgba(13, 148, 136, 0.12)'
                            : 'var(--raised)',
                        color:
                          selectedCluster === 'CONTROL'
                            ? '#0d9488'
                            : 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 13 }}>
                          2. Kelompok Kontrol
                        </span>
                        <span
                          className="pill slate"
                          style={{
                            height: 18,
                            fontSize: 10.5,
                            padding: '0 5px',
                            fontWeight: 800,
                          }}
                        >
                          X = 0
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          lineHeight: 1.35,
                        }}
                      >
                        Edukasi Video Digital, Panduan Kit & Direktori PKPR Tempuran
                      </span>
                    </button>
                  </div>
                </div>

                <div className="auth-password-row">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--muted)',
                        marginBottom: 6,
                      }}
                    >
                      Buat Kata Sandi Anda
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Minimal 4 karakter (buat sendiri)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--muted)',
                        marginBottom: 6,
                      }}
                    >
                      Ulangi Kata Sandi
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Ketik ulang kata sandi Anda"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn primary"
                  style={{ height: 44, fontSize: 15, marginTop: 4 }}
                >
                  <ShieldCheck size={17} />
                  <span>Daftar dengan Username Acak Ini</span>
                </button>
              </form>
            ) : (
              /* Form Masuk Akun */
              <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      marginBottom: 6,
                    }}
                  >
                    Nama Pengguna Acak Anda
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Sahabat-4829 atau ID Anda"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                  <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--faint)' }}>
                    Gunakan nama acak yang Anda dapatkan saat mendaftar.
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      marginBottom: 6,
                    }}
                  >
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Masukkan kata sandi yang Anda buat"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn primary"
                  style={{ height: 44, fontSize: 15, marginTop: 4 }}
                >
                  <span>Masuk ke Aplikasi</span>
                </button>
              </form>
            )}

            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--rule)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--faint)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Lock size={12} />
                <span>Privasi Anda terlindungi & data dienkripsi (UU PDP No. 27/2022)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 50,
              background: 'var(--text)',
              color: 'var(--surface)',
              padding: '10px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
            }}
          >
            <Check size={16} color="var(--positive)" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. TAMPILAN UTAMA PENGGUNA SETELAH LOGIN
  // Alur: Kuesioner -> Video Edukasi -> Chatbot -> Modul
  // =========================================================================
  return (
    <div className="framed-app">
      {/* SIDEBAR NAVIGASI */}
      <aside className={`framed-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <TepatTesLogo size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
              TepatTes
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 600 }}>
              Adaptif · Aman · Mandiri
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="btn"
              style={{ marginLeft: 'auto', padding: 6, height: 32 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Menu Navigasi Alur Utama */}
        <div className="sidebar-group-label">Navigasi Aplikasi</div>

        <button
          type="button"
          aria-current={activeTab === 'KUESIONER' ? 'page' : undefined}
          onClick={() => {
            setActiveTab('KUESIONER');
            setMobileMenuOpen(false);
          }}
          className="nav-item"
        >
          <span className="nav-item-left">
            <FileText />
            <span>Kuesioner</span>
          </span>
          {questionnaireSubmitted && (
            <span
              className="pill pos"
              style={{ height: 20, fontSize: 11, padding: '0 6px' }}
            >
              Selesai
            </span>
          )}
        </button>

        <button
          type="button"
          aria-current={activeTab === 'VIDEO' ? 'page' : undefined}
          onClick={() => {
            setActiveTab('VIDEO');
            setMobileMenuOpen(false);
          }}
          className="nav-item"
        >
          <span className="nav-item-left">
            <Video />
            <span>Video Edukasi</span>
          </span>
        </button>

        <button
          type="button"
          aria-current={activeTab === 'CHATBOT' ? 'page' : undefined}
          onClick={() => {
            setActiveTab('CHATBOT');
            setMobileMenuOpen(false);
          }}
          className="nav-item"
        >
          <span className="nav-item-left">
            <MessageCircle />
            <span>Chatbot AI</span>
          </span>
          {currentUser.groupAllocation === 'CONTROL' && (
            <span
              className="pill slate"
              style={{ height: 18, fontSize: 10, padding: '0 5px', fontWeight: 700 }}
              title="Fitur percakapan AI dibatasi pada Kelompok Kontrol"
            >
              Terkunci
            </span>
          )}
        </button>

        <button
          type="button"
          aria-current={activeTab === 'MODUL' ? 'page' : undefined}
          onClick={() => {
            setActiveTab('MODUL');
            setMobileMenuOpen(false);
          }}
          className="nav-item"
        >
          <span className="nav-item-left">
            <BookOpen />
            <span>Modul</span>
          </span>
        </button>

        {/* Profil Akun & Kontrol Bawah */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTop: '1px solid var(--rule)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Card Info User */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-inner)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background:
                  currentUser.groupAllocation === 'CONTROL'
                    ? 'rgba(13, 148, 136, 0.15)'
                    : 'var(--accent-soft)',
                color:
                  currentUser.groupAllocation === 'CONTROL' ? '#0d9488' : 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 14,
                flex: 'none',
              }}
            >
              <User size={18} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentUser.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-code)',
                }}
              >
                {currentUser.token}
              </div>
              <div style={{ marginTop: 4 }}>
                {currentUser.groupAllocation === 'CONTROL' ? (
                  <span
                    className="pill slate"
                    style={{ height: 18, fontSize: 10, padding: '0 6px', fontWeight: 800 }}
                  >
                    Kontrol (X = 0)
                  </span>
                ) : (
                  <span
                    className="pill teal"
                    style={{ height: 18, fontSize: 10, padding: '0 6px', fontWeight: 800 }}
                  >
                    Intervensi (X = 1)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Tema Sidebar */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn"
            style={{ width: '100%', justifyContent: 'flex-start', height: 38 }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          {/* Tombol Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="btn"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              height: 38,
              color: 'var(--pill-negative-ink)',
            }}
          >
            <LogOut size={15} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* KOLOM UTAMA */}
      <div className="framed-main-col">
        {/* TOPBAR HEADER */}
        <header className="framed-topbar">
          {/* Versi Tampilan Desktop */}
          <div className="framed-topbar-desktop">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="btn mobile-menu-btn"
                aria-label="Buka navigasi"
              >
                <Menu size={16} />
                <span>Menu</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  color: 'var(--muted)',
                }}
              >
                <span style={{ fontWeight: 600 }}>TepatTes</span>
                <span>·</span>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                  {activeTab === 'KUESIONER' && 'Kuesioner Pengguna'}
                  {activeTab === 'VIDEO' && 'Video Edukasi'}
                  {activeTab === 'CHATBOT' && 'Chatbot Edukasi'}
                  {activeTab === 'MODUL' && 'Modul Pembelajaran'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Tombol Tema Cepat */}
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle-btn"
                style={{ height: 34 }}
                title="Ganti Tema Terang/Gelap"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
              </button>

              <span className="pill pos" style={{ height: 30 }}>
                <Lock size={12} />
                <span>Sesi Rahasia</span>
              </span>
            </div>
          </div>

          {/* Versi Tampilan Mobile (Sesuai Referensi Desain HP) */}
          <div className="framed-topbar-mobile mobile-header-bar">
            <div className="mobile-header-left">
              <span className="mobile-status-dot" title="Status Online" />
              <div>
                <div className="mobile-user-token">
                  {currentUser.token}
                </div>
                <div className="mobile-user-sub">
                  {currentUser.groupAllocation === 'CONTROL' ? 'Kontrol (X=0)' : 'Intervensi (X=1)'} • Hari ke-{simulatedDay === 'H0' ? 0 : simulatedDay === 'H1' ? 1 : simulatedDay === 'H4' ? 4 : simulatedDay === 'H8' ? 8 : 10}
                </div>
              </div>
            </div>

            <div className="mobile-header-right">
              <div className="mobile-timer-pill" title="Sisa Waktu Sesi Aktif">
                <Clock size={12} />
                <span>{formattedTimer}</span>
              </div>

              <button
                type="button"
                className="mobile-icon-btn"
                onClick={toggleTheme}
                title="Ganti Tema Warna Terang/Gelap"
                aria-label="Ganti Tema"
              >
                <Settings size={15} />
              </button>

              <button
                type="button"
                className="mobile-icon-btn mobile-bell-btn"
                onClick={() => showToast('Tidak ada notifikasi baru.')}
                title="Notifikasi Sistem"
                aria-label="Notifikasi"
              >
                <Bell size={15} />
                <span className="bell-badge" />
              </button>

              <button
                type="button"
                className="mobile-icon-btn"
                onClick={() => showToast('Perlindungan Sesi Terenkripsi AES-256 Aktif')}
                title="Status Keamanan & Privasi"
                aria-label="Status Privasi"
              >
                <Shield size={15} />
              </button>

              <button
                type="button"
                className="mobile-samaran-btn"
                onClick={() => setIsStealthMode(true)}
                title="Aktifkan Mode Samaran (Tampilan Catatan Biologi)"
                aria-label="Mode Samaran"
              >
                <Eye size={13} />
                <span>Samaran</span>
              </button>
            </div>
          </div>
        </header>

        {/* AREA KERJA KONTEN */}
        <main className="work-sheet">
          {/* ===============================================================
              1. HALAMAN KUESIONER (Disajikan Langsung Setelah Login)
             =============================================================== */}
          {activeTab === 'KUESIONER' && (
            <div>
              {/* BAR SIMULASI HARI (Sesuai Referensi Mockup HP) */}
              <div className="sim-day-bar">
                <div className="sim-day-label">
                  <Zap size={13} />
                  <span>
                    Simulasi Hari {currentUser.groupAllocation === 'CONTROL' ? '(Kontrol: Pre/Post)' : '(JITAI DP1–DP3)'}:
                  </span>
                </div>
                {(currentUser.groupAllocation === 'CONTROL'
                  ? (['H0', 'H10'] as const)
                  : (['H0', 'H1', 'H4', 'H8', 'H10'] as const)
                ).map((day) => {
                  const dayLabels: Record<string, string> = {
                    H0: 'H0 (Pre)',
                    H1: 'H1 (DP1)',
                    H4: 'H4 (DP2)',
                    H8: 'H8 (DP3)',
                    H10: 'H10 (Post)',
                  };
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`sim-day-pill ${simulatedDay === day ? 'active' : ''}`}
                      onClick={() => handleSelectSimDay(day)}
                    >
                      {dayLabels[day]}
                    </button>
                  );
                })}
              </div>

              {/* SUBTAB NAVIGASI KUESIONER */}
              <div className="questionnaire-subtabs">
                <button
                  type="button"
                  className={`subtab-btn ${questionnaireSubTab === 'PRE_POST' ? 'active' : ''}`}
                  onClick={() => setQuestionnaireSubTab('PRE_POST')}
                >
                  1. Pre/Posttest
                </button>
                <button
                  type="button"
                  className={`subtab-btn ${questionnaireSubTab === 'MICRO_CHECKIN' ? 'active' : ''}`}
                  onClick={() => setQuestionnaireSubTab('MICRO_CHECKIN')}
                >
                  2. Micro-Check-In {currentUser.groupAllocation === 'CONTROL' ? '(Intervensi)' : ''}
                </button>
                <button
                  type="button"
                  className={`subtab-btn ${questionnaireSubTab === 'TACT_PLAN' ? 'active' : ''}`}
                  onClick={() => setQuestionnaireSubTab('TACT_PLAN')}
                >
                  3. Rencana TACT {currentUser.groupAllocation === 'CONTROL' ? '(Intervensi)' : ''}
                </button>
              </div>

              {/* TAMPILAN KHUSUS SUBTAB 2: MICRO-CHECK-IN */}
              {questionnaireSubTab === 'MICRO_CHECKIN' && (
                currentUser.groupAllocation === 'CONTROL' ? (
                  <div className="panel" style={{ padding: '32px 24px', marginBottom: 20, textAlign: 'center' }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(13, 148, 136, 0.12)',
                        display: 'grid',
                        placeItems: 'center',
                        margin: '0 auto 14px',
                        color: '#0d9488',
                      }}
                    >
                      <Lock size={24} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>
                      Micro-Check-In JITAI Khusus Kelompok Intervensi (X = 1)
                    </h3>
                    <p style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 540, margin: '0 auto 18px', lineHeight: 1.55 }}>
                      Sesuai protokol penelitian skripsi, evaluasi adaptif harian berbasis titik keputusan (DP1 pada Hari ke-1, DP2 pada Hari ke-4, dan DP3 pada Hari ke-8) yang memutakhirkan variabel penyesuaian (tailoring variables) secara real-time merupakan perlakuan adaptif untuk Kelompok Intervensi.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn primary"
                        onClick={() => setQuestionnaireSubTab('PRE_POST')}
                      >
                        Buka Kuesioner Pre/Posttest
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setActiveTab('VIDEO')}
                      >
                        Buka Video Edukasi
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="panel" style={{ padding: '20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--accent)' }}>
                        Micro-Check-In Cepat (&lt; 60 Detik)
                      </h2>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '4px 0 0' }}>
                        Evaluasi harian untuk memicu intervensi adaptif JITAI ({simulatedDay === 'H0' ? 'H0 - Pengukuran Awal' : simulatedDay === 'H1' ? 'Titik Keputusan DP1 (Hari 1)' : simulatedDay === 'H4' ? 'Titik Keputusan DP2 (Hari 4)' : simulatedDay === 'H8' ? 'Titik Keputusan DP3 (Hari 8)' : 'Pasca-Intervensi (Hari 10)'}).
                      </p>
                    </div>
                    <span className="pill teal">Rule-Based JITAI</span>
                  </div>

                  <div style={{ display: 'grid', gap: 14 }}>
                    <div className="mockup-question-card">
                      <div className="mockup-question-header">
                        <span className="mockup-item-code">PR</span>
                        <p className="mockup-item-text">Perceived Risk: Seberapa penting bagi Anda untuk mengetahui status kesehatan seksual Anda saat ini?</p>
                      </div>
                      <div className="likert-circles-container">
                        <div className="likert-circles-row">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button key={v} type="button" className={`likert-circle-btn ${v === 4 ? 'active' : ''}`} onClick={() => showToast('Tanggapan risiko (PR) dicatat')}>
                              {v}
                            </button>
                          ))}
                        </div>
                        <div className="likert-anchors-row">
                          <span>Sangat Rendah</span>
                          <span>Sangat Tinggi</span>
                        </div>
                      </div>
                    </div>

                    <div className="mockup-question-card">
                      <div className="mockup-question-header">
                        <span className="mockup-item-code">PC</span>
                        <p className="mockup-item-text">Privacy Concern: Apakah Anda merasa nyaman dengan tingkat kerahasiaan dan privasi data Anda saat ini?</p>
                      </div>
                      <div className="likert-circles-container">
                        <div className="likert-circles-row">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button key={v} type="button" className={`likert-circle-btn ${v === 5 ? 'active' : ''}`} onClick={() => showToast('Tanggapan privasi (PC) dicatat')}>
                              {v}
                            </button>
                          ))}
                        </div>
                        <div className="likert-anchors-row">
                          <span>Sangat Cemas</span>
                          <span>Sangat Tenang</span>
                        </div>
                      </div>
                    </div>

                    <div className="mockup-question-card">
                      <div className="mockup-question-header">
                        <span className="mockup-item-code">SE</span>
                        <p className="mockup-item-text">Testing Self-Efficacy: Seberapa yakin Anda mampu melakukan tes mandiri OraQuick® secara benar tanpa bantuan orang lain?</p>
                      </div>
                      <div className="likert-circles-container">
                        <div className="likert-circles-row">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button key={v} type="button" className={`likert-circle-btn ${v === 4 ? 'active' : ''}`} onClick={() => showToast('Tanggapan efikasi (SE) dicatat')}>
                              {v}
                            </button>
                          ))}
                        </div>
                        <div className="likert-anchors-row">
                          <span>Sangat Ragu</span>
                          <span>Sangat Yakin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              )}

              {/* TAMPILAN KHUSUS SUBTAB 3: RENCANA TACT */}
              {questionnaireSubTab === 'TACT_PLAN' && (
                currentUser.groupAllocation === 'CONTROL' ? (
                  <div className="panel" style={{ padding: '32px 24px', marginBottom: 20, textAlign: 'center' }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(13, 148, 136, 0.12)',
                        display: 'grid',
                        placeItems: 'center',
                        margin: '0 auto 14px',
                        color: '#0d9488',
                      }}
                    >
                      <Lock size={24} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>
                      Rencana Tindakan TACT Khusus Kelompok Intervensi (X = 1)
                    </h3>
                    <p style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 540, margin: '0 auto 18px', lineHeight: 1.55 }}>
                      Penyusunan rencana Target, Action, Context, dan Time untuk skrining mandiri OraQuick® dengan dukungan rujukan aktif merupakan bagian dari perlakuan adaptif Kelompok Intervensi.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn primary"
                        onClick={() => setQuestionnaireSubTab('PRE_POST')}
                      >
                        Buka Kuesioner Pre/Posttest
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="panel" style={{ padding: '20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--accent)' }}>
                        Rencana Tindakan Mandiri (TACT Action Plan)
                      </h2>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '4px 0 0' }}>
                        Kerangka Target, Action, Context, dan Time untuk skrining mandiri OraQuick®.
                      </p>
                    </div>
                    <span className="pill cobalt">Komitmen TACT</span>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ padding: '14px', borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>1. Target (Sasaran)</div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>Melaksanakan skrining mandiri HIVST menggunakan alat OraQuick® Rapid HIV-1/2 Antibody Test secara mandiri.</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>2. Action (Tindakan Teknis)</div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>Mengusap gusi atas 1 kali dan gusi bawah 1 kali, memasukkan pad ke tabung reagen, dan membaca garis hasil pada menit ke-20 hingga 40.</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>3. Context (Konteks Ruang & Privasi)</div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>Di ruang pribadi yang tenang dan nyaman, memastikan keamanan gawai serta tersedianya tombol samaran bila diperlukan.</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>4. Time (Waktu Pelaksanaan)</div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>Dilakukan saat kondisi santai, tidak makan atau minum 15–30 menit sebelum pemeriksaan, memperhatikan window period 12 minggu.</div>
                    </div>
                  </div>
                </div>
                )
              )}

              {/* TAMPILAN SUBTAB 1: PRE/POSTTEST */}
              {questionnaireSubTab === 'PRE_POST' && (
                <>
                  {/* SEGMENTED SWITCH PRETEST VS POSTTEST */}
                  <div className="phase-segmented-container">
                    <button
                      type="button"
                      className={`phase-segmented-btn ${demographics.measurementPhase.startsWith('Pretest') ? 'active' : ''}`}
                      onClick={() => {
                        setDemographics((prev) => ({ ...prev, measurementPhase: 'Pretest (T0 - Pengukuran Awal)' }));
                        showToast('Instrumen aktif: Pretest (Hari ke-0)');
                      }}
                    >
                      Pretest (Hari ke-0)
                    </button>
                    <button
                      type="button"
                      className={`phase-segmented-btn ${demographics.measurementPhase.startsWith('Posttest') ? 'active' : ''}`}
                      onClick={() => {
                        setDemographics((prev) => ({ ...prev, measurementPhase: 'Posttest (T1 - Hari ke-14)' }));
                        showToast('Instrumen aktif: Posttest (Hari ke-10)');
                      }}
                    >
                      Posttest (Hari ke-10)
                    </button>
                  </div>

                  {/* KEMAJUAN PENGISIAN & SLIM PROGRESS BAR */}
                  <div className="progress-meta-row">
                    <span>Kemajuan Pengisian: {questionnaireScores.answeredCount} dari {questionnaireScores.totalQuestions} Butir</span>
                    <span className="pct">{Math.round((questionnaireScores.answeredCount / questionnaireScores.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="slim-progress-track">
                    <div
                      className="slim-progress-fill"
                      style={{ width: `${Math.round((questionnaireScores.answeredCount / questionnaireScores.totalQuestions) * 100)}%` }}
                    />
                  </div>

                  {/* TOMBOL ISI CEPAT JAWABAN SIMULASI */}
                  <div className="quick-fill-row">
                    <button
                      type="button"
                      className="quick-fill-btn"
                      onClick={handleQuickFillAnswers}
                    >
                      <Zap size={13} />
                      <Zap size={13} style={{ marginLeft: -8 }} />
                      <span>Isi Cepat Jawaban Simulasi</span>
                    </button>
                  </div>

              {/* Status Selesai / Ringkasan Skor Kuesioner */}
              {questionnaireSubmitted && (
                <div
                  className="panel tint-teal"
                  style={{
                    padding: '16px 20px',
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          flex: 'none',
                        }}
                      >
                        <Check size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                          Kuesioner Penelitian Telah Terisi Lengkap ({questionnaireScores.answeredCount}/30 Butir)
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                          Data tersimpan di penyimpanan lokal (siap untuk sinkronisasi database Supabase). Anda dapat meninjau atau memperbarui jawaban kapan saja.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('VIDEO')}
                      className="btn primary"
                    >
                      <span>Buka Video Edukasi</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* Ringkasan Skor Subskala */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ padding: '8px 10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Privasi (PT)</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{questionnaireScores.pt} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>/ 40</span></div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Efikasi Diri (SE)</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{questionnaireScores.se} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>/ 40</span></div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Intensi (INT)</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{questionnaireScores.int} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>/ 30</span></div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Bantuan (HS)</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{questionnaireScores.hs} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>/ 40</span></div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--accent-soft)', borderRadius: 8, border: '1px solid var(--accent)' }}>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>Total Komposit</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{questionnaireScores.total} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>/ 150</span></div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleQuestionnaireSubmit}>
                {/* Bagian A: Karakteristik Responden (Kovariat Penelitian) */}
                <div className="panel" style={{ marginBottom: 20 }}>
                  <div className="panel-header">
                    <div>
                      <h2>Bagian A: Karakteristik Responden</h2>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        Data demografis dan kovariat untuk keperluan analisis statistik penelitian.
                      </p>
                    </div>
                    <span className="pill teal">6 Kovariat Penelitian</span>
                  </div>
                  <div className="sheet-grid">
                    {/* Alokasi Klaster Penelitian */}
                    <div className="col-12" style={{ marginBottom: 4 }}>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-inner)',
                          background:
                            currentUser.groupAllocation === 'CONTROL'
                              ? 'rgba(13, 148, 136, 0.08)'
                              : 'var(--accent-soft)',
                          border: `1.5px solid ${
                            currentUser.groupAllocation === 'CONTROL' ? '#0d9488' : 'var(--accent)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>
                            Klaster Penelitian (Peneliti: Abdullah Azzam, NIM. 223001)
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                            {currentUser.groupAllocation === 'CONTROL'
                              ? 'Kelompok Kontrol (X = 0)'
                              : 'Kelompok Intervensi (X = 1)'}
                          </div>
                        </div>
                        <span
                          className={currentUser.groupAllocation === 'CONTROL' ? 'pill slate' : 'pill teal'}
                          style={{ fontWeight: 800, fontSize: 11 }}
                        >
                          {currentUser.groupAllocation === 'CONTROL'
                            ? 'X = 0 • Edukasi Digital Video'
                            : 'X = 1 • JITAI Adaptif + AI Chatbot'}
                        </span>
                      </div>
                    </div>

                    {/* Waktu Pengukuran */}
                    <div className="col-6">
                      <label
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        Waktu Pengukuran Kuesioner
                      </label>
                      <select
                        className="input-field"
                        value={demographics.measurementPhase}
                        onChange={(e) =>
                          setDemographics({ ...demographics, measurementPhase: e.target.value })
                        }
                      >
                        <option value="">-- Pilih Fase Pengukuran --</option>
                        <option value="Pretest (T0 - Pengukuran Awal)">Pretest (T0 - Pengukuran Awal)</option>
                        <option value="Posttest (T1 - Hari ke-14)">Posttest (T1 - Hari ke-14)</option>
                      </select>
                    </div>

                    {/* Usia */}
                    <div className="col-6">
                      <label
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        Usia Saat Ini (Rentang Inklusi: 15–19 Tahun)
                      </label>
                      <select
                        className="input-field"
                        value={demographics.age}
                        onChange={(e) =>
                          setDemographics({ ...demographics, age: e.target.value })
                        }
                      >
                        <option value="">-- Pilih Usia --</option>
                        <option value="15">15 Tahun</option>
                        <option value="16">16 Tahun</option>
                        <option value="17">17 Tahun</option>
                        <option value="18">18 Tahun</option>
                        <option value="19">19 Tahun</option>
                      </select>
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="col-6">
                      <label
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        Jenis Kelamin
                      </label>
                      <select
                        className="input-field"
                        value={demographics.gender}
                        onChange={(e) =>
                          setDemographics({
                            ...demographics,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Jenis Kelamin --</option>
                        <option value="Perempuan">Perempuan</option>
                        <option value="Laki-laki">Laki-laki</option>
                      </select>
                    </div>

                    {/* Tingkat Kelas */}
                    <div className="col-6">
                      <label
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        Tingkat Kelas
                      </label>
                      <select
                        className="input-field"
                        value={demographics.grade}
                        onChange={(e) =>
                          setDemographics({
                            ...demographics,
                            grade: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Kelas --</option>
                        <option value="Kelas X">Kelas X</option>
                        <option value="Kelas XI">Kelas XI</option>
                        <option value="Kelas XII">Kelas XII</option>
                      </select>
                    </div>

                    {/* Riwayat Informasi HIV */}
                    <div className="col-6">
                      <label
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        Riwayat Paparan Informasi HIV / Kesehatan Seksual
                      </label>
                      <select
                        className="input-field"
                        value={demographics.priorHivInfo}
                        onChange={(e) =>
                          setDemographics({
                            ...demographics,
                            priorHivInfo: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Riwayat Informasi --</option>
                        <option value="Pernah mendapatkan penyuluhan/informasi resmi sebelumnya">
                          Pernah mendapatkan penyuluhan/informasi resmi sebelumnya
                        </option>
                        <option value="Belum pernah mendapatkan penyuluhan/informasi resmi sebelumnya">
                          Belum pernah mendapatkan penyuluhan/informasi resmi sebelumnya
                        </option>
                      </select>
                    </div>

                    {/* Status Kepemilikan Perangkat (Shared Device) */}
                    <div className="col-6">
                      <label
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        Status Kepemilikan Perangkat Gawai
                      </label>
                      <select
                        className="input-field"
                        value={demographics.sharedDevice}
                        onChange={(e) =>
                          setDemographics({
                            ...demographics,
                            sharedDevice: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Status Kepemilikan --</option>
                        <option value="Perangkat milik pribadi sepenuhnya (tidak dipakai bersama)">
                          Perangkat milik pribadi sepenuhnya (tidak dipakai bersama)
                        </option>
                        <option value="Perangkat digunakan bersama orang tua/saudara/teman (shared device)">
                          Perangkat digunakan bersama orang tua/saudara/teman (shared device)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bagian B: Butir Pertanyaan Penelitian (4 Konstruk, Total 30 Butir) */}
                <div className="panel" style={{ marginBottom: 24 }}>
                  <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2>Bagian B: Butir Instrumen Penelitian</h2>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        Pilihlah skala 1 hingga 5 yang paling mewakili kondisi atau keyakinan Anda secara jujur.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="pill cobalt">
                        30 Butir Pertanyaan Resmi
                      </span>
                    </div>
                  </div>

                  {/* Filter / Navigasi Konstruk (Sangat praktis di HP dan Tablet) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      overflowX: 'auto',
                      paddingBottom: 12,
                      marginBottom: 16,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', marginRight: 4 }}>
                      Filter Konstruk:
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveConstructFilter('ALL')}
                      className={`btn ${activeConstructFilter === 'ALL' ? 'primary' : ''}`}
                      style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 20 }}
                    >
                      Semua Butir (30)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConstructFilter('PT')}
                      className={`btn ${activeConstructFilter === 'PT' ? 'primary' : ''}`}
                      style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 20 }}
                    >
                      1. Privasi (8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConstructFilter('SE')}
                      className={`btn ${activeConstructFilter === 'SE' ? 'primary' : ''}`}
                      style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 20 }}
                    >
                      2. Efikasi Diri (8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConstructFilter('INT')}
                      className={`btn ${activeConstructFilter === 'INT' ? 'primary' : ''}`}
                      style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 20 }}
                    >
                      3. Intensi (6)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConstructFilter('HS')}
                      className={`btn ${activeConstructFilter === 'HS' ? 'primary' : ''}`}
                      style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 20 }}
                    >
                      4. Bantuan (8)
                    </button>
                  </div>

                  {/* Daftar Butir Pertanyaan Dikelompokkan per Konstruk */}
                  <div style={{ display: 'grid', gap: 24 }}>
                    {questionnaireSeed.constructs
                      .filter((c) => activeConstructFilter === 'ALL' || c.code === activeConstructFilter)
                      .map((construct) => {
                        const constructCode = construct.code as ConstructCode;
                        const subscaleScore =
                          constructCode === 'PT'
                            ? questionnaireScores.pt
                            : constructCode === 'SE'
                            ? questionnaireScores.se
                            : constructCode === 'INT'
                            ? questionnaireScores.int
                            : questionnaireScores.hs;

                        return (
                          <div key={construct.code} style={{ display: 'grid', gap: 12 }}>
                            {/* Section Header Card Sesuai Mockup Referensi */}
                            <div className="mockup-section-card">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                                <div className="mockup-section-title">
                                  Bagian {construct.code === 'PT' ? 'A' : construct.code === 'SE' ? 'B' : construct.code === 'INT' ? 'C' : 'D'}: {construct.name} ({construct.code}1–{construct.code}{construct.items.length})
                                </div>
                                <span className="pill teal" style={{ height: 24, fontSize: 11 }}>
                                  Skor: {subscaleScore} / {construct.range[1]}
                                </span>
                              </div>
                              <p className="mockup-section-desc">
                                {construct.code === 'PT' && 'Tingkat kepercayaan terhadap jaminan keamanan teknis dan kerahasiaan data sistem (Skor 8–40).'}
                                {construct.code === 'SE' && 'Tingkat keyakinan diri dalam melaksanakan langkah skrining mandiri secara tepat (Skor 8–40).'}
                                {construct.code === 'INT' && 'Komitmen dan niat perilaku melaksanakan tes HIV mandiri kerangka TACT (Skor 6–30).'}
                                {construct.code === 'HS' && 'Kesiapan mengakses layanan bantuan dan konseling kesehatan remaja PKPR (Skor 8–40).'}
                              </p>
                            </div>

                            {/* Daftar Butir Pertanyaan (Card Per Butir dengan 5 Lingkaran) */}
                            {construct.items.map((item) => {
                              const selectedVal = answers[item.code] || 0;

                              return (
                                <div key={item.code} className="mockup-question-card">
                                  <div className="mockup-question-header">
                                    <span className="mockup-item-code">{item.code}</span>
                                    <p className="mockup-item-text">{item.text}</p>
                                  </div>

                                  <div className="likert-circles-container">
                                    <div className="likert-circles-row">
                                      {[1, 2, 3, 4, 5].map((val) => {
                                        const isSelected = selectedVal === val;

                                        return (
                                          <button
                                            key={val}
                                            type="button"
                                            className={`likert-circle-btn ${isSelected ? 'active' : ''}`}
                                            onClick={() =>
                                              setAnswers((prev) => ({
                                                ...prev,
                                                [item.code]: val,
                                              }))
                                            }
                                            title={`${val} - ${(construct.scaleLabels as Record<string, string>)[String(val)]}`}
                                            aria-label={`${item.code} skala ${val}`}
                                          >
                                            {val}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <div className="likert-anchors-row">
                                      <span>Sangat Tidak Setuju</span>
                                      <span>Sangat Setuju</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                  </div>

                  {/* Summary & Tombol Simpan Kuesioner */}
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 18,
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      <div>
                        Status Pengisian: <strong style={{ color: 'var(--text)' }}>{questionnaireScores.answeredCount} dari 30 Butir Terjawab</strong>
                      </div>
                      <div style={{ fontSize: 11.5, marginTop: 2 }}>
                        *Jawaban disimpan di penyimpanan lokal peramban Anda (siap dihubungkan ke Supabase).
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn primary"
                      style={{ height: 46, padding: '0 24px', fontSize: 15 }}
                    >
                      <Check size={18} />
                      <span>Simpan Kuesioner & Lanjut ke Video Edukasi</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
            </div>
          )}

          {/* ===============================================================
              2. HALAMAN VIDEO EDUKASI (Sederhana, Bersih, Slot Siap Pakai)
             =============================================================== */}
          {activeTab === 'VIDEO' && (
            <div>
              <div className="title-row">
                <div>
                  <h1>Video Edukasi</h1>
                  <p className="sub">
                    Kumpulan materi video edukasi seputar kesehatan reproduksi,
                    prosedur skrining mandiri, dan panduan penggunaan aplikasi.
                    Slot video telah disiapkan dan siap disematkan ketika materi
                    video final telah selesai dibuat.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('CHATBOT')}
                    className="btn primary"
                  >
                    <span>Lanjut ke Chatbot</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Grid Kartu Video Edukasi */}
              <div className="sheet-grid">
                {educationalVideos.map((video, idx) => (
                  <div key={video.id} className="col-6">
                    <div className="panel" style={{ height: '100%' }}>
                      {/* Video Player Placeholder Frame */}
                      <div className="video-frame-placeholder">
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            color: '#ffffff',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 4px 16px rgba(13, 116, 128, 0.3)',
                          }}
                        >
                          <Play size={26} style={{ marginLeft: 3 }} />
                        </div>
                        <div style={{ textAlign: 'center', padding: '0 16px' }}>
                          <span
                            className="pill warn"
                            style={{ marginBottom: 6, fontSize: 11 }}
                          >
                            {video.status}
                          </span>
                          <div
                            style={{
                              fontSize: 12.5,
                              color: 'var(--muted)',
                              fontWeight: 500,
                            }}
                          >
                            Slot Video #{idx + 1} · Estimasi Durasi: {video.duration}
                          </div>
                        </div>
                      </div>

                      {/* Info Video */}
                      <div style={{ marginTop: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span className="pill teal">{video.category}</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--muted)',
                            }}
                          >
                            {video.duration}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            margin: '8px 0 6px',
                            color: 'var(--text)',
                          }}
                        >
                          {video.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 13.5,
                            color: 'var(--muted)',
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {video.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigasi Lanjut */}
              <div
                style={{
                  marginTop: 28,
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-card)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    Sudah selesai menonton materi video?
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                    Jika Anda memiliki pertanyaan mengenai materi di atas, tanyakan
                    langsung pada Chatbot kami.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('CHATBOT')}
                  className="btn primary"
                  style={{ height: 42, padding: '0 20px' }}
                >
                  <MessageCircle size={16} />
                  <span>Buka Chatbot Tanya Jawab</span>
                </button>
              </div>
            </div>
          )}

          {/* ===============================================================
              3. HALAMAN CHATBOT (Interaktif, Ramah & Berpelindung Privasi)
             =============================================================== */}
          {activeTab === 'CHATBOT' && (
            currentUser.groupAllocation === 'CONTROL' ? (
              <div>
                <div className="title-row">
                  <div>
                    <h1>Chatbot Edukasi AI</h1>
                    <p className="sub">
                      Fitur Asisten Cerdas Tanya TepatTes AI & Intervensi Adaptif Real-Time JITAI.
                    </p>
                  </div>
                </div>

                <div
                  className="panel"
                  style={{
                    padding: '40px 24px',
                    textAlign: 'center',
                    maxWidth: 640,
                    margin: '20px auto',
                    borderRadius: 'var(--radius-panel)',
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(13, 148, 136, 0.12)',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 16px',
                      color: '#0d9488',
                    }}
                  >
                    <Lock size={32} />
                  </div>

                  <span
                    className="pill slate"
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 12,
                    }}
                  >
                    Fitur Khusus Kelompok Intervensi (X = 1)
                  </span>

                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>
                    Interaksi Percakapan AI Tidak Tersedia untuk Kelompok Kontrol
                  </h2>

                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--muted)',
                      lineHeight: 1.6,
                      margin: '0 auto 24px',
                      maxWidth: 540,
                    }}
                  >
                    Sesuai protokol penelitian kuasi-eksperimen (Abdullah Azzam, 2026), kelompok kontrol (X = 0) tidak menerima intervensi percakapan berbasis kecerdasan buatan (Generative AI/LLM) maupun titik keputusan adaptif JITAI (DP1–DP3).
                  </p>

                  {/* Direktori Layanan PKPR Puskesmas Tempuran */}
                  <div
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-inner)',
                      background: 'var(--raised)',
                      border: '1.5px solid var(--border)',
                      textAlign: 'left',
                      marginBottom: 24,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Shield size={16} color="var(--accent)" />
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                        Kesetaraan Akses Layanan: PKPR Puskesmas Tempuran
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                      Peserta Kelompok Kontrol tetap disetarakan aksesnya terhadap informasi dasar penggunaan kit OraQuick® HIVST dan direktori rujukan reguler Pelayanan Kesehatan Peduli Remaja (PKPR) Puskesmas Tempuran:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', display: 'grid', gap: 6 }}>
                      <li>
                        <strong>Lokasi Fasyankes:</strong> Puskesmas Tempuran, Jl. Raya Tempuran, Tempuran, Kabupaten Karawang, Jawa Barat.
                      </li>
                      <li>
                        <strong>Layanan:</strong> Ruang Konseling Remaja Ramah, Konsultasi Kesehatan Reproduksi & HIV/IMS Bebas Stigma.
                      </li>
                      <li>
                        <strong>Prinsip:</strong> 100% Rahasia, Privasi Terlindungi, dan Tanpa Biaya (Gratis untuk Remaja).
                      </li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => setActiveTab('VIDEO')}
                    >
                      <Video size={15} />
                      <span>Buka Modul Video Edukasi</span>
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setActiveTab('KUESIONER')}
                    >
                      <FileText size={15} />
                      <span>Isi Kuesioner Pre/Posttest</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
            <div>
              <div className="title-row">
                <div>
                  <h1>Chatbot Edukasi</h1>
                  <p className="sub">
                    Tanyakan apa pun seputar kesehatan, mitos vs fakta, tata cara
                    skrining mandiri, maupun hak privasi Anda. Asisten AI siap
                    membantu secara aman dan rahasia.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('MODUL')}
                    className="btn primary"
                  >
                    <span>Lanjut ke Modul</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Chat Container */}
              <div
                className="panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100vh - 270px)',
                  minHeight: 480,
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Header Chat */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--raised)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        Tanya TepatTes AI
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: 'var(--positive)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--positive)',
                          }}
                        />
                        Online & Anonim
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMessages([
                        {
                          id: `reset-${Date.now()}`,
                          sender: 'assistant',
                          text: 'Riwayat percakapan telah dibersihkan. Silakan tanyakan hal baru seputar kesehatan atau panduan aplikasi.',
                          time: 'Baru saja',
                        },
                      ])
                    }
                    className="btn"
                    style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                    title="Bersihkan riwayat obrolan"
                  >
                    <RotateCcw size={13} />
                    <span>Hapus Layar</span>
                  </button>
                </div>

                {/* Body Messages */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    background: 'var(--ground)',
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems:
                          msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        gap: 4,
                      }}
                    >
                      <div
                        className={
                          msg.sender === 'user'
                            ? 'chat-bubble-user'
                            : 'chat-bubble-ai'
                        }
                      >
                        {msg.text}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--faint)',
                          padding: '0 4px',
                        }}
                      >
                        {msg.time}
                      </span>
                    </div>
                  ))}

                  {chatLoading && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: 'var(--muted)',
                        fontSize: 13,
                        fontStyle: 'italic',
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          animation: 'pulse 1s infinite',
                        }}
                      />
                      Asisten sedang menyiapkan jawaban...
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>



                {/* Input Area */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="chat-input-box"
                  >
                    <input
                      type="text"
                      className="input-field"
                      style={{ border: 0, padding: 0, height: 36 }}
                      placeholder="Ketik pertanyaan Anda di sini..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="btn primary"
                      style={{ height: 36, padding: '0 14px' }}
                    >
                      <Send size={15} />
                      <span>Kirim</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
            )
          )}

          {/* ===============================================================
              4. HALAMAN MODUL (Pusat Materi Bacaan & Edukasi Terlengkap)
             =============================================================== */}
          {activeTab === 'MODUL' && (
            <div>
              <div className="title-row">
                <div>
                  <h1>Modul Pembelajaran</h1>
                  <p className="sub">
                    Pusat materi edukatif komprehensif mengenai kesehatan
                    reproduksi, prosedur teknis skrining mandiri, dan panduan hak
                    kerahasiaan remaja.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('KUESIONER')}
                    className="btn"
                  >
                    <FileText size={15} />
                    <span>Lihat Kembali Kuesioner</span>
                  </button>
                </div>
              </div>

              {/* Grid Kartu Modul */}
              <div className="sheet-grid">
                {modulesData.map((module) => {
                  const isDone = completedModules[module.id];
                  return (
                    <div key={module.id} className="col-6">
                      <div className="module-card">
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              marginBottom: 10,
                            }}
                          >
                            <span className="pill cobalt">{module.code}</span>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  color: 'var(--muted)',
                                  fontWeight: 500,
                                }}
                              >
                                {module.readTime}
                              </span>
                              {isDone && (
                                <span
                                  className="pill pos"
                                  style={{
                                    height: 20,
                                    fontSize: 11,
                                    padding: '0 6px',
                                  }}
                                >
                                  Selesai
                                </span>
                              )}
                            </div>
                          </div>

                          <h3
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: 'var(--text)',
                              margin: '0 0 8px',
                            }}
                          >
                            {module.title}
                          </h3>

                          <p
                            style={{
                              fontSize: 13.5,
                              color: 'var(--muted)',
                              margin: 0,
                              lineHeight: 1.55,
                            }}
                          >
                            {module.summary}
                          </p>
                        </div>

                        <div
                          style={{
                            paddingTop: 12,
                            borderTop: '1px solid var(--rule)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            className="pill teal"
                            style={{ fontSize: 11.5 }}
                          >
                            {module.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedModule(module)}
                            className="btn primary"
                            style={{ height: 34, fontSize: 13 }}
                          >
                            <Eye size={14} />
                            <span>Buka Modul</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MODAL PEMBACA MODUL LENGKAP */}
              {selectedModule && (
                <div
                  className="module-modal-overlay"
                  onClick={() => setSelectedModule(null)}
                >
                  <div
                    className="module-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header Modal */}
                    <div
                      style={{
                        padding: '18px 24px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        background: 'var(--raised)',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <span className="pill cobalt">
                            {selectedModule.code}
                          </span>
                          <span className="pill teal">
                            {selectedModule.readTime}
                          </span>
                        </div>
                        <h2
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--text)',
                          }}
                        >
                          {selectedModule.title}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedModule(null)}
                        className="btn"
                        style={{ padding: 6, height: 32 }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Body Isi Bacaan */}
                    <div
                      style={{
                        padding: '24px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                      }}
                    >
                      {selectedModule.sections.map((sec, i) => (
                        <div key={i}>
                          <h4
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: 'var(--accent)',
                              margin: '0 0 8px',
                            }}
                          >
                            {sec.heading}
                          </h4>
                          <p
                            style={{
                              fontSize: 14,
                              color: 'var(--text)',
                              margin: 0,
                              lineHeight: 1.65,
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {sec.body}
                          </p>
                        </div>
                      ))}

                      {/* Poin Utama / Key Takeaways */}
                      <div
                        style={{
                          padding: '16px 18px',
                          borderRadius: 'var(--radius-inner)',
                          background: 'var(--accent-soft)',
                          border: '1px solid var(--accent-track)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: 'var(--accent-ink)',
                            marginBottom: 8,
                          }}
                        >
                          Poin Kunci yang Perlu Diingat:
                        </div>
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: 18,
                            color: 'var(--accent-ink)',
                            fontSize: 13.5,
                            lineHeight: 1.6,
                          }}
                        >
                          {selectedModule.keyTakeaways.map((point, pIdx) => (
                            <li key={pIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer Modal */}
                    <div
                      style={{
                        padding: '14px 24px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--raised)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedModules((prev) => ({
                            ...prev,
                            [selectedModule.id]: !prev[selectedModule.id],
                          }));
                          showToast(
                            completedModules[selectedModule.id]
                              ? 'Status modul diubah menjadi belum selesai.'
                              : 'Selamat! Anda telah menyelesaikan modul ini.'
                          );
                        }}
                        className={`btn ${
                          completedModules[selectedModule.id] ? 'pos' : 'cobalt'
                        }`}
                      >
                        <Check size={15} />
                        <span>
                          {completedModules[selectedModule.id]
                            ? 'Telah Selesai Dibaca'
                            : 'Tandai Selesai Dibaca'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedModule(null)}
                        className="btn primary"
                      >
                        Tutup Bacaan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* BOTTOM NAVIGATION BAR FOR MOBILE (HP & TAB) */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah">
        <button
          type="button"
          className={`mobile-bottom-nav-item ${
            activeTab === 'KUESIONER' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('KUESIONER')}
        >
          <div className="nav-icon-capsule">
            <FileText size={19} />
          </div>
          <span>Kuesioner</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${
            activeTab === 'VIDEO' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('VIDEO')}
        >
          <div className="nav-icon-capsule">
            <Video size={19} />
          </div>
          <span>Video Edukasi</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${
            activeTab === 'CHATBOT' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('CHATBOT')}
        >
          <div className="nav-icon-capsule">
            <MessageCircle size={19} />
          </div>
          <span>Chatbot AI</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${
            activeTab === 'MODUL' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('MODUL')}
        >
          <div className="nav-icon-capsule">
            <BookOpen size={19} />
          </div>
          <span>Modul</span>
        </button>
      </nav>

      {/* OVERLAY MODE SAMARAN (STEALTH PANIC SCREEN) */}
      {isStealthMode && (
        <div className="stealth-overlay" role="dialog" aria-modal="true" aria-label="Mode Samaran">
          <div className="stealth-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={20} color="var(--accent)" />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>Catatan Pembelajaran Daring Siswa</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>SMA Negeri 1 • Bab 7: Sistem Sirkulasi & Imunologi Manusia</div>
              </div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setIsStealthMode(false);
                showToast('Mode samaran ditutup. Melanjutkan sesi kuesioner.');
              }}
              style={{ fontSize: 12, height: 34, padding: '0 12px' }}
            >
              <X size={14} />
              <span>Kembali</span>
            </button>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
              1. Konsep Dasar Pertahanan Tubuh Spesifik
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)', marginBottom: 12 }}>
              Imunitas spesifik merupakan mekanisme pertahanan yang memiliki kemampuan untuk mengenali secara spesifik antigen patogen tertentu dan membentuk memori imunologis. Sistem ini terutama diperantarai oleh sel-sel limfosit.
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>
              Limfosit T (sel T) berkembang di timus dan berperan dalam respons imun seluler. Sel T CD4+ (T helper) mengoordinasikan respons imun melalui pelepasan sitokin, sedangkan sel T CD8+ (T sitotoksik) menghancurkan sel inang yang telah terinfeksi.
            </p>
          </div>

          <div className="panel">
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
              2. Pembentukan Antibodi oleh Sel Limfosit B
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
              Limfosit B berdiferensiasi menjadi sel plasma yang mensekresikan imunoglobulin (IgG, IgM, IgA, IgE, dan IgD). Ikatan antigen-antibodi akan menetralkan toksin, memicu aglutinasi, atau mengaktifkan kaskade komplemen untuk lisis sel target.
            </p>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 70,
            background: 'var(--text)',
            color: 'var(--surface)',
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Check size={16} color="var(--positive)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
