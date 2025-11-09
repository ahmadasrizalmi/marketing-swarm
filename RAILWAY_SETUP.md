# Railway Deployment Setup - AI Marketing Swarm

## 🚨 Error yang Terjadi

Error **"TypeError: Invalid URL"** disebabkan oleh:

1. **Missing Environment Variables**: `VITE_OAUTH_PORTAL_URL` dan `VITE_APP_ID` tidak di-set di Railway
2. **URL Constructor Error**: Code mencoba membuat URL dari undefined value
3. **Build vs Runtime Environment**: Vite environment variables harus tersedia saat build time

## ✅ Solusi yang Sudah Diterapkan

### 1. **Perbaikan Code** ✓
File `client/src/const.ts` sudah diperbaiki dengan:
- Default values untuk environment variables
- Validation sebelum membuat URL
- Error handling dengan try-catch
- Fallback ke '#' jika URL invalid

### 2. **Konfigurasi Railway** ✓
File `railway.json` sudah dibuat untuk optimasi deployment.

### 3. **Environment Variables Template** ✓
File `.env.example` sudah dibuat sebagai referensi.

---

## 📋 Langkah Setup Railway (PENTING!)

### **Step 1: Set Environment Variables di Railway**

Buka Railway dashboard → Project → Variables tab, lalu tambahkan:

#### **Required Variables:**
```bash
# Database (auto-generated jika sudah add MySQL)
DATABASE_URL=mysql://user:password@host:port/database

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Circlo API
CIRCLO_API_TOKEN=your_circlo_jwt_token_here

# Node Environment
NODE_ENV=production
```

#### **Optional Variables (untuk Manus OAuth):**
```bash
# Jika menggunakan Manus OAuth, tambahkan:
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_manus_app_id

# Jika tidak menggunakan Manus OAuth, bisa skip
# Code sudah handle dengan default values
```

### **Step 2: Add MySQL Database**

1. Di Railway dashboard, klik tombol **"+ New"** di sidebar kiri
2. Pilih **"Database"** → **"Add MySQL"**
3. Railway akan otomatis:
   - Create MySQL instance
   - Generate `DATABASE_URL`
   - Inject ke environment variables

### **Step 3: Commit dan Push Perubahan**

Setelah code diperbaiki, commit dan push ke GitHub:

```bash
git add .
git commit -m "fix: handle invalid URL error in Railway deployment"
git push origin main
```

Railway akan otomatis detect perubahan dan re-deploy.

### **Step 4: Run Database Migrations**

Setelah deployment berhasil, jalankan migrations:

**Opsi A: Via Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run pnpm db:push
```

**Opsi B: Via Railway Dashboard**
1. Buka **Deployments** tab
2. Klik deployment yang active
3. Klik **"View Logs"**
4. Jika ada error database, run manual via CLI

### **Step 5: Register Agents (Optional)**

Jika menggunakan Circlo agents:
```bash
railway run pnpm tsx scripts/register-agents.ts
```

---

## 🔧 Troubleshooting

### Error: "Invalid URL" masih muncul
**Solusi:**
1. Pastikan code sudah di-commit dan di-push
2. Trigger manual redeploy di Railway
3. Clear browser cache dan reload

### Error: "Cannot connect to database"
**Solusi:**
1. Pastikan MySQL database sudah di-add di Railway
2. Check `DATABASE_URL` di Variables tab
3. Pastikan format: `mysql://user:password@host:port/database`

### Error: "Build failed"
**Solusi:**
1. Check build logs di Railway dashboard
2. Pastikan `pnpm` version compatible
3. Try clear cache: Settings → Clear Build Cache

### Error: "Application failed to respond"
**Solusi:**
1. Check runtime logs di Railway
2. Pastikan `PORT` environment variable tidak di-set manual (Railway auto-inject)
3. Verify start command: `pnpm start`

---

## 📊 Checklist Deployment

- [ ] Code sudah diperbaiki (const.ts dengan error handling)
- [ ] Commit dan push ke GitHub
- [ ] Railway auto-deploy triggered
- [ ] MySQL database sudah di-add
- [ ] Environment variables sudah di-set:
  - [ ] `DATABASE_URL` (auto dari MySQL)
  - [ ] `GEMINI_API_KEY`
  - [ ] `CIRCLO_API_TOKEN`
  - [ ] `NODE_ENV=production`
  - [ ] `VITE_OAUTH_PORTAL_URL` (optional)
  - [ ] `VITE_APP_ID` (optional)
- [ ] Deployment status: Success (green checkmark)
- [ ] Generate public domain (klik "Unexposed service")
- [ ] Access URL dan test aplikasi
- [ ] Run database migrations: `railway run pnpm db:push`
- [ ] Register agents (jika perlu): `railway run pnpm tsx scripts/register-agents.ts`

---

## 🎯 Expected Result

Setelah semua langkah di atas, aplikasi akan:
- ✅ Build successfully
- ✅ Deploy successfully
- ✅ Accessible via public URL
- ✅ No "Invalid URL" error
- ✅ Database connected
- ✅ Ready untuk create campaigns

---

## 📞 Next Steps

1. **Commit perubahan code** yang sudah diperbaiki
2. **Push ke GitHub** untuk trigger auto-deploy
3. **Set environment variables** di Railway dashboard
4. **Add MySQL database** di Railway
5. **Generate public domain** untuk akses aplikasi
6. **Test aplikasi** dengan create campaign

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- MySQL Setup: https://docs.railway.app/databases/mysql
- Environment Variables: https://docs.railway.app/develop/variables

---

**Status**: Code sudah diperbaiki, tinggal commit + push + set environment variables di Railway! 🚀
