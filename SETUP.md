# CLaaS2SaaS Security Control Centre — Setup Steps

## Prerequisites
- Node.js 18+
- npm

## 1. Install Dependencies
```bash
cd claas2saas
npm install
```

## 2. Configure Environment
Copy or create `apps/web/.env.development`:
```env
VITE_API_URL=
VITE_AUTH_MODE=demo
VITE_DATA_MODE=Local
VITE_TENANT_MODE=local
```

- **VITE_AUTH_MODE=demo** — Uses demo auth (no Entra)
- **VITE_DATA_MODE=Local** — Uses static roles & permissions (no backend required)

## 3. Run Locally
```bash
cd apps/web
npm run dev
```

Open http://localhost:5174 (or 5173 if available).

## 4. Demo User Switcher
When in demo mode, use the switcher in the TopBar to change users:
- **Global Admin** — All permissions
- **Security Admin** — Role + audit permissions
- **Help Desk** — Read-only support
- **User TenantA/B** — Limited permissions

## 5. Roles Page
Navigate to **Role Management** (/roles) in the security section to see:
- Loading skeleton
- Static roles (demo mode)
- Search
- Empty state when no matches
- Error state with Retry (when API fails)
- Add Role button (visible with ROLE_MANAGE)
