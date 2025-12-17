Berikut **gambaran lengkap dan detail modul Purchasing (Procurement)** pada sistem ERP, disusun **end-to-end dari sisi bisnis, data, hingga kontrol sistem**. Struktur ini cocok jika Anda ingin membangun ERP yang **scalable & enterprise-ready**.

---

## 1. Master Data (Fondasi Modul Purchasing)

![Image](https://i.ytimg.com/vi/1kHkT7uarPI/hqdefault.jpg?utm_source=chatgpt.com)

![Image](https://www.netsuite.com/portal/assets/img/business-articles/inventory-management/infographic-master-data-uses.png?utm_source=chatgpt.com)

![Image](https://www.tutorialspoint.com/sap_mm/images/purchase_item_category.png?utm_source=chatgpt.com)

![Image](https://community.sap.com/legacyfs/online/storage/blog_attachments/2022/01/Purchase-category-2-scaled.jpg?utm_source=chatgpt.com)

![Image](https://artofprocurement.com/hs-fs/hubfs/Imported_Blog_Media/strategic-sourcing-step-2-category-profile.png?height=768\&name=strategic-sourcing-step-2-category-profile.png\&width=1024\&utm_source=chatgpt.com)

### 1.1 Vendor / Supplier Master

**Fitur**

* Data legal vendor (nama, NPWP, alamat, bank)
* Kontak (sales, finance)
* Kategori vendor (barang / jasa / impor / lokal)
* Status (active, blacklist, probation)
* SLA vendor (lead time, minimum order)
* Rating & performance vendor

**Relasi**

* Dipakai oleh PR, PO, Invoice
* Terhubung ke Accounting (AP)

---

### 1.2 Item / Service Master

**Fitur**

* Kode item
* Deskripsi
* UOM (unit of measure)
* Kategori barang/jasa
* Spesifikasi teknis
* Flag: stock / non-stock / service

---

### 1.3 Purchasing Configuration

**Fitur**

* Payment terms (TOP 30, COD, dll)
* Incoterms
* Currency
* Tax configuration (PPN, PPh)
* Approval matrix

---

## 2. Purchase Requisition (PR)

![Image](https://cdn.prod.website-files.com/5c48a23c5b91aaddb3086f0f/5f2c0343d53e386aaa39759f_ProcurementFlow%20value%20before%20ERP%20in%20requisition%20management.svg?utm_source=chatgpt.com)

![Image](https://cdn.prod.website-files.com/5c48a23c5b91aaddb3086f0f/5e791bb329308c5067447123_Procurement%20and%20Accounts%20Payable%20process.svg?utm_source=chatgpt.com)

![Image](https://erpsoftwareblog.com/wp-content/uploads/Web-Based-Purchase-Requisition-and-E-Mail-Approval-in-Dynamics-GP-image-1.jpg?utm_source=chatgpt.com)

### Tujuan

Permintaan pembelian internal dari user/divisi.

**Fitur**

* PR manual
* PR otomatis dari:

  * MRP (stok minimum)
  * Sales Order
  * Project
* Multi-line item
* Estimasi harga
* Tanggal dibutuhkan
* Lampiran (spec, gambar)

**Workflow**

```
Draft → Submit → Approval → Approved → Converted to PO
```

**Kontrol**

* Budget checking
* Limit per user/divisi
* Mandatory approval

---

## 3. Request for Quotation (RFQ) / Tender

![Image](https://www.erpag.com/wp-content/uploads/2021/06/image-8-1024x828.png?utm_source=chatgpt.com)

![Image](https://www.slideteam.net/media/catalog/product/cache/1280x720/e/r/erp_software_proposal_comparison_with_rfp_evaluation_slide01.jpg?utm_source=chatgpt.com)

![Image](https://proqsmart.com/wp-content/uploads/2024/07/What_are_Steps_Involved_in_the_Bid_Process_ProQsmart.jpg?utm_source=chatgpt.com)

### Tujuan

Meminta penawaran ke beberapa vendor.

**Fitur**

* RFQ dari PR
* Multiple vendor
* Deadline penawaran
* Vendor response portal
* Attachment penawaran

### Vendor Comparison

* Harga
* Lead time
* Terms
* Rating vendor

➡️ **Output**: rekomendasi vendor

---

## 4. Purchase Order (PO)

![Image](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijak8WQERevbexfwoqGeNFzYbS4yPNF4PX1T2GE-ZJl1eilNXlyLAkRwLNipKH96WazgZuVeQBAaQhVBu4tpvdjb5h6Qwcp23QNFTy8CWEMB6TxtaQ3d6VJiIfISaPbs44lAdf9cEnvLqZnxrHWNm-j3zVAHjLBvS6JH1zij00Edux_HBNQv9sHjw9J3xK/w1200-h630-p-k-no-nu/center3.png?utm_source=chatgpt.com)

![Image](https://www.tyasuite.com/uploads/blog/Purchase-Order-Approval-workflow.webp?utm_source=chatgpt.com)

![Image](https://datamoto.com/wp-content/uploads/purchase-order-document-1024x609.png?utm_source=chatgpt.com)

### Fitur Utama

* PO dari PR / RFQ / manual
* Multi currency
* Multi tax
* Diskon
* Partial delivery
* Blanket PO (kontrak jangka panjang)

**Workflow**

```
Draft → Approval → Released → Sent to Vendor
```

**Kontrol**

* Approval by value
* Lock harga setelah approve
* Audit trail

---

## 5. Goods Receipt (GR) / Service Receipt

![Image](https://www.tutorialspoint.com/sap_pp/images/goods_receipt.jpg?utm_source=chatgpt.com)

![Image](https://blog.symtrax.com/wp-content/uploads/2020/10/steps-involved-in-a-typical-process.png?utm_source=chatgpt.com)

![Image](https://forceintellect.com/wp-content/uploads/2018/03/Service-Receipt-Note-1.jpg?utm_source=chatgpt.com)

### Goods Receipt (Barang)

* Terhubung ke PO
* Partial receipt
* QC / Inspection
* Update stok otomatis
* Serial / batch number

### Service Receipt

* Progress (%)
* Acceptance note
* Milestone-based

---

## 6. Invoice Verification (3-Way Matching)

![Image](https://www.netsuite.com/portal/assets/img/business-articles/accounting-software/infographic-bsa-three-way-matching-chart-1.jpg?utm_source=chatgpt.com)

![Image](https://www.stampli.com/wp-content/uploads/2023/07/03-stampli-po-invoice-matching.png?utm_source=chatgpt.com)

![Image](https://help.sap.com/doc/65b1545de4cf409db91e81c6da53db5a/6.18.latest/en-US/loioac03c753c4551f4be10000000a174cb4_LowRes.png?utm_source=chatgpt.com)

### 3-Way Match

```
PO ↔ Goods Receipt ↔ Vendor Invoice
```

**Fitur**

* Toleransi selisih harga/qty
* Hold invoice jika mismatch
* Auto posting ke AP

---

## 7. Vendor Performance Management

![Image](https://www.slideteam.net/media/catalog/product/cache/1280x720/s/u/supplier_and_vendor_management_kpi_dashboard_introduction_to_cloud_based_erp_software_slide01.jpg?utm_source=chatgpt.com)

![Image](https://docs.oracle.com/en/industries/retail/retail-supplier-evaluation-cloud-service/24.0.101.0/rsvwu/img/se_dashboard.png?utm_source=chatgpt.com)

![Image](https://www.trintech.com/wp-content/uploads/2025/03/vendor-scorecard-screenshot.png?utm_source=chatgpt.com)

### KPI Vendor

* On-time delivery
* Quality issue
* Harga vs kontrak
* Respons time

➡️ Dipakai untuk:

* Blacklist
* Prefered vendor
* Tender berikutnya

---

## 8. Purchasing Analytics & Reporting

![Image](https://www.viennaadvantage.com/blog/wp-content/uploads/Finance-Management-ERP-Dashboards-VIENNA-Advantage.jpg?utm_source=chatgpt.com)

![Image](https://www.oracle.com/a/ocom/img/rc118-procurement-analytics-pt-5.png?utm_source=chatgpt.com)

![Image](https://simfoni.com/wp-content/uploads/2018/07/Spend-Analysis.png.webp?utm_source=chatgpt.com)

### Report Wajib

* Spend analysis per vendor/kategori
* Outstanding PO
* Lead time analysis
* Budget vs actual
* Saving from negotiation

---

## 9. Integrasi Modul Lain

| Modul      | Integrasi           |
| ---------- | ------------------- |
| Inventory  | Update stok         |
| Accounting | AP, jurnal          |
| Budgeting  | Commitment & actual |
| Project    | Cost allocation     |
| HR         | Approval matrix     |
| Asset      | Pembelian aset      |

---

## 10. Hak Akses & Keamanan

**Role contoh**

* Requester
* Purchasing Staff
* Purchasing Manager
* Finance
* Auditor

**Fitur**

* Role-based access
* Approval by value
* Audit log
* Versioning dokumen

---

## 11. Struktur Domain (DDD – Ringkas)

```
Purchasing
├── Vendor
├── PurchaseRequisition
├── RFQ
├── PurchaseOrder
├── GoodsReceipt
├── InvoiceMatching
├── VendorPerformance
```

---

## 12. Urutan Implementasi (Best Practice)

1️⃣ Vendor Master
2️⃣ Item Master
3️⃣ Purchase Requisition
4️⃣ Purchase Order
5️⃣ Goods Receipt
6️⃣ Invoice Matching
7️⃣ Reporting & Analytics

---

### Jika Anda mau, saya bisa:

* Buat **ERD Purchasing**
* Buat **API contract (OpenAPI)**
* Buat **workflow BPMN**
* Buat **contoh database schema**
* Mapping ke **microservice vs monolith modular**

Tinggal bilang ingin fokus ke **level teknis atau bisnis**.
