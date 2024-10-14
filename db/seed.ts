import { db } from './drizzle';
import { users, Role, articles } from './schema';
import { hashPassword } from '../lib/auth/session';

async function seed() {
  const email = 'admin@admin.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  // Insert Admin User
  const [adminUser] = await db.insert(users).values({
    name: 'Admin User',
    email: email,
    passwordHash: passwordHash,
    about: 'I am the admin user.',
    role: Role.ADMIN,
    contact: email
  }).returning();

  console.log('Admin user created:', adminUser);

  // Insert Test Articles
  const testArticles = [
    {
      image: 'https://example.com/image1.jpg',
      slug: 'test-article-1',
      title: 'Test Article 1',
      content: 'This is the content of test article 1.',
      author: adminUser.id,
      isDraft: false,
      embedding: Array(1536).fill(0),  // Example embedding of zeros
    },
    {
      image: 'https://example.com/image2.jpg',
      slug: 'test-article-2',
      title: 'Test Article 2',
      content: 'This is the content of test article 2.',
      author: adminUser.id,
      isDraft: false,
      embedding: Array(1536).fill(0),  // Example embedding of zeros
    },
    {
      image: 'https://example.com/image3.jpg',
      slug: 'test-article-3',
      title: 'Test Article 3',
      content: 'This is the content of test article 3.',
      author: adminUser.id,
      isDraft: true,
      embedding: Array(1536).fill(0),  // Example embedding of zeros
    }
  ];

  const insertedArticles = await db.insert(articles).values(testArticles).returning();
  console.log('Test articles created:', insertedArticles);
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
