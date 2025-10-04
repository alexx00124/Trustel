import oracledb from "oracledb";

export async function getConnection() {
  const connection = await oracledb.getConnection({
    user: "TICKETUSER",
    password: "123456",
    connectString: "//localhost:1521/XEPDB1"
  });
  console.log("✅ Conectado correctamente a Oracle Database"); // 🔹 mensaje de éxito
  return connection;
}

if (import.meta.main) {
  try {
    const conn = await getConnection();
    const result = await conn.execute("SELECT SYSDATE FROM DUAL");
    console.log("🗓 Fecha del servidor Oracle:", result.rows[0]);
    await conn.close();
  } catch (err) {
    console.error("❌ Error al conectar:", err);
  }
}
