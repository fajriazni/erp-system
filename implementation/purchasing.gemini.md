Modul *Purchasing* (Pembelian) adalah salah satu komponen paling kritis dalam ERP karena mengatur arus keluar uang perusahaan dan ketersediaan stok operasional. Aplikasi yang "lengkap" tidak hanya mencatat pembelian, tetapi juga mengontrol anggaran, kualitas vendor, dan akurasi stok.

Berikut adalah gambaran detail fitur lengkap yang sebaiknya ada pada modul Purchasing, dikelompokkan berdasarkan fungsinya:

### 1. Master Data & Manajemen Vendor (Supplier)

Sebelum transaksi terjadi, data induk harus kuat.

* **Vendor Master Data:** Menyimpan detail kontak, NPWP, syarat pembayaran (Term of Payment), mata uang default, dan kategori vendor (misal: Raw Material, Jasa, Aset).
* **Vendor Pricelist & History:** Menyimpan riwayat harga beli per item dari setiap vendor. Fitur ini memungkinkan sistem otomatis menyarankan vendor dengan harga termurah saat membuat PO.
* **Vendor Rating/Scorecard:** Fitur otomatis untuk menilai kinerja vendor berdasarkan ketepatan waktu pengiriman, kualitas barang (tingkat retur), dan kelengkapan dokumen.

### 2. Alur Transaksi Utama (Core Workflow)

Ini adalah siklus hidup pembelian standar (*Procure-to-Pay*).

#### A. Purchase Request (PR) - Permintaan Pembelian

* **Internal Request:** Form bagi karyawan/departemen lain untuk meminta barang.
* **Budget Checking (Encumbrance):** Sistem otomatis mengecek apakah departemen tersebut masih memiliki sisa anggaran (budget) untuk melakukan pembelian ini. Jika tidak, PR otomatis ditahan/ditolak.

#### B. Request for Quotation (RFQ) / Tender

* **Multi-Vendor Request:** Mengirim satu permintaan penawaran ke beberapa vendor sekaligus via email langsung dari sistem.
* **Bid Comparison (Perbandingan Harga):** Fitur tabel perbandingan otomatis (Side-by-side comparison) antara penawaran vendor A, B, dan C untuk memudahkan user memilih yang terbaik.

#### C. Purchase Order (PO) - Pesanan Pembelian

* **PO Creation:** Konversi otomatis dari PR atau RFQ yang disetujui menjadi PO.
* **Blanket Order / Frame Contract:** Fitur untuk kontrak jangka panjang (misal: beli 1000 ton pengiriman bertahap selama 1 tahun) dengan harga yang dikunci.
* **Approval Matrix:** Workflow persetujuan bertingkat (misal: < 10 juta oleh Manager, > 10 juta oleh Direktur).

#### D. Goods Receipt Note (GRN) / Penerimaan Barang

* **QC Integration:** Integrasi dengan modul Quality Control. Barang masuk ke status "Quarantine" dulu sebelum masuk stok "Available" jika perlu pemeriksaan.
* **Partial Delivery:** Kemampuan menangani pengiriman parsial (Vendor mengirim 50% dulu, sisanya menyusul). Sistem harus melacak sisa *Backorder*.
* **Barcode/QR Scanning:** Penerimaan barang menggunakan scanner untuk akurasi.

#### E. Vendor Bill / Invoicing

* **3-Way Matching:** Ini fitur **paling krusial**. Sistem otomatis mencocokkan data antara:
1. **PO** (Apa yang dipesan & harganya)
2. **GRN** (Apa yang benar-benar diterima)
3. **Invoice** (Apa yang ditagihkan vendor)
*Jika ada selisih (misal: tagihan lebih mahal dari PO, atau jumlah barang di tagihan lebih banyak dari yang diterima), sistem otomatis memblokir pembayaran.*



### 3. Fitur Lanjutan & Spesifik (Advanced Features)

* **Landed Cost (Biaya Pendaratan):**
Kemampuan menghitung HPP (Harga Pokok Penjualan) secara akurat dengan membebankan biaya tambahan (Ongkir, Bea Masuk, Asuransi) ke harga barang.
* *Contoh:* Beli barang seharga Rp1.000 + Ongkir Rp100. Sistem mencatat nilai persediaan barang tersebut adalah Rp1.100, bukan Rp1.000.


* **Dropshipping:**
Fitur membuat PO otomatis ke vendor untuk dikirimkan langsung ke pelanggan anda (tanpa masuk ke gudang anda).
* **Reordering Rules (Min/Max Stock):**
Sistem otomatis membuat draf RFQ/PO ketika stok barang di gudang menyentuh batas minimum (*Safety Stock*).
* **Vendor Portal:**
Halaman web khusus untuk vendor login. Di sini vendor bisa melihat status PO, mengupload invoice sendiri, dan melihat jadwal pembayaran.

### 4. Integrasi Modul

Modul purchasing tidak berdiri sendiri:

* **Ke Inventory:** Update stok fisik saat GRN.
* **Ke Accounting:**
* Saat terima barang (GRN): Debit Persediaan, Kredit Utang Belum Ditagih (GRNI).
* Saat terima tagihan (Bill): Debit Utang Belum Ditagih, Kredit Utang Dagang (AP).


* **Ke Manufacturing:** PO otomatis terbentuk berdasarkan kebutuhan bahan baku produksi (*Material Requirements Planning* / MRP).

### 5. Laporan & Analisa (Reporting)

* **Laporan Pembelian per Vendor/Barang:** Analisa tren belanja.
* **Aging Report:** Umur utang ke vendor (mana yang jatuh tempo).
* **Open PO Report:** Daftar pesanan yang belum dikirim vendor (untuk *follow-up*).
* **Purchase Price Variance (PPV):** Laporan selisih harga beli standar vs harga beli aktual.

### Langkah Selanjutnya

Untuk tahap awal pengembangan, apakah Anda ingin fokus membangun **alur transaksinya dulu (PR -> PO -> GRN)** atau Anda sedang merancang **struktur databasenya (ERD)**? Saya bisa bantu buatkan detail skema database atau *mockup* alurnya.