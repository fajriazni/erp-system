# Purchasing Data Simulation Guide - PT. Lawangsewu Teknologi

Panduan ini berisi data simulasi yang telah disiapkan untuk fitur Purchasing. Gunakan data ini untuk menguji alur kerja dari PR hingga Pembayaran.

## 1. Login Accounts (Users)
Gunakan akun berikut untuk berbagai peran dalam workflow:

| Role | Name | Email | Password | Department |
|---|---|---|---|---|
| **Director** | Budi Director | `director@lawangsewu.tech` | `password` | - |
| **Manager** | Andi IT Manager | `it.manager@lawangsewu.tech` | `password` | Technology |
| **Manager** | Siti Finance Manager | `finance.manager@lawangsewu.tech` | `password` | Finance |
| **Staff** | Rudi IT Staff | `it.staff@lawangsewu.tech` | `password` | Technology |
| **Staff** | Dewi Purchasing | `purchasing@lawangsewu.tech` | `password` | Procurement |

> **Note:** Password standard adalah `password`.

## 2. Struktur Organisasi
- **Departemen:** Technology, Operations, Finance, Procurement.
- **Budget Tahunan:**
    - **Technology:** Rp 1.000.000.000 (1 Milyar)
    - **Operations:** Rp 500.000.000 (500 Juta)

## 3. Master Data Vendor
Terdapat 5 Vendor aktif dengan detail kontak & pajak yang lengkap:

1.  **PT. Mega Komputindo** (IT Hardware) - `sales@megakom.com`
2.  **Global Cloud Services** (Cloud & SaaS) - `billing@globalcloud.com`
3.  **CV. Jasa Kabel** (Networking) - `info@jasakabel.com`
4.  **PT. Server Indo** (Servers) - `sales@serverindo.co.id`
5.  **CV. Network Solusi** (Infrastructure) - `marketing@netsolusi.com`

> Setiap vendor memiliki **Pricelist (Daftar Harga)** otomatis untuk 4-12 produk acak dengan variasi harga.

## 4. Master Data Produk
Katalog produk mencakup barang elektronik dan jasa:

- **Hardware:** Dell Server R740, Cisco Switch, Macbook Pro M3, Lenovo Thinkpad X1, SSD NVMe, HDD 16TB, Monitor Dell.
- **Software/License:** AWS Subscription, Microsoft 365, Adobe Creative Cloud.
- **Jasa:** IT Consulting, Server Maintenance, Network Installation.

## 5. Aturan Approval (Workflow)
Sistem telah dikonfigurasi dengan aturan approval berikut:

| Dokumen | Kondisi | Approver |
|---|---|---|
| **Purchase Request (PR)** | > Rp 100 Juta | **Director** |
| **Purchase Request (PR)** | < Rp 100 Juta | **Manager** (Sesuai Dept) |
| **Purchase Order (PO)** | > Rp 50 Juta | **Director** |
| **Purchase Order (PO)** | < Rp 50 Juta | **Manager** |

## 6. Skenario Simulasi yang Disarankan
Anda dapat mencoba skenario berikut untuk menguji sistem:

### Skenario A: Pengadaan Laptop (Standard)
1.  Login sebagai **Rudi IT Staff**.
2.  Buat PR untuk **Lenovo ThinkPad X1** (Qty: 2).
3.  Login sebagai **Andi IT Manager** untuk menyetujui PR.
4.  Login sebagai **Dewi Purchasing** untuk membuat PO ke **PT. Mega Komputindo**.

### Skenario B: Pengadaan Server (High Value)
1.  Login sebagai **Rudi IT Staff**.
2.  Buat PR untuk **Dell PowerEdge R740** (Qty: 3) -> Total > 100 Juta.
3.  Login sebagai **Andi IT Manager** (Approval 1).
4.  Login sebagai **Budi Director** (Approval 2 - Final).
5.  Proses RFQ ke 3 vendor berbeda untuk membandingkan harga.

### Skenario C: Over Budget Warning
1.  Coba buat PR dengan nilai melebihi sisa budget Department Technology untuk melihat sistem peringatan/blocking.
