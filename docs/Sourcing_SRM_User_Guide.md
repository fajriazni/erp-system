# Sourcing & SRM User Guide

## Overview
This guide covers Supplier Relationship Management (SRM) and the Sourcing process (RFQ), including how they integrate with the Purchasing Operations module.

---

## 1. Vendor Management

### 1.1 Vendor Registry
Manage your supplier database with the Vendor Registry.
- **Profiles**: Store comprehensive details (contacts, bank info, addresses).
- **Onboarding Status**: Track vendors through the qualification process (Draft, Submitted, Approved, Rejected).
- **Performance**: (Future Feature) Monitor vendor performance metrics.

### 1.2 Vendor Onboarding
New vendors can be onboarded via a structured workflow:
1.  **Draft**: Initial data entry.
2.  **Review**: Submit for internal review.
3.  **Approval/Rejection**: Formal qualification decision.
4.  **Active**: Vendor is ready for transactions (RFQs, POs).

---

## 2. Request for Quotation (RFQ)

### 2.1 Creating RFQs
- Generate RFQs to solicit bids from multiple vendors.
- Specify items, required dates, and terms.
- **Integration**: Approved vendors from the Registry are available for selection.

### 2.2 RFQ Process Flow
1.  **Draft**: Prepare the RFQ details.
2.  **Open**: Send invitations to vendors.
3.  **Closed**: Deadline passed, no new quotes accepted.
4.  **Awarded**: Winning bid selected, converted to PO.

### 2.3 Converting to Purchase Order
When a Vendor Quotation is accepted:
1.  The system automatically generates a **Purchase Order**.
2.  The PO source will be marked as **RFQ**.
3.  All item details, prices, and vendor info are carried over.
4.  **Version Control**: From this point on, any changes to the generated PO will be tracked in the **PO Version Control** system (refer to *Purchasing Operations User Guide*).

---

## 3. Supplier Portal (Overview)
*Note: This section refers to the vendor-facing interface.*
- Vendors receive email invitations to view RFQs.
- They can submit quotations directly through the secure portal.
- Detailed tracking of their quote status (Pending, Accepted, Rejected).
