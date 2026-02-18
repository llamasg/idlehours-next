import { useState, useCallback, useRef } from 'react';
import { askPipYesAnd } from '../lib/pipClaude';

export function useYesAnd() {
  const [response, setResponse] = useState<{
    response: string;
    angles: string[];
  } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ask = useCallback(async (input: string) => {
    if (!input.trim() || input.trim().length < 3) return;
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

  const askDebounced = useCallback((input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => ask(input), 800);
  }, [ask]);

  const clear = useCallback(() => setResponse(null), []);

  return { response, isThinking, ask, askDebounced, clear };
}
