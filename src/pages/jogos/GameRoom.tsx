import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ratImage = new Image();
ratImage.src = "/rat.png";

const arrowImage = new Image();
arrowImage.src = "/seta.png";

export default function GameRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [players, setPlayers] = useState<any[]>([]);
  const [code1, setCode1] = useState("programa {\n\n}");
  const [code2, setCode2] = useState("programa {\n\n}");
  const [host, setHost] = useState<string>("");
  const [hasJoined, setHasJoined] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const executandoRef = useRef(false);

  const gridSize = 5;
  const tileSize = 100;

  const player1 = players[0];
  const player2 = players[1];
  const isPlayer1 = player1?.id === socket.id;
  const isPlayer2 = player2?.id === socket.id;
  const isHost = host === socket.id;

  useEffect(() => {
    const handler = (e: any) => {
      const { type, message } = e.detail;
      if (type === "error") toast.error(message);
      else if (type === "success") toast.success(message);
      else if (type === "info") toast.info(message);
      else if (type === "warning") toast.warning(message);
      else toast(message);
    };
    window.addEventListener("notify", handler);
    return () => window.removeEventListener("notify", handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    drawBoard();

    socket.emit("join_game", {
      code: roomCode,
      player: { id: socket.id, name: user.name },
    });

    socket.on("update_players", ({ players, host }) => {
      setPlayers(players);
      setHost(host);
    });

    socket.on("receive_code", ({ playerId, code }) => {
      if (playerId !== socket.id) {
        if (isPlayer1) setCode2(code);
        else setCode1(code);
      }
    });

    socket.on("kicked", () => {
      navigate("/lobby");
    });

    socket.on("notify", ({ type, message }) => {
      window.dispatchEvent(new CustomEvent("notify", { detail: { type, message } }));
    });

    socket.on("run_code", ({ code1, code2 }) => {
      setTimeout(() => {
        handleRun(code1, code2);
      }, 100);
    });

    socket.on("sala_encerrada", () => {
      toast.error("Sala inexistente");
      navigate("/lobby");
    });

    socket.on("room_not_found", () => {
      toast.error("Sala inexistente");
      navigate("/lobby");
    });

    socket.on("room_joined", ({ code }) => {
      setHasJoined(true);
    });

    return () => {
      socket.off("update_players");
      socket.off("receive_code");
      socket.off("kicked");
      socket.off("notify");
      socket.off("run_code");
      socket.off("sala_encerrada");
      socket.off("room_not_found");
    };
  }, [user, roomCode, navigate]);

  const drawBoard = (p1?: any, p2?: any) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const size = Math.min(width, height); // canvas quadrado
  
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  
    const cellSize = size / gridSize;
  
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
  
    // desenhar grade
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        ctx.strokeStyle = "gray";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  
    // ponto de chegada
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏁 Chegada", size / 2, size / 2);
  
    // posições iniciais
    const default1 = { x: 0, y: 0, dir: 1 };
    const default2 = { x: gridSize - 1, y: gridSize - 1, dir: 3 };
    const pos1 = p1 || default1;
    const pos2 = p2 || default2;
  
    // jogador 1
    ctx.drawImage(
      ratImage,
      pos1.x * cellSize + cellSize / 2 - 12,
      pos1.y * cellSize + cellSize / 2 - 12,
      24,
      24
    );
    ctx.fillText("Player 1", pos1.x * cellSize + cellSize / 2, pos1.y * cellSize + cellSize / 2 + 18);
  
    // jogador 2
    ctx.drawImage(
      ratImage,
      pos2.x * cellSize + cellSize / 2 - 12,
      pos2.y * cellSize + cellSize / 2 - 12,
      24,
      24
    );
    ctx.fillText("Player 2", pos2.x * cellSize + cellSize / 2, pos2.y * cellSize + cellSize / 2 + 18);
  
    // desenha setas apenas quando não está executando
    if (!executandoRef.current && !p1 && !p2 && arrowImage.complete) {
      const drawArrow = (player: any) => {
        const dir = player.dir;
        const cx = player.x * cellSize + cellSize / 2;
        const cy = player.y * cellSize + cellSize / 2;
        const size = 45; // seta mais robusta e visível
        const offset = 7; // distância ideal para estar na frente, mas dentro da célula
      
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((Math.PI / 2) * (dir - 1));
        ctx.translate(65, -offset); // empurra suavemente à frente
        ctx.drawImage(arrowImage, -size / 2, -size / 2, size, size);
        ctx.restore();
      };  
      drawArrow(pos1);
      drawArrow(pos2);
    }
  };

  const handleRun = (codigo1: string = code1, codigo2: string = code2) => {
    if (!ratImage.complete) {
      ratImage.onload = () => handleRun(codigo1, codigo2);
      return;
    }

    const DIRECTIONS = ["cima", "direita", "baixo", "esquerda"];
    const start1 = { x: 0, y: 0, dir: 1 };
    const start2 = { x: gridSize - 1, y: gridSize - 1, dir: 3 };
    const destino = {
      x: Math.floor(gridSize / 2),
      y: Math.floor(gridSize / 2),
    };

    const comandos1 = parseCommands(codigo1);
    const comandos2 = parseCommands(codigo2);
    if (!comandos1 || !comandos2) return;

    const jogadores = [start1, start2];
    const comandos = [comandos1, comandos2];
    let passo = 0;
    const maxPassos = Math.max(comandos1.length, comandos2.length);

    const mover = (j: any) => {
      if (DIRECTIONS[j.dir] === "cima" && j.y > 0) j.y--;
      if (DIRECTIONS[j.dir] === "baixo" && j.y < 5) j.y++;
      if (DIRECTIONS[j.dir] === "esquerda" && j.x > 0) j.x--;
      if (DIRECTIONS[j.dir] === "direita" && j.x < 5) j.x++;
    };

    const intervalo = setInterval(() => {
      for (let i = 0; i < jogadores.length; i++) {
        const cmd = comandos[i][passo];
        if (cmd === "MOVER") mover(jogadores[i]);
        if (cmd === "DIREITA") jogadores[i].dir = (jogadores[i].dir + 1) % 4;
        if (cmd === "ESQUERDA") jogadores[i].dir = (jogadores[i].dir + 3) % 4;
      }

      drawBoard(jogadores[0], jogadores[1]);
      passo++;

      if (passo >= maxPassos) {
        clearInterval(intervalo);

        const venceu = jogadores.every(j => j.x === destino.x && j.y === destino.y);
        if (isHost) {
          const type = venceu ? "success" : "default";
          const message = venceu ? "Parabéns! Objetivo concluído!" : "Vocês ainda não chegaram no objetivo.";
          socket.emit("notify", { type, message });
        }

        setTimeout(() => {
          drawBoard();
        }, 1000);
      }
    }, 600);
  };

  const handleExecute = () => {
    socket.emit("run_code", { code1, code2 });
  };

  const handleCodeChange = (e: any, isPlayer1: boolean) => {
    const value = e.target.value;
    if (isPlayer1) setCode1(value);
    else setCode2(value);
    socket.emit("send_code", { code: value, roomCode });
  };

  const handleKick = (playerId: string) => {
    socket.emit("kick_player", { roomCode, playerId });
  };

  const parseCommands = (code: string): string[] | null => {
    try {
      const comandos: string[] = [];
      const linhas = code.replace(/programa\s*{/, "").replace(/}$/, "").split(/\n|;/).map(l => l.trim()).filter(l => l.length > 0);
      let i = 0;
      while (i < linhas.length) {
        let linha = linhas[i];
        if (linha.startsWith("repita")) {
          const match = linha.match(/repita (\d+) vezes ?{/);
          if (!match) throw new Error("Sintaxe inválida no bloco de repetição.");
          const vezes = parseInt(match[1]);
          i++;
          const bloco: string[] = [];
          while (i < linhas.length && linhas[i] !== "}") bloco.push(linhas[i++]);
          for (let r = 0; r < vezes; r++) {
            for (let cmd of bloco) {
              if (cmd === "mover_frente()") comandos.push("MOVER");
              else if (cmd === "virar_direita()") comandos.push("DIREITA");
              else if (cmd === "virar_esquerda()") comandos.push("ESQUERDA");
              else throw new Error("Comando inválido em repita: " + cmd);
            }
          }
        } else {
          if (linha === "mover_frente()") comandos.push("MOVER");
          else if (linha === "virar_direita()") comandos.push("DIREITA");
          else if (linha === "virar_esquerda()") comandos.push("ESQUERDA");
          else throw new Error("Comando inválido: " + linha);
        }
        i++;
      }
      return comandos;
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  };

  useEffect(() => {
    const handleLeave = () => {
      if (hasJoined) socket.emit("leave_room", { roomCode, playerId: socket.id });
    };
    window.addEventListener("beforeunload", handleLeave);
    return () => {
      handleLeave();
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [roomCode, hasJoined]);

  return (
   <div className="min-h-screen p-2 sm:p-4 lg:p-8 bg-transparent text-white w-full max-w-full mx-auto">
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div>
          <div className="bg-slate-700 p-2 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-2">Como jogar</h2>
            <pre className="text-sm whitespace-pre-wrap text-green-200">
  {`
  Sequência:
    mover_frente();
    virar_direita();
    virar_esquerda();
  
  Repetição:
    repita N vezes {
      mover_frente();
    }

  Substitua "N" para o total de vezes que achar necessário
  
  Objetivo: Programe os dois para chegarem juntos ao destino!
  `}
            </pre>
          </div>
  
          <div className="bg-slate-700 p-2 sm:p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Sala: <span className="text-blue-400">{roomCode}</span></h2>
            <p className="text-sm mb-2 sm:mb-4">
              Você está logado como: <strong>{user?.name}</strong> ({isHost ? "player1" : "player2"})
            </p>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <h3 className="text-sm font-bold mb-1">Jogador 1: {player1?.name}</h3>
                <textarea
                  value={code1}
                  onChange={(e) => handleCodeChange(e, true)}
                  disabled={!isPlayer1}
                  className="w-full h-40 p-2 rounded bg-black text-green-400 font-mono resize-none"
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold mb-1">Jogador 2: {player2?.name || "Aguardando..."}</h3>
                  {isHost && player2?.id && (
                    <Button variant="destructive" size="sm" onClick={() => handleKick(player2.id)}>
                      Remover
                    </Button>
                  )}
                </div>
                <textarea
                  value={code2}
                  onChange={(e) => handleCodeChange(e, false)}
                  disabled={!isPlayer2}
                  className="w-full h-40 p-2 rounded bg-black text-green-400 font-mono resize-none"
                />
              </div>
            </div>
  
            {isHost && (
              <div className="mt-2 sm:mt-4">
                <Button onClick={handleExecute} className="bg-green-600 hover:bg-green-500">
                  Executar Código
                </Button>
              </div>
            )}
          </div>
        </div>
  
        <div
          ref={containerRef}
          className="game-canvas-container bg-white rounded-lg overflow-hidden p-0 w-full aspect-square flex items-center justify-center"
        >
          <canvas ref={canvasRef} className="bg-black rounded-lg w-full h-full block" />
        </div>
      </div>
    </div>
  );
}