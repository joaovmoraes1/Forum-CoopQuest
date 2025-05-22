import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";
import ProfileModal from "../components/ProfileModal";
import EventsSection from "../components/EventsSection";
import DiscussionsSection from "../components/DiscussionsSection";
import ChatModal from "../components/ChatModal";

interface Stats {
  topics: number;
  replies: number;
  members: number;
}

interface User {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  bio?: string;
  createdAt: string;
}

const Forum: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [onlineMembers, setOnlineMembers] = useState<User[]>([]);
  const [showMessageModal, setShowMessageModal] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<User | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats");
        setStats(response.data);
      } catch (error: any) {
        console.error("Error fetching stats (Forum.tsx):", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast.error("Failed to load forum statistics");
      }
    };

    const fetchOnlineMembers = async () => {
      try {
        const response = await api.get("/members/online");
        setOnlineMembers(response.data);
      } catch (error: any) {
        console.error("Error fetching online members (Forum.tsx):", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast.error("Failed to load online members");
      }
    };

    fetchStats();
    fetchOnlineMembers();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header Banner */}
      <div className="bg-coopquest-yellow text-white py-6 px-6 sm:px-8 lg:px-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-2 tracking-tight">
            Bem-vindo ao Fórum CoopQuest
          </h1>
          <p className="text-base sm:text-lg text-gray-100 max-w-2xl font-light">
            Plataforma educacional para o ensino de lógica de programação
            através de jogos cooperativos
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Topics (Left Side) */}
          <div className="lg:col-span-2">
            <div className="bg-secondary rounded-2xl shadow-2xl p-8 border border-border transform transition-all hover:shadow-3xl duration-500">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-2">
                <span className="text-coopquest-yellow">Membros Online</span>
              </h2>
              <ul className="space-y-6">
                {onlineMembers.length > 0 ? (
                  onlineMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all duration-300 border border-border"
                    >
                      <img
                        src={member.avatar || "/default-avatar.png"}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-coopquest-yellow/50 shadow-sm transform transition-transform hover:scale-105 duration-300"
                      />
                      <div className="flex-1">
                        <p className="text-text font-semibold text-lg">
                          {member.name}
                        </p>
                        <p className="text-text/80 text-sm mt-1">
                          Membro desde:{" "}
                          {new Date(member.createdAt).toLocaleDateString(
                            "pt-BR",
                            { day: "2-digit", month: "long", year: "numeric" }
                          )}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setShowProfileModal(member)}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-xl shadow"
                          >
                            Ver Perfil
                          </button>
                          {user?.id !== member.id && (
                            <button
                              onClick={() => setShowMessageModal(member)}
                              className="bg-coopquest-yellow hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-xl shadow"
                              aria-label={`Conversar com ${member.name}`}
                            >
                              Conversar
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-text/80 italic text-center py-6">
                    Nenhum membro online no momento.
                  </p>
                )}
              </ul>
            </div>
          </div>

          {/* Forum Stats (Right Side) */}
          {stats && (
            <div className="bg-secondary rounded-2xl shadow-2xl p-8 border border-border transform transition-all hover:shadow-3xl duration-500">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-2">
                <span className="text-coopquest-yellow">
                  Estatísticas do Fórum
                </span>
              </h2>
              <div className="space-y-4">
                <p className="text-text/80 text-lg flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-coopquest-yellow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7h18M3 12h18M3 17h18"
                    ></path>
                  </svg>
                  Tópicos:{" "}
                  <span className="font-semibold text-coopquest-yellow ml-2">
                    {stats.topics}
                  </span>
                </p>
                <p className="text-text/80 text-lg flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-coopquest-yellow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M4 6h16M4 6a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H4z"
                    ></path>
                  </svg>
                  Respostas:{" "}
                  <span className="font-semibold text-coopquest-yellow ml-2">
                    {stats.replies}
                  </span>
                </p>
                <p className="text-text/80 text-lg flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-coopquest-yellow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                  Membros:{" "}
                  <span className="font-semibold text-coopquest-yellow ml-2">
                    {stats.members}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Events and Discussions */}
        <div className="mt-16 space-y-16">
          <EventsSection />
          <DiscussionsSection />
        </div>
      </div>

      {/* Modals */}
      {showMessageModal && user && (
        <ChatModal
          userId={user.id}
          userAvatar={user.avatar}
          recipient={{
            id: showMessageModal.id,
            name: showMessageModal.name,
            avatar: showMessageModal.avatar,
          }}
          onClose={() => setShowMessageModal(null)}
        />
      )}
      {showProfileModal && (
        <ProfileModal
          user={showProfileModal}
          onClose={() => setShowProfileModal(null)}
          isOwnProfile={false}
        />
      )}
    </div>
  );
};

export default Forum;