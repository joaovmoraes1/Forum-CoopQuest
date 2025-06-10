import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  contentType: 'topic' | 'reply';
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contentType,
}) => {
  const [reason, setReason] = useState<string>('inappropriate');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalReason = reason === 'other' ? customReason : reason;
      if (reason === 'other' && !customReason.trim()) {
        toast.error('Por favor, descreva o motivo da denúncia.');
        setIsSubmitting(false);
        return;
      }
      await onSubmit(finalReason);
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 w-full max-w-sm sm:max-w-md rounded-lg p-2 sm:p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
            Denunciar {contentType === 'topic' ? 'Tópico' : 'Resposta'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
            Por favor, indique o motivo para denunciar este conteúdo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:gap-6 pt-2 sm:pt-4">
          <RadioGroup
            value={reason}
            onValueChange={setReason}
            className="grid grid-cols-1 gap-2 sm:gap-3"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <RadioGroupItem
                value="inappropriate"
                id="inappropriate"
                className="border-gray-500 text-orange-500"
              />
              <Label htmlFor="inappropriate" className="text-gray-200 text-xs sm:text-sm">
                Conteúdo inapropriado
              </Label>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <RadioGroupItem
                value="spam"
                id="spam"
                className="border-gray-500 text-orange-500"
              />
              <Label htmlFor="spam" className="text-gray-200 text-xs sm:text-sm">
                Spam
              </Label>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <RadioGroupItem
                value="harassment"
                id="harassment"
                className="border-gray-500 text-orange-500"
              />
              <Label htmlFor="harassment" className="text-gray-200 text-xs sm:text-sm">
                Assédio ou bullying
              </Label>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <RadioGroupItem
                value="misinformation"
                id="misinformation"
                className="border-gray-500 text-orange-500"
              />
              <Label htmlFor="misinformation" className="text-gray-200 text-xs sm:text-sm">
                Informação incorreta
              </Label>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <RadioGroupItem
                value="other"
                id="other"
                className="border-gray-500 text-orange-500"
              />
              <Label htmlFor="other" className="text-gray-200 text-xs sm:text-sm">
                Outro
              </Label>
            </div>
          </RadioGroup>

          {reason === 'other' && (
            <Textarea
              placeholder="Descreva o motivo da denúncia..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-orange-500 text-xs sm:text-sm p-2 sm:p-3"
            />
          )}
        </div>

        <DialogFooter className="mt-2 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 border-gray-600 text-white rounded-lg text-xs sm:text-sm p-2 sm:p-3"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting || (reason === 'other' && !customReason.trim())
            }
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs sm:text-sm p-2 sm:p-3"
          >
            {isSubmitting ? 'Enviando...' : 'Denunciar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;