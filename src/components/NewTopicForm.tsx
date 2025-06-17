import React, { useState } from 'react';
import { createTopic, CreateTopicData } from '@/services/topics';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import MDEditor from '@uiw/react-md-editor';

interface NewTopicFormProps {
  onTopicCreated?: () => void;
}

function renderCodePreview(text: string) {
  const lines = text.split('\n');
  let inCodeBlock = false;

  const codeStartRegex = /^\s*(let|const|var|function|função|if|se|for|para|while|enquanto|return|retorne|class|classe|import|importar|export|de|from|print\(|console\.log|{|}|[a-zA-Z0-9_$]+\s*=|def |caso|case|switch|escolha|tente|try|exceto|except|finalmente|finally|com|with|passe|pass|continue|soma\s*=|sum\s*=|mover_frente\s*\(|move_forward\s*\(|virar_direita\s*\(|turn_right\s*\(|virar_esquerda\s*\(|turn_left\s*\(|repita\s+\d+\s+vezes|repita\s*\(.*\)\s*{|repeat\s+\d+\s+times|Sequência:|Repetição:|Escolha:|Condição:)/i;

  const codeContinueRegex = /^\s*(até|[a-zA-Z0-9_$]+\s*=\s*[a-zA-Z0-9_$+\-%\s]+|\%|[a-zA-Z0-9_$]+\s*\+\s*[a-zA-Z0-9_$+\-%\s]+)/i;

  const codeEndRegex = /^\s*(fimse|fimpara|fimenquanto|fimfunção|fimclasse)$/i;

  return (
    <div className="font-mono text-xs sm:text-sm whitespace-pre-wrap">
      {lines.map((line, idx) => {
        if (codeStartRegex.test(line)) {
          inCodeBlock = true;
          return (
            <span key={idx} className="text-green-500">
              {line + '\n'}
            </span>
          );
        }

        if (inCodeBlock && (codeContinueRegex.test(line) || /^\s+/.test(line) || codeEndRegex.test(line))) {
          if (codeEndRegex.test(line)) {
            inCodeBlock = false;
          }
          return (
            <span key={idx} className="text-green-500">
              {line + '\n'}
            </span>
          );
        }

        inCodeBlock = false;
        return (
          <span key={idx} className="text-gray-300">
            {line + '\n'}
          </span>
        );
      })}
    </div>
  );
}

const NewTopicForm: React.FC<NewTopicFormProps> = ({ onTopicCreated }) => {
  const [formData, setFormData] = useState<CreateTopicData>({
    title: '',
    content: '',
    category: '',
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const topicData: CreateTopicData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        tags: formData.tags?.length ? formData.tags : [],
      };
      await createTopic(topicData);
      toast.success('Tópico criado com sucesso!');
      setFormData({ title: '', content: '', category: '', tags: [] });
      if (onTopicCreated) {
        onTopicCreated();
      }
      navigate('/topics');
    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao criar tópico. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setFormData((prev) => ({
        ...prev,
        tags: value.split(',').map((tag) => tag.trim()).filter(tag => tag),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg sm:max-w-2xl mx-auto grid grid-cols-1 gap-2 sm:gap-6 p-2 sm:p-4"
    >
      <div className="grid grid-cols-1 gap-1 sm:gap-2">
        <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-white">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="bg-gray-700 text-white border-gray-600 focus:ring-orange-500 rounded-lg text-sm sm:text-base p-2 sm:p-3"
          placeholder="Digite o título do tópico"
        />
      </div>
      <div className="grid grid-cols-1 gap-1 sm:gap-2">
        <Label htmlFor="content" className="text-xs sm:text-sm font-medium text-white">
          Conteúdo <span className="text-red-500">*</span>
        </Label>
        <div data-color-mode="dark">
          <MDEditor
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value || '' }))
            }
            height={200}
            preview="edit" 
            textareaProps={{
              placeholder: "Descreva o conteúdo do tópico (texto e código, não precisa usar blocos ```) ",
              id: "content",
              name: "content",
              required: true,
              className: "text-sm sm:text-base",
            }}
          />
        </div>
        {formData.content.trim() && (
            <div className="mt-2 sm:mt-4 bg-gray-900 rounded-lg p-2 sm:p-4 border border-gray-700 w-full max-w-2xl overflow-x-auto break-words">
        {renderCodePreview(formData.content)}
      </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-1 sm:gap-2">
        <Label htmlFor="category" className="text-xs sm:text-sm font-medium text-white">
          Categoria <span className="text-red-500">*</span>
        </Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="bg-gray-700 text-white border-gray-600 focus:ring-orange-500 rounded-lg text-sm sm:text-base p-2 sm:p-3"
          placeholder="Ex.: Jogos, Programação, Dúvidas"
        />
      </div>
      <div className="grid grid-cols-1 gap-1 sm:gap-2">
        <Label htmlFor="tags" className="text-xs sm:text-sm font-medium text-white">
          Tags (separadas por vírgula)
        </Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags?.join(',') || ''}
          onChange={handleChange}
          className="bg-gray-700 text-white border-gray-600 focus:ring-orange-500 rounded-lg text-sm sm:text-base p-2 sm:p-3"
          placeholder="Ex.: dinde, cooperação, desafio"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors p-2 sm:p-3 text-sm sm:text-base"
      >
        {isLoading ? 'Criando...' : 'Criar Tópico'}
      </Button>
    </form>
  );
};

export default NewTopicForm;