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

// Função para destacar código em verde e texto/comentário em cinza
function renderCodePreview(text: string) {
  const lines = text.split('\n');
  let inCodeBlock = false;

  const codeStartRegex = /^\s*(let|const|var|function|função|if|se|for|para|while|enquanto|return|retorne|class|classe|import|importar|export|de|from|print\(|console\.log|{|}|[a-zA-Z0-9_$]+\s*=|def |caso|case|switch|escolha|tente|try|exceto|except|finalmente|finally|com|with|passe|pass|continue|soma\s*=|sum\s*=|mover_frente\s*\(|move_forward\s*\(|virar_direita\s*\(|turn_right\s*\(|virar_esquerda\s*\(|turn_left\s*\(|repita\s+\d+\s+vezes|repita\s*\(.*\)\s*{|repeat\s+\d+\s+times|Sequência:|Repetição:|Escolha:|Condição:)/i;

  const codeContinueRegex = /^\s*(até|[a-zA-Z0-9_$]+\s*=\s*[a-zA-Z0-9_$+\-%\s]+|\%|[a-zA-Z0-9_$]+\s*\+\s*[a-zA-Z0-9_$+\-%\s]+)/i;

  const codeEndRegex = /^\s*(fimse|fimpara|fimenquanto|fimfunção|fimclasse)$/i;

  return (
    <div style={{ fontFamily: 'Fira Mono, monospace', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
      {lines.map((line, idx) => {
        if (codeStartRegex.test(line)) {
          inCodeBlock = true;
          return (
            <span key={idx} style={{ color: '#22c55e' }}>
              {line + '\n'}
            </span>
          );
        }

        if (inCodeBlock && (codeContinueRegex.test(line) || /^\s+/.test(line) || codeEndRegex.test(line))) {
          if (codeEndRegex.test(line)) {
            inCodeBlock = false;
          }
          return (
            <span key={idx} style={{ color: '#22c55e' }}>
              {line + '\n'}
            </span>
          );
        }

        inCodeBlock = false;
        return (
          <span key={idx} style={{ color: '#d1d5db' }}>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-white">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="bg-gray-700 text-white border-gray-600 focus:ring-orange-500 rounded-lg"
          placeholder="Digite o título do tópico"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium text-white">
          Conteúdo <span className="text-red-500">*</span>
        </Label>
        <div data-color-mode="dark">
          <MDEditor
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value || '' }))
            }
            height={250}
            textareaProps={{
              placeholder: "Descreva o conteúdo do tópico (texto e código, não precisa usar blocos ```)",
              id: "content",
              name: "content",
              required: true,
            }}
          />
        </div>
        {/* Preview customizado igual ao desafio diário */}
        {formData.content.trim() && (
          <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
            {renderCodePreview(formData.content)}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium text-white">
          Categoria <span className="text-red-500">*</span>
        </Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="bg-gray-700 text-white border-gray-600 focus:ring-orange-500 rounded-lg"
          placeholder="Ex.: Jogos, Programação, Dúvidas"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm font-medium text-white">
          Tags (separadas por vírgula)
        </Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags?.join(',') || ''}
          onChange={handleChange}
          className="bg-gray-700 text-white border-gray-600 focus:ring-orange-500 rounded-lg"
          placeholder="Ex.: dinde, cooperação, desafio"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        {isLoading ? 'Criando...' : 'Criar Tópico'}
      </Button>
    </form>
  );
};

export default NewTopicForm;