# E-commerce CMS

A modern, full-featured e-commerce content management system built with Next.js, TypeScript, and Turborepo.

## 🚀 Features

- **Modern Tech Stack**
  - Next.js 15 with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Radix UI for accessible components
  - TipTap for rich text editing
  - Clerk for authentication
  - Convex for backend
  - Zustand for state management

- **E-commerce Features**
  - Product management
  - Collection management
  - Order processing
  - Customer management
  - Payment integration
  - Shipping configuration
  - Rich text editor for product descriptions
  - Image upload and management

## 📦 Project Structure

```
ecommerce-cms/
├── apps/
│   └── web/           # Next.js frontend application
├── packages/
│   └── backend/       # Shared backend logic
├── turbo.json         # Turborepo configuration
└── pnpm-workspace.yaml # PNPM workspace configuration
```

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 15
  - React 19
  - TypeScript
  - Tailwind CSS
  - Radix UI Components
  - TipTap Editor
  - Zustand
  - React Hook Form
  - Zod

- **Backend**
  - Convex
  - Clerk Authentication
  - Resend for emails

- **Development Tools**
  - Turborepo
  - PNPM
  - ESLint
  - Prettier
  - TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PNPM 8+
- A Clerk account for authentication
- A Convex account for backend

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-cms.git
   cd ecommerce-cms
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `apps/web` directory with the following variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CONVEX_URL=your_convex_url
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Run TypeScript type checking
- `pnpm prettier:check` - Check code formatting
- `pnpm prettier:write` - Format code

## 🏗️ Project Structure

- `apps/web/` - Next.js frontend application
  - `app/` - Next.js app router pages
  - `components/` - Reusable React components
  - `lib/` - Utility functions and shared logic
  - `hooks/` - Custom React hooks
  - `types/` - TypeScript type definitions

- `packages/backend/` - Shared backend logic
  - `convex/` - Convex backend functions
  - `types/` - Shared TypeScript types

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Turborepo](https://turbo.build)
- [Clerk](https://clerk.com)
- [Convex](https://convex.dev)
- [Radix UI](https://www.radix-ui.com)
- [TipTap](https://tiptap.dev)
