<div align="center">

# ReetiVerse

#### *Journey Through India's Culture, One State at a Time 🇮🇳*

> *Discover the traditions, festivals, cuisines, languages, and stories that make every Indian state beautifully unique.*

<br/>

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-ReetiVerse-success?style=for-the-badge)](https://reeti-verse.vercel.app/)
[![Backend API](https://img.shields.io/badge/⚡_Backend_API-Online-blue?style=for-the-badge)](https://reetiverse.onrender.com/)

</div>

---

# 🌐 Live Deployment

| 🔗 Resource | 🌍 URL |
|------------|---------|
| 🎨 Frontend | https://reeti-verse.vercel.app/ |
| ⚡ Backend API | https://reetiverse.onrender.com/ |

> ⚠️ **Note:** The backend is deployed on Render's free tier and may take a few seconds to wake up after inactivity.

---

# 📸 Screenshots

### 🏠 Landing Page
![Landing Page](YOUR_SCREENSHOT_URL)

### 🗺️ Interactive India Map
![Map](YOUR_SCREENSHOT_URL)

### 📚 State Information Page
![State Details](YOUR_SCREENSHOT_URL)

### 🤖 AI Assistant
![AI Assistant](YOUR_SCREENSHOT_URL)

---

# ❓ Problem Statement

India is home to an extraordinary diversity of cultures, traditions, languages, cuisines, and festivals. However, information about these cultural treasures is often scattered across different sources and presented in a way that feels overwhelming.

**ReetiVerse** aims to become a single digital destination where anyone can explore, understand, and appreciate the unique identity of every Indian state through an interactive and visually engaging experience.

---

# ✨ Features

### 🗺️ Interactive India Map
- Explore every Indian state visually
- Clickable state navigation
- Immersive and intuitive UI

### 📚 Detailed Cultural Information
Discover information about:

- 🎭 Culture & Traditions
- 🎉 Festivals & Celebrations
- 🍛 Food & Cuisine
- 👗 Traditional Clothing
- 🗣️ Languages
- 🏛️ Historical Significance
- 🌄 Geography
- 📍 Tourist Attractions
- 💡 Interesting Facts

### 🤖 AI-Powered Learning
- Ask questions about any state
- Simplified explanations
- Conversational exploration of Indian heritage

### 🎨 User Experience
- Responsive Design
- Smooth Animations
- Scrollable Information Pages
- Modern UI
- Mobile Friendly

---

# ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🎨 Frontend | React, TypeScript, Vite |
| ⚡ Backend | Node.js, Express.js |
| 📦 Data | JSON-based State Dataset |
| 🚀 Deployment | Vercel & Render |

---

# 🏗️ Architecture

```mermaid
graph TD

A[👤 User] --> B[🎨 React + TypeScript Frontend]
B --> C[⚡ Express.js Backend]
C --> D[(📦 State Information Dataset)]
C --> E[🤖 AI Information Service]
C --> B

style A fill:#B22222,color:#fff,stroke:#333,stroke-width:2px
style B fill:#1E88E5,color:#fff,stroke:#333,stroke-width:2px
style C fill:#2E7D32,color:#fff,stroke:#333,stroke-width:2px
style D fill:#6A1B9A,color:#fff,stroke:#333,stroke-width:2px
style E fill:#EF6C00,color:#fff,stroke:#333,stroke-width:2px
```

---

# 🌍 User Journey

```mermaid
flowchart TD

A([🏠 Landing Page])
A --> B([🗺️ Explore India Map])
B --> C([📍 Select State])
C --> D([📚 State Categories])

D --> E1([🎭 Culture])
D --> E2([🍛 Cuisine])
D --> E3([🎉 Festivals])
D --> E4([🏛️ History])
D --> E5([🌄 Geography])

E1 --> F([🤖 Ask AI])
E2 --> F
E3 --> F
E4 --> F
E5 --> F

F --> G([✨ Learn & Explore])

style A fill:#5C3317,color:#fff
style B fill:#1565C0,color:#fff
style C fill:#2E7D32,color:#fff
style D fill:#EF6C00,color:#fff
style F fill:#8E24AA,color:#fff
style G fill:#1B5E20,color:#fff
```

---

# 📂 Folder Structure

```bash
ReetiVerse/
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   └── package.json
│
├── ⚡ backend/
│   ├── data/
│   │   └── statesData.json
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ReetiVerse.git
cd ReetiVerse
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```bash
http://localhost:5173
```

---

## Backend Setup

```bash
cd backend
npm install
npm start
```

Runs on:

```bash
http://localhost:5000
```

---

# 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000
```

### Frontend (.env)

```env
VITE_API_URL=https://reetiverse.onrender.com
```

---

# 📊 Project Highlights

| Feature | Status |
|---------|---------|
| 🗺️ Interactive State Map | ✅ |
| 📚 Detailed State Information | ✅ |
| 🤖 AI-Powered Exploration | ✅ |
| 📱 Responsive Design | ✅ |
| ⚡ Fast Navigation | ✅ |
| 🚀 Cloud Deployment | ✅ |

---

# 🔮 Future Enhancements

- 🌐 Support for regional languages
- ❤️ Save favourite states
- 🔍 Advanced search functionality
- 🧠 Personalized recommendations
- 📖 Cultural quizzes and games
- 🎙️ Voice-assisted exploration
- 📱 Progressive Web App (PWA)

---

# 🤝 Contributing

Contributions are always welcome!

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature-name

# Commit changes
git commit -m "Add feature"

# Push branch
git push origin feature-name
```

Then create a Pull Request 🚀

---

# 👩‍💻 Developer

**Dhruvi Mishra**

- 🐙 GitHub: https://github.com/dhruvim-03
- 💼 LinkedIn: https://www.linkedin.com/in/dhruvi-mishra-a86115288

---

<div align="center">

## 🇮🇳 Celebrating the Cultural Diversity of India

**Made with ❤️ by Dhruvi**

⭐ If you enjoyed this project, consider giving it a star!

</div>
