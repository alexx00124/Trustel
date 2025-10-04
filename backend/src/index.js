import { loginRoute } from "./routes/login";

const server = Bun.serve({
  port : 3000, //donde se va aprender el server
  fetch(req){
    const url = new URL(req.url);

    if (url.pathname === ("/")){
      return Response.redirect("login") //redirige al login
    }

    if (url.pathname.startsWith("/login")){
      return loginRoute(req); // dirige al login 
    }

    if (url.pathname.startsWith("/register")){
      return registerRoute(req);
    }
    
    if (url.pathname.startsWith("/tickets")){
      return ticketsRoute(req); // dirige a los tickets
    }
    return new Response ("Ruta no encontrada ", {status : 404});
  },
});
console.log (`Servidor corriendo http://localhost:${server.port}`)