# 📝 NestJS Todo Playground

A simple and extensible Todo backend playground built with [NestJS](https://nestjs.com/), MongoDB (Mongoose), and TypeScript. This project demonstrates modular architecture, DTO validation, custom error handling, and includes ready-to-use Docker and test setups.

---

## 🚀 Features

- Modular structure with NestJS
- Authentication (JWT tokens)
- `MongoDB` integration using Mongoose
- User registration with unique nickname validation
- DTO validation with class-validator
- Custom error and exception handling
- Ready-to-use `integration tests` (Jest & Supertest)
- `Docker support` for easy development and deployment

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

Create a user:

```http
POST /user
Content-Type: application/json

{
  "nickname": "your_nickname",
  "fullname": "Your Name",
  "password": "your_password"
}
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

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Docs](https://mongoosejs.com/)
- [Jest Docs](https://jestjs.io/)

---

## 🪪 License

This project is for educational purposes and is currently **unlicensed**.
