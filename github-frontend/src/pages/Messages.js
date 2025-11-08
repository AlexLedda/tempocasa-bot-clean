import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { MessageSquare, Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, clientsRes] = await Promise.all([
        axios.get(`${API}/messages`),
        axios.get(`${API}/clients`),
      ]);

      setMessages(messagesRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClientMessages = (phone) => {
    return messages.filter((msg) => msg.client_phone === phone);
  };

  const groupedClients = clients.map((client) => ({
    ...client,
    messages: getClientMessages(client.phone),
    lastMessage: getClientMessages(client.phone)[0],
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="messages-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Messaggi WhatsApp</h1>
        <p className="text-lg text-gray-600">Conversazioni con i tuoi clienti</p>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
        <div className="flex h-full">
          {/* Clients List */}
          <div className="w-80 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Conversazioni</h2>
            </div>
            <div className="flex-1 overflow-y-auto" data-testid="clients-list">
              {groupedClients.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Nessuna conversazione</p>
                </div>
              ) : (
                groupedClients.map((client) => (
                  <div
                    key={client.phone}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedClient?.phone === client.phone ? "bg-blue-50" : ""
                    }`}
                    data-testid={`client-item-${client.phone}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.phone}</p>
                        {client.lastMessage && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {client.lastMessage.message}
                          </p>
                        )}
                      </div>
                      {client.messages.length > 0 && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          {client.messages.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="flex-1 flex flex-col">
            {selectedClient ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedClient.name}</p>
                      <p className="text-sm text-gray-500">{selectedClient.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="messages-list">
                  {selectedClient.messages
                    .slice()
                    .reverse()
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            msg.direction === "outgoing"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.direction === "outgoing" ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Scrivi un messaggio..."
                      className="flex-1"
                      data-testid="message-input"
                    />
                    <Button className="bg-blue-500 hover:bg-blue-600" data-testid="send-message-btn">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Nota: Invio messaggi diretto disponibile dopo setup completo WhatsApp
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Seleziona una conversazione</p>
                  <p className="text-gray-400 text-sm mt-2">Scegli un cliente dalla lista</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}