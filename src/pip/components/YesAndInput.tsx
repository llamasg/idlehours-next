/* ──────────────────────────────────────────────
   Pip Dashboard v2 — YesAndInput
   Conversational "Yes, And" brainstorm input
   ────────────────────────────────────────────── */

import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useYesAnd } from '../hooks/useYesAnd';
import { PipSpeech } from './PipSpeech';

function ThinkingDots() {
  return (
    <div className="flex items-start gap-3 mt-4">
      <span className="mt-1 text-2xl select-none" aria-hidden="true">
        🤖
      </span>
      <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-2 h-2 bg-burnt-orange rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function YesAndInput() {
  const { response, isThinking, ask } = useYesAnd();
  const [input, setInput] = useState('');

  const canSend = input.trim().length > 0 && !isThinking;

  const submit = () => {
    if (!canSend) return;
    ask(input);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section className="px-1 py-8">
      <h3 className="text-lg font-semibold mb-2">Have your own idea?</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Tell Pip what you're thinking &mdash; no wrong answers.
      </p>

      <div className="relative">
        <textarea
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what's on your mind..."
          rows={3}
          className="w-full bg-white border-2 border-border rounded-2xl p-5 pr-14 text-base resize-none min-h-[80px] focus:border-burnt-orange focus:ring-0 outline-none transition"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Ask Pip"
          className="absolute bottom-4 right-4 flex items-center justify-center w-9 h-9 rounded-xl bg-burnt-orange text-white transition-opacity disabled:opacity-30 hover:enabled:opacity-80"
        >
          {isThinking ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
            />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ThinkingDots />
          </motion.div>
        )}

        {response && !isThinking && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-4"
          >
            <PipSpeech message={response.response} />

            {response.angles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 ml-11">
                {response.angles.map((angle) => (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => {
                      setInput(angle);
                      ask(angle);
                    }}
                    className="bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20 rounded-full px-4 py-2 text-sm hover:bg-burnt-orange/20 cursor-pointer transition"
                  >
                    {angle} &rarr;
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
