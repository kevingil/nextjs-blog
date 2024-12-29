import { db } from './drizzle';
import { 
  users, 
  Role, 
  articles, 
  tags, 
  articleTags, 
  aboutPage, 
  contactPage 
} from './schema';
import { hashPassword } from '../lib/auth/session';

async function seed() {
  // Create admin user
  const email = 'admin@admin.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);
  
  const [adminUser] = await db.insert(users).values({
    name: 'Admin User',
    email: email,
    passwordHash: passwordHash,
    role: Role.ADMIN
  }).returning();
  
  console.log('Admin user created:', adminUser);

  // Create tags
  const tagData = [
    { name: 'Technology' },
    { name: 'Web Development' },
    { name: 'Programming' },
    { name: 'Design' },
    { name: 'Tutorial' }
  ];

  const insertedTags = await db.insert(tags)
    .values(tagData)
    .returning();
  
  console.log('Tags created:', insertedTags);

  // Create test articles with more realistic content
  const testArticles = [
    {
      image: 'https://pub-77540a26e0ed46cb9cd842883ee82a7f.r2.dev/IMG_9460.JPEG',
      slug: 'getting-started-with-nextjs',
      title: 'Getting Started with Next.js: A Comprehensive Guide',
      content: `
        Next.js has revolutionized the way we build React applications. In this comprehensive guide,
        we'll explore the key features that make Next.js a powerful framework for building modern web applications.
        
        We'll cover:
        - Server-side rendering
        - Static site generation
        - API routes
        - File-based routing
        
        Let's dive in and discover how Next.js can enhance your development workflow.
      `.trim(),
      author: adminUser.id,
      isDraft: false,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      embedding: Array(1536).fill(0),
    },
    {
      image: 'https://pub-77540a26e0ed46cb9cd842883ee82a7f.r2.dev/806be441-planetscale.png',
      slug: 'typescript-best-practices-2024',
      title: 'TypeScript Best Practices for 2024',
      content: `
        TypeScript continues to grow in popularity, and for good reason. This article explores
        the latest best practices for TypeScript development in 2024.
        
        Topics covered:
        - Type inference
        - Generic constraints
        - Utility types
        - Error handling patterns
        
        Follow these guidelines to write more maintainable TypeScript code.
      `.trim(),
      author: adminUser.id,
      isDraft: false,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      embedding: Array(1536).fill(0),
    },
    {
      image: 'https://pub-77540a26e0ed46cb9cd842883ee82a7f.r2.dev/htmx.png',
      slug: 'web-security-essentials',
      title: 'Web Security Essentials Every Developer Should Know',
      content: `
        Security should be a top priority for every web developer. This guide covers
        essential security concepts and best practices for modern web applications.
        
        Key topics:
        - XSS prevention
        - CSRF protection
        - SQL injection
        - Authentication best practices
        
        Learn how to protect your applications from common security vulnerabilities.
      `.trim(),
      author: adminUser.id,
      isDraft: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      embedding: Array(1536).fill(0),
    }
  ];

  const insertedArticles = await db.insert(articles)
    .values(testArticles)
    .returning();
  
  console.log('Articles created:', insertedArticles);

  // Create article-tag relationships
  const articleTagRelations = [
    // First article tags
    {
      articleId: insertedArticles[0].id,
      tagId: insertedTags[0].id, // Technology
    },
    {
      articleId: insertedArticles[0].id,
      tagId: insertedTags[1].id, // Web Development
    },
    // Second article tags
    {
      articleId: insertedArticles[1].id,
      tagId: insertedTags[2].id, // Programming
    },
    {
      articleId: insertedArticles[1].id,
      tagId: insertedTags[4].id, // Tutorial
    },
    // Third article tags
    {
      articleId: insertedArticles[2].id,
      tagId: insertedTags[0].id, // Technology
    },
    {
      articleId: insertedArticles[2].id,
      tagId: insertedTags[2].id, // Programming
    }
  ];

  await db.insert(articleTags)
    .values(articleTagRelations);
  
  console.log('Article tags created');

  // Create about page
  const aboutPageData = {
    title: 'About Me',
    content: `
      Hi, I'm Admin User, a full-stack developer with a passion for building 
      modern web applications. I specialize in React, TypeScript, and Node.js, 
      and I love sharing my knowledge through writing and teaching.

      This blog is where I share my experiences, insights, and tutorials about 
      web development, programming best practices, and emerging technologies.
    `.trim(),
    profileImage: 'https://kevingil.com/images/profile.jpg',
    metaDescription: 'Learn more about Admin User, a full-stack developer sharing insights about web development and programming.',
    lastUpdated: new Date().toISOString(),
  };

  await db.insert(aboutPage)
    .values(aboutPageData);
  
  console.log('About page created');

  // Create contact page
  const contactPageData = {
    title: 'Contact Me',
    content: `
      I'm always interested in connecting with fellow developers and potential collaborators. 
      Whether you have a question about one of my articles, want to discuss a potential project, 
      or just want to say hi, feel free to reach out!
    `.trim(),
    emailAddress: 'admin@admin.com',
    socialLinks: JSON.stringify({
      github: 'https://github.com/adminuser',
      twitter: 'https://twitter.com/adminuser',
      linkedin: 'https://linkedin.com/in/adminuser'
    }),
    metaDescription: 'Get in touch with Admin User for collaboration, questions, or feedback.',
    lastUpdated: new Date().toISOString(),
  };

  await db.insert(contactPage)
    .values(contactPageData);
  
  console.log('Contact page created');
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
