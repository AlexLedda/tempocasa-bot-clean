import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Immobili', href: '/immobili' },
    { name: 'Valutazione', href: '/valutazione' },
    { name: 'Contatti', href: '/contatti' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <a href="tel:+390766180585" className="flex items-center gap-1 hover:underline">
                <Phone className="w-4 h-4" />
                <span>0766 180585</span>
              </a>
              <a href="tel:+393515290147" className="hidden sm:flex items-center gap-1 hover:underline">
                <Phone className="w-4 h-4" />
                <span>351 529 0147</span>
              </a>
              <a href="mailto:tarquinia@tempocasa.it" className="hidden md:flex items-center gap-1 hover:underline">
                <Mail className="w-4 h-4" />
                <span>tarquinia@tempocasa.it</span>
              </a>
            </div>
            <div className="text-sm">
              Lun-Ven 9:00-19:00 | Sab 9:00-13:00
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={LOGO_URL} 
              alt="Tempocasa Tarquinia" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/valutazione"
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Valuta Gratis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/valutazione"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-full font-semibold"
            >
              Valuta Gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
