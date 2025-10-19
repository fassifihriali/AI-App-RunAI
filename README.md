# 🧠 AI Content Creation & Management API

## 🚀 Project Description
This project is an **intelligent backend API** that enables **AI-assisted content creation and management**.  
Using **Google Gemini** and **OpenAI** models, the API provides advanced features like article generation, blog title generation, AI image generation, background or object removal from images, and resume analysis & review.

It integrates **Clerk** for authentication and subscription management (Free/Premium), uses **Neon PostgreSQL** for database storage, and **Cloudinary** for media management.

---

## 🎯 Project Objective
The main objectives of this project are to provide a **robust and extensible backend platform** that allows:

- **AI-powered content creation** (text and image) based on user prompts.
- **User creations management** (save, publish, like/unlike).
- **Automated resume review** (PDF analysis).
- **Seamless integration with a modern frontend** (React, Next.js, etc.).
- **Subscription-based feature access** (Free vs Premium) limiting or unlocking certain features.

---

## ✨ Main Features

### 🧩 AI Features
- **Generate Article:** Create a full article from a user prompt.  
- **Generate Blog Title:** Generate optimized blog titles.  
- **Generate Image:** AI-powered image generation from text prompts (OpenAI DALL·E).  
- **Remove Image Background:** Automatic background removal (Cloudinary AI).  
- **Remove Image Object:** Remove a specific object from an image.  
- **Resume Review:** Review and provide feedback on a PDF resume via Gemini AI.

### 👥 User Management
- **Auth & Plans:** Secure authentication via Clerk (Free & Premium).  
- **Free Usage Limit:** 10 free uses before upgrade is required.  
- **User Creations:** View personal creations (articles, images, etc.).  
- **Published Creations:** View publicly shared creations.  
- **Likes System:** Like or unlike public creations.

### 🗄️ Data Management
- **Cloudinary:** Store and manage images.  
- **Neon PostgreSQL:** Structured data management (users, creations).  
- **Multer:** File uploads (images, PDFs).  

---

## 🧰 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend Framework** | Node.js, Express.js |
| **AI Integration** | OpenAI API, Google Gemini API |
| **Auth & User Management** | Clerk |
| **Database** | Neon (PostgreSQL serverless) |
| **File Upload** | Multer |
| **Cloud Storage** | Cloudinary |
| **PDF Processing** | pdf-parse |
| **Environment Management** | dotenv |
| **Deployment Ready** | Compatible with Vercel / Render / Railway |

