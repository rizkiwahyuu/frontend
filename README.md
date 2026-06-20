# Infranexia FiberOps Frontend

Infranexia FiberOps Frontend adalah aplikasi web berbasis React untuk monitoring aset, gangguan, pekerjaan lapangan, laporan operator, dan analisis operasional jaringan fiber optik.

Project ini dibuat sebagai antarmuka utama untuk sistem informasi operasional jaringan fiber optik. Aplikasi ini terhubung dengan backend Laravel API dan menampilkan data dalam bentuk dashboard, tabel, peta interaktif, grafik, dan laporan.

## Daftar Isi

* [Tentang Project](#tentang-project)
* [Fitur Utama](#fitur-utama)
* [Tech Stack](#tech-stack)
* [Requirement](#requirement)
* [Struktur Folder](#struktur-folder)
* [Instalasi Local](#instalasi-local)
* [Konfigurasi Environment](#konfigurasi-environment)
* [Menjalankan Project](#menjalankan-project)
* [Integrasi Backend](#integrasi-backend)
* [Role Pengguna](#role-pengguna)
* [Halaman Aplikasi](#halaman-aplikasi)
* [Data Geospasial](#data-geospasial)
* [Build Production](#build-production)
* [Deployment](#deployment)
* [Deployment ke Vercel](#deployment-ke-vercel)
* [Catatan Keamanan](#catatan-keamanan)
* [Rencana Pengembangan](#rencana-pengembangan)
* [Author](#author)
* [License](#license)

## Tentang Project

Infranexia FiberOps adalah aplikasi frontend untuk membantu proses monitoring dan manajemen operasional jaringan fiber optik.

Aplikasi ini membantu admin dan operator lapangan dalam:

* Melihat kondisi aset jaringan.
* Memantau gangguan aktif.
* Mengelola data aset fiber optik.
* Mengelola pekerjaan lapangan.
* Membuat dan memvalidasi laporan operator.
* Melihat peta aset dan gangguan.
* Melihat grafik analisis operasional.
* Mengekspor data untuk kebutuhan laporan.

Frontend ini menggunakan arsitektur Single Page Application. Routing aplikasi berjalan di sisi client menggunakan React Router.

## Fitur Utama

### 1. Authentication

* Login menggunakan email dan password.
* Session user disimpan di local storage.
* Redirect otomatis jika user belum login.
* Proteksi route untuk halaman internal.
* Proteksi khusus untuk halaman admin.

### 2. Dashboard Operasional

* Ringkasan total aset.
* Ringkasan gangguan aktif.
* Ringkasan tugas lapangan.
* Ringkasan laporan operator.
* Aktivitas terbaru.
* Visualisasi data operasional.

### 3. Map Monitoring

* Peta interaktif berbasis Leaflet.
* Menampilkan titik aset jaringan.
* Menampilkan gangguan aktif.
* Menampilkan tugas lapangan aktif.
* Filter berdasarkan region, status, dan tipe aset.
* Mendukung data GeoJSON di folder public.

### 4. Asset Management

* Melihat daftar aset.
* Melihat detail aset.
* Filter aset berdasarkan keyword, region, tipe aset, dan status.
* Menambah data aset.
* Mengubah data aset.
* Menghapus data aset.
* Mencatat aktivitas perubahan aset.

### 5. Disturbance Management

* Melihat daftar gangguan.
* Melihat detail gangguan.
* Memantau gangguan berdasarkan status dan region.
* Mendukung pencatatan gangguan aktif.
* Mendukung proses tindak lanjut gangguan.

### 6. Field Task Management

* Mengelola tugas pekerjaan lapangan.
* Menampilkan tugas berdasarkan status, prioritas, region, dan operator.
* Operator hanya melihat tugas yang ditugaskan kepadanya.
* Admin dapat membuat dan memperbarui tugas.
* Status tugas mendukung draft, assigned, on progress, waiting validation, completed, dan rejected.

### 7. Field Report

* Operator dapat membuat laporan pekerjaan lapangan.
* Admin dapat menyetujui atau menolak laporan.
* Laporan dapat terhubung dengan tugas dan gangguan.
* Status laporan mendukung submitted, approved, dan rejected.

### 8. Analytics

* Analisis temporal gangguan.
* Analisis tren operasional.
* Grafik untuk membantu evaluasi kondisi jaringan.
* Halaman analytics hanya dapat diakses admin.

### 9. Risk Priority

* Menampilkan prioritas penanganan gangguan atau pekerjaan.
* Membantu admin menentukan pekerjaan dengan risiko lebih tinggi.
* Halaman risk priority hanya dapat diakses admin.

### 10. User Management

* Admin dapat melihat daftar user.
* Admin dapat menambah user.
* Admin dapat mengubah user.
* Admin dapat mengaktifkan atau menonaktifkan user.
* Mendukung role admin dan operator.

### 11. Export Report

* Export data aset.
* Export data gangguan.
* Export data tugas lapangan.
* Export data laporan operator.
* Export data user.
* Export data activity log.
* Format export menggunakan CSV.

### 12. Activity Log

* Menampilkan riwayat aktivitas sistem.
* Mencatat aktivitas penting seperti tambah aset, update user, submit laporan, approve laporan, dan reject laporan.

## Tech Stack

| Kategori         | Teknologi                     |
| ---------------- | ----------------------------- |
| Frontend Library | React 18                      |
| Build Tool       | Vite                          |
| Routing          | React Router DOM              |
| State Management | Zustand                       |
| Styling          | Tailwind CSS                  |
| Chart            | Chart.js dan React Chart.js 2 |
| Map              | Leaflet dan React Leaflet     |
| Form             | React Hook Form               |
| Validation       | Zod                           |
| Icon             | Lucide React                  |
| Package Manager  | npm                           |
| Deployment       | Vercel                        |

## Requirement

Pastikan perangkat sudah memiliki:

* Node.js 20 atau lebih baru.
* npm.
* Git.
* Backend Laravel API sudah berjalan.

Cek versi:

```bash
node -v
npm -v
git --version
```

## Struktur Folder

Struktur utama project:

```text
frontend/
├── public/
│   └── data/
│       ├── komdigi-fiber-surabaya.geojson
│       └── regions-7-mainland.geojson
├── src/
│   ├── app/
│   │   ├── queryClient.js
│   │   └── routes.jsx
│   ├── components/
│   │   ├── charts/
│   │   ├── layout/
│   │   ├── map/
│   │   └── ui/
│   ├── pages/
│   │   ├── analytics/
│   │   ├── assets/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── disturbances/
│   │   ├── export/
│   │   ├── map/
│   │   ├── pruning/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── users/
│   ├── services/
│   │   ├── activityService.js
│   │   ├── api.js
│   │   ├── assetService.js
│   │   ├── authService.js
│   │   ├── exportService.js
│   │   ├── mapService.js
│   │   ├── pruningService.js
│   │   ├── reportService.js
│   │   └── userService.js
│   ├── stores/
│   │   └── authStore.js
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── prd.md
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## Instalasi Local

Clone repository:

```bash
git clone https://github.com/rizkiwahyuu/frontend.git
cd frontend
```

Install dependency:

```bash
npm install
```

Buat file environment:

```bash
cp .env.example .env
```

Jika file `.env.example` belum ada, buat manual file `.env` di root project.

## Konfigurasi Environment

Contoh konfigurasi `.env`:

```env
VITE_API_URL=http://127.0.0.1:8001/api
```

Jika backend Laravel berjalan di port 8000, gunakan:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Jika backend sudah online, gunakan URL production:

```env
VITE_API_URL=https://domain-backend-kamu.com/api
```

Catatan:

* Semua environment variable Vite harus diawali dengan `VITE_`.
* Jangan simpan credential rahasia di frontend.
* Frontend dapat dibaca oleh browser, jadi semua variable di frontend bersifat public.

## Menjalankan Project

Jalankan development server:

```bash
npm run dev
```

Default port pada project ini:

```text
http://localhost:3000
```

Buka browser, lalu akses:

```text
http://localhost:3000
```

## Integrasi Backend

Frontend ini terhubung ke backend Laravel melalui `VITE_API_URL`.

Endpoint backend yang digunakan:

| Modul         | Endpoint Backend     |
| ------------- | -------------------- |
| Login         | `/api/login`         |
| Users         | `/api/users`         |
| Assets        | `/api/assets`        |
| Disturbances  | `/api/disturbances`  |
| Field Tasks   | `/api/pruning-tasks` |
| Field Reports | `/api/field-reports` |
| Activity Logs | `/api/activity-logs` |

Pastikan backend sudah berjalan sebelum membuka frontend.

Contoh menjalankan backend Laravel:

```bash
php artisan serve --port=8001
```

Jika backend berjalan di port 8001, maka `.env` frontend harus berisi:

```env
VITE_API_URL=http://127.0.0.1:8001/api
```

Jika muncul pesan:

```text
Backend belum bisa diakses
```

Periksa hal berikut:

* Backend Laravel sudah berjalan.
* URL pada `VITE_API_URL` sudah benar.
* CORS backend sudah mengizinkan akses dari frontend.
* Database backend sudah dimigrasi dan diisi seeder.
* Port backend tidak bentrok dengan service lain.

## Role Pengguna

Aplikasi ini mendukung dua role utama.

### Admin

Admin dapat:

* Melihat dashboard.
* Melihat peta monitoring.
* Mengelola aset.
* Mengelola gangguan.
* Mengelola tugas lapangan.
* Memvalidasi laporan.
* Mengakses analytics.
* Mengakses risk priority.
* Mengelola user.
* Mengekspor data.
* Melihat settings.

### Operator

Operator dapat:

* Login ke aplikasi.
* Melihat dashboard sesuai data yang relevan.
* Melihat peta monitoring.
* Melihat tugas yang ditugaskan.
* Membuat laporan pekerjaan.
* Melihat status laporan.
* Mengakses settings.

Halaman khusus admin:

* Analytics.
* Risk Priority.
* User Management.
* Export Report.

## Halaman Aplikasi

| Route               | Halaman               | Akses              |
| ------------------- | --------------------- | ------------------ |
| `/login`            | Login Page            | Public             |
| `/`                 | Dashboard             | Admin dan Operator |
| `/map`              | Map Monitoring        | Admin dan Operator |
| `/assets`           | Asset List            | Admin dan Operator |
| `/assets/:id`       | Asset Detail          | Admin dan Operator |
| `/disturbances`     | Disturbance List      | Admin dan Operator |
| `/disturbances/:id` | Disturbance Detail    | Admin dan Operator |
| `/pruning`          | Field Task Management | Admin dan Operator |
| `/reports`          | Field Report          | Admin dan Operator |
| `/analytics`        | Temporal Analysis     | Admin              |
| `/risk`             | Risk Priority         | Admin              |
| `/users`            | User Management       | Admin              |
| `/export`           | Export Report         | Admin              |
| `/settings`         | Settings              | Admin dan Operator |

## Data Geospasial

Project ini menyimpan data GeoJSON pada folder:

```text
public/data/
```

File GeoJSON yang tersedia:

```text
komdigi-fiber-surabaya.geojson
regions-7-mainland.geojson
```

Data ini dapat digunakan untuk:

* Layer batas wilayah.
* Layer jaringan fiber.
* Layer area monitoring.
* Visualisasi peta berbasis Leaflet.

Pastikan file GeoJSON tetap berada di folder `public/data` agar dapat diakses langsung oleh aplikasi.

## Build Production

Jalankan build production:

```bash
npm run build
```

Hasil build akan masuk ke folder:

```text
dist/
```

Cek hasil build secara local:

```bash
npm run preview
```

Default preview akan berjalan pada URL yang ditampilkan oleh Vite.

## Deployment

Langkah umum deployment frontend:

1. Pastikan backend Laravel sudah online.
2. Pastikan API backend dapat diakses.
3. Set environment variable production:

```env
VITE_API_URL=https://domain-backend-kamu.com/api
```

4. Install dependency:

```bash
npm install
```

5. Build project:

```bash
npm run build
```

6. Upload folder `dist` ke hosting static.

Hosting yang bisa digunakan:

* Vercel.
* Netlify.
* Firebase Hosting.
* Cloudflare Pages.
* VPS dengan Nginx.
* Shared hosting yang mendukung static file.

## Deployment ke Vercel

Project ini sudah memiliki file `vercel.json` untuk mendukung routing SPA.

Isi konfigurasi:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Langkah deployment:

1. Push project ke GitHub.
2. Buka Vercel.
3. Import repository frontend.
4. Pilih framework preset `Vite`.
5. Set build command:

```bash
npm run build
```

6. Set output directory:

```text
dist
```

7. Tambahkan environment variable:

```env
VITE_API_URL=https://domain-backend-kamu.com/api
```

8. Deploy project.

Setelah deployment selesai, uji halaman berikut:

```text
/login
/
/map
/assets
/disturbances
/reports
```

Jika refresh route selain `/` menyebabkan error 404, pastikan `vercel.json` sudah terbaca.

## Catatan Keamanan

Perhatikan beberapa hal berikut sebelum production:

* Jangan commit file `.env` ke repository public.
* Gunakan `.env.example` sebagai template.
* Jangan simpan password asli di frontend.
* Jangan simpan token rahasia di frontend.
* Gunakan HTTPS untuk frontend dan backend.
* Pastikan backend memiliki CORS yang sesuai.
* Pastikan backend memiliki validasi dan middleware role.
* Gunakan autentikasi token yang aman pada backend.
* Hindari menyimpan data sensitif di local storage.
* Gunakan akun demo hanya untuk development.

Rekomendasi `.gitignore`:

```gitignore
.env
.env.local
.env.production
dist/
node_modules/
```

Contoh `.env.example`:

```env
VITE_API_URL=http://127.0.0.1:8001/api
```

## Rencana Pengembangan

Beberapa pengembangan yang dapat ditambahkan:

* Integrasi token Laravel Sanctum.
* Middleware frontend untuk role yang lebih detail.
* Refresh token atau session timeout.
* Upload foto dokumentasi laporan.
* Export Excel selain CSV.
* Filter peta berdasarkan waktu.
* Layer peta tambahan untuk wilayah operasional.
* Notifikasi laporan baru untuk admin.
* Notifikasi tugas baru untuk operator.
* Dark mode.
* Unit testing dengan Vitest.
* End to end testing dengan Playwright.
* Dokumentasi API dengan Swagger pada backend.
* Optimasi state management untuk data besar.
* Pagination dan server side filter.
* Integrasi PostGIS untuk query spasial lebih akurat.

## Author

Rizki Wahyu Widodo

* GitHub: rizkiwahyuu
* Project: Infranexia FiberOps Frontend
* Fokus: Sistem Informasi Geospasial Aset, Gangguan, dan Operasional Jaringan Fiber Optik

## License

Sesuaikan bagian license dengan kebutuhan repository.
