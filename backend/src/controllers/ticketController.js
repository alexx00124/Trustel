const Ticket = require("../models/ticketModel");

const ticketController = {
  listar: async (req, res) => {
    try {
      const tickets = await Ticket.getAll();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  detalle: async (req, res) => {
    try {
      const ticket = await Ticket.getById(req.params.id);
      if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
      res.json(ticket);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  crear: async (req, res) => {
    try {
      const nuevo = await Ticket.create(req.body);
      res.json(nuevo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const actualizado = await Ticket.updateEstado(req.params.id, req.body.id_estado);
      res.json(actualizado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = ticketController;
