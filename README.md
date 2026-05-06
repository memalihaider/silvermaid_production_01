# Silver Maid - ERP System

A comprehensive Enterprise Resource Planning (ERP) system for Silver Maid, a Dubai-based cleaning services company. This system integrates a public business website, content management system (CMS), and full-featured admin portal with role-based access control.
## Development

**API Basic Auth setup**

 - The app enforces basic auth for some API routes. The middleware looks for one username env var and one password env var. Allowed names are:
	 - Username: `BLOG_API_USER`, `BLOG_API_USERNAME`, `API_BASIC_AUTH_USER`, `API_BASIC_AUTH_USERNAME`, `BASIC_AUTH_USER`, `BASIC_AUTH_USERNAME`
	 - Password: `BLOG_API_PASSWORD`, `BLOG_API_PASS`, `API_BASIC_AUTH_PASSWORD`, `API_BASIC_AUTH_PASS`, `BASIC_AUTH_PASSWORD`, `BASIC_AUTH_PASS`

 - For local development copy `.env.example` to `.env.local` and set values. On hosting (Vercel, Netlify, etc.) add one username key and one password key using the host UI and redeploy.

 - To test the endpoint locally or from your workstation, use the included script:

```bash
# make executable once
chmod +x scripts/test-basic-auth.sh

# simple GET test
scripts/test-basic-auth.sh your_username your_password https://www.silvermaidsdubai.com/api/media

# multipart file upload test
scripts/test-basic-auth.sh your_username your_password https://www.silvermaidsdubai.com/api/media /path/to/image.png
```

 - If you're using n8n's HTTP Request node, set Authentication -> Basic Auth with the same username/password, and set Body Content Type to `multipart/form-data` for uploads.
# Silver Maid - ERP System

A comprehensive Enterprise Resource Planning (ERP) system for Silver Maid, a Dubai-based cleaning services company. This system integrates a public business website, content management system (CMS), and full-featured admin portal with role-based access control.

## Features

### Public Website
- Professional business website with SEO optimization
- Service booking system
- Dynamic content management
- Contact forms and lead generation

### Admin ERP Portal
- **CRM**: Lead management, client database, pipeline tracking
- **Quotation Management**: Auto-generated quotes, version control, PDF generation
- **Job Management**: Scheduling, team assignment, progress tracking
- **HR Management**: Employee profiles, attendance, payroll
- **Finance**: Invoicing, payments, financial reports
- **Meetings**: Calendar management, scheduling, notes
- **CMS**: Content management for website
- **Settings**: Role-based access control, user management

### Client Portal
- Service booking and management
- Invoice viewing and payment
- Service history and feedback
- Support ticket system

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM (configured)
- **Authentication**: To be implemented
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Project Structure

```
app/
├── (public)/          # Public website pages
│   ├── page.tsx       # Home page
│   ├── about/
│   ├── services/
│   ├── pricing/
│   ├── book-service/
│   ├── contact/
│   ├── careers/
│   └── blog/
├── (admin)/           # Admin ERP portal
│   ├── layout.tsx
│   ├── dashboard/
│   ├── crm/
│   ├── quotations/
│   ├── jobs/
│   ├── hr/
│   ├── finance/
│   ├── meetings/
│   ├── cms/
│   └── settings/
├── (client)/          # Client portal
│   ├── layout.tsx
│   ├── dashboard/
│   └── ...
├── globals.css
├── layout.tsx         # Root layout
└── page.tsx           # Redirect or landing

components/
├── ui/                # Reusable UI components
└── ...

lib/
└── utils.ts           # Utility functions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the public website
5. Access admin portal at [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
6. Access client portal at [http://localhost:3000/client/dashboard](http://localhost:3000/client/dashboard)

## Routes

- `/` - Public home page
- `/admin/*` - Admin ERP portal (role-based access)
- `/client/*` - Client portal
- Public pages: `/about`, `/services`, `/pricing`, `/book-service`, `/contact`, `/careers`, `/blog`

## Development Notes

- Database and authentication systems are configured but need implementation
- Role-based access control framework is in place
- AI features integration points are prepared
- Mobile-responsive design implemented
- Export functionality for reports (PDF/Excel) to be added

## Business Context

This system is specifically designed for UAE/Dubai cleaning services industry with:
- VAT compliance
- Local business workflows
- Arabic language support preparation
- Dubai municipality integration points
- WhatsApp integration for communications
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
