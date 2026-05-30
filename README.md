# CollabBoard – Real-time Collaborative Whiteboard (Microservices Architecture)

CollabBoard is a high-performance, real-time collaborative whiteboard application designed using a scalable microservices architecture. It allows multiple users to draw, communicate, and share ideas simultaneously. The platform enables users to create or join rooms, collaborate on a shared canvas, chat in real time, and manage participants seamlessly. 

The backend is built as a distributed microservices system utilizing **Java (Spring Boot)** and **Golang** to handle high concurrency, data persistence via **PostgreSQL** and **MariaDB**, and real-time event synchronization using **WebSockets** and **Redis Pub/Sub**.

---

## 🚀 Features

### 🔐 Authentication & User Microservice (Java / Spring Boot)
* Secure user authentication and token handling using **JWT (JSON Web Tokens)**
* Federated login with **Google OAuth2** integrated via Spring Security
* Object-Oriented programming (OOP) principles for user profile management, session tracking, and access roles (Host vs. Member)
* Persistent storage of user profiles and credential audits in **PostgreSQL**

### 🎨 Realtime Whiteboard & Collaboration Microservice (Golang)
* Pencil drawing, eraser, and geometric shape tools (Rectangle, Circle, Triangle, Line)
* Multi-user drawing synchronization powered by a high-throughput **Golang WebSocket Server**
* Concurrency model leveraging Go's **Goroutines and Channels** to handle thousands of concurrent WebSocket connections efficiently
* **Redis Pub/Sub** for broadcasting draw events across multiple horizontal microservice instances
* State management for Undo/Redo operations and canvas clear requests
* Export whiteboard states as PNG

### 💬 Communication & Chat Microservice (Golang)
* Real-time room chat system with typing indicators and file sharing
* High-performance relational schema in **MariaDB** for chat logs and room history retrieval
* Asynchronous message storage using execution pools to ensure low-latency message delivery

### 🤖 Smart Board Analytics Microservice (Java / Spring Boot)
* AI-powered board analysis converting canvas structures into structured descriptors using Claude API
* Shape-snap feature transforming rough sketch points into clean geometric shapes
* Sticky notes and active session timer features

---

## 🛠️ Tech Stack & Architecture

### Frontend
* React.js (Vite) / Canvas API / Context API
* Socket.io Client
* Lucide Icons

### Backend (Microservices)
* **Java (Spring Boot / Spring Security):** Auth Service, Profile Service, and AI Integration.
* **Golang:** Real-time Collaboration Engine, WebSocket Handlers, and Chat Service.
* **Databases:**
  * **PostgreSQL:** Handles relational transactional data (Users, Rooms, Canvas States).
  * **MariaDB:** Handles chat logs, audit tracking, and message history.
  * **Redis:** In-memory store for active session states and Pub/Sub event distribution.
* **Network & Protocols:** WebSockets (over TCP), HTTP/2, REST APIs, CORS.
* **Security & Practices:** SSL/TLS termination, SQL Injection protection via parameterized queries/ORM, JWT validation middleware, and secure password hashing (BCrypt).
* **Deployment & DevOps:** Docker containerization, Docker Compose for local orchestration, Kubernetes deployment configurations.

---

## 📂 Project Structure

```
CollabBoard
│
├── client                         # React Frontend
│   ├── src
│   │   ├── components             # Reusable UI elements
│   │   ├── pages                  # React Pages (Board, Lounge, Login)
│   │   └── context                # Client-side state management
│   
├── services
│   ├── auth-service (Java)        # Spring Boot Auth/User management
│   ├── collab-service (Golang)    # WebSocket sync & collaboration engine
│   ├── chat-service (Golang)      # Message storage and chat engine
│   └── ai-service (Java)          # AI board analyzer integrations
│
└── docker-compose.yml             # Orchestration for local development
```

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
Ensure you have the following installed:
* Java Development Kit (JDK 17 or higher)
* Go (1.20 or higher)
* Docker & Docker Compose
* Node.js & npm (for the React client)

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=collabboard_db

MARIADB_ROOT_PASSWORD=your_mariadb_password
MARIADB_DATABASE=collabboard_chat

# Security Configs
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=86400

# Google OAuth Configs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

CLIENT_URL=http://localhost:5173
```

### 3. Run with Docker Compose
Orchestrate all services (Java Auth, Golang Collab, Chat, Postgres, MariaDB, and Redis) locally:
```bash
docker-compose up --build
```

### 4. Run the Frontend Client
Navigate to the client directory and run the development server:
```bash
cd client
npm install
npm run dev
```

---

## 📌 Future Scaling & Architecture Goals
* Kubernetes implementation with horizontal pod autoscalers based on WebSocket CPU utilization
* Database sharding for PostgreSQL as canvas drawings scale
* Redis cluster integration for distributed caching of room canvas paths
