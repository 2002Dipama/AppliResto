import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MenuManagePage from './pages/MenuManagePage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import RegisterPage from './pages/RegisterPage';
import TrackingPage from './pages/TrackingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/menu" element={<MenuManagePage />} />
        <Route path="/track/:code" element={<TrackingPage />} />
        <Route path="/:slug" element={<MenuPage />} />
        <Route path="/:slug/order" element={<OrderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
