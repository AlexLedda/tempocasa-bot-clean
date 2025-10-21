import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { User, Mail, Phone, Search, Euro, Home, CheckCircle, XCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    looking_for: "",
    budget: "",
    needs_mortgage: false,
    mortgage_amount: "",
    notes: "",
    profile_completed: false,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error("Errore nel caricamento dei clienti");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      surname: client.surname || "",
      phone: client.phone || "",
      email: client.email || "",
      looking_for: client.looking_for || "",
      budget: client.budget?.toString() || "",
      needs_mortgage: client.needs_mortgage || false,
      mortgage_amount: client.mortgage_amount?.toString() || "",
      notes: client.notes || "",
      profile_completed: client.profile_completed || false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (phone) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo cliente? Verranno eliminati anche tutti i messaggi, appuntamenti e valutazioni associati.")) {
      return;
    }

    try {
      await axios.delete(`${API}/clients/${phone}`);
      toast.success("Cliente eliminato con successo");
      fetchClients();
    } catch (error) {
      toast.error("Errore nell'eliminazione del cliente");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email || null,
        looking_for: formData.looking_for || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        needs_mortgage: formData.needs_mortgage,
        mortgage_amount: formData.mortgage_amount ? parseFloat(formData.mortgage_amount) : null,
        notes: formData.notes || null,
        profile_completed: formData.profile_completed,
      };

      await axios.put(`${API}/clients/${editingClient.phone}`, payload);
      toast.success("Cliente aggiornato con successo");
      setDialogOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      toast.error("Errore nell'aggiornamento del cliente");
    }
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      surname: "",
      phone: "",
      email: "",
      looking_for: "",
      budget: "",
      needs_mortgage: false,
      mortgage_amount: "",
      notes: "",
      profile_completed: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="clients-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Clienti</h1>
        <p className="text-lg text-gray-600">Gestisci i profili dei tuoi clienti</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totale Clienti</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Profili Completi</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => c.profile_completed).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Con Budget Definito</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => c.budget).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Euro className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="clients-grid">
        {clients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nessun cliente trovato</p>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.phone}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover"
              data-testid={`client-card-${client.phone}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {client.name} {client.surname}
                    </h3>
                    <p className="text-xs text-gray-500">{client.phone}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    client.profile_completed
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {client.profile_completed ? "Completo" : "Incompleto"}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-4">
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{client.email}</span>
                  </div>
                )}
                {client.looking_for && (
                  <div className="flex items-start space-x-2 text-sm">
                    <Search className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{client.looking_for}</span>
                  </div>
                )}
                {client.budget && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Euro className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 font-semibold">
                      Budget: €{client.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                {client.needs_mortgage && (
                  <div className="bg-blue-50 rounded-lg p-2 text-sm">
                    <p className="text-blue-700 font-medium">
                      Mutuo: €{client.mortgage_amount?.toLocaleString() || "Non specificato"}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Note</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{client.notes}</p>
                </div>
              )}

              {/* Edit Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleEdit(client)}
                data-testid={`edit-client-${client.phone}`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifica Profilo
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="client-form">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="client-name-input"
                />
              </div>
              <div>
                <Label>Cognome</Label>
                <Input
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  data-testid="client-surname-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefono *</Label>
                <Input
                  value={formData.phone}
                  disabled
                  data-testid="client-phone-input"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="client-email-input"
                />
              </div>
            </div>

            <div>
              <Label>Cosa cerca</Label>
              <Textarea
                value={formData.looking_for}
                onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                rows={3}
                placeholder="Es: Appartamento 3 camere in centro, con balcone..."
                data-testid="client-looking-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget (€)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="300000"
                  data-testid="client-budget-input"
                />
              </div>
              <div>
                <Label>Necessita Mutuo?</Label>
                <Select
                  value={formData.needs_mortgage ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, needs_mortgage: value === "true" })
                  }
                >
                  <SelectTrigger data-testid="client-mortgage-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Sì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.needs_mortgage && (
              <div>
                <Label>Importo Mutuo (€)</Label>
                <Input
                  type="number"
                  value={formData.mortgage_amount}
                  onChange={(e) => setFormData({ ...formData, mortgage_amount: e.target.value })}
                  placeholder="200000"
                  data-testid="client-mortgage-amount-input"
                />
              </div>
            )}

            <div>
              <Label>Note</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                data-testid="client-notes-input"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="profile_completed"
                checked={formData.profile_completed}
                onChange={(e) =>
                  setFormData({ ...formData, profile_completed: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
                data-testid="client-completed-checkbox"
              />
              <Label htmlFor="profile_completed" className="cursor-pointer">
                Profilo Completo
              </Label>
            </div>

            <Button type="submit" className="w-full" data-testid="save-client-btn">
              Aggiorna Cliente
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
