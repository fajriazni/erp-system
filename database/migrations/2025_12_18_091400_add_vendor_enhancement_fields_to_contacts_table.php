<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            // Documents (JSON array of document objects)
            $table->json('documents')->nullable()->after('tax_id');
            
            // Banking Information
            $table->string('bank_name')->nullable()->after('documents');
            $table->string('bank_account_number')->nullable()->after('bank_name');
            $table->string('bank_account_holder')->nullable()->after('bank_account_number');
            $table->string('bank_swift_code')->nullable()->after('bank_account_holder');
            $table->string('currency', 3)->default('IDR')->after('bank_swift_code');
            
            // Business Details
            $table->string('company_registration_no')->nullable()->after('currency');
            $table->year('established_year')->nullable()->after('company_registration_no');
            $table->integer('employee_count')->nullable()->after('established_year');
            $table->string('website')->nullable()->after('employee_count');
            $table->text('notes')->nullable()->after('website');
            
            // Categories & Classification
            $table->string('category')->nullable()->after('notes'); // e.g., Raw Materials, Services
            $table->string('industry')->nullable()->after('category');
            $table->json('tags')->nullable()->after('industry');
            
            // Contact Persons (JSON array of contact objects)
            $table->json('contact_persons')->nullable()->after('tags');
            
            // Status
            $table->string('status')->default('active')->after('contact_persons'); // active, inactive, blacklist
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn([
                'documents',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
                'bank_swift_code',
                'currency',
                'company_registration_no',
                'established_year',
                'employee_count',
                'website',
                'notes',
                'category',
                'industry',
                'tags',
                'contact_persons',
                'status',
            ]);
        });
    }
};
