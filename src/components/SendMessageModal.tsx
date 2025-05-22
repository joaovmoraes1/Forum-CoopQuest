import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import io from "socket.io-client";

interface SendMessageModalProps {
  recipientId: number;
  recipientName: string;
  onClose: () => void;
  userId: number;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  date: string;
}

const socket = io("https://forum-coop-quest.vercel.app", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  recipientId,
  recipientName,
  onClose,
  userId,
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para buscar o histórico de mensagens
  const fetchHistory = async () => {
    try {
      const response = await api.get(`/messages/history/${recipientId}`);
      const messages = response.data.messages || [];
      setMessageHistory(messages);
    } catch (error: any) {
      console.error("Erro ao buscar histórico de mensagens:", error);
      toast.error("Erro ao carregar o histórico de mensagens.");
    }
  };

  // Buscar histórico ao abrir o modal
  useEffect(() => {
    fetchHistory();
  }, [recipientId]);

  // Configurar WebSocket para mensagens em tempo real
  useEffect(() => {
    socket.emit("register", userId);

    socket.on("private_message", (newMessage: Message) => {
      if (
        (newMessage.senderId === recipientId && newMessage.recipientId === userId) ||
        (newMessage.senderId === userId && newMessage.recipientId === recipientId)
      ) {
        fetchHistory(); // Sempre recarrega do backend
      }
    });

    return () => {
      socket.off("private_message");
    };
  }, [userId, recipientId]);

  // Ordenar mensagens antes de renderizar
  const sortedMessages = [...messageHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error("A mensagem não pode estar vazia.");
      return;
    }
    if (trimmedMessage.length > 1000) {
      toast.error("A mensagem não pode ter mais de 1000 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/messages", {
        recipientId,
        content: trimmedMessage,
      });
      toast.success(`Mensagem enviada para ${recipientName}!`);
      setMessage("");
      await fetchHistory(); // Atualiza o histórico direto do backend
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error(
        "Erro ao enviar mensagem: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 w-full max-w-md transform transition-all duration-300">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-orange-500">✉️</span> Chat com {recipientName}
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </h3>

        {/* Área do histórico de mensagens */}
        <div className="max-h-64 overflow-y-auto mb-4 p-2 bg-gray-700 rounded-lg">
          {sortedMessages.length === 0 ? (
            <p className="text-gray-400 text-center">
              Nenhuma mensagem encontrada.
            </p>
          ) : (
            sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col mb-2 ${
                  msg.senderId === userId ? "items-end" : "items-start"
                }`}
              >
                <span className="text-xs text-gray-400">
                  {new Date(msg.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div
                  className={`p-2 rounded-lg max-w-[70%] ${
                    msg.senderId === userId ? "bg-orange-500" : "bg-gray-600"
                  } text-white`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulário de envio de mensagem */}
        <form onSubmit={handleSendMessage}>
          <textarea
            className="w-full p-3 bg-gray-700 text-white rounded-lg mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;