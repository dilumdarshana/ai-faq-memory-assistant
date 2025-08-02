'use client';

import { useState } from 'react';

type Props = {
  onAsk: (question: string) => void;
  loading: boolean;
};

export function QuestionForm({ onAsk, loading }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAsk(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        className="p-4 border border-gray-300 rounded resize-none h-24"
        placeholder="Ask any question about the Redis Challenge..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Ask'}
      </button>
    </form>
  );
}
