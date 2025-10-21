import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { ClipboardCheck, MapPin, Building2, CheckCircle, Clock, Euro, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Valuations() {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("richiesta");
  const [selectedValuation, setSelectedValuation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState("");

  useEffect(() => {
    fetchValuations();
  }, [filter]);

  const fetchValuations = async () => {
    try {
      const response = await axios.get(`${API}/valuations?status=${filter}`);
      setValuations(response.data);
    } catch (error) {
      toast.error("Errore nel caricamento delle valutazioni");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, value = null) => {
    try {
      const params = new URLSearchParams({ status });
      if (value) params.append("estimated_value", value);
      
      await axios.put(`${API}/valuations/${id}?${params.toString()}`);
      toast.success("Valutazione aggiornata");
      fetchValuations();
      setDialogOpen(false);
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const toggleEvaluated = async (id, currentStatus) => {
    try {
      const params = new URLSearchParams({ 
        status: currentStatus,
        is_evaluated: (!currentStatus || currentStatus === "false").toString()
      });
      
      await axios.put(`${API}/valuations/${id}?${params.toString()}`);
      toast.success("Stato valutazione aggiornato");
      fetchValuations();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const openValuationDialog = (valuation) => {
    setSelectedValuation(valuation);
    setEstimatedValue(valuation.estimated_value?.toString() || "");
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="valuations-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Valutazioni Immobili</h1>
          <p className="text-lg text-gray-600">Richieste di valutazione dai clienti</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {["richiesta", "appuntamento_fissato", "valutata", "conclusa"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              size="sm"
              data-testid={`filter-${status}`}
            >
              {status === "richiesta" && "Richieste"}
              {status === "appuntamento_fissato" && "Appuntamenti"}
              {status === "valutata" && "Valutate"}
              {status === "conclusa" && "Concluse"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Richieste</p>
              <p className="text-2xl font-bold text-orange-600">
                {valuations.filter((v) => v.status === "richiesta").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Appuntamenti</p>
              <p className="text-2xl font-bold text-blue-600">
                {valuations.filter((v) => v.status === "appuntamento_fissato").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valutate</p>
              <p className="text-2xl font-bold text-green-600">
                {valuations.filter((v) => v.status === "valutata").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Concluse</p>
              <p className="text-2xl font-bold text-gray-600">
                {valuations.filter((v) => v.status === "conclusa").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Valuations List */}
      <div className="space-y-4" data-testid="valuations-list">
        {valuations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <ClipboardCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nessuna valutazione {filter}</p>
          </div>
        ) : (
          valuations.map((valuation) => (
            <div
              key={valuation.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover"
              data-testid={`valuation-card-${valuation.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{valuation.property_location}</h3>
                      <p className="text-sm text-gray-500">
                        {valuation.property_type || "Tipo non specificato"}
                      </p>
                    </div>
                    <span
                      className={`ml-auto text-xs px-3 py-1 rounded-full ${
                        valuation.status === "richiesta"
                          ? "bg-orange-100 text-orange-700"
                          : valuation.status === "appuntamento_fissato"
                          ? "bg-blue-100 text-blue-700"
                          : valuation.status === "valutata"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {valuation.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">{valuation.client_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Telefono</p>
                        <p className="text-sm font-medium text-gray-900">{valuation.client_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Ubicazione</p>
                        <p className="text-sm font-medium text-gray-900">{valuation.property_location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                    {valuation.already_listed && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          Già in vendita
                        </span>
                        {valuation.current_agency && (
                          <span className="text-xs text-gray-600">con {valuation.current_agency}</span>
                        )}
                      </div>
                    )}
                    {valuation.property_description && (
                      <p className="text-sm text-gray-600">{valuation.property_description}</p>
                    )}
                    {valuation.estimated_value && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                        <Euro className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          Valore stimato: €{valuation.estimated_value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {valuation.notes && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Note</p>
                      <p className="text-sm text-gray-700">{valuation.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {valuation.status === "richiesta" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => updateStatus(valuation.id, "appuntamento_fissato")}
                        data-testid={`set-appointment-${valuation.id}`}
                      >
                        Fissa Appuntamento
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openValuationDialog(valuation)}
                        data-testid={`evaluate-${valuation.id}`}
                      >
                        Valuta
                      </Button>
                    </>
                  )}
                  {valuation.status === "appuntamento_fissato" && (
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => openValuationDialog(valuation)}
                      data-testid={`complete-valuation-${valuation.id}`}
                    >
                      Completa Valutazione
                    </Button>
                  )}
                  {valuation.status === "valutata" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(valuation.id, "conclusa")}
                      data-testid={`close-valuation-${valuation.id}`}
                    >
                      Chiudi Pratica
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Valuation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completa Valutazione</DialogTitle>
          </DialogHeader>
          {selectedValuation && (
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <p className="text-sm font-medium">{selectedValuation.client_name}</p>
              </div>
              <div>
                <Label>Immobile</Label>
                <p className="text-sm font-medium">{selectedValuation.property_location}</p>
              </div>
              <div>
                <Label>Valore Stimato (€)</Label>
                <Input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="250000"
                  data-testid="estimated-value-input"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => updateStatus(selectedValuation.id, "valutata", estimatedValue)}
                data-testid="save-valuation-btn"
              >
                Salva Valutazione
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
