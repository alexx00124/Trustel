import { registerController } from "../controllers/registerController.js";

export function registerRoute(req) {
  const url = new URL(req.url);

  if (url.pathname === "/register" && req.method === "POST") {
    return registerController.processRegister(req);
  }

  return new Response("Método no soportado en /register", { status: 405 });
}
