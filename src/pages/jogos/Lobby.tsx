import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Lobby() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    socket.on("room_joined", ({ code }) => {
      toast.success("Entrou na sala com sucesso!");
      navigate(`/game/${code}`);
    });

    socket.on("room_not_found", () => {
      toast.error("Sala não encontrada.");
    });

    socket.on("room_full", () => {
      toast.error("Sala já está cheia.");
    });

    return () => {
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("room_not_found");
      socket.off("room_full");
    };
  }, [navigate, isAuthenticated, user]);

  const createRoom = () => {
    if (!user) return;

    const toastId = toast.loading("Criando sala...");

    const emitCreate = () => {
      socket.emit("create_game", { hostId: socket.id, hostName: user.name });

      socket.once("room_created", ({ code }) => {
        toast.dismiss(toastId);
        toast.success("Sala criada com sucesso!");
        navigate(`/game/${code}`);
      });
    };

    if (!socket.connected) {
      toast.info("Conectando ao servidor...");
      socket.once("connect", emitCreate);
      return;
    }

    emitCreate();
  };

  const joinRoom = () => {
    if (!user) return;

    if (!roomCode) {
      toast.error("Insira o código da sala.");
      return;
    }

    const toastId = toast.loading("Entrando na sala...");

    setTimeout(() => {
      socket.emit("join_game", {
        code: roomCode,
        player: { id: socket.id, name: user.name },
      });

      toast.dismiss(toastId);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:p-8 min-h-screen text-white text-xl w-full max-w-full mx-auto">
      <h1 className="text-4xl font-bold mb-4 sm:mb-6">Lobby de Missão Cooperativa</h1>
  
      <Button
        className="mb-4 sm:mb-6 bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-lg font-semibold rounded-lg"
        onClick={createRoom}
      >
        Criar Sala
      </Button>
  
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-md">
        <Input
          placeholder="Código da Sala"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-full px-4 py-2 sm:py-3 text-lg bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <Button
          onClick={joinRoom}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-lg font-semibold rounded-lg"
        >
          Entrar na Sala
        </Button>
      </div>
    </div>
  );  
}