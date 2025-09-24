# 📝 NestJS Todo Playground

A comprehensive Todo backend playground built with [NestJS](https://nestjs.com/), showcasing modern backend architecture with microservices patterns, event-driven design, and AI integration. This project demonstrates advanced NestJS features, distributed systems concepts, and production-ready patterns.

---

## 🚀 Features

### Core Backend Features

- **Modular NestJS Architecture** with clean separation of concerns
- **JWT Authentication** with access & refresh tokens
- **MongoDB Integration** using Mongoose ODM
- **Redis Caching & Session Management**
- **DTO Validation** with class-validator
- **Custom Exception Handling** with structured error responses
- **Integration Testing Suite** (Jest & Supertest)

### Advanced Features

- **🔄 BullMQ Job Queue** - Delayed todo deletion with rollback support
- **🔍 Elasticsearch Integration** - Full-text search capabilities
- **🐰 RabbitMQ Event System** - Event-driven architecture for data synchronization
- **🔒 RedLock Distributed Locking** - Race condition protection
- **⚡ Real-time Search** - Instant todo search with Elasticsearch
- **🐳 Docker-Compose Setup** - Multi-container development environment

### AI & Integration

- **🤖 MCP (Model Context Protocol)** - Claude Desktop integration
- **🔧 Natural Language Interface** - Control your app via AI commands
- **📡 JSON-RPC Protocol** - Standardized AI-to-backend communication

---

## 🛠️ Tech Stack

### Backend Framework

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework (underlying NestJS)

### Databases & Storage

- **[MongoDB](https://www.mongodb.com/)** - Document database with Mongoose ODM
- **[Redis](https://redis.io/)** - In-memory caching & session storage
- **[Elasticsearch](https://www.elastic.co/)** - Full-text search engine

### Message Queues & Events

- **[BullMQ](https://bullmq.io/)** - Redis-based job queue for background tasks
- **[RabbitMQ](https://www.rabbitmq.com/)** - Message broker for event-driven architecture

### DevOps & Infrastructure

- **[Docker](https://www.docker.com/)** & **Docker Compose** - Containerization
- **[Jest](https://jestjs.io/)** - Testing framework with Supertest
- **[Swagger](https://swagger.io/)** - API documentation

### AI Integration

- **[Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io/)** - AI integration standard
- **JSON-RPC** - Remote procedure call protocol

---

## ⚙️ Installation

```bash
npm install
```

---

## 🏃‍♂️ Running the Project

```bash
$ cd docker
$ docker compose up
```

---

## 🚶 Stopping the Project

```bash
$ cd docker
$ docker compose down
```

---

## 🤖 MCP (Model Context Protocol) Integration

This project includes MCP server integration, allowing **Claude Desktop** to interact with your Todo application using natural language commands.

### 🏃‍♂️ Running MCP Server

The MCP server runs automatically when you start the Docker containers:

```bash
$ cd docker
$ docker compose up
```

This starts both:

- **HTTP API Server** (port 3000) - Regular REST API
- **MCP Server** (stdio) - Claude Desktop integration

### 🔧 Claude Desktop Setup

1. **Install Claude Desktop** from Anthropic

2. **Create/Edit Claude Desktop config file**:

   - **macOS**: `~/.config/claude-desktop/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`

3. **Add MCP server configuration**:

```json
{
  "mcpServers": {
    "nestjs-todo": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "docker-mcp-server-1",
        "node",
        "dist/mcp-server.js"
      ]
    }
  }
}
```

4. **Restart Claude Desktop** completely

### 🎯 Available MCP Tools

- `auth_register` - Register new user
- `auth_login` - User authentication and JWT token retrieval

### 💬 Example Claude Desktop Commands

Try these natural language commands in Claude Desktop:

```
Can you register a new user with:
- Full name: "John Doe"
- Nickname: "johndoe"
- Password: "secure123"
```

```
Please login user "johndoe" with password "secure123"
```

```
What MCP tools are available in this application?
```

### 🔍 Troubleshooting MCP

**Check if MCP server is running:**

```bash
docker ps | grep mcp-server
# Should show: docker-mcp-server-1
```

**View MCP server logs:**

```bash
docker logs docker-mcp-server-1
```

**Restart only MCP server:**

```bash
docker compose restart mcp-server
```

---

## 🧪 Testing

```bash
test
├── api
│   ├── auth
│   │   └── sign-in.test.ts
│   └── user
│       └── create-user.test.ts
├── common
│   ├── auth.helper.ts
│   ├── db
│   │   ├── index.ts
│   │   ├── mongo.helper.ts
│   │   └── redis.helper.ts
│   ├── helper.ts
│   ├── index.ts
│   └── user.helper.ts
├── jest-e2e.json
├── test-config.ts
└── test-setup.ts
```

---

## 🧪 To run tests

```bash
npm run test

```

---

## 📬 Example API Usage

### Authentication

```http
# Register User
POST /user
Content-Type: application/json

{
  "nickname": "johndoe",
  "fullname": "John Doe",
  "password": "secure123"
}

# Login User
POST /auth/sign-in
Content-Type: application/json

{
  "nickname": "johndoe",
  "password": "secure123"
}
```

### Todo Management

```http
# Create Todo
POST /todo
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Learn NestJS",
  "description": "Build a comprehensive todo app"
}

# Get Todos
GET /todo?page=1&limit=10&completed=false
Authorization: Bearer <access_token>

# Search Todos (Elasticsearch)
GET /todo/search?q=NestJS
Authorization: Bearer <access_token>

# Delete Todo (with 4-second delay)
DELETE /todo/:id
Authorization: Bearer <access_token>

# Cancel Deletion (within 4 seconds)
POST /todo/:id/cancel-deletion
Authorization: Bearer <access_token>
```

---

## 📁 Project Structure

- `src/` - Main application source code
- `test/` - Unit and e2e tests
- `docker/` - Docker and Docker Compose files

---

## 🤝 Contributing

Pull requests and suggestions are welcome!

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com) - Framework fundamentals
- [MongoDB & Mongoose](https://mongoosejs.com/) - Database & ODM
- [BullMQ Documentation](https://bullmq.io/) - Job queue system
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials.html) - Message broker
- [Elasticsearch Guide](https://www.elastic.co/guide/) - Search engine
- [Model Context Protocol](https://spec.modelcontextprotocol.io/) - AI integration standard
- [Docker Compose](https://docs.docker.com/compose/) - Multi-container applications
- [Jest Testing](https://jestjs.io/) - Testing framework

---

## 🪪 License

This project is for educational purposes demonstrating advanced NestJS patterns and AI integration. Currently **unlicensed**.
