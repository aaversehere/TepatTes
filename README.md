# TepatTes — Aplikasi PWA JITAI-AI Skrining Mandiri HIV (HIVST) Remaja
*Adaptif | Aman | Mandiri*

Aplikasi Progressive Web App (PWA) berbahasa Indonesia untuk penelitian kuasi-eksperimen:
**"Efektivitas Real-Time Adaptive Intervention Berbasis Kecerdasan Buatan dengan Perlindungan Privasi terhadap Perilaku Pencegahan HIV pada Remaja"** (`N = 130`: `65` Kelompok Intervensi `X = 1`, `65` Kelompok Kontrol `X = 0`).

---

## 1. Fitur Utama & Prinsip Keselamatan

1. **Privacy-by-Design (UU PDP No. 27/2022)**:
   - Login berbasis **Token Pseudonim** (`ID-REMAJA-001` s/d `ID-REMAJA-130`) tanpa mencatat nama asli, NISN, nomor telepon, atau alamat.
   - **Explicit Digital Consent** yang memisahkan *Assent Remaja (15–17 tahun) + Parental Waiver* dari *Consent Dewasa Muda (18–19 tahun)* serta dipisahkan tegas dari persetujuan klinis tes HIV.
   - **Auto-Logout 3 Menit** tidak aktif, tombol **Mode Samaran 1-Klik** (mengubah layar menjadi catatan pelajaran Biologi), dan tombol **Hapus Cepat Riwayat Layar**.
   - **Enkripsi AES-256-GCM** pada penyimpanan pesan percakapan (`chat_messages`).
2. **Arsitektur Hibrida JITAI Dua Lapisan**:
   - **Lapisan 1 (Rule-Based Trigger Engine Deterministik)**: Mengevaluasi Micro-Check-In (`PR`, `PC`, `ST`, `SE`) dengan ambang skor `3.5` pada `DP1` (Hari 1: `1A`, `1B`, `1C`), `DP2` (Hari 4: `2A`, `2B`, `2C`, serta aturan konflik `2A+2B`), dan `DP3` (Hari 8: prioritas ketat `3B -> 3A -> 3C`).
   - **Lapisan 2 (Modul LLM Server-Side)**: Menggunakan OpenAI `gpt-4o-mini-2024-07-18` (`temperature = 0.25`, `top_p = 0.85`, `frequency_penalty = 0.20`, `max_tokens = 350`) dengan pengetahuan tertutup dari ringkasan terverifikasi WHO (2024a), Kepmenkes 90/2019, Permenkes 3/2026, dan spesifikasi teknis OraQuick® (`WHO PQDx 0159-055-00`).
3. **Lapisan Keselamatan Berlapis**:
   - **Local Regex PII Scrubber** (100% redaksi nama, nomor HP, NISN, medsos, alamat, nama sekolah sebelum ke API).
   - **Safety Classifier Rule-Based (`< 200 ms`)**: Mendeteksi indikator krisis atau hasil reaktif (`"muncul 2 garis"`) dan langsung melakukan **BYPASS LLM** ke pesan penenangan tervalidasi + tombol satu klik **Hubungi Konselor Rahasia PKPR**.
   - **Kill-Switch LLM** di Dasbor Admin Peneliti untuk menonaktifkan LLM seketika ke templat statis.
4. **5 Bar Navigasi Peserta yang Sederhana & Ramah Remaja**:
   - **1. Beranda & Check-In**: Timeline 10 hari, Micro-Check-In `< 60 detik`, konfirmasi penerimaan kit OraQuick®.
   - **2. Bar Video Edukasi**: 4 modul visual interaktif dengan bab & poin kunci.
   - **3. Bar Chatbot AI / Pusat Edukasi**: Menjawab seluruh pertanyaan siswa seputar HIV, cara penularan vs mitos, prosedur OraQuick®, *window period* 12 minggu, dan privasi.
   - **4. Panduan & Simulasi HIVST**: Simulator 4 langkah OraQuick®, timer waktu baca `20–40 menit`, dan simulator pembaca garis `C` & `T`.
   - **5. Kuesioner, Privasi & PKPR**: Kuesioner Pretest/Posttest 30 butir (placeholder siap ganti), 3 jalur Active Linkage (Reaktif, Nonreaktif, Invalid), dan hak subjek data.

---

## 2. Cara Menjalankan di Lokal

```bash
# 1. Instal dependensi
npm install

# 2. Jalankan pengujian unit & 45 skenario Red-Teaming
npm test

# 3. Jalankan server pengembangan Next.js
npm run dev
```

Buka `http://localhost:3000` di browser.

---

## 3. Cara Menghubungkan ke Supabase PostgreSQL

1. Buat proyek baru di Supabase dan buka menu **SQL Editor**.
2. Salin dan jalankan seluruh isi file [`supabase/migration.sql`](file:///d:/Data%20Azm/Matkul%20Kampus/SKRIPSI/APK/APK%20JADI/supabase/migration.sql) untuk membuat seluruh tabel (`participants`, `questionnaire_responses`, `checkins`, `decision_events`, `chat_messages`, `linkage_requests`, `kit_status`, `audit_log`).
3. Isi variabel `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `OPENAI_API_KEY` pada file `.env`.
4. Bila `.env` belum diisi kredensial cloud, aplikasi otomatis menggunakan penyimpanan persisten lokal (`data/senyap-store.json`) yang sudah terisi seed kohort `N = 130` (`ID-REMAJA-001` s/d `ID-REMAJA-130`).

---

## 4. Cara Mengganti Butir Kuesioner (30 Butir)

Seluruh 30 butir placeholder (`PT1–PT8`, `SE1–SE8`, `INT1–INT6`, `HS1–HS8`) dan 5 kovariat tersimpan rapi di:
- [`src/config/questionnaire.seed.json`](file:///d:/Data%20Azm/Matkul%20Kampus/SKRIPSI/APK/APK%20JADI/src/config/questionnaire.seed.json)

Anda cukup mengubah teks `"text"` pada masing-masing kode butir di file JSON tersebut ketika instrumen final Anda sudah siap.
