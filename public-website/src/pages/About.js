import React from 'react';
import { MapPin, Award, Users, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Chi Siamo</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            La tua agenzia immobiliare di fiducia a Tarquinia
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Team */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Il Nostro Team</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Se vuoi <strong>vendere, comprare o affittare casa a Tarquinia</strong>, Tempocasa ti aspetta in <strong>viale Luigi Dasti, 6</strong>. 
            L'agenzia è diretta dall'esperienza di <strong>Alessandro Ledda, Andrea Manfré e Corrado Sassu</strong>.
          </p>
        </div>

        {/* Tarquinia */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Tarquinia: Storia e Territorio</h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="leading-relaxed mb-4">
              Si trova sul colle che domina il fiume Marta, vicino alla via Aurelia, nella zona della <strong>Maremma laziale</strong>, poco lontano dalla Toscana. 
              Tarquinia ha origini molto antiche e a testimoniarlo ci sono ritrovamenti archeologici come le necropoli. In particolare, da segnalare c'è quella dei Monterozzi, 
              che ospita una serie di tombe a tumulo scavate all'interno della roccia.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Patrimonio Storico e Culturale</h3>
            <p className="leading-relaxed mb-4">
              Oltre alle aree storiche, Tarquinia vanta la presenza di edifici religiosi e civili di pregio:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Il <strong>duomo e concattedrale di Santa Margherita</strong>, principale luogo di culto, edificato dopo il XIII secolo</li>
              <li>La <strong>chiesa di Santa Maria in Castello</strong>, la struttura romanica più significativa del comune</li>
              <li><strong>Palazzo Vitelleschi</strong>, costruito nel XV secolo e oggi sede del Museo archeologico nazionale etrusco</li>
              <li>Le <strong>mura etrusche</strong> e le torri d'avvistamento</li>
              <li>La <strong>barriera di San Giusto</strong>, con vista panoramica sul litorale</li>
            </ul>
          </div>
        </div>

        {/* Collegamenti */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Collegamenti e Servizi</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Comprare o affittare casa a Tarquinia significa scegliere di rivivere la storia in una realtà che - allo stesso tempo - offre una 
            <strong> molteplicità di servizi</strong> e diversi <strong>collegamenti con le zone limitrofe</strong> grazie alla strada provinciale 3 che collega a Tuscania, 
            alla stazione ferroviaria e ai trasporti interurbani.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Inoltre, Tarquinia è servita sia dallo <strong>svincolo dell'autostrada A12 Roma-Tarquinia</strong> che dallo svincolo di Monte Romano, 
            che collega il comune alla Aurelia bis e alla strada statale 675 Umbro-Laziale.
          </p>
        </div>

        {/* Vantaggi */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Perché Scegliere Tarquinia</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            Quali sono i vantaggi di comprare casa a Tarquinia? Oppure di affittare casa a Tarquinia?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🏨 Hotel, ristoranti, pizzerie, bar, negozi</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🏛️ Edifici storici, musei e aree archeologiche</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🎓 Scuole</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">📚 Biblioteca</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🏥 Ospedale</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">💊 Servizi sanitari e alla persona</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🌳 Aree naturali, parco, punto panoramico</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">⚽ Impianti sportivi</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🚂 Collegamenti stradali e ferroviari</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="font-semibold text-gray-900">🚌 Linee autobus</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Scopri gli Immobili Tempocasa a Tarquinia
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Immobili in vendita o in affitto, oppure fai valutare la tua casa dai nostri professionisti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/immobili"
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
            >
              Esplora Immobili
            </a>
            <a
              href="/valutazione"
              className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-50 transition-all"
            >
              Richiedi Valutazione
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
