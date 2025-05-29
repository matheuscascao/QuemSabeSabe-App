#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default database credentials
DB_USER="postgres"
DB_PASS="NUNES"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="quizz_2"

# Function to check if PostgreSQL is running
check_postgres() {
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
        echo -e "${RED}❌ PostgreSQL is not running at $DB_HOST:$DB_PORT. Please start PostgreSQL and try again.${NC}"
        exit 1
    fi
}

# Function to test database connection
test_db_connection() {
    if ! PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

# Function to create database if it doesn't exist
create_database() {
    echo -e "${BLUE}🗄️  Checking database...${NC}"
    if ! PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo -e "${BLUE}Creating database $DB_NAME...${NC}"
        if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"; then
            echo -e "${GREEN}✅ Database created successfully${NC}"
        else
            echo -e "${RED}❌ Failed to create database. Please check your PostgreSQL credentials.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Database $DB_NAME already exists${NC}"
    fi
}

echo -e "${BLUE}🚀 Starting Quiz Master setup...${NC}\n"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

# Database credentials setup
echo -e "${BLUE}🔧 Database Configuration${NC}"
echo "Please enter your PostgreSQL credentials (press Enter to use defaults):"

read -p "Database Host [$DB_HOST]: " input
DB_HOST=${input:-$DB_HOST}

read -p "Database Port [$DB_PORT]: " input
DB_PORT=${input:-$DB_PORT}

read -p "Database User [$DB_USER]: " input
DB_USER=${input:-$DB_USER}

read -sp "Database Password: " input
if [ ! -z "$input" ]; then
    DB_PASS=$input
fi
echo

# Test database connection
echo -e "${BLUE}Testing database connection...${NC}"
if ! test_db_connection; then
    echo -e "${RED}❌ Could not connect to PostgreSQL with the provided credentials.${NC}"
    echo "Please make sure:"
    echo "1. PostgreSQL is running"
    echo "2. The credentials are correct"
    echo "3. The user has sufficient privileges"
    exit 1
fi
echo -e "${GREEN}✅ Database connection successful${NC}"

# Create .env files if they don't exist
echo -e "${BLUE}🔑 Setting up environment variables...${NC}"

# Backend .env
if [ ! -f "packages/backend/.env" ]; then
    cat > packages/backend/.env << EOL
# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3333
HOST="0.0.0.0"
EOL
    echo -e "${GREEN}✅ Created packages/backend/.env${NC}"
else
    echo "ℹ️  packages/backend/.env already exists"
fi

# Frontend .env
if [ ! -f "packages/frontend/.env" ]; then
    cat > packages/frontend/.env << EOL
VITE_API_URL="http://localhost:3333"
EOL
    echo -e "${GREEN}✅ Created packages/frontend/.env${NC}"
else
    echo "ℹ️  packages/frontend/.env already exists"
fi

# Check if PostgreSQL is running
check_postgres

# Create database if it doesn't exist
create_database

# Generate Prisma client and run migrations
echo -e "${BLUE}🔄 Setting up Prisma...${NC}"
cd packages/backend

echo -e "${BLUE}Generating Prisma client...${NC}"
if ! pnpm prisma generate; then
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo -e "${BLUE}Running database migrations...${NC}"
if ! pnpm prisma migrate dev --name init; then
    echo -e "${RED}❌ Failed to run database migrations${NC}"
    echo -e "${BLUE}Attempting to reset database...${NC}"
    if ! pnpm prisma migrate reset --force; then
        echo -e "${RED}❌ Failed to reset database. Please check your database connection and try again.${NC}"
        exit 1
    fi
fi

cd ../..

echo -e "\n${GREEN}✨ Setup completed successfully!${NC}"
echo -e "\nTo start the development servers:"
echo "1. Backend: cd packages/backend && pnpm dev"
echo "2. Frontend: cd packages/frontend && pnpm dev"
echo
echo "Make sure to update the .env files with your actual values before deploying to production!" 