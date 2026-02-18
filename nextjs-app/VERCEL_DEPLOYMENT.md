
# 🚀 Vercel Deployment Guide

Your deployment failed because Vercel CANNOT access your local MongoDB (`mongodb://localhost...`). You must use a Cloud Database.

## Step 1: Get a Cloud MongoDB (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up (Free).
2. Create a new Cluster (Shared/Free tier).
3. Create a Database User (Username/Password).
4. Allow Access from Anywhere (`0.0.0.0/0`) in Network Access.
5. Get your **Connection String**:
   - Format: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/student_detection`

## Step 2: Configure Vercel Projects
1. Go to your Vercel Project Dashboard.
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your MongoDB Atlas Connection String (from Step 1) |
| `NEXTAUTH_SECRET` | `supersecretkey123` (or generate a secure random string) |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) |

## Step 3: Redeploy
1. Go to **Deployments** in Vercel.
2. Click the three dots (⋮) on the failed deployment > **Redeploy**.
3. Check "Redeploy with existing build cache" (or without, doesn't matter much here).

## Why was it failing?
The error `Failed to collect page data` occurred because Next.js tried to connect to `localhost:27017` during the build process to generate static pages, but there is no MongoDB running inside Vercel's build container.

I have also added `"postinstall": "prisma generate"` to your `package.json` to ensure Prisma Client is always generated correctly on Vercel.
