# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Start: `npm run start`
- Lint: `npm run lint`
- Stripe commands: `npm run stripe:listen`, `npm run stripe:trigger`

## Testing
- Test components with Jest and React Testing Library (see testing-strategy.md)
- Visual testing via device emulation in browser DevTools
- Manual testing across device sizes (375px to 1920px)

## Code Style Guidelines
- TypeScript with strict typing enabled (see tsconfig.json)
- Next.js app router pattern with page.tsx convention
- Use path aliases: import from `@/components`, `@/lib`, etc.
- Components use PascalCase (e.g., `NewsCard.tsx`)
- Utilities use camelCase (e.g., `formatTime.ts`)
- Use Tailwind CSS for styling with shadcn UI components
- Convex for backend functionality (API endpoints in convex/)
- Clerk for authentication (auth routes in app/(auth)/)
- Error handling: use try/catch blocks and proper type checking

Always run `npm run lint` before submitting changes to ensure code quality.