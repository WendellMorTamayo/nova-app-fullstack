# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Start: `npm run start`
- Lint: `npm run lint`
- Stripe commands: `npm run stripe:listen`, `npm run stripe:trigger`

## Code Style Guidelines
- Use TypeScript with strict typing
- Follow Next.js app router pattern
- Use path aliases: import from `@/components`, `@/lib`, etc.
- Components: PascalCase (e.g., `NewsCard.tsx`)
- Utilities: camelCase (e.g., `formatTime.ts`)
- Pages follow Next.js conventions with `page.tsx`
- Use Tailwind CSS for styling with shadcn UI components
- Use Convex for backend functionality
- Use Clerk for authentication

Always run `npm run lint` before submitting changes to ensure code quality.