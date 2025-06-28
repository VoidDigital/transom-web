import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  initials: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  userId: z.string(),
  noteCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertProjectSchema = projectSchema.omit({
  id: true,
  noteCount: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Tag schema
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  isPiece: z.boolean().default(false), // true for Project tags, false for regular tags
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTagSchema = tagSchema.omit({
  id: true,
  isPiece: true,
  createdAt: true,
  updatedAt: true,
});

export type Tag = z.infer<typeof tagSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;

// Note schema (also called "Thoughts")
export const noteSchema = z.object({
  id: z.string(),
  content: z.string(),
  projectId: z.string(),
  userId: z.string(),
  tags: z.array(z.string()), // Array of tag IDs
  isArchived: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertNoteSchema = noteSchema.omit({
  id: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNoteSchema = noteSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type Note = z.infer<typeof noteSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
