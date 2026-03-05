const List = require('../models/List');
const Item = require('../models/Item');

const verifyMembership = async (listId, userId) => {
  const list = await List.findOne({ _id: listId, members: userId });
  return list;
};

exports.getItems = async (req, res) => {
  try {
    const { listId } = req.params;
    if (!(await verifyMembership(listId, req.user._id))) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const items = await Item.find({ list_id: listId })
      .populate('added_by', 'name')
      .populate('completed_by', 'name')
      .sort({ completed: 1, created_at: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { listId } = req.params;
    if (!(await verifyMembership(listId, req.user._id))) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const { name, quantity } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

    const existing = await Item.findOne({
      list_id: listId,
      name: name.trim(),
      completed: false,
    }).collation({ locale: 'es', strength: 2 });

    if (existing) {
      existing.quantity += quantity || 1;
      await existing.save();
      const populated = await existing.populate('added_by', 'name');
      req.app.get('io')?.to(`list:${listId}`).emit('items-updated', listId);
      return res.json(populated);
    }

    const item = await Item.create({
      list_id: listId,
      name: name.trim(),
      quantity: quantity || 1,
      added_by: req.user._id,
    });

    const populated = await item.populate('added_by', 'name');
    req.app.get('io')?.to(`list:${listId}`).emit('items-updated', listId);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    if (!(await verifyMembership(listId, req.user._id))) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const { name, quantity, completed } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (quantity !== undefined) update.quantity = quantity;
    if (completed !== undefined) {
      update.completed = completed;
      update.completed_by = completed ? req.user._id : null;
    }

    const item = await Item.findOneAndUpdate({ _id: itemId, list_id: listId }, update, { new: true })
      .populate('added_by', 'name')
      .populate('completed_by', 'name');

    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });

    req.app.get('io')?.to(`list:${listId}`).emit('items-updated', listId);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    if (!(await verifyMembership(listId, req.user._id))) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const item = await Item.findOneAndDelete({ _id: itemId, list_id: listId });
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });

    req.app.get('io')?.to(`list:${listId}`).emit('items-updated', listId);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCompleted = async (req, res) => {
  try {
    const { listId } = req.params;
    if (!(await verifyMembership(listId, req.user._id))) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    await Item.deleteMany({ list_id: listId, completed: true });

    req.app.get('io')?.to(`list:${listId}`).emit('items-updated', listId);
    res.json({ message: 'Completados eliminados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
