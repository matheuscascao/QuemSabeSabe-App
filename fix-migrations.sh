#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing migration order...${NC}"

# Backup migrations directory
echo "Creating backup of migrations..."
cp -r packages/backend/prisma/migrations packages/backend/prisma/migrations.backup

# Remove existing migrations
echo "Removing existing migrations..."
rm -rf packages/backend/prisma/migrations/*

# Create new migrations directory
mkdir -p packages/backend/prisma/migrations

# Copy migration_lock.toml back
cp packages/backend/prisma/migrations.backup/migration_lock.toml packages/backend/prisma/migrations/

# Copy migrations in correct order with new timestamps
echo "Creating new migrations in correct order..."

# Copy init migration with timestamp 20240320000000
cp -r packages/backend/prisma/migrations.backup/20250519235718_init/* packages/backend/prisma/migrations/20240320000000_init/

# Copy default quizzes migration with timestamp 20240320000001
cp -r packages/backend/prisma/migrations.backup/20240320000000_add_default_quizzes/* packages/backend/prisma/migrations/20240320000001_add_default_quizzes/

echo -e "${GREEN}✅ Migration order fixed!${NC}"
echo
echo "To apply the fixed migrations:"
echo "1. Delete the database (if it exists):"
echo "   DROP DATABASE quiz_master;"
echo "2. Run the setup script again:"
echo "   ./setup.sh"
echo
echo "Note: A backup of your original migrations is stored in packages/backend/prisma/migrations.backup" 