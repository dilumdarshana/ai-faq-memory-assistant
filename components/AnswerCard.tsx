type Props = {
  question: string;
  answer: string;
};

export function AnswerCard({ question, answer }: Props) {
  return (
    <div className="mt-8 border border-gray-200 rounded p-4 shadow">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">You asked:</h2>
      <p className="italic mb-4 text-gray-900">{question}</p>
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Answer:</h3>
      <p className="text-gray-800">{answer}</p>
    </div>
  );
}
