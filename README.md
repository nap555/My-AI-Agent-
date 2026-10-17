# My AI Agent

A free chat app with three modes:

- **Ask anything**: news, maths, English, chess, karate, anything
- **Maths tutor**: Class 8 Samacheer Kalvi. Explain, then practice, then hints, then full solution
- **Brainstorm**: story ideas and study ideas. Questions, then ideas, then honest feedback

## What is in this folder

| File | What it does |
|---|---|
| `index.html` | The chat page you see |
| `netlify/functions/chat.js` | The safe box. Keeps your secret key hidden and talks to Gemini |
| `netlify.toml` | Tells Netlify where the safe box is |
| `manifest.webmanifest`, `sw.js`, `*.png` | Make the app installable, with your icon and the name My AI Agent |

## Step 1: Get a free Gemini API key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account.
3. Click **Create API key**.
4. Copy the key. Treat it like a password and never post it anywhere public.

Note: Google may require the account holder to be 18 or older. If it says you cannot continue, ask a parent or guardian to sign in and create the key with you.

## Step 2: Put the project on GitHub

1. Create an account at https://github.com if you don't have one.
2. Click **New repository**, name it `my-ai-agent`, and create it.
3. Click **uploading an existing file**, then drag in everything from this folder. Keep the `netlify` folder structure exactly as it is.
4. Click **Commit changes**.

## Step 3: Put it live on Netlify

1. Create an account at https://netlify.com (you can sign in with GitHub).
2. Click **Add new site**, then **Import an existing project**, then choose **GitHub** and pick `my-ai-agent`.
3. Before you deploy, open **Site configuration > Environment variables** and add:
   - Key: `GEMINI_API_KEY`
   - Value: the key you copied in Step 1
4. Click **Deploy**. In about a minute you get a link like `https://something.netlify.app`.

If you added the key after deploying, go to **Deploys > Trigger deploy > Deploy site** so it picks up the key.

## Install it like an app (no Play Store needed)

1. Open your Netlify link in **Chrome** on your Android phone.
2. Tap the **Install this app** button at the bottom of the chat, or tap the three dots menu and choose **Install app** (or **Add to Home screen**).
3. The My AI Agent icon appears on your home screen.

## Good to know

- The free plan has daily limits. If you see "free daily limit", try again later or tomorrow.
- Don't share your link widely, or other people will use up your free limit.
- The default model is `gemini-flash-latest`. To change it, add an environment variable `GEMINI_MODEL` in Netlify.
- Dragging the folder into Netlify Drop may not include the safe box (the function), so the GitHub method above is the reliable one.
