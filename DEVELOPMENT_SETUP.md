# Development Setup

## Backend
1. Install .NET SDK 8.0
2. Run `dotnet restore` in services/api
3. Run `dotnet build services/api/ECC.sln`

## Frontend
1. Install Node.js 20+
2. Run `npm install` in apps/frontend
3. Run `npm run dev`

## Database
1. Start SQL Server via docker compose in infrastructure/docker
2. Apply migration script in infrastructure/database/migrations
3. Seed data from infrastructure/database/seed
