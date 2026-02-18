import { useState, useCallback } from 'react';
import { askPipYesAnd } from '../lib/pipClaude';

export function useYesAnd() {
  const [response, setResponse] = useState<{
    response: string;
    angles: string[];
  } | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const ask = useCallback(async (input: string) => {
    if (!input.trim()) return;
    setIsThinking(true);
    try {
      const result = await askPipYesAnd(input);
      setResponse(result);
    } finally {
      setIsThinking(false);
    }
  }, []);

  const clear = useCallback(() => setResponse(null), []);

  return { response, isThinking, ask, clear };
}
