import { loginController } from "../controllers/loginController.js";

export function loginRoute(req) {
  if (req.method === "POST") {
    return loginController.processLogin(req);
  }

  return new Response("Método no soportado en /login", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  });
}

