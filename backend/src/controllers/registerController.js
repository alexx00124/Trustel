import mysql from "mysql2/promise";  // Importa la librería para conectar con MySQL
import bcrypt from "bcrypt";         

export const registerController = {
  async processRegister(req) {
    try {
      const body = await req.json();
      const { usuario, password } = body;

      // 1️⃣ Conexión a tu base de datos
      const connection = await mysql.createConnection({
        host: "localhost", // 🔹 Cambia esto si tu servidor no es local
        user: "root",      // 🔹 Cambia por tu usuario de MySQL
        password: "",      // 🔹 Cambia por tu contraseña de MySQL
        database: "tickets", // 🔹 Aquí pon el nombre de tu base de datos (ejemplo: 'tickets', 'miApp', etc.)
      });

      // 2️⃣ Validar que los campos no estén vacíos
      if (!usuario || !password) {
        return new Response(
          JSON.stringify({ error: "Debes llenar todos los campos" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 3️⃣ Verificar si el usuario ya existe
      // 🔹 Cambia 'usuarios' por el nombre de tu tabla donde guardas los usuarios (ej: 'clientes', 'admins', etc.)
      const [rows] = await connection.execute(
        "SELECT * FROM usuarios WHERE usuario = ?",
        [usuario]
      );

      if (rows.length > 0) {
        return new Response(
          JSON.stringify({ error: "El usuario ya está registrado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // 4️⃣ Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // 5️⃣ Insertar el nuevo usuario
      // 🔹 Igual aquí: cambia 'usuarios' por el nombre de tu tabla
      // 🔹 Si tu tabla tiene otras columnas (por ejemplo: correo, rol), agrégalas en el mismo orden
      await connection.execute(
        "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
        [usuario, hashPassword]
      );

      // 6️⃣ Cerrar la conexión
      await connection.end();

      // 7️⃣ Responder con éxito
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
    }
  },
};
