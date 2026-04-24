import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Gift, Heart, Plus, Check, Mail, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GiftShop() {
  const [packages, setPackages] = useState([]);
  const [builderItems, setBuilderItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selections, setSelections] = useState({});
  const { items, addItem, removeItem, updateQty, clearCart, total, count } = useCart();

  useEffect(() => {
    axios.get(`${API}/packages`).then(r => setPackages(r.data.packages));
    axios.get(`${API}/builder-items`).then(r => setBuilderItems(r.data.items));
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const addBuilderQty = (id, delta) => {
    setSelections(prev => {
      const next = { ...prev };
      const val = Math.max(0, (next[id] || 0) + delta);
      if (val === 0) delete next[id]; else next[id] = val;
      return next;
    });
  };
  const builderTotal = Object.entries(selections).reduce((s, [id, q]) => {
    const it = builderItems.find(i => i.id === id);
    return it ? s + it.price * q : s;
  }, 0);

  const addCustomToCart = () => {
    if (Object.keys(selections).length === 0) return alert('Agrega al menos un ítem');
    Object.entries(selections).forEach(([id, qty]) => {
      const it = builderItems.find(i => i.id === id);
      for (let i = 0; i < qty; i++) addItem({ id: `custom_${it.id}_${Date.now()}_${i}`, name: `${it.name} (personalizada)`, price: it.price, type: 'custom_item' });
    });
    setSelections({});
    setCartOpen(true);
  };

  return (
    <div className="App">
      {/* HEADER */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon"><Gift size={20} color="white" /></div>
            <div>
              <div className="font-accent" style={{ fontSize: 24, color: '#EC4899', lineHeight: 1 }}>Laurita</div>
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: 1 }}>TIENDA DE REGALOS</div>
            </div>
          </div>
          <nav className="nav">
            <button onClick={() => scrollTo('paquetes')}>Paquetes</button>
            <button onClick={() => scrollTo('personalizar')}>Personaliza</button>
            <button onClick={() => scrollTo('contacto')}>Contacto</button>
          </nav>
          <button className="btn btn-primary" onClick={() => setCartOpen(true)} style={{ position: 'relative' }}>
            <ShoppingBag size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Carrito
            {count > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#FDE047', color: '#1F2937', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{count}</span>}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="container" style={{ padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <span className="tag-pink">✨ Hecho con cariño en Laurita</span>
          <h1 style={{ fontSize: 60, lineHeight: 1.05, margin: '16px 0' }}>Personaliza tu <span style={{ color: '#EC4899' }}>caja de regalo</span><br /><span className="font-accent" style={{ color: '#F472B6', fontWeight: 400 }}>con mucho amor</span></h1>
          <p style={{ fontSize: 18, color: '#4B5563', marginBottom: 24 }}>Cajas únicas llenas de peluches, dulces, chocolates y detalles hechos a mano.</p>
          <button className="btn btn-primary" onClick={() => scrollTo('paquetes')}><Heart size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Ver paquetes</button>
          <button className="btn btn-outline" onClick={() => scrollTo('personalizar')} style={{ marginLeft: 12 }}>Personalizar</button>
        </div>
        <img src="https://images.pexels.com/photos/5713550/pexels-photo-5713550.jpeg" alt="Regalo" style={{ width: '100%', borderRadius: 32, boxShadow: '0 20px 60px rgba(244,114,182,0.25)' }} />
      </section>

      {/* PAQUETES */}
      <section id="paquetes" className="container" style={{ padding: '60px 24px' }}>
        <div className="font-accent" style={{ color: '#F472B6', fontSize: 28 }}>Nuestros paquetes</div>
        <h2 style={{ fontSize: 42, marginBottom: 32 }}>Encuentra la caja perfecta</h2>
        <div className="grid grid-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 22 }}>{pkg.name}</h3>
                <div className="font-accent" style={{ color: '#F472B6', fontSize: 18 }}>{pkg.tagline}</div>
                <div className="price-big" style={{ margin: '12px 0' }}>{pkg.is_custom ? 'A tu medida' : `$${pkg.price}`}</div>
                <ul style={{ listStyle: 'none', flex: 1, marginBottom: 16 }}>
                  {pkg.features?.map((f, i) => <li key={i} style={{ fontSize: 14, color: '#4B5563', margin: '6px 0', display: 'flex', gap: 8 }}><Check size={16} color="#F472B6" /> {f}</li>)}
                </ul>
                <button className="btn btn-primary" onClick={() => {
                  if (pkg.is_custom) return scrollTo('personalizar');
                  addItem({ id: pkg.id, name: pkg.name, price: pkg.price, type: 'package' });
                  setCartOpen(true);
                }}><Plus size={16} style={{ verticalAlign: 'middle' }} /> Agregar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONSTRUCTOR */}
      <section id="personalizar" className="container" style={{ padding: '60px 24px' }}>
        <div className="font-accent" style={{ color: '#F472B6', fontSize: 28 }}>Arma tu caja</div>
        <h2 style={{ fontSize: 42, marginBottom: 32 }}>Personaliza cada detalle</h2>
        <div className="grid grid-3">
          {builderItems.map(it => {
            const qty = selections[it.id] || 0;
            return (
              <div key={it.id} className="card" style={{ borderColor: qty > 0 ? '#F472B6' : '#FCE7F3', borderWidth: 2 }}>
                <img src={it.image} alt={it.name} className="img-cover" />
                <h4 style={{ marginTop: 12 }}>{it.name}</h4>
                <div style={{ color: '#EC4899', fontSize: 20, fontWeight: 900, margin: '6px 0' }}>${it.price}</div>
                {qty === 0
                  ? <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => addBuilderQty(it.id, 1)}>Agregar</button>
                  : <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #F472B6', borderRadius: 999, padding: 4 }}>
                      <button onClick={() => addBuilderQty(it.id, -1)} style={{ background: '#FCE7F3', width: 32, height: 32, borderRadius: '50%' }}>−</button>
                      <span style={{ fontWeight: 700 }}>{qty}</span>
                      <button onClick={() => addBuilderQty(it.id, 1)} style={{ background: '#F472B6', color: 'white', width: 32, height: 32, borderRadius: '50%' }}>+</button>
                    </div>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: 24, borderRadius: 24 }}>
          <div><div style={{ fontSize: 14, color: '#6B7280' }}>Total de tu caja</div><div className="price-big" style={{ color: '#EC4899' }}>${builderTotal}</div></div>
          <button className="btn btn-primary" onClick={addCustomToCart}>Agregar al carrito</button>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="container" style={{ padding: '60px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #F472B6, #EC4899)', borderRadius: 40, padding: 48, color: 'white' }}>
          <h2 style={{ fontSize: 42, color: 'white' }}>¿Tienes una idea especial?</h2>
          <p style={{ fontSize: 18, margin: '16px 0 32px', opacity: 0.95 }}>Escríbenos o llámanos, te respondemos rápido 💖</p>
          <a href="mailto:contacto@laurita.shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: 16, marginRight: 12 }}><Mail /> contacto@laurita.shop</a>
          <a href="tel:+525512345678" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: 16 }}><Phone /> +52 55 1234 5678</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'white', padding: '24px', textAlign: 'center', color: '#6B7280', borderTop: '1px solid #FCE7F3' }}>
        Hecho con 💖 para Laurita · © {new Date().getFullYear()}
      </footer>

      {/* CARRITO (drawer) */}
      {cartOpen && (
        <>
          <div className="overlay" onClick={() => setCartOpen(false)} />
          <div className="drawer">
            <h3 style={{ fontSize: 24, marginBottom: 16 }}>Tu carrito ({count})</h3>
            {items.length === 0 ? <p style={{ color: '#6B7280' }}>Vacío</p> : items.map(it => (
              <div key={it.id} style={{ background: '#FFF5F7', padding: 14, borderRadius: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>${it.price} × {it.quantity}</div>
                </div>
                <div>
                  <button onClick={() => updateQty(it.id, it.quantity - 1)} style={{ padding: 4 }}>−</button>
                  <span style={{ margin: '0 8px' }}>{it.quantity}</span>
                  <button onClick={() => updateQty(it.id, it.quantity + 1)} style={{ padding: 4 }}>+</button>
                  <button onClick={() => removeItem(it.id)} style={{ marginLeft: 8, color: '#EF4444' }}>🗑</button>
                </div>
              </div>
            ))}
            {items.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 22, margin: '16px 0', paddingTop: 16, borderTop: '2px solid #FCE7F3' }}>
                  <span>Total</span><span style={{ color: '#EC4899' }}>${total}</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Finalizar pedido</button>
              </>
            )}
          </div>
        </>
      )}

      {/* CHECKOUT (modal) */}
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} items={items} total={total} clearCart={clearCart} />}
    </div>
  );
}

