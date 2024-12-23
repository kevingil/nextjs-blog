'use server'

import { db } from './drizzle';
import { users, aboutPage, AboutPage, contactPage, ContactPage } from './schema';
import { cookies } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { verifyToken } from '../lib/auth/session';
import { User } from '@/db/schema';

export async function getUser(): Promise<User | null> {
  const awaitCookies = await cookies();
  const sessionCookie = awaitCookies.get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}


export async function getAboutPage(): Promise<AboutPage | null> {
  try {
    const result = await db.select().from(aboutPage).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to fetch about page:', error);
    return null;
  }
}

export async function getContactPage(): Promise<ContactPage | null> {
  try {
    const result = await db.select().from(contactPage).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to fetch contact page:', error);
    return null;
  }
}

export async function updateAboutPage(data: Partial<AboutPage>): Promise<boolean> {
  try {
    await db.update(aboutPage)
      .set({
        ...data,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(aboutPage.id, data.id!));
    return true;
  } catch (error) {
    console.error('Failed to update about page:', error);
    return false;
  }
}

export async function updateContactPage(data: Partial<ContactPage>): Promise<boolean> {
  try {
    await db.update(contactPage)
      .set({
        ...data,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(contactPage.id, data.id!));
    return true;
  } catch (error) {
    console.error('Failed to update contact page:', error);
    return false;
  }
}


