import oracledb from "oracledb";
import bcrypt from "bcrypt";

// Nota: Bun carga automáticamente las variables del .env en process.env,
// así que no necesitas dotenv si ejecutas con Bun.
export const registerController = {
  async processRegister(req) {
    let connection;

    try {
      // --- 0) Leer body ---
      const body = await req.json();
      const { usuario, correo, password } = body;

      // --- 1) Conexión a la base usando variables de entorno ---
      // process.env.DB_USER, DB_PASSWORD, DB_CONNECT deben estar en tu .env
      connection = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT, // ej: localhost:1521/XEPDB1
      });

      // (Opcional) devolver filas como objetos en vez de arrays:
      // oracledb.OUT_FORMAT_OBJECT hace más cómodo acceder por nombre de columna.
      // Puedes poner esto al inicio del app (una vez): oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

      // --- 2) Validaciones básicas ---
      if (!usuario || !correo || !password) {
        return new Response(
          JSON.stringify({ error: "Debes llenar todos los campos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validación simple del formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return new Response(
          JSON.stringify({ error: "El correo no tiene un formato válido" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // --- 3) Comprobar duplicados (usuario o correo) ---
      // Usamos binds por nombre (más claro) y OUT_FORMAT_OBJECT para facilitar lectura
      const checkSql = `
        SELECT usuario, correo 
        FROM usuarios 
        WHERE usuario = :usuario OR correo = :correo
      `;
      const checkResult = await connection.execute(
        checkSql,
        { usuario, correo }, // binds por nombre
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (checkResult.rows.length > 0) {
        // Evitamos exponer cuál exactamente por seguridad; el frontend puede mostrar el mensaje apropiado.
        return new Response(
          JSON.stringify({ error: "El usuario o el correo ya están registrados" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // --- 4) Encriptar la contraseña ---
      // bcrypt.genSalt(10) está bien para producción ligera; ajuste si necesitas más CPU.
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // --- 5) Insertar el nuevo usuario ---
      // Usamos binds por nombre nuevamente.
      const insertSql = `
        INSERT INTO usuarios (usuario, correo, password)
        VALUES (:usuario, :correo, :password)
      `;

      await connection.execute(
        insertSql,
        { usuario, correo, password: hashPassword },
        { autoCommit: true } // importante: en Oracle confirma la transacción
      );

      // --- 6) Responder con éxito ---
      return new Response(
        JSON.stringify({ mensaje: `Usuario ${usuario} registrado correctamente` }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // --- Manejo de errores ---
      console.error("Error en el registro:", error);

      // Ejemplo: manejo razonable de violación de constraint única (race condition)
      if (error.message && error.message.includes("ORA-00001")) {
        return new Response(
          JSON.stringify({ error: "El usuario o el correo ya existen" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      // --- Cerrar la conexión siempre ---
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
