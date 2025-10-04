import oracledb from "oracledb";
import bcrypt from "bcrypt";

export const loginController = {
  async processLogin(req) {
    let connection;

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

      // 2️⃣ Conectarse a la base de datos Oracle
      connection = await oracledb.getConnection({
        user: "TICKETUSER",          // 🔹 Usuario de Oracle
        password: "B4b1l0n14",       // 🔹 Contraseña
        connectString: "localhost:1521/XEPDB1", // 🔹 Host:Puerto/Servicio
      });

      // 3️⃣ Buscar al usuario en la tabla
      const result = await connection.execute(
        `SELECT usuario, password FROM usuarios WHERE usuario = :usuario`,
        [usuario]
      );

      // 4️⃣ Si no se encuentra ningún usuario
      if (result.rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // ⚠️ Importante: en Oracle los resultados vienen como arrays, no objetos
      // Por eso debes acceder así:
      const [dbUsuario, dbPassword] = result.rows[0];

      // 5️⃣ Comparar la contraseña ingresada con la encriptada
      const match = await bcrypt.compare(password, dbPassword);

      if (!match) {
        return new Response(
          JSON.stringify({ error: "Usuario o contraseña incorrectos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 6️⃣ Respuesta exitosa
      return new Response(
        JSON.stringify({ mensaje: `Bienvenido ${dbUsuario}, inicio de sesión exitoso` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("Error en login:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } finally {
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
