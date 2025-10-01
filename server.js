import express from "express";
import session from "express-session";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Session middleware - CRITICAL FOR AUTH
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "nutribot-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Static files
app.use(express.static("public"));

// API routes
app.use(routes);

// Start server
app.listen(PORT, () => {
  console.log(`
    🚀 NutriBot Server Running!
    📊 Port: ${PORT}
    🔐 Session Auth: ENABLED
    🗄️  Database: Neon PostgreSQL
    🍽️  Foods: 142+ available
    ✅ SECURE & Ready!
    `);
});
