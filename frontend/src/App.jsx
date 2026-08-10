import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import TrackingPage from './pages/TrackingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:slug" element={<MenuPage />} />
        <Route path="/:slug/order" element={<OrderPage />} />
        <Route path="/track/:code" element={<TrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
