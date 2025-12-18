<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: Drop existing constraint and recreate with new values
        DB::statement('
            ALTER TABLE approval_tasks 
            DROP CONSTRAINT IF EXISTS approval_tasks_status_check
        ');

        DB::statement("
            ALTER TABLE approval_tasks 
            ADD CONSTRAINT approval_tasks_status_check 
            CHECK (status IN ('pending', 'approved', 'rejected', 'delegated', 'escalated', 'skipped'))
        ");
    }

    public function down(): void
    {
        // Revert back to original constraint
        DB::statement('
            ALTER TABLE approval_tasks 
            DROP CONSTRAINT IF EXISTS approval_tasks_status_check
        ');

        DB::statement("
            ALTER TABLE approval_tasks 
            ADD CONSTRAINT approval_tasks_status_check 
            CHECK (status IN ('pending', 'approved', 'rejected', 'delegated', 'escalated'))
        ");
    }
};
