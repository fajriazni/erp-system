<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\VendorOnboarding;
use Illuminate\Database\Seeder;

class VendorOnboardingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Scenario 1: New vendor, pending onboarding (baru dibuat, belum upload dokumen)
        $vendor1 = Contact::create([
            'type' => 'vendor',
            'name' => 'PT. Maju Jaya Sentosa',
            'email' => 'contact@majujaya.co.id',
            'phone' => '+62 21 1234567',
            'address' => 'Jl. Industri Raya No. 123, Kawasan Industri Pulo Gadung, Jakarta Timur 13920',
            'tax_id' => '01.234.567.8-901.000',
            'website' => 'https://majujaya.co.id',
            'company_registration_no' => 'AHU-0012345.AH.01.01.TAHUN 2020',
            'established_year' => 2020,
            'employee_count' => 150,
            'category' => 'Raw Materials',
            'industry' => 'Manufacturing',
            'status' => 'pending_onboarding', // Note: ini yang harusnya default untuk vendor baru
        ]);

        VendorOnboarding::create([
            'vendor_id' => $vendor1->id,
            'status' => VendorOnboarding::STATUS_PENDING,
            'checklist' => VendorOnboarding::getDefaultChecklist(),
            'documents' => [],
            'notes' => 'Vendor baru terdaftar, menunggu upload dokumen',
        ]);

        // Scenario 2: Vendor sudah upload dokumen, siap di-review
        $vendor2 = Contact::create([
            'type' => 'vendor',
            'name' => 'CV. Berkah Mandiri',
            'email' => 'info@berkahmandiri.com',
            'phone' => '+62 21 9876543',
            'address' => 'Jl. Raya Bogor KM 25, Cibinong, Bogor 16914',
            'tax_id' => '02.345.678.9-012.000',
            'website' => 'https://berkahmandiri.com',
            'company_registration_no' => 'AHU-0023456.AH.01.01.TAHUN 2018',
            'established_year' => 2018,
            'employee_count' => 75,
            'category' => 'Packaging',
            'industry' => 'Trading',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '1370012345678',
            'bank_account_holder' => 'CV. BERKAH MANDIRI',
            'currency' => 'IDR',
            'status' => 'pending_onboarding',
        ]);

        // Mark all checklist items as completed
        $checklist2 = VendorOnboarding::getDefaultChecklist();
        foreach ($checklist2 as &$item) {
            $item['completed'] = true;
        }

        VendorOnboarding::create([
            'vendor_id' => $vendor2->id,
            'status' => VendorOnboarding::STATUS_IN_REVIEW,
            'checklist' => $checklist2,
            'documents' => [
                ['type' => 'NPWP (Tax ID)', 'name' => 'npwp_berkahmandiri.pdf', 'url' => '/storage/docs/npwp.pdf'],
                ['type' => 'SIUP (Business License)', 'name' => 'siup_berkahmandiri.pdf', 'url' => '/storage/docs/siup.pdf'],
                ['type' => 'TDP (Company Registration)', 'name' => 'tdp_berkahmandiri.pdf', 'url' => '/storage/docs/tdp.pdf'],
            ],
            'notes' => 'Semua dokumen lengkap, siap untuk di-review oleh Purchasing Manager',
        ]);

        // Scenario 3: Vendor sudah approved (active)
        $vendor3 = Contact::create([
            'type' => 'vendor',
            'name' => 'PT. Sumber Makmur Abadi',
            'email' => 'sales@sumbermakmur.id',
            'phone' => '+62 21 5555666',
            'address' => 'Kawasan Industri MM2100 Blok A-5, Cikarang Barat, Bekasi 17520',
            'tax_id' => '03.456.789.0-123.000',
            'website' => 'https://sumbermakmur.id',
            'company_registration_no' => 'AHU-0034567.AH.01.01.TAHUN 2015',
            'established_year' => 2015,
            'employee_count' => 300,
            'category' => 'Equipment',
            'industry' => 'Manufacturing',
            'bank_name' => 'Bank Central Asia',
            'bank_account_number' => '0123456789',
            'bank_account_holder' => 'PT. SUMBER MAKMUR ABADI',
            'bank_swift_code' => 'CENAIDJA',
            'currency' => 'IDR',
            'payment_term_id' => 1, // Assuming NET 30 exists
            'status' => 'active', // Vendor approved, bisa terima PO
        ]);

        $checklist3 = VendorOnboarding::getDefaultChecklist();
        foreach ($checklist3 as &$item) {
            $item['completed'] = true;
        }

        VendorOnboarding::create([
            'vendor_id' => $vendor3->id,
            'status' => VendorOnboarding::STATUS_APPROVED,
            'checklist' => $checklist3,
            'documents' => [
                ['type' => 'NPWP (Tax ID)', 'name' => 'npwp_sumbermakmur.pdf', 'url' => '/storage/docs/npwp.pdf'],
                ['type' => 'SIUP (Business License)', 'name' => 'siup_sumbermakmur.pdf', 'url' => '/storage/docs/siup.pdf'],
                ['type' => 'TDP (Company Registration)', 'name' => 'tdp_sumbermakmur.pdf', 'url' => '/storage/docs/tdp.pdf'],
                ['type' => 'ISO Certificate', 'name' => 'iso_9001_sumbermakmur.pdf', 'url' => '/storage/docs/iso.pdf'],
            ],
            'notes' => 'Vendor qualified, semua dokumen terverifikasi',
            'reviewed_by' => 1, // Assuming user ID 1 exists
            'reviewed_at' => now()->subDays(7),
            'approved_at' => now()->subDays(7),
        ]);

        // Scenario 4: Vendor rejected (perlu perbaikan dokumen)
        $vendor4 = Contact::create([
            'type' => 'vendor',
            'name' => 'UD. Karya Bersama',
            'email' => 'info@karyabersama.com',
            'phone' => '+62 22 7778888',
            'address' => 'Jl. Soekarno-Hatta No. 456, Bandung 40286',
            'tax_id' => '04.567.890.1-234.000',
            'status' => 'inactive', // Rejected, tidak bisa terima PO
        ]);

        VendorOnboarding::create([
            'vendor_id' => $vendor4->id,
            'status' => VendorOnboarding::STATUS_REJECTED,
            'checklist' => VendorOnboarding::getDefaultChecklist(),
            'documents' => [
                ['type' => 'NPWP (Tax ID)', 'name' => 'npwp_expired.pdf', 'url' => '/storage/docs/npwp_old.pdf'],
            ],
            'notes' => 'Dokumen NPWP sudah expired, SIUP belum diupload. Mohon lengkapi dokumen dan submit ulang.',
            'reviewed_by' => 1,
            'reviewed_at' => now()->subDays(3),
        ]);

        // Add contact persons untuk beberapa vendor
        $vendor2->update([
            'contact_persons' => [
                [
                    'name' => 'Budi Santoso',
                    'position' => 'Sales Manager',
                    'email' => 'budi@berkahmandiri.com',
                    'phone' => '+62 813 1234 5678',
                    'is_primary' => true,
                ],
                [
                    'name' => 'Siti Rahma',
                    'position' => 'Account Executive',
                    'email' => 'siti@berkahmandiri.com',
                    'phone' => '+62 812 9876 5432',
                    'is_primary' => false,
                ],
            ],
        ]);

        $vendor3->update([
            'contact_persons' => [
                [
                    'name' => 'Ahmad Rizki',
                    'position' => 'Director',
                    'email' => 'ahmad@sumbermakmur.id',
                    'phone' => '+62 811 2223 3334',
                    'is_primary' => true,
                ],
            ],
        ]);

        $this->command->info('✓ Created 4 vendor onboarding scenarios:');
        $this->command->info('  1. PT. Maju Jaya Sentosa - Pending (baru dibuat)');
        $this->command->info('  2. CV. Berkah Mandiri - In Review (dokumen lengkap)');
        $this->command->info('  3. PT. Sumber Makmur Abadi - Approved (aktif)');
        $this->command->info('  4. UD. Karya Bersama - Rejected (perlu perbaikan)');
    }
}
