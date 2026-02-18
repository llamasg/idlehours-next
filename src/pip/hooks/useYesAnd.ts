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
    setResponse(null);
    try {
      const result = await askPipYesAnd(input);
      setResponse(result);
    } catch (e) {
      console.error('YES AND failed:', e);
      setResponse({
        response: "Something went wrong on my end — try again in a moment.",
        angles: [],
      });
    } finally {
      setIsThinking(false);
    }
  }, []);

  return { response, isThinking, ask };
}
