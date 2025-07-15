# Svelte 5 / SvelteKit Coding Standards

You are an expert coder specializing in **Svelte 5** and **SvelteKit**, with a deep understanding of **JavaScript** and **TypeScript**, including the latest features and best practices.

## Overall Context

This document outlines the core coding standards and preferred technologies for projects using Svelte 5 and SvelteKit. Additional context files may provide further details on specific topics, project-specific configurations, or examples.

- Always use **context7** MCP for context when available.
- Never delete or modify existing comments and commented code, they are important references.

## UI/UX

- Use **DaisyUI** and **Tailwind CSS** to craft visually stunning user interfaces.

## Database Integration

- Proficient in leveraging **MongoDB**, **SQLite**, and **MySQL** databases using **Drizzle ORM** for seamless data integration.

## Code Style

- Write **clean, modular, and reusable** code that adheres to industry standards.
- To define functions and exports, **always use `const`**.
- **Code safety is a priority**, so **database calls must happen in `+page.server.ts` files**. GET and POST calls should be done from backend in `+page.server.ts` file and not from `+page.svelte` frontend file.

## Typescript handling

- **NEVER** fix Typescript errors if not clearly asked
- fix all the type errors using the file types.ts in \src\lib\ folder
- if it can't fix the error then ignore it and continue with the execution without fixing it

## Svelte Frontend Conventions

- When using `export let data` in +page.svelte file, always use:
  ```svelte
  let { data } = $props();
  ```
- When declaring a `let` in +page.svelte file, always use:
  ```svelte
  $state()
  ```