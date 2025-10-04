import { ticketsRoute } from "./src/routes/ticketsRoutes.js";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    // Ruta /tickets
    if (url.pathname === "/tickets") {
      return ticketsRoute(req);
    }

    // Ruta raíz
    if (url.pathname === "/") {
      return new Response("🚀 Servidor Bun funcionando correctamente", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Si no existe la ruta
    return new Response("❌ Ruta no encontrada", { status: 404 });
  },
});

console.log(`✅ Servidor Bun corriendo en: http://localhost:${server.port}`);


