# ✨ Simran Jaswal — Interactive Developer Portfolio

*Every section has its own personality. Scroll, drag, tilt and explore.*

A modern, interactive portfolio built with React, Motion and Tailwind CSS. Each section has its own visual identity, from words that light up as you read to a draggable 3D stack of project screenshots, in a dark editorial design that also comes in a light theme. All content comes from a Supabase database through an Express API and is managed from a private admin dashboard.

**🌐 Live demo:** [portfolio-simran-0106.vercel.app](https://portfolio-simran-0106.vercel.app)


---

## 🧭 Explore the portfolio

### 🏠 Home: immersive introduction
- A big, bold name set beside a full-height portrait that fades softly into the dark background.
- A short intro, "View My Work" and "Get in Touch" buttons, and résumé, email, GitHub and LinkedIn links drawn from the profile.
- Content rises into place on load, and on desktop the portrait drifts slightly with your pointer.
- A sticky navbar follows you down the page, highlights the section you're in, and collapses into a menu on smaller screens.

### 🌗 Light and dark, with a twist
- A navbar switch morphs from a crescent moon into a sun.
- The new theme spreads across the page in a circle that grows out of the button (in browsers that support it).
- Your choice is remembered and applied before the page paints, so there is no flash.

### 👤 About: personal story
- The bio's words light up one by one as you scroll, with a soft violet glow at the line you're reading. It runs backwards when you scroll up.
- Key phrases stay highlighted in violet, and four personality tags sit underneath.

### ⚡ Skills: interactive showcase
- Skills are grouped by category as frosted-glass tiles with real technology logos.
- Hover a tile and it tilts toward your pointer, lifts, catches a moving reflection, and the logo steps forward.

### 🎴 Projects: interactive gallery
- Each project gets its own space: number, title, description, technology pills, and GitHub and live-demo links, alternating left and right.
- Screenshots live in a **draggable 3D card stack**: drag or flick to move through, and a spring settles the cards. Arrows, dots, a counter and arrow keys work too.
- Click the front card to open a **full-screen viewer** with zoom, thumbnails, keyboard and swipe support.

### 💼 Experience: spotlight stage
- Each role is a chapter, with an oversized faint number that drifts as you scroll and a soft stage light from above.
- The role title is the star, and its violet rule stretches on hover. Photographs from the experience use the same draggable card stack.

### 🎓 Education: degree dossier
- Every qualification is a document-style sheet with corner crop marks and a ghosted record number.
- The sheet tilts a few degrees toward your pointer, and an archive index switches between records, with arrow-key support.
- Detail panels expand smoothly when a record has more to say.

### ✉️ Contact: get in touch
- A big "Have a good idea? Let's build it." headline, with each line rising into view.
- Your email is one click away: a button that leans toward your pointer opens your mail app, and a copy button confirms with "Email copied!".
- A message form with clear success and error feedback, and a "Back to top" link in the footer.

### 🛡️ Admin dashboard
Content is managed from a private dashboard: projects, skills, experience and education, image uploads and reordering, and contact messages. Sign in through the **Admin** link in the navbar.

---

## 🎨 Design highlights

- **Distinct identity per section:** glass tiles, a card-stack gallery, a spotlight stage and a document dossier, all in one consistent palette.
- **Near-black, off-white and violet** palette in both themes, with a fine film grain for depth.
- **Typography:** Bricolage Grotesque for headlines, Geist for text and Geist Mono for small labels.
- **Spring-based motion** for drags and settling, and subtle reveals as sections enter the screen.
- **Pointer effects only where they help:** tilt, parallax and magnetic buttons are disabled on touch screens.
- **Accessible by design:** keyboard navigation, visible focus rings, labelled controls, alt text for images, and `prefers-reduced-motion` support that swaps animation for a calm, readable layout.
- **Graceful states:** loading placeholders, empty states and friendly error messages (with a retry button on the data-heavy sections).

---

## 🚀 Featured projects

| Project | What it is | Stack | Links |
|---|---|---|---|
| **RecallPal** | A real-time face-recognition app that helps people with dementia recognize and remember the people around them, with spoken memory cards. | Next.js, Python, Flask, InsightFace, PostgreSQL, pgvector, Docker | [Live](https://recall-pal.vercel.app/) · [GitHub](https://github.com/Simranjaswal123/RecallPal) |
| **VisuGuard** | An AI-powered visual regression testing suite: it pixel-diffs each page against an approved baseline, and Claude vision explains each change and rates its severity. | React, Vite, Node.js, Express, Playwright, Supabase, Docker | [Live](http://visu-guard.vercel.app/) · [GitHub](https://github.com/Simranjaswal123/VisuGuard) |
| **Tiki-Topple** | A 2–4 player board game synced live over WebSockets, where the server holds the official game state so every move is checked there. | React, Node.js, Socket.io | [Live](https://tikitopple.vercel.app/) · [GitHub](https://github.com/Simranjaswal123/tiki-topple) |

*These are the projects currently in the portfolio's database; the live site always shows the latest.*

---

## 🛠️ Tech stack

- **Frontend:** React 19, Vite 8, React Router 7, Tailwind CSS 4
- **Animation:** [Motion](https://motion.dev), plus CSS transforms and scroll-driven effects
- **Backend:** Node.js, Express 5
- **Database, auth and image storage:** Supabase
- **Hosting:** Vercel (frontend) and Render (backend)

---

## 📱 Responsive design

- **Desktop:** two-column layouts, a full navbar, and pointer effects such as tilt and parallax.
- **Tablet and below (under 1024px):** the navbar becomes a menu, and sections stack into a single column.
- **Phones (under 640px):** the screenshot carousels use wider cards so images stay readable, and swiping replaces pointer effects.
- Nothing scrolls sideways at any size, and large text and images scale with the screen.

---

## ⚙️ Getting started

**Prerequisites:** Node.js 22.12 or newer, and a [Supabase](https://supabase.com) project. The SQL for security policies and image storage is in [`backend/sql`](backend/sql).

```bash
# Backend: http://localhost:5000
cd backend
npm install
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
npm run dev

# Frontend: http://localhost:5173 (in a second terminal)
cd frontend
npm install
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
npm run dev
```

Fill in `backend/.env` and `frontend/.env` using the comments in each [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). Never commit real keys: `.env` files are git-ignored, and the Supabase secret key belongs only in the backend.

To create a production build of the frontend:

```bash
cd frontend
npm run build
```
