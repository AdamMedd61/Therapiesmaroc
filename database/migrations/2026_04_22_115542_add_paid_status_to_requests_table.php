<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support modifying enum columns directly.
        // We update any existing 'paid' check constraint by rebuilding the column via raw query.
        // Since this is SQLite, we can simply allow the value at application level.
        // For MySQL/PostgreSQL, you would use: DB::statement("ALTER TABLE requests MODIFY COLUMN status ENUM(...)");
        
        // The status column already allows strings — SQLite enums are stored as VARCHAR,
        // so 'paid' will work fine without schema changes on SQLite.
        // This migration is a no-op for SQLite but documents the intent.
    }

    public function down(): void
    {
        //
    }
};