function CheckoutModal({ onClose, items, total, clearCart }) {
  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', customer_address: '', notes: '' });
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/orders`, { ...form, items, total });
      setSuccess(res.data);
      clearCart();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal-content">
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <h3 style={{ fontSize: 26, margin: '12px 0' }}>¡Pedido enviado!</h3>
              <p style={{ color: '#6B7280', marginBottom: 16 }}>Te contactaremos al correo <b>{success.customer_email}</b></p>
              <div style={{ background: '#FFF5F7', padding: 12, borderRadius: 12, fontSize: 12, marginBottom: 16 }}>Folio: {success.id}</div>
              <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3 style={{ fontSize: 24, marginBottom: 16 }}>Finaliza tu pedido</h3>
              <label className="label">Nombre *</label>
              <input className="input" required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
              <label className="label" style={{ marginTop: 12 }}>Correo *</label>
              <input className="input" type="email" required value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} />
              <label className="label" style={{ marginTop: 12 }}>Teléfono *</label>
              <input className="input" required value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} />
              <label className="label" style={{ marginTop: 12 }}>Dirección</label>
              <input className="input" value={form.customer_address} onChange={e => setForm({ ...form, customer_address: e.target.value })} />
              <label className="label" style={{ marginTop: 12 }}>Notas / dedicatoria</label>
              <textarea className="input" rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <div style={{ background: '#FFF5F7', padding: 16, borderRadius: 16, margin: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total</span><span style={{ fontSize: 24, fontWeight: 900, color: '#EC4899' }}>${total}</span>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>{loading ? 'Enviando...' : 'Confirmar pedido'}</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}