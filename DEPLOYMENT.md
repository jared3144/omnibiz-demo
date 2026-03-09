# Deployment Guide: OmniBiz Multi-Business Platform (Demo)

This guide provides instructions to easily deploy the OmniBiz demo to a cloud hosting platform for sharing with prospective clients. The application is built with **React** (Vite) and an **Express/SQLite** backend.

## Deployment Strategy

Because this application relies on a local SQLite database (`database.sqlite`) via an Express backend (`server.ts`), it must be deployed to a service that supports **Node.js web services** with a persistent disk (if data must survive restarts) or as an ephemeral container where the SQLite database is re-seeded on startup.

The recommended and easiest platform for this architecture is **Render.com**.

---

## Deploying to Render.com

### Step 1: Create and Push to a GitHub Repository

If you haven't uploaded your code to GitHub yet, follow these exact steps:

1. **Initialize Git locally** (if not already done):
   Open a terminal in your project folder (`omnibiz_-multi-business-management-platform`) and run:

   ```bash
   git init
   git add .
   git commit -m "Initial commit for OmniBiz Demo"
   ```

2. **Create a Repository on GitHub**:
   - Go to [GitHub.com](https://github.com) and log in.
   - Click the **+** icon in the top right corner and select **New repository**.
   - Name your repository (e.g., `omnibiz-demo`).
   - Choose whether you want it to be **Public** or **Private**.
   - **Important:** Do *not* check "Add a README file" or "Add .gitignore" (your project already has them).
   - Click the green **Create repository** button.

3. **Link Your Local Code to GitHub**:
   GitHub will show you a page with instructions. Copy the commands under the heading **"…or push an existing repository from the command line"**. They look like this:

   ```bash
   git remote add origin https://github.com/[your-username]/[your-repo-name].git
   git branch -M main
   git push -u origin main
   ```

   Paste and run those commands in your local project terminal.

4. Your code is now securely on GitHub and ready to be deployed to Render!

### Step 2: Create a Web Service on Render

1. Go to [Render](https://render.com) and sign in.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.

### Step 3: Configure Settings

Fill out the service configuration as follows:

- **Name**: `omnibiz-demo` (or similar)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run dev` (This uses `tsx server.ts` to run both the API and serve Vite locally, but for production, you can set the Start Command to `npm start` assuming you change the start script to compile `server.ts` or run via `node`. For this demo, using `npm run dev` or `npx tsx server.ts` works perfectly as a live demo).

### Step 4: Environment Variables

Add the following Environment Variables in the Render dashboard:

- `NODE_ENV`: `production`

### Step 5: (Optional) Persistent Data

By default, Render spins down free-tier web services, which will reset the `database.sqlite` file. If you want the data to persist across deployments and restarts:

1. Go to **Disks** in your Render service settings.
2. Create a new disk named `data` and set the mount path to `/opt/render/project/src/data`.
3. Update `server.ts` to use `new Database("/opt/render/project/src/data/database.sqlite")`.

### Step 6: Deploy

Click **Create Web Service**. Render will install the dependencies, build the Vite frontend, and start the Express server.
Once complete, you will receive a Live URL (e.g., `https://omnibiz-demo.onrender.com`) to share with your clients!

---

## Verifying Local Execution

If you prefer to run it locally for clients:

```bash
# Install dependencies
npm install

# Start the application
npm run dev
```

Open a web browser and navigate to `http://localhost:3000`. You will see the fully seeded Kenyan demo data spanning the Dashboard, Businesses, Inventory, POS, and financial summaries!
