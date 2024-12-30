'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { users, projects, articles, articleTags, tags, NewUser, Role } from '../db/schema';
import { comparePasswords, hashPassword, setSession } from '../lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '../db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '../lib/auth/middleware';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithDetails = await db
    .select({
      user: users,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userWithDetails.length === 0) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  const { user: foundUser } = userWithDetails[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  await setSession(foundUser);

  redirect('/dashboard');
});

const signUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { name, email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: 'Failed to create user. Please try again.' };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    name,
    email,
    passwordHash,
    role: Role.USER, // Default role
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: 'Failed to create user. Please try again.' };
  }

  await setSession(createdUser);

  redirect('/dashboard');
});

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    return { success: 'Password updated successfully.' };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    await db.delete(users).where(eq(users.id, user.id));
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, user.id));

    return { success: 'Account updated successfully.' };
  }
);

// Example function for adding a project (to demonstrate usage of the updated schema)
const addProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  url: z.string().url(),
  image: z.string().optional(),
});

export const addProject = validatedActionWithUser(
  addProjectSchema,
  async (data, _, user) => {
    const { title, description, url, image } = data;

    const newProject = {
      title,
      description,
      url,
      image,
      userId: user.id,
    };

    await db.insert(projects).values(newProject);
    return { success: 'Project added successfully.' };
  }
);
