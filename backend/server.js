

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { randomUUID } = require('crypto');
require('dotenv').config();

const app = express();

// ---------- Middlewares ----------
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || '*' }));
app.use(express.json());

// ---------- Conexión a MongoDB ----------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error('❌ Error MongoDB:', err));

// ---------- Modelo de Pedido ----------
const orderSchema = new mongoose.Schema({
  id:              { type: String, default: () => randomUUID() },
  customer_name:   { type: String, required: true, minlength: 2, maxlength: 100 },
  customer_email:  { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
  customer_phone:  { type: String, required: true, minlength: 6, maxlength: 30 },
  customer_address:{ type: String, default: '' },
  notes:           { type: String, default: '' },
  items: [{
    id:       String,
    name:     String,
    price:    Number,
    quantity: { type: Number, default: 1 },
    type:     String,  // "package" o "custom_item"
  }],
  total:      { type: Number, required: true },
  status:     { type: String, default: 'pending' },
  created_at: { type: Date,   default: Date.now },
}, { versionKey: false });

const Order = mongoose.model('Order', orderSchema);

// ---------- Catálogo estático: Paquetes ----------
const PACKAGES = [
  {
    id: 'basica',
    name: 'Caja Básica',
    price: 500,
    tagline: 'Un detalle cálido y dulce',
    description: 'Perfecta para decirle a alguien que piensas en él.',
    image: 'https://images.unsplash.com/photo-1765167029919-69048f9a8069',
    features: [
      '1 peluche pequeño',
      '4 dulces surtidos',
      'Tarjeta personalizada',
      'Empaque rosado con moño',
    ],
  },
  {
    id: 'mediana',
    name: 'Caja Mediana',
    price: 1000,
    tagline: 'El clásico favorito',
    description: 'Una caja equilibrada, llena de sabores y ternura.',
    image: 'https://images.unsplash.com/photo-1765167029837-cd5dd16896b9',
    features: [
      '1 peluche mediano',
      '8 dulces variados',
      'Caja de chocolates',
      'Tarjeta personalizada',
      'Empaque premium con listón',
    ],
  },
  {
    id: 'premium',
    name: 'Caja Premium',
    price: 1500,
    tagline: 'Un regalo inolvidable',
    description: 'Para momentos que merecen brillar.',
    image: 'https://images.pexels.com/photos/6045704/pexels-photo-6045704.jpeg',
    features: [
      '2 peluches (grande y pequeño)',
      'Chocolates finos surtidos',
      'Globo metálico',
      'Flores de papel hechas a mano',
      'Tarjeta premium personalizada',
    ],
  },
  {
    id: 'personalizada',
    name: 'Caja Personalizada XL',
    price: 0,
    is_custom: true,
    tagline: 'Tú decides qué va dentro',
    description: 'Arma tu propia caja, elige cada detalle.',
    image: 'https://images.pexels.com/photos/7679762/pexels-photo-7679762.jpeg',
    features: [
      'Elige tu caja XL',
      'Agrega peluches, dulces y chocolates',
      'Agrega globos, flores y tarjetas',
      'Precio según los ítems elegidos',
    ],
  },
];

// ---------- Catálogo estático: Ítems del constructor ----------
const BUILDER_ITEMS = [
  { id: 'chocolates',      name: 'Caja de Chocolates',    price: 80,  category: 'Dulces',      image: 'https://images.pexels.com/photos/867464/pexels-photo-867464.jpeg' },
  { id: 'caramelos',       name: 'Caramelos Surtidos',    price: 50,  category: 'Dulces',      image: 'https://images.unsplash.com/photo-1680345576203-0e45d9340d4c' },
  { id: 'peluche_pequeno', name: 'Peluche Pequeño',       price: 200, category: 'Peluches',    image: 'https://images.pexels.com/photos/35153245/pexels-photo-35153245.jpeg' },
  { id: 'peluche_grande',  name: 'Peluche Grande',        price: 350, category: 'Peluches',    image: 'https://images.pexels.com/photos/35153245/pexels-photo-35153245.jpeg' },
  { id: 'globos',          name: 'Set de Globos',         price: 70,  category: 'Decoración',  image: 'https://images.pexels.com/photos/3905853/pexels-photo-3905853.jpeg' },
  { id: 'tarjeta',         name: 'Tarjeta Personalizada', price: 40,  category: 'Detalles',    image: 'https://images.pexels.com/photos/5713550/pexels-photo-5713550.jpeg' },
  { id: 'flores_papel',    name: 'Flores de Papel',       price: 100, category: 'Decoración',  image: 'https://images.pexels.com/photos/5713550/pexels-photo-5713550.jpeg' },
  { id: 'caja_xl',         name: 'Caja XL Decorada',      price: 150, category: 'Base',        image: 'https://images.pexels.com/photos/7679762/pexels-photo-7679762.jpeg' },
];

// ---------- RUTAS ----------

// Health check
app.get('/api/', (req, res) => {
  res.json({ message: 'Tienda de Regalos Laurita API', status: 'ok' });
});

// Listar paquetes
app.get('/api/packages', (req, res) => {
  res.json({ packages: PACKAGES });
});

// Listar ítems del constructor
app.get('/api/builder-items', (req, res) => {
  res.json({ items: BUILDER_ITEMS });
});

// Crear pedido
app.post('/api/orders', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ detail: 'El pedido debe tener al menos un artículo.' });
    }
    const order = await Order.create(req.body);
    res.json(order);
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

// Listar pedidos (admin)
app.get('/api/orders', async (req, res) => {
  const orders = await Order.find({}, { _id: 0 })
    .sort({ created_at: -1 })
    .limit(500)
    .lean();
  res.json(orders);
});

// ---------- Levantar servidor ----------
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🎁 Backend Laurita corriendo en http://localhost:${PORT}`);
});