import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './Layout';
import { useAccessibility } from './Layout';

const AccessibilityControls: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { highContrast } = useAccessibility();

  return (
    <TooltipProvider>
      <div className="fixed bottom-16 right-4 z-[9999]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
              data-theme={theme}
              data-high-contrast={highContrast}
              className={`bg-[var(--primary)] fallback:bg-yellow-500 hover:bg-[color:hsl(var(--primary-hsl)/0.8)] p-3 rounded-full shadow-2xl transform transition-all hover:scale-105 duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none ${highContrast ? 'border-4 border-black animate-pulse' : ''}`}
            >
              {theme === 'light' ? (
                <Moon className={`h-6 w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-[var(--text)]'}`} />
              ) : (
                <Sun className={`h-6 w-6 ${highContrast ? 'text-black filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-[var(--text)]'}`} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-text rounded-lg p-2 shadow-lg">
            <p>{theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default AccessibilityControls;