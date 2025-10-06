import "dotenv/config";
import oracledb from "oracledb";

// Conexión como SUPER ADMIN (SYS)
export async function getSysConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.SYS_USER,
      password: process.env.SYS_PASSWORD,
      connectString: process.env.SYS_CONNECT,
      privilege: oracledb.SYSDBA, 
    });
    console.log("✅ Conectado como SYS (SYSDBA)");
    return connection;
  } catch (err) {
    console.error("❌ Error al conectar como SYS:", err);
    throw err;
  }
}

// Conexión como USUARIO NORMAL
export async function getUserConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT,
    });
    console.log("✅ Conectado como TICKETUSER");
    return connection;
  } catch (err) {
    console.error("❌ Error al conectar como TICKETUSER:", err);
    throw err;
  }
}
