'use client';

import { useState, useEffect } from 'react';
import { QuestionForm } from '@/components/QuestionForm';
import { AnswerCard } from '@/components/AnswerCard';

type RecordValue = {
  question: string;
  answer: string;
}

type DocumentRecord = {
  id: string;
  value: RecordValue;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [faqList, setFaqList] = useState<DocumentRecord[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);

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
      console.error(err);
      setAnswer('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFaqList = async () => {
      setFaqLoading(true);
      try {
        const res = await fetch('/api/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: 'idx:faq_result' }),
        });

        const data = await res.json();
        setFaqList(data || []);
      } catch (err) {
        console.error('Failed to fetch FAQ list:', err);
      } finally {
        setFaqLoading(false);
      }
    };

    fetchFaqList();
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Ask the FAQ Assistant</h1>
      <QuestionForm onAsk={handleAsk} loading={loading} />
      {answer && <AnswerCard question={question} answer={answer} />}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recently Asked Questions</h2>
        {faqLoading ? (
          <p>Loading...</p>
        ) : faqList.length > 0 ? (
          <ul className="space-y-4">
            {faqList.map((faq, index) => (
              <li key={index} className="p-4 border rounded shadow">
                <p className="font-semibold">Q: {faq.value.question}</p>
                <p>A: {faq.value.answer}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recently asked questions.</p>
        )}
      </section>
    </main>
  );
}
