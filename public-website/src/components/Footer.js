import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrizione */}
          <div>
            <img src={LOGO_URL} alt="Tempocasa Tarquinia" className="h-12 mb-4 brightness-0 invert" />
            <p className="text-sm text-gray-400">
              L'agenzia Tempocasa di Tarquinia è diretta dall'esperienza di Alessandro Ledda, Andrea Manfré e Corrado Sassu. Vendita, acquisto e affitto di immobili a Tarquinia.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Veloci */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Link Veloci</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/immobili" className="text-sm hover:text-primary-500 transition-colors">
                  Immobili in Vendita
                </Link>
              </li>
              <li>
                <Link to="/valutazione" className="text-sm hover:text-primary-500 transition-colors">
                  Richiedi Valutazione
                </Link>
              </li>
              <li>
                <Link to="/contatti" className="text-sm hover:text-primary-500 transition-colors">
                  Contattaci
                </Link>
              </li>
            </ul>
          </div>

          {/* Servizi */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">I Nostri Servizi</h3>
            <ul className="space-y-2 text-sm">
              <li>• Vendita Immobili</li>
              <li>• Affitto Immobili</li>
              <li>• Valutazioni Gratuite</li>
              <li>• Consulenza Immobiliare</li>
              <li>• Assistenza Mutui</li>
              <li>• Gestione Pratiche</li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contattaci</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Via Roma 123, 01016 Tarquinia (VT)</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <a href="tel:+390766123456" className="hover:text-primary-500">
                  +39 0766 123456
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <a href="mailto:info@tempocasa-tarquinia.it" className="hover:text-primary-500">
                  info@tempocasa-tarquinia.it
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p>Lun-Ven: 9:00-19:00</p>
                  <p>Sab: 9:00-13:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tempocasa Tarquinia. Tutti i diritti riservati.</p>
          <p className="mt-2">
            P.IVA 01234567890 | <a href="#" className="hover:text-primary-500">Privacy Policy</a> | <a href="#" className="hover:text-primary-500">Cookie Policy</a>
          </p>
        </div>
      </div>
    </footer>
  );
}