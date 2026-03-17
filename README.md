# CollabBoard – Real-time Collaborative Whiteboard

CollabBoard is a full-stack real-time collaborative whiteboard application that allows multiple users to draw, communicate, and share ideas simultaneously. The platform enables users to create or join rooms, collaborate on a shared canvas, chat in real time, and manage participants seamlessly. It is designed to provide an interactive environment similar to modern collaborative tools like Miro or Excalidraw.

---

## 🚀 Features

### 🔐 Authentication

* Secure user authentication using **JWT**
* **Google OAuth login** using Passport.js
* User profile with name, email, and avatar

### 🎨 Realtime Whiteboard

* Pencil drawing tool
* Eraser tool
* Shape tools (Rectangle, Circle, Triangle, Line)
* Undo / Redo functionality
* Clear board
* Export whiteboard as PNG
* Color palette and brush size selection

### 👥 Realtime Collaboration

* Multi-user drawing with **Socket.io**
* Live synchronization of drawings and shapes
* Online participants list
* Host and member roles
* Room creation and joining via Room ID

### 💬 Communication

* Realtime chat system
* Typing indicators
* File sharing in chat
* Chat history stored in database

### 🤖 Smart Tools

* AI-powered board analysis
* Shape-snap feature to convert rough drawings into shapes
* Sticky notes panel
* Session timer

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Context API
* Socket.io Client
* Canvas API
* Lucide Icons

### Backend

* Node.js
* Express.js
* MongoDB with Mongoose
* Socket.io

### Authentication

* JWT Authentication
* Google OAuth (Passport.js)

### Additional Services

* Cloudinary (file uploads)
* Claude API (AI analysis)

---

## 📂 Project Structure

```
CollabBoard
│
├── client          # React frontend
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   └── utils
│
├── server          # Express backend
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   └── sockets
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/collabboard.git
cd collabboard
```

### 2. Install Dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

### 3. Environment Variables

Create a `.env` file in the backend folder.

Example:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/CollabBoard
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLIENT_URL=http://localhost:5173
```

---

### 4. Run the Application

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

## 📌 Future Improvements

* Screen sharing functionality
* Text tool improvements
* Advanced shape editing
* Infinite canvas
* Role-based permissions
* Performance optimization for large boards

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is open source and available under the MIT License.
