
import bcrypt from "bcrypt";
import { getUserConnection, getSysConnection } from "../db.js";


export const loginController = {
  async processLogin(req) {
    let connection;

    try {
      const body = await req.json();
      const { usuario, password } = body;

      // 🔹 Validación de campos
      if (!usuario || !password) {
        return new Response(
          JSON.stringify({ error: "Debes diligenciar todos los campos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 🔹 Si el usuario es "superadmin", conecta como SYS
      if (usuario.toLowerCase() === "superadmin") {
        connection = await getSysConnection();
      } else {
        connection = await getUserConnection();
      }

      // 🔹 Buscar usuario en la tabla
      const result = await connection.execute(
        `SELECT usuario, password 
         FROM usuarios 
         WHERE usuario = :usuario`,
        [usuario]
      );

      // 🔹 Validar si el usuario existe
      if (!result.rows || result.rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Oracle devuelve filas como array
      const [dbUsuario, dbPassword] = result.rows[0];

      // 🔹 Comparar la contraseña encriptada
      const match = await bcrypt.compare(password, dbPassword);

      if (!match) {
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 🔹 Si todo está bien → login exitoso
      return new Response(
        JSON.stringify({ mensaje: `✅ Bienvenido ${dbUsuario}, inicio de sesión exitoso` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("❌ Error en login:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      // 🔹 Cerrar la conexión
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error cerrando la conexión:", err);
        }
      }
    }
  }
};
