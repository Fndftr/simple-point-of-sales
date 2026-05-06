# Simple Point of Sales

Aplikasi **Point of Sale (POS)** sederhana berbasis **Express.js** dengan pola **MVC** (Model-View-Controller).

## Fitur

- 📊 **Dashboard** – ringkasan transaksi, pendapatan hari ini, dan aksi cepat
- 📦 **Manajemen Produk** – tambah, edit, hapus produk; kelola stok & kategori
- 🛒 **Kasir (POS)** – pilih produk, keranjang belanja berbasis sesi, proses pembayaran & kembalian
- 🧾 **Riwayat Transaksi** – daftar semua transaksi beserta detail item

## Teknologi

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Express.js |
| Template Engine | EJS |
| Database | SQLite (via `better-sqlite3`) |
| Styling | Bootstrap 5 |
| Session | `express-session` |
| Method Override | `method-override` |

## Struktur Proyek (MVC)

```
simple-point-of-sales/
├── app.js                  # Entry point aplikasi
├── seed.js                 # Script untuk mengisi data awal
├── config/
│   └── database.js         # Koneksi & inisialisasi SQLite
├── models/
│   ├── Product.js          # Model produk
│   └── Transaction.js      # Model transaksi
├── controllers/
│   ├── dashboardController.js
│   ├── productController.js
│   └── transactionController.js
├── routes/
│   ├── dashboard.js
│   ├── products.js
│   └── transactions.js
├── views/
│   ├── dashboard.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── products/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   └── edit.ejs
│   └── transactions/
│       ├── pos.ejs
│       ├── index.ejs
│       └── show.ejs
└── public/
    ├── css/style.css
    └── js/app.js
```

## Cara Menjalankan

### 1. Install dependensi

```bash
npm install
```

### 2. Isi data produk awal (opsional)

```bash
node seed.js
```

### 3. Jalankan aplikasi

```bash
npm start
```

Buka browser di **http://localhost:3000**

## Halaman Utama

| URL | Halaman |
|-----|---------|
| `/` | Dashboard |
| `/products` | Daftar Produk |
| `/products/create` | Tambah Produk |
| `/pos` | Kasir / Transaksi Baru |
| `/transactions` | Riwayat Transaksi |
