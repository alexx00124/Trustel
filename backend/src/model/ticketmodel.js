const getConnection = require("../config/db");
const oracledb = require("oracledb");

const Ticket = {
  getAll: async () => {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT t.id_ticket, t.titulo, t.descripcion, t.fecha_creacion, t.prioridad,
              u.nombre AS usuario, c.nombre_categoria AS categoria, e.nombre_estado AS estado
       FROM tickets t
       JOIN usuarios u ON t.id_usuario = u.id_usuario
       JOIN categorias c ON t.id_categoria = c.id_categoria
       JOIN estados e ON t.id_estado = e.id_estado
       ORDER BY t.fecha_creacion DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    return result.rows;
  },

  getById: async (id) => {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT t.id_ticket, t.titulo, t.descripcion, t.fecha_creacion, t.prioridad,
              u.nombre AS usuario, c.nombre_categoria AS categoria, e.nombre_estado AS estado
       FROM tickets t
       JOIN usuarios u ON t.id_usuario = u.id_usuario
       JOIN categorias c ON t.id_categoria = c.id_categoria
       JOIN estados e ON t.id_estado = e.id_estado
       WHERE t.id_ticket = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    return result.rows[0];
  },

  create: async (ticket) => {
    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO tickets (titulo, descripcion, prioridad, id_usuario, id_categoria, id_estado)
       VALUES (:titulo, :descripcion, :prioridad, :id_usuario, :id_categoria, :id_estado)`,
      [ticket.titulo, ticket.descripcion, ticket.prioridad, ticket.id_usuario, ticket.id_categoria, ticket.id_estado],
      { autoCommit: true }
    );
    await conn.close();
    return { message: "Ticket creado con éxito" };
  },

  updateEstado: async (id, id_estado) => {
    const conn = await getConnection();
    await conn.execute(
      `UPDATE tickets SET id_estado = :id_estado WHERE id_ticket = :id`,
      [id_estado, id],
      { autoCommit: true }
    );
    await conn.close();
    return { message: "Estado actualizado con éxito" };
  }
};

module.exports = Ticket;
