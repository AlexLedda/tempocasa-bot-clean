import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Home, Building2, MessageSquare, Calendar, Settings, Menu, X, Users, ClipboardCheck, Bot, LogOut, Send } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/PropertiesNew";
import Messages from "./pages/Messages";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Valuations from "./pages/Valuations";
import BotSettings from "./pages/BotSettings";
import TelegramConversations from "./pages/TelegramConversations";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Funzione per convertire hex a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Funzione per applicare tutti i colori
export function applyAllColors(primary, secondary, accent) {
  if (primary) applyPrimaryColor(primary);
  if (secondary) applySecondaryColor(secondary);
  if (accent) applyAccentColor(accent);
}

// Funzione per applicare il colore primario
export function applyPrimaryColor(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return;
  
  const root = document.documentElement;
  root.style.setProperty('--primary-color', color);
  root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  
  // Varianti del colore
  root.style.setProperty('--primary-50', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
  root.style.setProperty('--primary-100', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
  root.style.setProperty('--primary-200', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
  root.style.setProperty('--primary-500', color);
  root.style.setProperty('--primary-600', `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`);
  root.style.setProperty('--primary-700', `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`);
}

// Funzione per applicare il colore secondario
export function applySecondaryColor(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return;
  
  const root = document.documentElement;
  root.style.setProperty('--secondary-color', color);
  root.style.setProperty('--secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

// Funzione per applicare il colore accent
export function applyAccentColor(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return;
  
  const root = document.documentElement;
  root.style.setProperty('--accent-color', color);
  root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}


// Logout Button Component
function LogoutButton() {
  const { logout, user } = require('./contexts/AuthContext').useAuth();
  
  return (
    <button
      onClick={() => {
        if (window.confirm('Vuoi disconnetterti?')) {
          logout();
          toast.success('Disconnesso con successo');
        }
      }}
      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <div className="flex-1 text-left">
        <span className="font-medium block">Disconnetti</span>
        {user && (
          <span className="text-xs text-gray-500">@{user.username}</span>
        )}
      </div>
    </button>
  );
}

function Layout({ children, settings }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Immobili", href: "/properties", icon: Building2 },
    { name: "Clienti", href: "/clients", icon: Users },
    { name: "Messaggi", href: "/messages", icon: MessageSquare },
    { name: "Telegram Bot", href: "/telegram", icon: Send },
    { name: "Appuntamenti", href: "/appointments", icon: Calendar },
    { name: "Valutazioni", href: "/valuations", icon: ClipboardCheck },
    { name: "Impostazioni Bot", href: "/bot-settings", icon: Bot },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-blue-100 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-blue-100">
            <div className="flex items-center space-x-3">
              {settings?.logo_url ? (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white">
                  <img 
                    src={settings.logo_url} 
                    alt="Logo Agenzia" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {settings?.agency_name || "RealEstate"}
                </h1>
                <p className="text-xs text-gray-500">Bot Manager</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              data-testid="close-sidebar-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-100 space-y-3">
            {/* Bot Status */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
              <p className="text-sm font-semibold mb-1">Bot WhatsApp Attivo</p>
              <p className="text-xs opacity-90">
                {settings?.bot_name ? `${settings.bot_name} gestisce i clienti` : "Gestisci i tuoi clienti automaticamente"}
              </p>
            </div>
            
            {/* Logout Button - Inserted by auth integration */}
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-blue-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              data-testid="open-sidebar-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Carica impostazioni all'avvio
    axios.get(`${API}/settings`)
      .then(response => {
        setSettings(response.data);
        
        // Applica tutti i colori
        if (response.data.primary_color) {
          applyPrimaryColor(response.data.primary_color);
        }
        if (response.data.secondary_color) {
          applySecondaryColor(response.data.secondary_color);
        }
        if (response.data.accent_color) {
          applyAccentColor(response.data.accent_color);
        }
      })
      .catch(error => console.error('Error loading settings:', error));
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout settings={settings}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/telegram" element={<TelegramConversations />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/valuations" element={<Valuations />} />
                    <Route path="/bot-settings" element={<BotSettings />} />
                    <Route path="/whatsapp-setup" element={<WhatsAppSetup />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
