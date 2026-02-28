-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 28 Feb 2026 pada 01.01
-- Versi server: 10.11.13-MariaDB-0ubuntu0.24.04.1
-- Versi PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kas_grup`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `bot_commands`
--

CREATE TABLE `bot_commands` (
  `id` int(11) NOT NULL,
  `command` varchar(255) NOT NULL,
  `response` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bot_commands`
--

INSERT INTO `bot_commands` (`id`, `command`, `response`, `created_at`) VALUES
(3, '/ipphone', '**📞 TUTOR SETTING IP PHONE – DIVATEL**\r\n\r\n**1️⃣ Pastikan browser bisa akses Divatel**\r\nBuka:\r\n👉 https://172.16.1.82:9527\r\n\r\nLogin:\r\n```\r\nUser : admin\r\nPass : 123admin\r\n```\r\n\r\n---\r\n\r\n**2️⃣ Buka data extension**\r\nBuka link:\r\n\r\n```\r\nhttps://172.16.1.82:9527/config.php?display=extensions&extdisplay=4008\r\n```\r\n\r\n➡ Klik **List Extension**\r\n➡ Pilih **ext** yang mau disetting\r\n➡ Ubah **Permit** sesuai VLAN \r\ncontoh : ip ipphone 10.55.1.15\r\nsetting permitnya jadi : 10.55.1.0/24\r\n➡ Klik **Apply** → **Save**\r\n\r\n---\r\n\r\n**3️⃣ Masuk ke Remote IP Phone**\r\nBuka IP address yang didapat IP Phone di browser\r\nLogin: http://10.55.1.15 (contoh)\r\n\r\n```\r\nUser : admin\r\nPassword : (password yang tadi dibuat di IP phone)\r\n```\r\n\r\n---\r\n\r\n**4️⃣ Setting SIP Account**\r\nMasuk ke tab **Account**, lalu isi:\r\n\r\n```\r\nLine Active      : Enabled\r\nRegister Name   : (nomor ext)\r\nUsername        : (nomor ext)\r\nPassword        : Ln5GQH4n6b1\r\nSIP Server 1    : 172.16.1.82\r\nPort            : 48581\r\n```\r\n\r\n➡ Klik **Confirm / Save**', '2026-01-13 18:23:58'),
(4, '/listcmd', '*/ipphone* → Tutorial setting Ipphone\r\n*/cekkas* → Cek kas bulan berjalan (total & yang sudah bayar)\r\n*/historykas* → Lihat semua riwayat kas\r\n*/rekapbulan MM-YYYY* → Rekap kas per bulan (contoh: /rekapbulan 01-2026)\r\n*/tambahkas nama jumlah* → Tambah kas\r\nContoh: /tambahkas Ridwan 10000\r\n*/kurangikas keperluan jumlah* → Kurangi kas\r\nContoh: /kurangikas Snack 5000\r\n*/hapus_kas id* → Hapus data kas\r\nContoh: /hapus_kas 69\r\n*/sticker* → Ubah gambar jadi sticker\r\n(Kirim gambar dengan caption /sticker atau reply gambar lalu ketik /sticker)\r\n*/previewpanel* Cara fix preview file tidak muncul', '2026-01-13 18:50:32'),
(5, '/previewpanel', 'Preview Panel Windows 11 Tidak Tampil\r\n\r\nTambahkan Lokasi ke Trusted Sites (Jaringan)\r\n\r\n1. Buka Control Panel > Internet Options.\r\n2. Pilih tab Security > Local intranet.\r\n3. Klik Sites > Advanced.\r\n4. Tambahkan jalur server jaringan Anda (misal: ) dan klik Add.\r\n5. OK', '2026-02-25 10:48:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kas`
--

CREATE TABLE `kas` (
  `id` int(11) NOT NULL,
  `nomor` varchar(25) DEFAULT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `tanggal` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kas`
--

INSERT INTO `kas` (`id`, `nomor`, `nama`, `jumlah`, `tanggal`) VALUES
(7, '138031977787564@lid', 'anjas', 5000, '2026-01-08 20:22:44'),
(8, '138031977787564@lid', 'edo', 5000, '2026-01-08 20:22:54'),
(9, '138031977787564@lid', 'ardian', 5000, '2026-01-08 20:23:12'),
(10, '138031977787564@lid', 'adit', 5000, '2026-01-08 20:23:22'),
(11, '138031977787564@lid', 'adhi', 5000, '2026-01-08 20:23:32'),
(12, '138031977787564@lid', 'joni', 5000, '2026-01-08 20:23:41'),
(13, '138031977787564@lid', 'ridwan', 5000, '2026-01-08 20:23:47'),
(14, '138031977787564@lid', 'dony', 5000, '2026-01-08 20:24:03'),
(15, '138031977787564@lid', 'adi_admin', 5000, '2026-01-08 20:24:17'),
(16, '138031977787564@lid', 'adji', 5000, '2026-01-08 20:24:29'),
(17, '138031977787564@lid', 'rama', 5000, '2026-01-08 20:24:37'),
(18, '138031977787564@lid', 'farizky', 5000, '2026-01-08 20:24:43'),
(19, '138031977787564@lid', 'nugroho', 5000, '2026-01-08 20:24:52'),
(20, '138031977787564@lid', 'akbar', 5000, '2026-01-08 20:24:58'),
(25, 'web', 'lainlain', 1740000, '2026-01-08 20:42:40'),
(28, '138031977787564@lid', 'galon', -43000, '2026-01-14 08:41:11'),
(29, '125932870344917@lid', 'Edo', 150, '2026-01-19 08:32:59'),
(30, '125932870344917@lid', 'salahinput', -150, '2026-01-19 08:43:08'),
(31, '125932870344917@lid', 'Edo', 150000, '2026-01-19 08:44:04'),
(32, '138031977787564@lid', 'cempemanis', -787500, '2026-02-14 13:36:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `status`, `role`) VALUES
(1, 'teknisi', '$2y$12$KiDkgUPX6Y408ztkjNshde1VeNJuI7hC5YRYHdy/Jd7ltBolSigke', '2026-01-13 17:44:06', 'approved', 'user'),
(2, 'admin', '$2y$12$eb9ikCHJHuYDYtb4r2J1Reof3g9xyekio7hRt3EDGqW7p7rOlXJcW', '2026-01-13 17:52:16', 'approved', 'admin'),
(3, 'mhafidz', '$2y$10$76FyWIhqRFdP9XUE5Tn8qu9IpzfeF9oBWBH6SFAzXqesTyKmhHAm2', '2026-01-20 14:38:27', 'rejected', 'user');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bot_commands`
--
ALTER TABLE `bot_commands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `command` (`command`);

--
-- Indeks untuk tabel `kas`
--
ALTER TABLE `kas`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bot_commands`
--
ALTER TABLE `bot_commands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `kas`
--
ALTER TABLE `kas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
