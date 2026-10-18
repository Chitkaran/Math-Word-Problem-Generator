# Render.com Deployment Guide

This guide contains the exact settings and steps to deploy this application to **[Render](https://render.com/)**.

---

## 🚀 Quick Summary of Render Settings

When creating a **New Web Service** on Render:

| Field | Setting / Value | Notes |
|---|---|---|
| **Service Type** | **Web Service** | Do *not* choose Static Site because this app includes a server-side Gemini backend (`server.ts`). |
| **Language / Runtime** | **Node** | Node.js 18, 20, or 22 |
| **Build Command** | `npm install --include=dev && npm run build` | Builds the Vite frontend and bundles `server.ts` into `dist/server.cjs` (the `--include=dev` flag ensures build tools are installed even if `NODE_ENV=production`) |
| **Start Command** | `npm run start` | Runs `node dist/server.cjs` on the dynamic `$PORT` provided by Render |
| **Instance Type** | **Free** or **Starter** | Free tier works great; Starter removes sleep on inactivity |
| **Health Check Path** | `/api/health` | Verified endpoint that returns `{ status: "ok" }` |
| **Root Directory** | *(Leave blank)* | Defaults to the root of the repository |

---

## 🔑 Environment Variables on Render

In the **Environment** section of your Render Web Service dashboard, add the following variables:

| Key | Value | Required? | Description |
|---|---|---|---|
| `NODE_ENV` | `production` | **Yes** | Instructs Express to serve static files from `/dist` |
| `GEMINI_API_KEY` | `AIzaSy...` | **Yes** | Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) |

> ℹ️ **Note on `PORT`**: You do **not** need to manually add `PORT`. Render automatically sets this environment variable and passes it to the Node server.

---

## 🔒 Crucial Step: Firebase Authentication Authorized Domains

Because this application uses Firebase Google Authentication, after your site is deployed to Render, you must authorize your Render domain in Firebase:

1. Copy your Render URL (for example: `https://math-word-problem-generator.onrender.com` or your custom domain).
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Select your Firebase project (`gen-lang-client-0542111872`).
4. In the left navigation, click **Authentication** ➔ **Settings** tab ➔ **Authorized domains**.
5. Click **Add domain** and enter your Render domain (e.g., `math-word-problem-generator.onrender.com`).
6. Click **Save**.

This ensures teachers can log in with Google Sign-in on your Render deployment without encountering `auth/unauthorized-domain` errors.

---

## 📋 Step-by-Step Deployment Instructions

### Method 1: Using GitHub / GitLab (Recommended)
1. Push this project to your GitHub or GitLab repository.
2. Sign in to [Render.com](https://dashboard.render.com).
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Fill in the settings:
   - **Name**: `math-word-problem-generator` (or your preferred name)
   - **Region**: Choose the closest region (e.g. Oregon, Ohio, Frankfurt)
   - **Branch**: `main` (or `master`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start`
6. Scroll down to **Environment Variables**:
   - Add `NODE_ENV` = `production`
   - Add `GEMINI_API_KEY` = *your Google AI Studio key*
7. In **Advanced**, set **Health Check Path** to `/api/health`.
8. Click **Deploy Web Service**.

### Method 2: Blueprint (render.yaml)
Because this repository already contains `render.yaml`, you can also:
1. Go to **New +** ➔ **Blueprint**.
2. Select your repository.
3. Render will automatically detect `render.yaml` and configure all settings for you!
4. Enter your `GEMINI_API_KEY` when prompted and click **Apply**.
