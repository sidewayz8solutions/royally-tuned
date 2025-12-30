import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Layout from './layouts/Layout';

export default function App() {
  return (
    <Routes>
      {/* Public Pages with marketing layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Dashboard - separate from marketing layout */}
      <Route path="/app/*" element={<Dashboard />} />
    </Routes>
  );
}
