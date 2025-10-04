import oracledb from "oracledb";
import bcrypt from "bcrypt";

export const registerController = {
  async processRegister(req) {
    let connection;

    try {
      const body = await req.json();
      const { usuario, password } = body;

      // 1️⃣ Conexión a Oracle
      connection = await oracledb.getConnection({
        user: "TICKETUSER",          // 🔹 Tu usuario de Oracle
        password: "B4b1l0n14",       // 🔹 Tu contraseña de Oracle
        connectString: "localhost:1521/XEPDB1", // 🔹 Host:Puerto/Servicio (ajústalo a tu Oracle)
      });

      // 2️⃣ Validar que los campos no estén vacíos
      if (!usuario || !password) {
        return new Response(
          JSON.stringify({ error: "Debes llenar todos los campos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 3️⃣ Verificar si el usuario ya existe
      const result = await connection.execute(
        `SELECT usuario FROM usuarios WHERE usuario = :usuario`,
        [usuario]
      );

      if (result.rows.length > 0) {
        return new Response(
          JSON.stringify({ error: "El usuario ya está registrado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 4️⃣ Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // 5️⃣ Insertar el nuevo usuario
      await connection.execute(
        `INSERT INTO usuarios (usuario, password) VALUES (:usuario, :password)`,
        [usuario, hashPassword],
        { autoCommit: true } // 🔹 Muy importante en Oracle
      );

      // 6️⃣ Responder con éxito
      return new Response(
        JSON.stringify({ mensaje: "Usuario registrado correctamente" }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("Error en el registro:", error);
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
  },
};
