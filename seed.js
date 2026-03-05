require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const List = require('./models/List');
const Item = require('./models/Item');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await List.deleteMany({});
  await Item.deleteMany({});
  console.log('Cleared existing data');

  const javier = await User.create({
    name: 'Javier',
    email: 'javier@grocerati.com',
    password_hash: '123456',
  });

  const mariana = await User.create({
    name: 'Mariana',
    email: 'mariana@grocerati.com',
    password_hash: '123456',
  });

  console.log('Users created: Javier, Mariana (password: 123456)');

  const lista = await List.create({
    name: "Casa D'Accorso",
    created_by: javier._id,
    members: [javier._id, mariana._id],
  });

  const listaMariana = await List.create({
    name: 'Oficina',
    created_by: mariana._id,
    members: [mariana._id],
  });

  console.log(`Lists created: ${lista.name} (code: ${lista.invite_code}), ${listaMariana.name} (code: ${listaMariana.invite_code})`);

  const items = [
    { name: 'Leche', quantity: 2, added_by: javier._id },
    { name: 'Pan', quantity: 1, added_by: mariana._id },
    { name: 'Huevos', quantity: 12, added_by: javier._id },
    { name: 'Aguacates', quantity: 4, added_by: mariana._id },
    { name: 'Pollo', quantity: 1, added_by: javier._id },
    { name: 'Arroz', quantity: 1, added_by: mariana._id },
    { name: 'Tomates', quantity: 6, added_by: javier._id },
    { name: 'Cebollas', quantity: 3, added_by: mariana._id },
    { name: 'Aceite de oliva', quantity: 1, added_by: javier._id },
    { name: 'Pasta', quantity: 2, added_by: mariana._id },
    { name: 'Queso', quantity: 1, added_by: javier._id, completed: true },
    { name: 'Mantequilla', quantity: 1, added_by: mariana._id, completed: true },
  ];

  await Item.insertMany(
    items.map((item) => ({
      ...item,
      list_id: lista._id,
      completed: item.completed || false,
    })),
  );

  await Item.insertMany([
    { list_id: listaMariana._id, name: 'Cafe', quantity: 1, added_by: mariana._id },
    { list_id: listaMariana._id, name: 'Galletas', quantity: 2, added_by: mariana._id },
  ]);

  console.log(`${items.length + 2} items created`);
  console.log('\n--- Login credentials ---');
  console.log('javier@grocerati.com / 123456');
  console.log('mariana@grocerati.com / 123456');
  console.log(`Invite codes: ${lista.name}=${lista.invite_code}, ${listaMariana.name}=${listaMariana.invite_code}`);

  await mongoose.disconnect();
  console.log('\nDone!');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
