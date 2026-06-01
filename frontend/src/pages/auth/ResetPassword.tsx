import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { resetPassword } from '../../services/auth.service';

export default function ResetPassword() {
	const navigate = useNavigate();
	const { token: routeToken = '' } = useParams<{ token?: string }>();
	const [searchParams] = useSearchParams();
	const [token, setToken] = useState(routeToken || searchParams.get('token') || '');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');

	useEffect(() => {
		setToken(routeToken || searchParams.get('token') || '');
	}, [routeToken, searchParams]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setMessage('');

		if (!token.trim()) {
			setStatus('error');
			setMessage('Paste the reset token from your email before continuing.');
			return;
		}

		if (password !== confirmPassword) {
			setStatus('error');
			setMessage('Passwords do not match.');
			return;
		}

		setStatus('saving');
		try {
			await resetPassword({ token: token.trim(), password });
			setStatus('success');
			setMessage('Password reset successfully. You can sign in with the new password now.');
		} catch (error) {
			console.error('Failed to reset password', error);
			setStatus('error');
			setMessage('Unable to reset the password right now. Check the token and try again.');
		}
	}

	return (
		<div className="auth-studio-card">
			<div className="auth-card__header">
				<p className="eyebrow">Reset password</p>
				<h2 className="auth-card__title">Set a new account password</h2>
				<p className="auth-card__lead">Use the token sent to your email to finish the backend reset-password flow.</p>
			</div>

			<div className="auth-studio-grid">
				<form onSubmit={handleSubmit} className="auth-form auth-form--studio">
					<Field label="Reset token">
						<input
							type="text"
							placeholder="Paste token from email"
							required
							value={token}
							onChange={(event) => setToken(event.target.value)}
							className="auth-input"
						/>
					</Field>

					<Field label="New password">
						<input
							type="password"
							placeholder="Enter a new password"
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="auth-input"
						/>
					</Field>

					<Field label="Confirm password">
						<input
							type="password"
							placeholder="Repeat new password"
							required
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							className="auth-input"
						/>
					</Field>

					<div className="auth-page__meta">
						<span className="muted">The token is usually included in the email reset link.</span>
						<Link to="/forgot-password" className="auth-support__link">Request a new link</Link>
					</div>

					<button type="submit" className="button button-primary button--lg button--pill auth-submit" disabled={status === 'saving'}>
						{status === 'saving' ? 'Resetting…' : 'Reset password'}
					</button>

					{message ? <p className={status === 'success' ? 'text-success' : 'text-danger'}>{message}</p> : null}
					{status === 'success' ? <Button to="/login" variant="secondary">Back to sign in</Button> : null}
				</form>

				<aside className="auth-support auth-support--studio">
					<h3>After resetting</h3>
					<div className="auth-support__item">
						<span className="auth-support__dot" />
						<p>Return to the login screen and sign in with the new password.</p>
					</div>
					<div className="auth-support__item">
						<span className="auth-support__dot" />
						<p>Your learner progress, applications, and recruiter data stay attached to the same account.</p>
					</div>
					<Link to="/login" className="auth-support__link">Back to sign in</Link>
				</aside>
			</div>
		</div>
	);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="auth-field">
			<label className="auth-label">{label}</label>
			{children}
		</div>
	);
}