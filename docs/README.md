# Nirchal E-commerce Platform

A modern e-commerce platform built with React, TypeScript, and Supabase, specializing in Indian ethnic wear.

## Features

- 🛍️ Product catalog with filtering and sorting
- 🛒 Shopping cart functionality
- 👤 User authentication and authorization
- 📱 Responsive design
- 🔐 Admin dashboard for product management
- 📦 Inventory tracking
- 📝 Order management
- 🖼️ Image upload and management
- 🔍 SEO optimization

## Tech Stack

- React
- TypeScript
- Supabase (Backend & Database)
- TailwindCSS
- React Router
- React Helmet Async
- Lucide Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nirchal-ecommerce.git
cd nirchal-ecommerce
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Run the SQL scripts in the following order:
  1. `src/db/auth_schema.sql`
  2. `src/db/admin_schema.sql`
  3. `src/db/init.sql`

5. Create an admin user:
```sql
-- After creating a user through Supabase Auth UI
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid', 'admin');
```

6. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── utils/          # Utility functions
├── config/         # Configuration files
├── db/             # Database schemas and migrations
└── types/          # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Setting up Development Environment

1. Configure your Supabase project:
   - Enable Email Auth in Authentication settings
   - Configure Row Level Security (RLS) policies
   - Set up database tables and functions

2. Install VS Code extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense

3. Set up environment variables

4. Run the database migrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any queries, please contact:
- Email: support@nirchal.com
- Website: [nirchal.com](https://nirchal.com)