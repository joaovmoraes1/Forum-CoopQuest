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

  // Regex para detectar linhas que parecem código
  const codeLineRegex = /^(\s{2,}|\t|\/\/|let |const |var |if\s*\(|for\s*\(|while\s*\(|function |class |def |print\(|case |break;|default:|else\s*{|elif |{|}|switch\s*\(|return |import |from |try:|except |finally:|with |pass|continue|console\.log|[a-zA-Z_]+\s*=\s*|^\s*\d+\s*$)/;
  const pythonBlockRegex = /:\s*$/;

  function isCodeBlock(buffer: string[]) {
    // Todas as linhas do buffer devem parecer código OU
    // Primeira termina com : e as demais estão indentadas
    if (buffer.length < 2) return false;
    const allCode = buffer.every(line => codeLineRegex.test(line) || pythonBlockRegex.test(line));
    const pythonStyle =
      pythonBlockRegex.test(buffer[0]) &&
      buffer.slice(1).every(line => /^\s+/.test(line));
    return allCode || pythonStyle;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    codeBuffer.push(line);

    if (isCodeBlock(codeBuffer)) {
      inCode = true;
      continue;
    }

    // Se não é bloco de código, finalize bloco anterior se houver
    if (inCode) {
      result += '```python\n' + codeBuffer.slice(0, -1).join('\n') + '\n```\n';
      codeBuffer = [line];
      inCode = false;
    } else if (codeBuffer.length > 1) {
      // Não é código, solta como texto normal
      result += codeBuffer.slice(0, -1).join('\n') + '\n';
      codeBuffer = [line];
    }
  }

  // Finaliza bloco se necessário
  if (inCode && isCodeBlock(codeBuffer)) {
    result += '```python\n' + codeBuffer.join('\n') + '\n```\n';
  } else if (codeBuffer.length) {
    result += codeBuffer.join('\n') + '\n';
  }
  return result.trim();
}

const TopicContent: React.FC<TopicContentProps> = ({ content }) => {
  const processedContent = autoSplitCodeBlocks(content);
  return <MarkdownPreview source={processedContent} />;
};

export default TopicContent;