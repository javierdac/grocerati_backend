const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'El correo ya esta en uso' });

    const user = await User.create({ name, email, password_hash: password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contrasena son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const update = {};
    if (name?.trim()) update.name = name.trim();
    if (email?.trim()) {
      const exists = await User.findOne({ email: email.trim(), _id: { $ne: req.user._id } });
      if (exists) return res.status(400).json({ error: 'El correo ya esta en uso' });
      update.email = email.trim();
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });

    if (password) {
      user.password_hash = password;
      await user.save();
    }

    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
