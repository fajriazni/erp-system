# Analisis Gap & Implementasi Fitur Purchasing

Berdasarkan riset dari ChatGPT, Z.ai, dan Gemini, berikut adalah kesimpulan analisis gap antara fitur yang disarankan dengan kondisi aplikasi ERP saat ini, serta rencana pengembangan selanjutnya.

## 1. Analisis Gap Fitur

| Kategori | Fitur Ideal (Riset) | Status Saat Ini | Gap / Kekurangan |
| :--- | :--- | :--- | :--- |
| **Master Data** | Vendor Master (Rating, Blacklist, Terms) | **Ada** (Basic) | Vendor Rating/Scorecard, Dokumen Legal (Upload), Blacklist Status. |
| | Pricelist & History (Tier, Contract) | **Ada** (Baru Rilis) | Contract/Blanket Order Management, Validitas Tanggal (Promo). |
| | Product (Substitusi, Landed Cost) | **Ada** (Basic) | Konfigurasi Landed Cost, Item Substitusi. |
| **Procurement** | Purchase Requisition (Budget Check) | **Ada** (Basic) | **Budget Checking (Encumbrance)**, Approval Matrix Dinamis. |
| | **RFQ / Tender** | **Belum Ada** | Flow RFQ -> Bid Comparison -> PO belum ada sama sekali. |
| | Purchase Order (Blanket, Diskon) | **Ada** | Blanket Order (Kontrak Jangka Panjang), Multi-currency (perlu review). |
| **Receiving** | Goods Receipt (QC, Partial) | **Ada** (Partial ok) | **Quality Control (QC)** Process / Karantina barang. |
| **Finance** | **3-Way Matching** (Auto Verify) | **Manual** | Sistem otomatis validasi qty/harga PO vs GR vs Bill (sekarang manual check). |
| | Landed Cost (Biaya Tambahan) | **Belum Ada** | Pembebanan ongkir/bea masuk ke HPP barang. |
| **Report** | Spend Analysis, Vendor Perf. | **Basic** | Analisa mendalam (Price Variance, On-time delivery rate). |

---

## 2. Breakdown Plan Pengembangan

Berikut adalah roadmap pengembangan fitur untuk melengkapi modul Purchasing agar sesuai standar Enterprise.

### Phase 1: Procurement Flow Completeness (RFQ & Quotation)
Menambahkan langkah negosiasi harga sebelum PO.
- [ ] **Tabel RFQ & RFQ Lines**: Menyimpan data permintaan penawaran.
- [ ] **Kirim RFQ ke Vendor**: Kirim email/pdf ke beberapa vendor.
- [ ] **Vendor Quotation**: Input harga penawaran dari vendor.
- [ ] **Bid Comparison**: Fitur membandingkan harga termurah/tercepat dari beberapa vendor.
- [ ] **Convert to PO**: Tombol aksi untuk mengubah pemenang RFQ menjadi PO.

### Phase 2: Control & Compliance (Budget & Approval)
Memperketat kontrol pengeluaran perusahaan.
- [ ] **Budgeting Module Integration**:
    - [ ] Define Budget per Dept/Project.
    - [ ] Encumbrance: Blokir/Warn saat buat PR/PO jika budget habis.
- [ ] **Dynamic Approval Matrix**:
    - [ ] Configurable rules (e.g. < 5jt Supervisor, > 5jt Manager).

### Phase 3: Financial Accuracy (3-Way Match & Landed Cost)
Meningkatkan akurasi HPP dan mencegah kecurangan.
- [ ] **Automated 3-Way Matching**:
    - [ ] Sistem flag merah jika Qty Bill > Qty Received.
    - [ ] Sistem flag jika Harga Bill > Harga PO (toleransi %).
- [ ] **Landed Cost Allocation**:
    - [ ] Form input biaya tambahan (Freight, Insurance).
    - [ ] Alokasi biaya ke nilai stock (Weighted Average Adjustment).

### Phase 4: Quality & Performance
Memastikan kualitas barang dan performa vendor.
- [ ] **Quality Control (QC)**:
    - [ ] Status barang "In-QA" saat ditaruh di GR.
    - [ ] Flow Inspeksi (Pass/Fail).
    - [ ] Auto-return jika Fail.
- [ ] **Vendor Scorecard**:
    - [ ] Auto-calculation: On-time rate, Return rate.
    - [ ] Rating bintang di profil Vendor.

## 3. Kesimpulan & Rekomendasi
Saat ini aplikasi sudah memiliki fondasi transaksional yang kuat (Flow Lurus: PR -> PO -> GR -> Bill). Fokus selanjutnya sebaiknya pada **Phase 1 (RFQ)** untuk mengakomodir proses negosiasi, dan **Phase 3 (3-Way Matching)** untuk mengamankan proses pembayaran.
