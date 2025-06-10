import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accessibility, Eye, ZoomIn, ZoomOut, RotateCcw, Volume2, Pause, Play, StopCircle } from 'lucide-react';
import { useAccessibility } from './Layout';

const AccessibilityMenu: React.FC = () => {
  const { fontSize, highContrast, ttsEnabled, setFontSize, setHighContrast, toggleTts } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0); // Default speech rate
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullTextRef = useRef<string>(''); // Store the full text for restart
  let currentIndexRef = useRef<number>(0); // Track the current chunk index
  const chunksRef = useRef<string[]>([]); // Store all chunks for restart

  // Funções de ajuste de tamanho da fonte
  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 20); // Máximo 20px
    setFontSize(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 14); // Mínimo 14px
    setFontSize(newSize);
  };

  const resetFontSize = () => {
    setFontSize(16);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const ptVoice = availableVoices.find((voice) => 
        voice.lang === 'pt-BR' && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      ) || availableVoices.find((voice) => voice.lang === 'pt-BR');
      setSelectedVoice(ptVoice || null);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Dividir texto longo em chunks
  const splitText = (text: string, maxLength: number = 200): string[] => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  };

  // Função para ler texto
  const speak = (text: string, onEnd?: () => void) => {
    if (!ttsEnabled || !text || !selectedVoice) return;

    setIsSpeaking(true);
    setIsPaused(false);

    // Cancelar qualquer fala anterior para não acumular
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = 'pt-BR';
    utterance.rate = speechRate;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (currentIndexRef.current < chunksRef.current.length - 1) {
        currentIndexRef.current++;
        speak(chunksRef.current[currentIndexRef.current], onEnd);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (event) => {
      console.error('Erro na síntese de voz:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Pausar fala
  const pauseSpeech = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Retomar fala
  const resumeSpeech = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  // Parar fala e reiniciar do início
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    currentIndexRef.current = 0; // Reset to start on next play
    utteranceRef.current = null;
    
    // Recomeçar a leitura do início
    if (ttsEnabled && chunksRef.current.length > 0) {
      setTimeout(() => {
        speak(chunksRef.current[0]);
      }, 100);
    }
  };

  // Ajustar velocidade da voz mantendo a posição atual
  const adjustSpeechRate = (increment: number) => {
    const newRate = Math.min(Math.max(speechRate + increment, 0.5), 2.0); // Limites: 0.5 a 2.0
    setSpeechRate(newRate);
    
    if (isSpeaking) {
      // Guardar o estado atual
      const wasPaused = isPaused;
      const currentChunkIndex = currentIndexRef.current;
      
      // Cancelar a fala atual
      window.speechSynthesis.cancel();
      
      // Recomeçar a fala com a nova velocidade a partir do chunk atual
      setTimeout(() => {
        // Criar nova utterance com a nova velocidade
        if (chunksRef.current.length > 0 && currentChunkIndex < chunksRef.current.length) {
          speak(chunksRef.current[currentChunkIndex]);
          
          // Se estava pausado, pausar novamente
          if (wasPaused) {
            setTimeout(() => {
              pauseSpeech();
            }, 50);
          }
        }
      }, 100);
    }
  };

  // Extrair texto da página, excluindo cabeçalhos e elementos de navegação
  const extractTextFromNode = (node: Node): string => {
    let text = '';
    if (node.nodeType === Node.TEXT_NODE) {
      text = node.textContent?.trim() || '';
      const parentElement = node.parentElement;
      if (
        parentElement &&
        (parentElement.closest('[data-accessibility-menu]') ||
         parentElement.tagName.match(/^H[1-6]$/i) || // Ignorar cabeçalhos (h1-h6)
         parentElement.closest('nav')) // Ignorar elementos dentro de <nav>
      ) {
        text = '';
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (
        element.tagName.toLowerCase() !== 'script' &&
        element.tagName.toLowerCase() !== 'style' &&
        !element.closest('[data-accessibility-menu]') &&
        !element.tagName.match(/^H[1-6]$/i) && // Ignorar cabeçalhos
        element.tagName.toLowerCase() !== 'nav' // Ignorar <nav>
      ) {
        node.childNodes.forEach((child) => {
          text += extractTextFromNode(child) + ' ';
        });
      }
    }
    return text.replace(/\s+/g, ' ').trim();
  };

  // Iniciar leitura da página
  const startReading = () => {
    if (!ttsEnabled || !selectedVoice) return;
    
    const allText = extractTextFromNode(document.body);
    if (allText) {
      fullTextRef.current = allText; // Store full page text
      const chunks = splitText(allText);
      chunksRef.current = chunks; // Armazenar todos os chunks
      
      if (chunks.length > 0) {
        currentIndexRef.current = 0;
        speak(chunks[0]);
      }
    }
  };

  // Lidar com mudanças de texto na página
  useEffect(() => {
    if (!ttsEnabled) {
      stopSpeech();
      return;
    }

    startReading();

    // Observar mudanças dinâmicas em toda a página, exceto menu de acessibilidade
    const observer = new MutationObserver((mutations) => {
      let hasRelevantChanges = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (!node.parentElement?.closest('[data-accessibility-menu]')) {
              hasRelevantChanges = true;
            }
          });
        }
      });
      
      if (hasRelevantChanges) {
        const allText = extractTextFromNode(document.body);
        if (allText && allText !== fullTextRef.current) {
          fullTextRef.current = allText;
          const chunks = splitText(allText);
          chunksRef.current = chunks;
          
          // Reiniciar leitura apenas se não estiver lendo atualmente
          if (!isSpeaking) {
            currentIndexRef.current = 0;
            speak(chunks[0]);
          }
        }
      }
    });

    // Detectar mudança de página
    const handlePageChange = () => {
      stopSpeech(); // Parar leitura da página anterior
      setTimeout(startReading, 300); // Iniciar leitura após pequeno delay para carregar a página
    };

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', handlePageChange); // Detectar navegação via histórico
    document.addEventListener('DOMContentLoaded', handlePageChange); // Detectar carregamento inicial

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handlePageChange);
      document.removeEventListener('DOMContentLoaded', handlePageChange);
      window.speechSynthesis.cancel(); // Limpar ao desmontar
    };
  }, [ttsEnabled, selectedVoice]);

  // Efeito para atualizar a leitura quando a taxa de fala muda
  useEffect(() => {
    if (utteranceRef.current && isSpeaking) {
      utteranceRef.current.rate = speechRate;
    }
  }, [speechRate]);

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`w-full max-w-[60px] mx-auto bg-blue-500 hover:bg-blue-600 p-2 sm:p-3 rounded-full shadow-2xl transform transition-all hover:scale-105 duration-200 focus:outline-none`}
            aria-label="Abrir menu de acessibilidade"
            data-high-contrast={highContrast}
            data-accessibility-menu
          >
            <Accessibility className={`h-6 w-6 sm:h-8 sm:w-8 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-white'}`} />
            <span className="sr-only">Menu de Acessibilidade</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-full max-w-md mx-auto z-[9999] ${highContrast ? 'bg-black text-white border-4 border-yellow-300 shadow-2xl' : 'bg-gray-800 text-gray-200 border-gray-700'} rounded-xl p-2 sm:p-4`} data-accessibility-menu>
          <div className="grid grid-cols-1 gap-2 sm:gap-4">
            <h3 className="text-lg sm:text-xl font-bold">Acessibilidade</h3>

            {/* Alternar Alto Contraste */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full max-w-md mx-auto justify-start gap-3 bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:outline-none"
                  onClick={toggleHighContrast}
                  role="switch"
                  aria-checked={highContrast}
                  aria-label={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
                  data-accessibility-menu
                >
                  <Eye className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                  <span>Alto Contraste: {highContrast ? 'Ativado' : 'Desativado'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                <p>{highContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Alternar Text-to-Speech */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full max-w-md mx-auto justify-start gap-3 bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:outline-none"
                  onClick={toggleTts}
                  role="switch"
                  aria-checked={ttsEnabled}
                  aria-label={ttsEnabled ? 'Desativar leitura de tela' : 'Ativar leitura de tela'}
                  data-accessibility-menu
                >
                  <Volume2 className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                  <span>Leitura de Tela: {ttsEnabled ? 'Ativado' : 'Desativado'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                <p>{ttsEnabled ? 'Desativar Leitura de Tela' : 'Ativar Leitura de Tela'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Controles de TTS */}
            {ttsEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full max-w-md mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                        onClick={isPaused ? resumeSpeech : pauseSpeech}
                        aria-label={isPaused ? 'Retomar leitura' : 'Pausar leitura'}
                        data-accessibility-menu
                      >
                        {isPaused ? (
                          <Play className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                        ) : (
                          <Pause className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                        )}
                        <span className="sr-only">{isPaused ? 'Retomar leitura' : 'Pausar leitura'}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                      <p>{isPaused ? 'Retomar Leitura' : 'Pausar Leitura'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full max-w-md mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                        onClick={stopSpeech}
                        aria-label="Parar e reiniciar leitura"
                        data-accessibility-menu
                      >
                        <StopCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                        <span className="sr-only">Parar e reiniciar leitura</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                      <p>Parar e Reiniciar Leitura</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    className="w-full max-w-[60px] mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                    onClick={() => adjustSpeechRate(-0.1)}
                    aria-label="Diminuir velocidade da voz"
                    data-accessibility-menu
                  >
                    <span>-</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-gray-200">Velocidade: {speechRate.toFixed(1)}x</span>
                  <Button
                    variant="outline"
                    className="w-full max-w-[60px] mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                    onClick={() => adjustSpeechRate(0.1)}
                    aria-label="Aumentar velocidade da voz"
                    data-accessibility-menu
                  >
                    <span>+</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Controles de Tamanho da Fonte */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full max-w-md mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                    onClick={increaseFontSize}
                    aria-label="Aumentar tamanho da fonte"
                    disabled={fontSize >= 20}
                    data-accessibility-menu
                  >
                    <ZoomIn className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                    <span className="sr-only">Aumentar tamanho da fonte</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                  <p>Aumentar Tamanho da Fonte</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full max-w-md mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                    onClick={decreaseFontSize}
                    aria-label="Diminuir tamanho da fonte"
                    disabled={fontSize <= 14}
                    data-accessibility-menu
                  >
                    <ZoomOut className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                    <span className="sr-only">Diminuir tamanho da fonte</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                  <p>Diminuir Tamanho da Fonte</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full max-w-md mx-auto bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-lg transform transition-all hover:scale-105 duration-300 focus:ring-2"
                    onClick={resetFontSize}
                    aria-label="Restaurar tamanho da fonte"
                    disabled={fontSize === 16}
                    data-accessibility-menu
                  >
                    <RotateCcw className={`h-5 w-5 sm:h-6 sm:w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-gray-200'}`} />
                    <span className="sr-only">Restaurar tamanho da fonte</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-200 rounded-lg p-2 sm:p-3 shadow-lg">
                  <p>Restaurar Tamanho da Fonte</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs sm:text-sm">Tamanho da fonte: {fontSize}px</p>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

export default AccessibilityMenu;