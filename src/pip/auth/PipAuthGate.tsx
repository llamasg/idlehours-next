import { useState } from 'react';

interface PipAuthGateProps {
  onAuth: (password: string) => boolean;
}

export default function PipAuthGate({ onAuth }: PipAuthGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = onAuth(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-foreground font-serif text-center">
          {'\u{1F916}'} Pip Dashboard
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Enter the password to continue
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-burnt-orange"
          autoFocus
        />

        {error && (
          <p className="text-sm text-red-500 text-center">
            Wrong password, try again
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-burnt-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
