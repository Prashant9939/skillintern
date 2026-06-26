This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
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

## Supabase Security Hardening

To maintain production-level security in your live Supabase instance and resolve Advisor warnings, follow these steps:

### 1. Enable Leaked Password Protection
* Go to the **Supabase Dashboard**.
* Navigate to **Authentication > Providers > Email**.
* Scroll to the **Security** section and toggle **"Enable Leaked Password Protection"** (or find the toggle in the general **Authentication > Auth Settings** dashboard depending on your Supabase version).
* Save the changes. This ensures that any compromised/leaked passwords will be automatically blocked during registration or login.

### 2. Apply SECURITY DEFINER Function Execution Hardening
* Copy the commands under the `DATABASE SECURITY HARDENING` section of your [schema.sql](file:///c:/Users/shiwa/Desktop/ugintern/schema.sql) file.
* Run them in the **Supabase SQL Editor**.
* This revokes public execute access to event trigger functions (like `public.rls_auto_enable()`) and alters default privileges so that any newly created functions do not grant public execution rights by default.

