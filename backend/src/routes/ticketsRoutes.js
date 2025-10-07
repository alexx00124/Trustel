import oracledb from "oracledb";
import util from "util";

export const ticketsRoute = async (req) => {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: "TICKETUSER",
      password: "123456",
      connectString: "//localhost:1521/XEPDB1",
    });

    console.log("✅ Conectado correctamente a Oracle Database");

    
    const result = await connection.execute(`SELECT * FROM tickets`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const data = result.rows.map((row) => {
      const obj = {};
      for (const key in row) {
        const value = row[key];

        if (value === null || typeof value !== "object") {
          obj[key] = value; // números, strings, null, etc.
        } else if (value instanceof Date) {
          obj[key] = value.toISOString(); // fechas
        } else {
      
          obj[key] = util.inspect(value, { depth: 2 });
        }
      }
      return obj;
    });

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error en ticketsRoute:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("🔒 Conexión Oracle cerrada correctamente");
      } catch (err) {
        console.error("⚠️ Error al cerrar conexión:", err);
      }
    }
  }
};
