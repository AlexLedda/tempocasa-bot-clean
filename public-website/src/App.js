import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TelegramWidget from './components/TelegramWidget';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Valuation from './pages/Valuation';
import Contact from './pages/Contact';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/immobili" element={<Properties />} />
            <Route path="/immobili/:id" element={<PropertyDetail />} />
            <Route path="/valutazione" element={<Valuation />} />
            <Route path="/contatti" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <TelegramWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;