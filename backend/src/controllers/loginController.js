import bcrypt from "bcrypt";
import { getUserConnection, getSysConnection } from "../db.js";

/*
  Controlador de inicio de sesión.
  Permite que el usuario se autentique usando su nombre de usuario o su correo.
  Si el usuario es "superadmin", se conecta con privilegios SYSDBA (solo para administración).
*/

export const loginController = {
  async processLogin(req) {
    let connection;

    try {
      // --- 0) Leer body de la petición ---
      const body = await req.json();
      const { usuario, password } = body;

      // --- 1) Validar campos requeridos ---
      if (!usuario || !password) {
        return new Response(
          JSON.stringify({ error: "Debes diligenciar todos los campos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // --- 2) Decidir tipo de conexión ---
      // Si es "superadmin", conecta con SYS (privilegios especiales)
      if (usuario.toLowerCase() === "superadmin") {
        connection = await getSysConnection();
      } else {
        connection = await getUserConnection();
      }

      // --- 3) Buscar usuario por nombre o correo ---
      // Se usa una sola consulta con OR para permitir ambas opciones.
      const query = `
        SELECT usuario, correo, password 
        FROM usuarios 
        WHERE usuario = :usuario OR correo = :correo
      `;

      // Pasamos el mismo valor en ambas variables, por si el usuario escribe cualquiera de las dos.
      const result = await connection.execute(
        query,
        { usuario, correo: usuario },
        { outFormat: connection.OUT_FORMAT_OBJECT || 4002 } // 4002 equivale a oracledb.OUT_FORMAT_OBJECT
      );

      // --- 4) Validar existencia ---
      if (!result.rows || result.rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Usuario o correo no encontrado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // --- 5) Extraer datos del usuario encontrado ---
      // Como usamos OUT_FORMAT_OBJECT, podemos acceder por nombre de columna.
      const dbUser = result.rows[0];
      const dbUsuario = dbUser.USUARIO || dbUser.usuario;
      const dbCorreo = dbUser.CORREO || dbUser.correo;
      const dbPassword = dbUser.PASSWORD || dbUser.password;

      // --- 6) Comparar contraseñas ---
      const match = await bcrypt.compare(password, dbPassword);

      if (!match) {  
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // --- 7) Login exitoso ---
      // Aquí podrías generar un token o guardar sesión más adelante.
      return new Response(
        JSON.stringify({
          mensaje: `Bienvenido ${dbUsuario || dbCorreo}, inicio de sesión exitoso`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // --- 8) Manejo de errores ---
      console.error("Error en login:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      // --- 9) Cerrar conexión siempre ---
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error cerrando la conexión:", err);
        }
      }
    }
  },
};
