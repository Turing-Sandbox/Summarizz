#!/usr/bin/env bash

echo "Setting up test PostgreSQL database for Summarizz..."

# Prompt for password only once
read -s -p "Enter your PostgreSQL password: " PGPASSWORD
echo
export PGPASSWORD

# Create a temporary .pgpass file for this session
PGPASS_FILE=$(mktemp)
echo "*:*:*:$(whoami):$PGPASSWORD" > "$PGPASS_FILE"
chmod 0600 "$PGPASS_FILE"
export PGPASSFILE=$PGPASS_FILE

echo "Dropping existing database if it exists..."
psql -h localhost -U "$(whoami)" -d postgres -c "DROP DATABASE IF EXISTS summarizz_test;"

echo "Creating new test database..."
psql -h localhost -U "$(whoami)" -d postgres -c "CREATE DATABASE summarizz_test;"

echo "Applying database schema..."
psql -h localhost -U "$(whoami)" -d summarizz_test -f "$(dirname "$0")/postgres_deployment_script.sql"

echo "Populating with test data..."
psql -h localhost -U "$(whoami)" -d summarizz_test -f "$(dirname "$0")/test_data.sql"

# Clean up temporary pgpass file
rm -f "$PGPASS_FILE"

echo "Test database setup complete!"
echo "Database: summarizz_test"
echo "Tables populated with test data for development purposes."
