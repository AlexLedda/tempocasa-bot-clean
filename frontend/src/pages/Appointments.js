import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Calendar, Clock, User, Building2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("confermato");

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments?status=${filter}`);
      setAppointments(response.data);
    } catch (error) {
      toast.error("Errore nel caricamento degli appuntamenti");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/appointments/${id}?status=${status}`);
      toast.success("Appuntamento aggiornato");
      fetchAppointments();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="appointments-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Appuntamenti</h1>
          <p className="text-lg text-gray-600">Gestisci le visite agli immobili</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {["confermato", "completato", "cancellato"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              data-testid={`filter-${status}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4" data-testid="appointments-list">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nessun appuntamento {filter}</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover"
              data-testid={`appointment-card-${appt.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{appt.property_title}</h3>
                      <p className="text-sm text-gray-500">ID: {appt.property_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">{appt.client_name}</p>
                        <p className="text-xs text-gray-500">{appt.client_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Data e Ora</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(appt.appointment_date).toLocaleDateString("it-IT")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(appt.appointment_date).toLocaleTimeString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Stato</p>
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded-full ${
                            appt.status === "confermato"
                              ? "bg-green-100 text-green-700"
                              : appt.status === "completato"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Note</p>
                      <p className="text-sm text-gray-700">{appt.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {appt.status === "confermato" && (
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => updateStatus(appt.id, "completato")}
                      data-testid={`complete-appointment-${appt.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => updateStatus(appt.id, "cancellato")}
                      data-testid={`cancel-appointment-${appt.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancella
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}