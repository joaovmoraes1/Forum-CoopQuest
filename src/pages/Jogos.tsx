// src/pages/Jogos.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GamepadIcon, Users, Code } from 'lucide-react';
import { socket } from '@/lib/socket';

const jogo = {
  id: 1,
  titulo: "Missão Cooperativa",
  descricao: "Trabalhe em equipe resolvendo desafios lógicos com programação sequencial e repetição.",
  categoria: "Lógica de Programação",
  nivelDificuldade: "Iniciante",
  imagem: "/jogo.png",
  icone: <Code className="w-5 h-5 mr-2 text-coopquest-yellow" />
};

const Jogos = () => {
  const navigate = useNavigate();
  // const [jogadoresOnline, setJogadoresOnline] = useState(0);

  // useEffect(() => {
  //   socket.on("jogadores_online", (count) => {
  //     setJogadoresOnline(count);
  //   });

  //   socket.emit("get_online_count"); // opcional, para solicitar ao montar

  //   return () => {
  //     socket.off("jogadores_online");
  //   };
  // }, []);

  return (
    <main className="flex-grow py-12 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="px-4 sm:px-6 lg:px-8 mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-coopquest-yellow to-yellow-500 mb-4 tracking-tight">
          Jogos Educativos
        </h1>
        <p className="text-lg text-text/80 font-light">
          Aprenda programação de forma divertida com nossos jogos educativos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-secondary border border-border overflow-hidden flex flex-col rounded-2xl shadow-2xl transform transition-all hover:shadow-3xl duration-500">
          <div className="aspect-video relative">
            <img
              src={jogo.imagem}
              alt={jogo.titulo}
              className="w-full h-full object-cover rounded-t-2xl"
            />
            <div className="absolute top-3 right-3 bg-coopquest-yellow text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {jogo.nivelDificuldade}
            </div>
          </div>

          <div className="p-6 flex-grow">
            <h3 className="text-2xl font-bold text-text mb-3">{jogo.titulo}</h3>
            <p className="text-text/80 mb-4 font-light leading-relaxed">{jogo.descricao}</p>
            <div className="flex items-center text-text/80 text-sm mb-4">
              {jogo.icone}
              <span className="mr-4">{jogo.categoria}</span>
              {/* <Users className="w-5 h-5 mr-2 text-coopquest-yellow" />
              <span>{jogadoresOnline} online</span> */}
            </div>
          </div>

          <div className="p-6 pt-0 mt-auto">
            <Button
              className="w-full bg-coopquest-yellow hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow-lg flex justify-center items-center transform transition-all hover:scale-105 duration-300"
              onClick={() => navigate('/lobby')}
            >
              <GamepadIcon className="w-5 h-5 mr-2" />
              Jogar Agora
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Jogos;
