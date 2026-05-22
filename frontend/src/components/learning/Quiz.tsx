import { useState } from 'react';
import type { CourseQuiz } from '../../types/course';
import { Button } from '../ui/Button';

type QuizProps = {
	quiz: CourseQuiz;
	onSubmit?: (score: number, passed: boolean) => void;
};

type QuizResult = {
	score: number;
	correct: number;
	total: number;
	passed: boolean;
};

export function Quiz({ quiz, onSubmit }: QuizProps) {
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const [result, setResult] = useState<QuizResult | null>(null);

	const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

	function handleSubmit() {
		if (!allAnswered) return;

		const correct = quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length;
		const score = Math.round((correct / quiz.questions.length) * 100);
		const passed = score >= quiz.passingScore;
		const nextResult = { score, correct, total: quiz.questions.length, passed };

		setResult(nextResult);
		onSubmit?.(score, passed);
	}

	function handleRetry() {
		setAnswers({});
		setResult(null);
	}

	return (
		<div className="quiz">
			<div className="quiz__header">
				<div>
					<p className="card-eyebrow">Assessment</p>
					<h3 className="card-title">{quiz.title}</h3>
				</div>
				<span className="quiz__passing">Pass: {quiz.passingScore}%</span>
			</div>

			{result ? (
				<QuizScoreDisplay result={result} passingScore={quiz.passingScore} onRetry={handleRetry} />
			) : (
				<>
					<ol className="quiz__questions">
						{quiz.questions.map((question, index) => (
							<li key={question.id} className="quiz__question">
								<p className="quiz__question-text">
									<span className="quiz__number">{index + 1}.</span> {question.question}
								</p>
								<div className="quiz__options" role="radiogroup" aria-label={question.question}>
									{question.options.map((option, optionIndex) => {
										const selected = answers[question.id] === optionIndex;
										return (
											<label
												key={option}
												className={`quiz__option ${selected ? 'quiz__option--selected' : ''}`.trim()}
											>
												<input
													type="radio"
													name={question.id}
													checked={selected}
													onChange={() =>
														setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
													}
												/>
												<span>{option}</span>
											</label>
										);
									})}
								</div>
							</li>
						))}
					</ol>

					<div className="quiz__actions">
						<Button type="button" variant="primary" disabled={!allAnswered} onClick={handleSubmit}>
							Submit quiz
						</Button>
						{!allAnswered ? (
							<p className="quiz__hint">Answer all questions to see your score.</p>
						) : null}
					</div>
				</>
			)}
		</div>
	);
}

function QuizScoreDisplay({
	result,
	passingScore,
	onRetry,
}: {
	result: QuizResult;
	passingScore: number;
	onRetry: () => void;
}) {
	return (
		<div className={`quiz-score ${result.passed ? 'quiz-score--passed' : 'quiz-score--failed'}`}>
			<div className="quiz-score__ring" aria-hidden="true">
				<span className="quiz-score__value">{result.score}%</span>
			</div>
			<div className="quiz-score__copy">
				<strong>{result.passed ? 'You passed!' : 'Not quite there yet'}</strong>
				<p>
					You got {result.correct} of {result.total} correct. Passing score is {passingScore}%.
				</p>
				<Button type="button" variant={result.passed ? 'secondary' : 'primary'} onClick={onRetry}>
					{result.passed ? 'Retake quiz' : 'Try again'}
				</Button>
			</div>
		</div>
	);
}
