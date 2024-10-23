# Blog

My new blog

## Getting Started

```bash
git clone https://github.com/kevingil/blog
cd blog
pnpm install
```

## Running Locally

Setup your .env

```bash
# Database 
TURSO_CONNECTION_URL=xxxxxx
TURSO_AUTH_TOKEN=xxxxxx

# File uploads
CDN_BUCKET_NAME=xxxxxx
CDN_ACCOUNT_ID=xxxxxx
CDN_ACCESS_KEY_ID=xxxxxx
CDN_ACCESS_KEY_SECRET=xxxxxx
CDN_SESSION_TOKEN=xxxxxx
CDN_API_ENDPOINT=xxxxx
CDN_URL_PREFIX=xxx

```

Then, run the database migrations and seed the database with a default user:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

