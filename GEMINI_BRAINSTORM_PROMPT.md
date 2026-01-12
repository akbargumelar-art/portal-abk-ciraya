# Portal ABK Ciraya - Prompt untuk Brainstorming dengan Gemini AI

Gunakan prompt ini untuk berdiskusi dan brainstorm fitur/improvement aplikasi dengan Gemini AI.

---

## PROMPT:

```
Saya sedang mengembangkan aplikasi web bernama "Portal Cirebon Raya" untuk PT Agrabudi Komunika, sebuah perusahaan distributor produk telekomunikasi Telkomsel. Berikut detail aplikasi saya:

## 🏢 TENTANG PERUSAHAAN & BISNIS

PT Agrabudi Komunika adalah distributor resmi Telkomsel yang mengelola:
- **Kartu Perdana (SIM Cards)** - berbagai paket starter pack
- **Voucher Fisik** - voucher pulsa dalam bentuk fisik
- **Produk Digital via Digipos** - aplikasi POS digital Telkomsel

Perusahaan memiliki struktur penjualan:
- Manager → Supervisor IDS/D2C → Salesforce → Outlet
- Area coverage: Cirebon Raya (beberapa kabupaten/kota)

## 🛠️ TECH STACK

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **Export**: XLSX untuk export Excel
- **State**: React Context API

## 👥 USER ROLES

1. **Admin Super** - Full access, manage users, settings
2. **Manager** - View all data, reports, KPI
3. **Supervisor IDS** - Manage IDS salesforce team
4. **Supervisor D2C** - Manage D2C (Direct to Customer) team
5. **Salesforce** - Field sales, visit outlets, input data
6. **Direct Sales** - D2C field team

## 📱 FITUR YANG SUDAH ADA

### Dashboard
- KPI Cards: Total Sales, Active Outlets, Digipos Transactions, Sell-out Qty
- Chart: Outlet Distribution per PJP, 6-Month Sales Trend
- Summary: Outlet Status, PJP Status, Digipos Status

### Menu Outlet (Collapsible)
- Outlet Register - Daftar outlet dengan filter & search
- Stock Perdana - Inventory kartu perdana per outlet
- Stock Voucher - Inventory voucher per outlet  
- Omzet Outlet - Revenue per outlet

### Menu Sales Plan (Collapsible)
- Perdana - Target vs actual kartu perdana
- Voucher Fisik - Target vs actual voucher
- CVM - Customer Value Management program
- Monitoring Visit - Track kunjungan salesforce

### Menu Sell Thru (Collapsible)
- ST Nota - Sell thru berdasarkan nota
- ST Digipos - Sell thru dari transaksi Digipos
- Penjualan D2C - Penjualan direct to customer

### Menu Performansi (Collapsible)
- Performansi SF - Performance salesforce
- Performansi Outlet - Performance per outlet

### Menu KPI (Collapsible)
- KPI SF - Key Performance Indicator salesforce
- KPI Outlet - KPI per outlet

### Menu Program (Collapsible)
- SCS - Sales Competition System
- Retina - Retention Incentive program

### Menu Fee / Komisi (Collapsible)
- Fee SF - Komisi salesforce
- Fee Outlet - Komisi outlet

### Menu Data Upload (Collapsible)
- Upload Sales - Import data penjualan
- Upload Inventory - Import data stok

### Menu Dokumentasi (Collapsible)
- User Manual - Panduan penggunaan
- Video Tutorial - Tutorial video

### Fitur Lainnya
- Looker Reports - Embed Looker Studio dashboard
- Links - Shortcut ke aplikasi eksternal
- User Management - Kelola user
- Settings - Pengaturan aplikasi
- Complaint - Form komplain
- POP Monitoring - Point of Purchase material tracking

## 🎨 UI/UX FEATURES

- Collapsible sidebar dengan hover popup saat collapsed
- Responsive design (mobile-first)
- Role-based navigation
- Demo login (quick login untuk testing)
- Modern design dengan gradients dan shadows
- Toast notifications
- Loading states dengan skeleton

## 💾 DATA MODEL

```typescript
// Core entities
- User (id, name, username, role, tap, etc.)
- Outlet (id, name, rsNumber, address, kabupaten, tap, salesforce, status, etc.)
- StockItem (productType, stockM, targetM, sellOut, etc.)
- Transaction (perdanaSales, voucherSales, digiposTrx, omzet)
- SalesPlan (category, targetM, actualM, achievement)
- Visit (outletId, photos, notes, issues, status)
- KPISummary, OmzetData, TAPSummary, SalesforceSummary
```

## 🚧 STATUS SAAT INI

- Frontend sudah 80% selesai dengan mock data
- Belum ada backend/database (masih menggunakan data dummy)
- Beberapa halaman masih placeholder "Sedang Dalam Pengerjaan"

## ❓ YANG INGIN SAYA DISKUSIKAN

1. **Fitur prioritas** - Fitur mana yang paling penting untuk dikembangkan lebih dulu?

2. **Backend Architecture** - Bagaimana sebaiknya arsitektur backend? (Node.js/Express, database MySQL/PostgreSQL, REST API vs GraphQL)

3. **Real-time Features** - Apakah perlu real-time updates untuk tracking visit atau sales?

4. **Mobile App** - Apakah perlu mobile app terpisah untuk salesforce di lapangan atau PWA cukup?

5. **Integration** - Bagaimana cara integrate dengan:
   - Digipos API (jika tersedia)
   - GPS/Location tracking untuk visit
   - Photo upload untuk bukti kunjungan
   - WhatsApp untuk notifikasi

6. **Reporting** - Report apa saja yang paling critical untuk management?

7. **Security** - Best practices untuk role-based access dan data security?

8. **Performance** - Bagaimana handle large data (ribuan outlet, jutaan transaksi)?

9. **Offline Support** - Apakah perlu offline capability untuk salesforce di area dengan sinyal buruk?

10. **Gamification** - Ide untuk membuat salesforce lebih engaged? (leaderboard, badges, rewards)

Tolong bantu saya brainstorm dan berikan rekomendasi untuk mengembangkan aplikasi ini lebih lanjut!
```

---

## TIPS PENGGUNAAN

1. **Copy paste** prompt di atas ke Gemini AI
2. Gemini akan memberikan analisis dan rekomendasi
3. Tanyakan follow-up questions sesuai kebutuhan
4. Fokus pada 1-2 topik per sesi untuk diskusi yang lebih mendalam

## CONTOH FOLLOW-UP QUESTIONS

- "Jelaskan lebih detail tentang arsitektur backend yang kamu rekomendasikan"
- "Bagaimana implementasi offline-first untuk PWA?"
- "Buatkan database schema untuk entity Outlet dan Transaction"
- "Apa best practice untuk real-time dashboard updates?"
- "Bagaimana cara implement gamification yang efektif untuk sales team?"
