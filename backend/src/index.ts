import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(
  env.PORT,
  () => {
    console.log(
      `API running on port ${env.PORT}`
    );
  }
);

function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down.`);

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));