import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';

interface TopicContentProps {
  content: string;
}

function autoSplitCodeBlocks(text: string) {
  if (/```/.test(text)) return text;

  const lines = text.split('\n');
  let result = '';
  let codeBuffer: string[] = [];
  let inCode = false;

  const codeStartRegex = /^(\s{2,}|\t|\/\/|let |const |var |function|função|if\s*\(|se\s|for\s*\(|para\s|while\s*\(|enquanto\s|class |classe |def |print\(|caso |case |switch|escolha|break;|pare;|default:|else\s*{|senão\s*{|elif |senão\s+se|{|}|retorne|return |import |importar |from |de |tente|try|exceto|except|finalmente|finally|com |with |passe|pass|continue|console\.log|[a-zA-Z_]+\s*=\s*|^\s*\d+\s*$|soma\s*=|sum\s*=|mover_frente\s*\(|move_forward\s*\(|virar_direita\s*\(|turn_right\s*\(|virar_esquerda\s*\(|turn_left\s*\(|repita\s+\d+\s+vezes|repita\s*\(.*\)\s*{|repeat\s+\d+\s+times|Sequência:|Repetição:|Escolha:|Condição:)/i;

  const codeContinueRegex = /(até|[a-zA-Z0-9_$]+\s*=\s*[a-zA-Z0-9_$+\-%\s]+|\%|[a-zA-Z0-9_$]+\s*\+\s*[a-zA-Z0-9_$+\-%\s]+)/i;

  const codeEndRegex = /^(fimse|fimpara|fimenquanto|fimfunção|fimclasse)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    codeBuffer.push(line);

    if (codeStartRegex.test(line)) {
      inCode = true;
      continue;
    }

    if (inCode && (codeContinueRegex.test(line) || /^\s+/.test(line) || codeEndRegex.test(line))) {
      if (codeEndRegex.test(line)) {
        inCode = false;
        result += '```python\n' + codeBuffer.join('\n') + '\n```\n';
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      result += '```python\n' + codeBuffer.slice(0, -1).join('\n') + '\n```\n';
      codeBuffer = [line];
      inCode = false;
    } else if (codeBuffer.length > 1) {
      result += codeBuffer.slice(0, -1).join('\n') + '\n';
      codeBuffer = [line];
    }
  }

  if (inCode && codeBuffer.length) {
    result += '```python\n' + codeBuffer.join('\n') + '\n```\n';
  } else if (codeBuffer.length) {
    result += codeBuffer.join('\n') + '\n';
  }

  return result.trim();
}

const TopicContent: React.FC<TopicContentProps> = ({ content }) => {
  const processedContent = autoSplitCodeBlocks(content);
  return (
    <div className="w-full max-w-3xl p-2 sm:p-4 text-sm sm:text-base text-left"> {/* Removido mx-auto */}
      <MarkdownPreview source={processedContent} />
    </div>
  );
};

export default TopicContent;