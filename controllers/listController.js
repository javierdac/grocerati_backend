const List = require('../models/List');
const Item = require('../models/Item');

exports.getMyLists = async (req, res) => {
  try {
    const lists = await List.find({ members: req.user._id })
      .populate('members', 'name email')
      .sort({ created_at: -1 });

    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const totalItems = await Item.countDocuments({ list_id: list._id });
        const pendingItems = await Item.countDocuments({ list_id: list._id, completed: false });
        return { ...list.toObject(), totalItems, pendingItems };
      }),
    );

    res.json(listsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createList = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

    const list = await List.create({
      name: name.trim(),
      ...(icon && { icon }),
      created_by: req.user._id,
      members: [req.user._id],
    });

    const populated = await list.populate('members', 'name email');
    res.status(201).json({ ...populated.toObject(), totalItems: 0, pendingItems: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinList = async (req, res) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return res.status(400).json({ error: 'El codigo es requerido' });

    const list = await List.findOne({ invite_code: invite_code.toUpperCase() });
    if (!list) return res.status(404).json({ error: 'Lista no encontrada' });

    if (list.members.map((m) => m.toString()).includes(req.user._id.toString())) {
      return res.status(400).json({ error: 'Ya eres miembro de esta lista' });
    }

    list.members.push(req.user._id);
    await list.save();

    const populated = await list.populate('members', 'name email');
    const totalItems = await Item.countDocuments({ list_id: list._id });
    const pendingItems = await Item.countDocuments({ list_id: list._id, completed: false });

    req.app.get('io')?.to(`list:${list._id.toString()}`).emit('list-updated', list._id.toString());
    res.json({ ...populated.toObject(), totalItems, pendingItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, members: req.user._id }).populate(
      'members',
      'name email',
    );
    if (!list) return res.status(404).json({ error: 'Lista no encontrada' });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateList = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const update = {};
    if (name?.trim()) update.name = name.trim();
    if (icon) update.icon = icon;
    const list = await List.findOneAndUpdate(
      { _id: req.params.listId, members: req.user._id },
      update,
      { new: true },
    ).populate('members', 'name email');
    if (!list) return res.status(404).json({ error: 'Lista no encontrada' });
    req.app.get('io')?.to(`list:${req.params.listId}`).emit('list-updated', req.params.listId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, created_by: req.user._id });
    if (!list) return res.status(404).json({ error: 'Solo el creador puede eliminar la lista' });

    const listId = list._id.toString();
    await Item.deleteMany({ list_id: list._id });
    await list.deleteOne();

    req.app.get('io')?.to(`list:${listId}`).emit('list-deleted', listId);
    res.json({ message: 'Lista eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.leaveList = async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, members: req.user._id });
    if (!list) return res.status(404).json({ error: 'Lista no encontrada' });

    if (list.created_by.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'El creador no puede salir. Elimina la lista.' });
    }

    list.members = list.members.filter((m) => m.toString() !== req.user._id.toString());
    await list.save();

    req.app.get('io')?.to(`list:${req.params.listId}`).emit('list-updated', req.params.listId);
    res.json({ message: 'Saliste de la lista' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.regenerateInviteCode = async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, created_by: req.user._id });
    if (!list) return res.status(404).json({ error: 'Solo el creador puede cambiar el codigo' });

    const crypto = require('crypto');
    list.invite_code = crypto.randomBytes(4).toString('hex').toUpperCase();
    await list.save();

    req.app.get('io')?.to(`list:${req.params.listId}`).emit('list-updated', req.params.listId);
    res.json({ invite_code: list.invite_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { user_id } = req.body;
    const list = await List.findOne({ _id: req.params.listId, created_by: req.user._id });
    if (!list) return res.status(404).json({ error: 'Solo el creador puede quitar miembros' });

    if (user_id === req.user._id.toString()) {
      return res.status(400).json({ error: 'No puedes quitarte a ti mismo' });
    }

    list.members = list.members.filter((m) => m.toString() !== user_id);
    await list.save();

    req.app.get('io')?.to(`list:${req.params.listId}`).emit('list-updated', req.params.listId);
    res.json({ message: 'Miembro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
