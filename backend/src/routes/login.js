import { loginController } from "../controllers/loginController.js";

export function loginRoute(req) {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/login") {
    return loginController.processLogin(req);
  }

  return new Response("Método no soportado en /login", { status: 405 });
}
