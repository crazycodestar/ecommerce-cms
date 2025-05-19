# E-commerce CMS

A modern, full-stack e-commerce content management system built with Next.js, Turborepo, and Convex.

## Features

- 🛍️ Complete e-commerce functionality
- 📧 Email notifications for orders
- 🔐 Secure authentication
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🚀 Fast development with Turborepo
- 🔄 Real-time updates with Convex
- 📦 Monorepo architecture

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Convex
- **Authentication**: Clerk
- **Email**: React Email
- **Build Tool**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Convex account
- Clerk account

## Getting Started

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
```bash
cp .env.example .env
```
Fill in the required environment variables in `.env`

4. Start the development server:
```bash
pnpm dev
```

## Project Structure

```
ecommerce-cms/
├── apps/
│   ├── web/           # Next.js frontend application
│   └── template/      # Template application
├── packages/
│   └── backend/       # Backend services and utilities
├── package.json
└── turbo.json
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build all applications
- `pnpm check-types` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or open an issue in the repository.
