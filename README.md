# 🌐 Khali Social Media App

A full-stack social media application built using **React**, **Node.js**, **Express**, and **MongoDB**.
Users can create posts, like/unlike posts, comment, follow/unfollow others, and receive real-time notifications — all with a clean and modern UI.

---

## 🚀 Features

* 🔐 Authentication (Signup, Login, Logout)
* 🧑‍🤝‍🧑 Follow & Unfollow users
* 💬 Create, Like, Comment, and Delete posts
* 🖼️ Upload Profile & Cover images using **Cloudinary**
* 🔔 Notifications system (updates on likes, comments, and follows)
* 📱 Fully responsive design using **DaisyUI (Forest Theme)**
* ⚡ Optimized state management with **React Query**

---

## 🗂️ Folder Structure

```
Khali-social-media/
│
├── backend/
│   ├── controller/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── index.html
│   └── public/
│
├── .env
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in your root directory and add the following:

```
PORT=5000
DB_URL=your_mongodb_url

JWT_SECRET=your_secret_key
NODE_ENV=development

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🧰 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/khali-social-media.git
cd khali-social-media
```

### 2️⃣ Install Dependencies

Install both backend and frontend dependencies:

```bash
npm install
cd frontend
npm install
```

### 3️⃣ Run the App

To start the backend:

```bash
npm run start
```

To start the frontend:

```bash
cd frontend
npm run dev
```

---

## 🖼️ Tech Stack

**Frontend:** React, React Router, React Query, DaisyUI, Tailwind CSS
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT
**Image Hosting:** Cloudinary
**Notifications:** Real-time updates handled via API

---

## 💡 Author

Developed by **Khali**
Passionate about full-stack development and creating clean, responsive web applications.
