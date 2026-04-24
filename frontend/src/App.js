import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GiftShop from './pages/GiftShop';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GiftShop />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;