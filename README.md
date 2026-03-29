<div align="center">
<img src="./apps/frontend/static/favicon.svg" width="80"/>

# Guest Book

**Guest book application with microservices architecture**

<a href="https://opensource.org/license/mit"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" height="24" /></a>
<a href="https://pnpm.io/"><img src="https://img.shields.io/badge/Package-PNPM-orange?style=flat-square" height="24" /></a>
<a href="https://bun.com/"><img src="https://img.shields.io/badge/Runtime-Bun-blue?style=flat-square" height="24" /></a>
<img src="https://img.shields.io/badge/Module-ECMAScript-yellow?style=flat-square" height="24" />
</div>

## Features
- Create, update, and delete guests entry
- Responsive design for use on both desktop and mobile devices
- Export report to Excel and/or PDF

## Stack Used
- [Turborepo](https://turbo.build/)
- Microservices [Elysia](https://elysiajs.com/) and [SvelteKit](https://svelte.dev/)
- [Tailwind](https://tailwindcss.com/) with [daisyUI](https://daisyui.com/)
- [MySQL](https://www.mysql.com/) with [Drizzle ORM](https://orm.drizzle.team/)

## Local Preview
1. Clone this repository to your local computer
2. Copy the default environment file and ensure all variables are correctly filled
   ```sh
   cd apps/backend
   cp .env.example .env
   ```
   ```sh
   cd apps/frontend
   cp .env.example .env
   ```
3. Install all required dependencies
   ```sh
   pnpm i
   ```
4. Run the application in development mode
   ```sh
   pnpm run dev
   ```

## Deployment
1. Clone this repository to the development server
2. Copy the default environment file and ensure all variables are correctly filled
   ```sh
   cd apps/backend
   cp .env.example .env
   ```
   ```sh
   cd apps/frontend
   cp .env.example .env
   ```
3. Install all required dependencies
   ```sh
   pnpm i
   ```
4. Optimize the application for production
   ```sh
   cd apps/frontend
   pnpm run build
   ```
5. Serve the application using PM2
   ```sh
   cd apps/backend
   pm2 start ecosystem.config.cjs
   ```
   ```sh
   cd apps/frontend
   pm2 start ecosystem.config.cjs
   ```
