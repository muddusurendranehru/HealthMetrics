import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string; // UUID string from users.id
    userEmail?: string;
    userName?: string;
  }
}
