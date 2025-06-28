import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This app uses Firebase for all data operations
  // No backend routes needed as all CRUD is handled client-side with Firebase

  const httpServer = createServer(app);

  return httpServer;
}
