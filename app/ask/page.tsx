'use client';

import { useState } from 'react';
import { QuestionForm } from '@/components/QuestionForm';
import { AnswerCard } from '@/components/AnswerCard';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (q: string) => {
    setLoading(true);
    setAnswer(null);
    setQuestion(q);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      setAnswer(data.answer || 'No answer found.');
    } catch (err) {
      setAnswer('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Ask the FAQ Assistant</h1>
      <QuestionForm onAsk={handleAsk} loading={loading} />
      {answer && <AnswerCard question={question} answer={answer} />}
    </main>
  );
}
