import mysql from "mysql2/promise";  // 🔹 Conexión a MySQL
import bcrypt from "bcrypt";      

export const loginController = {
  async processLogin(req) {
    try {
      const body = await req.json();
      const { usuario, password } = body;

      // 1️⃣ Validar que los campos no estén vacíos
      if (!usuario || !password) {
        return new Response(
          JSON.stringify({ error: "Debes diligenciar todos los campos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 2️⃣ Conectarse a la base de datos
      //    🔹 Cambia los valores según tu configuración local
      const connection = await mysql.createConnection({
        host: "localhost",   // 🔹 Cambia si usas otro servidor (por ej. "127.0.0.1" o una URL remota)
        user: "root",        // 🔹 Cambia por tu usuario de MySQL
        password: "",        // 🔹 Cambia por tu contraseña
        database: "tickets", // 🔹 Cambia por el nombre de tu base de datos (por ej. "miApp", "usuariosDB", etc.)
      });

      // 3️⃣ Buscar al usuario en la base de datos
      //    🔹 Cambia 'usuarios' por el nombre de tu tabla
      //    🔹 Cambia 'usuario' por la columna donde guardas el nombre o correo
      const [rows] = await connection.execute(
        "SELECT * FROM usuarios WHERE usuario = ?",
        [usuario]
      );

      // 4️⃣ Si no se encuentra ningún usuario, devuelve error
      if (rows.length === 0) {
        await connection.end();
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 5️⃣ Comparar la contraseña escrita con la guardada (encriptada)
      //    🔹 Cambia 'password' por el nombre real de la columna donde guardas la contraseña encriptada
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        await connection.end();
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 6️⃣ Cerrar conexión después de usarla
      await connection.end();

      // 7️⃣ Si todo está bien, enviar respuesta exitosa
      return new Response(
        JSON.stringify({ mensaje: "Bienvenido, inicio de sesión exitoso" }),
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
