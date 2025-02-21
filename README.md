# Forecasting

Forecasting is a simple full-stack weather forecast application that includes a web front-end, a backend API service, and an iOS client. The project demonstrates a complete solution by combining modern web technologies with native iOS development.

## Features

- **Full-Stack Implementation**: Combines a web front-end, backend API services, and an iOS client.
- **Real-Time Weather Forecast**: Fetches and displays the latest weather data.
- **Modern Tech Stack**: Built with React, TypeScript, Bun, Tailwind CSS, Nest.js, and Prisma.
- **Efficient Development**: Uses a monorepo workspace to manage front-end and backend dependencies, with Husky and lint-staged ensuring code quality.

## Tech Stack

### Front-End

- **Framework & Language**: React + TypeScript
- **Styling**: Tailwind CSS (integrated with `prettier-plugin-tailwindcss` to maintain a consistent code style)
- **Runtime & Build Tool**: Bun

### Back-End

- **Framework**: Built with [Nest.js](https://nestjs.com/)
- **Database ORM**: Uses [Prisma](https://www.prisma.io/) for database interaction
- **Language & Runtime**: TypeScript + Bun
- **API Service**: Provides endpoints to deliver weather data

### iOS Application

- **Development Language**: Swift / SwiftUI (refer to the `TForecast` directory for details)
- **Functionality**: A native iOS client that interacts with the backend to fetch and display weather data

## Installation and Running

### Prerequisites

- [Bun](https://bun.sh/) installed
- Xcode installed (if building the iOS application)
- Git

### Cloning the Repository

```bash
git clone https://github.com/Hirate99/forecasting.git
cd forecasting
```

### Installing Dependencies

This project uses a monorepo workspace to automatically manage dependencies for both front-end and back-end:

```bash
bun install
```

### Development Environment

Start the development servers for both the front-end and back-end:

```bash
bun run dev
```

This command uses [concurrently](https://www.npmjs.com/package/concurrently) to run both servers simultaneously.

### Production Build

Build all projects:

```bash
bun run build
```

### Starting the Production Server

Start the backend service in production mode:

```bash
bun run start
```

### iOS Application

Navigate to the `TForecast` directory, open the corresponding Xcode project file, and follow the provided instructions to build and run the iOS app.

## Directory Structure

```
forecasting/
├── frontend/         # Front-end React application
├── backend/          # Backend API service (using Nest.js and Prisma)
└── TForecast/        # iOS application project
```

## Code Quality and Tools

- **Git Hooks**: Husky and lint-staged automatically format code before commits.
- **Concurrent Development**: The concurrently tool is used to run both front-end and backend development servers simultaneously, enhancing development efficiency.

## License

This project is licensed under the [GPL-3.0 License](./LICENSE.txt).
