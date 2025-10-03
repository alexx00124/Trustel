import { loginController } from "../controllers/loginController.js";

export function loginRoute(req){
  const url = new URL (req.url);

  if (url.method === "POST" && url.pathname === "/login"){
    return loginController.procesLogun(req);
  }
  return new Response ("metodo no soportado en /login", {status:405});
}