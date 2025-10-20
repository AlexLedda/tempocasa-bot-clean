import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Building2, Users, MessageSquare, Calendar, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, messagesRes, appointmentsRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/messages`),
        axios.get(`${API}/appointments?status=confermato`),
      ]);

      setStats(statsRes.data);
      setRecentMessages(messagesRes.data.slice(0, 5));
      setUpcomingAppointments(appointmentsRes.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Immobili Totali",
      value: stats?.total_properties || 0,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Clienti",
      value: stats?.total_clients || 0,
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      name: "Messaggi",
      value: stats?.total_messages || 0,
      icon: MessageSquare,
      color: "from-sky-500 to-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      name: "Appuntamenti",
      value: stats?.pending_appointments || 0,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Panoramica della tua agenzia immobiliare</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
              data-testid={`stat-card-${stat.name.toLowerCase().replace(" ", "-")}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Messaggi Recenti</h2>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-4" data-testid="recent-messages-list">
            {recentMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessun messaggio</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {msg.client_name || msg.client_phone}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      msg.direction === "incoming" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {msg.direction === "incoming" ? "In" : "Out"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Prossimi Appuntamenti</h2>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-4" data-testid="upcoming-appointments-list">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessun appuntamento</p>
            ) : (
              upcomingAppointments.map((appt) => (
                <div key={appt.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{appt.client_name}</p>
                    <p className="text-sm text-gray-600 truncate">{appt.property_title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(appt.appointment_date).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}