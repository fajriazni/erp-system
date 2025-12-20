# Purchasing Operations User Guide

## Overview
This comprehensive guide details the operational workflows within the Purchasing Module. It specifically covers **Purchase Order (PO) Management**, **Direct Purchasing**, and the **Revisions & Versions** control system.

---

## 1. Purchase Order (PO) Management

The Purchase Order is the central legal document in the purchasing process. This section explains how to manage, track, and identify POs.

### 1.1 PO Structure & Numbering
- **Numbering Format**: `PO-YYYY-XXXX` (e.g., `PO-2025-0042`).
  - **YYYY**: Current year.
  - **XXXX**: Sequential number that resets January 1st of each year.
- **Source Badge**: Every PO is tagged with its origin:
  - **RFQ** (Blue Badge): Created automatically from an awarded Request for Quotation.
  - **Direct** (Purple Badge): Created manually via the Direct Purchasing form.

### 1.2 Accessing Orders
- Navigate to **Purchasing > Operations > Orders**.
- The list view shows status, vendor, amount, and date.
- Click any PO number to view the **PO Detail Page**.

---

## 2. Direct Purchasing

Direct Purchasing is used for immediate procurement needs that do not require a formal bidding (RFQ) process.

### 2.1 creating a Direct PO
1.  Navigate to **Purchasing > Operations > Direct Purchase**.
2.  **Vendor Selection**: Choose a vendor from the approved registry.
3.  **Warehouse**: Select the destination warehouse.
4.  **Add Items**:
    - Search for products by name or code.
    - Enter quantity and price.
    - System automatically calculates subtotals.
5.  **Tax Configuration**: Select applicable tax rates (VAT, WHT).
6.  **Submit**: Click "Create Purchase Order".

### 2.2 Form Features
- **Validation**: Prevents submission if critical data (like Vendor or Items) is missing.
- **Error Feedback**: Displays specific error messages for any invalid inputs.
- **Auto-Calculation**: Totals, taxes, and grand totals update in real-time.

---

## 3. Revisions & Versions (Version Control)

The **Version Control System** allows you to track revisions, compare changes, and restore previous states of a Purchase Order.

### 3.1 Revisions Overview
A "Revision" or "Version" is a snapshot of the PO at a specific point in time.
- **Version 1**: Created automatically when the PO is first generated.
- **New Versions**: Automatically created whenever a user modifies the PO (e.g., updates price, changes quantity, edits notes).
- **Badge**: Look for the `v#` badge (e.g., `v3`) in the PO header to see the current revision number.

### 3.2 Viewing History
To see the full revision history:
1.  Open the PO Detail page.
2.  Click the **Actions** dropdown menu.
3.  Select **Version History**.
4.  A timeline will appear showing all changes, including:
    - **Who** made the change.
    - **When** it occurred.
    - **What** changed (Change Summary).

### 3.3 Comparing Versions
To see exactly what changed between two revisions:
1.  Go to the **Version History** page.
2.  Click the **Compare** button on any previous version.
3.  The **Comparison View** opens:
    - **Side-by-side**: Comparing "Version X" vs. "Version Y".
    - **Yellow Highlights**: Fields that were modified.
    - **Green/Red Items**: Line items that were added or removed.

### 3.4 Restoring a Previous Version
If an error was made, you can roll back:
1.  In **Version History**, find the correct previous version.
2.  Click **Restore**.
3.  Confirm the action.
4.  The system will revert all data to that state and create a new "Restored" version to track this event.

### 3.5 Global Version Dashboard
For a high-level view of all revisions across the system:
- Navigate to **Purchasing > Operations > Version Control**.
- View metrics on recent changes, active users, and a live feed of all system modifications.
