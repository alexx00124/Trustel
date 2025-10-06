import "dotenv/config";
import { ticketsRoute } from "./routes/ticketsRoutes.js";
import { loginRoute } from "./routes/login.js";
import { registerRoute } from "./routes/register.js";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    // Ruta base → redirigir a login
    if (url.pathname === "/") {
      return Response.redirect("/login");
    }

    // Login
    if (url.pathname === "/login" && req.method === "POST") {
      return loginRoute(req);
    }

    // Register
    if (url.pathname === "/register" && req.method === "POST") {
      return registerRoute(req);
    }

    // Tickets
    if (url.pathname.startsWith("/tickets")) {
      return ticketsRoute(req);
    }

    // No encontrada
    return new Response("Ruta no encontrada", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  },
});

console.log(`Servidor Bun corriendo en: http://localhost:${server.port}`);


