# HOW TO DEPLOY SHOPVERSE — STEP BY STEP

---

## STEP 1 — Upload to GitHub (5 minutes)

1. Go to github.com — sign in
2. Click the GREEN "New" button → name it "shopverse" → click "Create repository"
3. Open your computer terminal IN the ecommerce folder and run:

   git init
   git add .
   git commit -m "shopverse ready"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/shopverse.git
   git push -u origin main

   ⚠️  Replace YOURUSERNAME with your GitHub username

---

## STEP 2 — Deploy Backend on Render (5 minutes)

1. Go to render.com — click "Sign in with GitHub"
2. Click "New +" → "Web Service"
3. Click "Connect a repository" → pick "shopverse"
4. Fill in:
   - Name: shopverse-api
   - Root Directory: backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js
   - Instance Type: Free

5. Click "Add Environment Variable" — add EACH of these:

   KEY            VALUE
   PORT           5000
   MONGO_URI      mongodb+srv://harishradhakrishnann_db_user:MQU062yeHwVTtqp5@shopverse-cluster.jno67gs.mongodb.net/ecommerce_db?retryWrites=true&w=majority&appName=shopverse-cluster
   JWT_SECRET     shopverse_jwt_super_secret_key_2025
   JWT_EXPIRE     30d
   NODE_ENV       production
   FRONTEND_URL   https://shopverse.vercel.app

6. Click "Create Web Service" — wait 3 minutes
7. You will see: ✅ Server running on port 5000
8. Your backend URL will be: https://shopverse-api-XXXX.onrender.com
   COPY THIS URL — you need it in Step 3

---

## STEP 3 — Seed the Database (2 minutes)

On your computer, open terminal inside the "backend" folder and run:

   npm install
   npm run seed

You should see:
   ✅ Database seeded successfully!
   📧 Admin: admin@shopverse.com  | Password: admin123
   📧 User:  jane@example.com     | Password: user123

---

## STEP 4 — Deploy Frontend on Vercel (5 minutes)

1. Go to vercel.com — click "Sign in with GitHub"
2. Click "Add New..." → "Project"
3. Find "shopverse" → click "Import"
4. Fill in:
   - Root Directory: frontend
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist

5. Click "Environment Variables" — add this ONE variable:

   KEY              VALUE
   VITE_API_URL     https://YOUR-RENDER-URL.onrender.com/api

   ⚠️  Replace with YOUR actual Render URL from Step 2
   ⚠️  Must end with /api

6. Click "Deploy" — wait 2 minutes
7. Your site is LIVE at: https://shopverse-XXXX.vercel.app
   COPY THIS URL

---

## STEP 5 — Connect Frontend to Backend (1 minute)

1. Go back to render.com → your shopverse-api service
2. Click "Environment" tab
3. Find FRONTEND_URL → change it to your actual Vercel URL
4. Click "Save Changes" — Render restarts automatically

---

## STEP 6 — Test It Works

Open your Vercel URL and test:

1. Homepage loads with products ✅
2. Go to /products — all 12 products show ✅
3. Login: admin@shopverse.com / admin123 ✅
4. Add product to cart ✅
5. Go to /admin — dashboard shows ✅

Test backend directly:
   https://YOUR-RENDER-URL.onrender.com/api/health
   Should show: { "status": "OK", "db": "connected" }

---

## WHEN YOU UPDATE CODE

Just run these 3 commands:
   git add .
   git commit -m "update"
   git push

Both Render and Vercel will auto-redeploy. Done.

---

## DEMO ACCOUNTS

Admin: admin@shopverse.com / admin123
User:  jane@example.com / user123

