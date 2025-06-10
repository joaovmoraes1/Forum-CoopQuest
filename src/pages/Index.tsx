import React, { useEffect, useState } from "react";
import TopicsList from "../components/TopicsList";
import NewTopicForm from "../components/NewTopicForm";
import DailyChallenge from "../components/DailyChallenge";
import { getTopics, Topic } from "@/services/topics";
import {
  getForumStats,
  getOnlineMembers,
  getDailyChallenge,
} from "../services/stats";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, BookOpen, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatModal from "../components/ChatModal";
import { useAuth } from "@/contexts/AuthContext";

interface ForumStats {
  topics: number;
  replies: number;
  members: number;
}

interface OnlineMember {
  id: number;
  name: string;
  avatar?: string;
}

interface DailyChallengeData {
  id: number;
  title: string;
  description: string;
  tips: string[];
}

const Index = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    topics: 0,
    replies: 0,
    members: 0,
  });
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState<OnlineMember | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchTopics(),
        fetchStats(),
        fetchOnlineMembers(),
        fetchDailyChallenge(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast.error("Erro ao carregar dados iniciais. Tente novamente mais tarde.");
    }
  };

  const fetchTopics = async () => {
    try {
      setIsLoadingTopics(true);
      const response = await getTopics(1, 3);
      setTopics(response.topics);
    } catch (error: any) {
      console.error("Erro ao carregar tópicos:", error.message);
      if (error.response?.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        toast.error("Erro ao carregar tópicos. Tente novamente mais tarde.");
      }
      setTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getForumStats();
      setStats(response);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas do fórum.");
      setStats({ topics: 0, replies: 0, members: 0 });
    }
  };

  const fetchOnlineMembers = async () => {
    try {
      const response = await getOnlineMembers();
      const uniqueMembers = response.filter(
        (member: OnlineMember, index: number, self: OnlineMember[]) =>
          index === self.findIndex((m) => m.id === member.id)
      );
      setOnlineMembers(uniqueMembers);
    } catch (error) {
      console.error("Erro ao carregar membros online:", error);
      toast.error("Erro ao carregar membros online.");
      setOnlineMembers([]);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const response = await getDailyChallenge();
      setDailyChallenge(response);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDailyChallenge(null);
        console.log("Nenhum desafio ativo encontrado");
      } else {
        console.error("Erro ao carregar desafio do dia:", error);
        toast.error("Erro ao carregar desafio do dia.");
      }
    }
  };

  const handleViewAllTopics = () => {
    navigate("/topics");
  };

  const handleTopicCreated = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await fetchTopics();
  };

  return (
    <main className="flex-grow py-12 min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-4 lg:px-8 mt-12">
        {/* Header Section - bloco amarelo ocupa toda a largura */}
        <div className="col-span-full">
          <div className="bg-coopquest-yellow text-white py-6 px-2 sm:px-4 lg:px-8 w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight text-white text-left">
              Bem-vindo ao Fórum CoopQuest
            </h1>
            <p className="text-base sm:text-lg text-white/90 font-light text-left">
              Plataforma educacional para o ensino de lógica de programação através de jogos cooperativos
            </p>
          </div>
        </div>

        {/* Left Column: Topics and New Topic Form */}
        <div className="md:col-span-2 space-y-8">
          {/* Recent Topics */}
          <Card className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500">
            <CardHeader className="border-b border-border p-2 sm:p-6">
              <CardTitle className="text-3xl font-bold text-text flex items-center gap-2">
                <span className="text-coopquest-yellow">Tópicos Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <TopicsList topics={topics} isLoading={isLoadingTopics} />
              <Button
                className="mt-6 w-full bg-coopquest-yellow hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
                onClick={() => navigate('/topics')}
              >
                Ver Todos os Tópicos
              </Button>
            </CardContent>
          </Card>

          {/* New Topic Form */}
          <Card className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500">
            <CardHeader className="border-b border-border p-2 sm:p-6">
              <CardTitle className="text-3xl font-bold text-text">
                Criar Novo Tópico
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <NewTopicForm onTopicCreated={handleTopicCreated} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats, Online Members, Daily Challenge */}
        <div className="space-y-8">
          {/* Forum Stats */}
          <Card className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500">
            <CardHeader className="border-b border-border p-2 sm:p-6">
              <CardTitle className="text-2xl font-bold text-text">
                Estatísticas do Fórum
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center p-2 sm:p-6 bg-secondary/50 rounded-xl">
                  <BookOpen className="mr-4 text-coopquest-yellow" size={28} />
                  <div>
                    <p className="font-bold text-3xl text-text">{stats.topics}</p>
                    <p className="text-sm text-text/80">Tópicos</p>
                  </div>
                </div>
                <div className="flex items-center p-2 sm:p-6 bg-secondary/50 rounded-xl">
                  <MessageSquare className="mr-4 text-coopquest-yellow" size={28} />
                  <div>
                    <p className="font-bold text-3xl text-text">{stats.replies}</p>
                    <p className="text-sm text-text/80">Respostas</p>
                  </div>
                </div>
                <div className="flex items-center p-2 sm:p-6 bg-secondary/50 rounded-xl">
                  <Users className="mr-4 text-coopquest-yellow" size={28} />
                  <div>
                    <p className="font-bold text-3xl text-text">{stats.members}</p>
                    <p className="text-sm text-text/80">Membros</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Online Members */}
          <Card className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500">
            <CardHeader className="border-b border-border p-2 sm:p-6">
              <CardTitle className="text-2xl font-bold text-text flex items-center gap-2">
                <Users size={24} className="text-coopquest-yellow" /> Membros Online
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              {onlineMembers.length > 0 ? (
                <ul className="space-y-4">
                  {onlineMembers.map((member) => (
                    <li key={member.id} className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            member.avatar ||
                            "/fc1350ed-e4a8-43e7-8e1e-6a85832f72d6.png"
                          }
                          alt={member.name}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-coopquest-yellow"
                        />
                        <span className="absolute bottom-0 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-secondary"></span>
                      </div>
                      <span className="text-text font-medium">{member.name}</span>
                      {user?.id !== member.id && (
                        <Button
                          size="sm"
                          className="ml-2 bg-coopquest-yellow hover:bg-yellow-400 text-black font-semibold py-1 px-2 sm:px-4 lg:px-8 rounded-xl shadow"
                          onClick={() => setShowMessageModal(member)}
                        >
                          Conversar
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center p-2 sm:p-6 text-text/80">
                  Nenhum membro online no momento
                </p>
              )}
            </CardContent>
          </Card>

          {/* Daily Challenge */}
          <Card className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500">
            <CardHeader className="border-b border-border p-2 sm:p-6 bg-coopquest-yellow rounded-t-2xl">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Award size={24} className="text-white" /> Desafio do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              {dailyChallenge ? (
                <DailyChallenge
                  id={dailyChallenge.id}
                  title={dailyChallenge.title}
                  description={dailyChallenge.description}
                  tips={dailyChallenge.tips}
                  redirectAfterParticipation={true}
                />
              ) : (
                <p className="text-center p-2 sm:p-6 text-text/80">
                  Nenhum desafio disponível no momento.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Modal para membros online */}
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
    </main>
  );
};

export default Index;