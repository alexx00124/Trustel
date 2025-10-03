import bcrypt from "bcrypt";

// Simulación: un usuario guardado en "base de datos"
const fakeUser = {
  usuario: "admin",
  // Este hash corresponde a la contraseña "1234"
  passwordHash: "$2b$10$uivUo4rpKvU7QMTibU0vM.9cnEHE8UgZsBbX29uGdNPhLzWfDHI6G"
};

export const loginController = {
  async processLogin(req) {
    try {
      const body = await req.json();
      const { usuario, password } = body;

      if (!usuario || !password) {
        return new Response(
          JSON.stringify({ error: "Faltan campos usuario o contraseña" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Aquí "buscarías" en tu base de datos el usuario
      if (usuario !== fakeUser.usuario) {
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Comparar contraseña con el hash guardado
      const match = await bcrypt.compare(password, fakeUser.passwordHash);

      if (!match) {
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // ✅ Login exitoso
      return new Response(
        JSON.stringify({ mensaje: "✅ Login exitoso", usuario }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("Error en login:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
