import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accessibility,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme, useAccessibility } from './Layout';

const AccessibilityToolbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, highContrast, toggleHighContrast, setFontSize } =
    useAccessibility();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const increaseFontSize = () => setFontSize(Math.min(fontSize + 2, 24)); // Max 24px
  const decreaseFontSize = () => setFontSize(Math.max(fontSize - 2, 12)); // Min 12px
  const resetFontSize = () => setFontSize(16); // Default 16px

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
        {/* Theme Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Mudar para tema escuro'
                  : 'Mudar para tema claro'
              }
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 p-3 rounded-full shadow-lg transform transition-all hover:scale-105 duration-300"
            >
              {theme === 'light' ? (
                <Moon className="h-6 w-6 text-white" />
              ) : (
                <Sun className="h-6 w-6 text-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 text-white border-gray-600 rounded-xl">
            <p>
              {theme === 'light'
                ? 'Mudar para tema escuro'
                : 'Mudar para tema claro'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Accessibility Menu Button */}
        <Popover
          open={isAccessibilityOpen}
          onOpenChange={setIsAccessibilityOpen}
        >
          <PopoverTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir menu de acessibilidade"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 p-3 rounded-full shadow-lg transform transition-all hover:scale-105 duration-300"
                >
                  <Accessibility className="h-6 w-6 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white border-gray-600 rounded-xl">
                <p>Menu de Acessibilidade</p>
              </TooltipContent>
            </Tooltip>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="end"
            className="w-80 bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600/50 text-gray-200 rounded-xl shadow-2xl"
          >
            <div className="space-y-4 p-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Accessibility size={20} className="text-orange-400" />
                Acessibilidade
              </h3>

              {/* High Contrast Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between gap-3 bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-xl transform transition-all hover:scale-105 duration-300 focus:ring-2 focus:ring-orange-400 border-gray-600"
                    onClick={toggleHighContrast}
                    aria-label={
                      highContrast
                        ? 'Desativar alto contraste'
                        : 'Ativar alto contraste'
                    }
                  >
                    <Eye size={18} className="text-orange-400" />
                    <span className="flex-1 text-left">Alto Contraste</span>
                    <span className="text-sm text-gray-400">
                      {highContrast ? 'Ativado' : 'Desativado'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-600 rounded-xl">
                  <p>
                    {highContrast
                      ? 'Desativar Alto Contraste'
                      : 'Ativar Alto Contraste'}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Font Size Controls */}
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-xl transform transition-all hover:scale-105 duration-300 focus:ring-2 focus:ring-orange-400 border-gray-600"
                      onClick={increaseFontSize}
                      aria-label="Aumentar tamanho da fonte"
                    >
                      <ZoomIn size={18} className="text-orange-400" />
                      <span className="sr-only">Aumentar fonte</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-600 rounded-xl">
                    <p>Aumentar Tamanho da Fonte</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-xl transform transition-all hover:scale-105 duration-300 focus:ring-2 focus:ring-orange-400 border-gray-600"
                      onClick={decreaseFontSize}
                      aria-label="Diminuir tamanho da fonte"
                    >
                      <ZoomOut size={18} className="text-orange-400" />
                      <span className="sr-only">Diminuir fonte</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-600 rounded-xl">
                    <p>Diminuir Tamanho da Fonte</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-700/50 text-gray-200 hover:bg-gray-600 rounded-xl transform transition-all hover:scale-105 duration-300 focus:ring-2 focus:ring-orange-400 border-gray-600"
                      onClick={resetFontSize}
                      aria-label="Restaurar tamanho da fonte"
                    >
                      <RotateCcw size={18} className="text-orange-400" />
                      <span className="sr-only">Restaurar fonte</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-600 rounded-xl">
                    <p>Restaurar Tamanho da Fonte</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Current Font Size Display */}
              <p className="text-sm text-gray-300">
                Tamanho atual da fonte:{' '}
                <span className="font-semibold">{fontSize}px</span>
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
};

export default AccessibilityToolbar;