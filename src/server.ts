import "dotenv/config";
import app from "./app";
import connectDB from "./config/db";
import cloudinary from "./config/cloudinary";

const PORT = process.env.PORT || 3000;

// Catch synchronous uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });

    // Catch unhandled asynchronous promise rejections
    process.on("unhandledRejection", (err: Error) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
};

startServer();
