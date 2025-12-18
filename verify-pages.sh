#!/bin/bash

echo "Checking Inertia::render paths..."

# Find all render paths in routes and controllers
grep -rh "Inertia::render" routes/ app/Http/Controllers/ 2>/dev/null | \
    grep -o "Inertia::render(['\"][^'\"]*['\"]" | \
    sed "s/Inertia::render(['\"]//g" | \
    sed "s/['\"])//g" | \
    sed "s/'.*//g" | \
    sed "s/\".*//g" | \
    sort -u | \
    while read -r path; do
        if [ -z "$path" ]; then
            continue
        fi
        
        # Convert to filesystem path  
        file_path="resources/js/Pages/${path}.tsx"
        
        if [ ! -f "$file_path" ]; then
            echo "❌ MISSING: $path"
            echo "   Expected at: $file_path"
        fi
    done

echo ""
echo "✅ Verification complete"
