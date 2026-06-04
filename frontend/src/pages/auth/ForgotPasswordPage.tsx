import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/auth.service';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

	return (
		<div className="auth-studio-card">
			<div className="auth-card__header">
				<p className="eyebrow">Forgot password</p>
				<h2 className="auth-card__title">Send a reset link</h2>
				<p className="auth-card__lead">Enter the email tied to your account and we&apos;ll send the reset instructions from the backend auth flow.</p>
			</div>

			<div className="auth-studio-grid">
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						setStatus('idle');
						try {
							await forgotPassword({ email });
							setStatus('sent');
						} catch {
							setStatus('error');
						}
					}}
					className="auth-form auth-form--studio"
				>
					<div className="auth-field">
						<label className="auth-label">Email address</label>
						<input
							type="email"
							placeholder="stevenjob@gmail.com"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="auth-input"
						/>
					</div>

					<div className="auth-page__meta">
						<span className="muted">We only send a reset link if the account exists.</span>
						<Link to="/reset-password" className="auth-support__link">Already have a token?</Link>
					</div>

					<button type="submit" className="button button-primary button--lg button--pill auth-submit">
						Continue
					</button>

					{status === 'sent' ? <p className="text-success">If an account with that email exists, a reset link has been sent.</p> : null}
					{status === 'error' ? <p className="text-danger">Unable to send reset link. Try again later.</p> : null}

					<p className="muted">
						Don&apos;t have an account? <Link to="/register" className="auth-support__link">Sign up</Link>
					</p>
				</form>

				<aside className="auth-support auth-support--studio">
					<h3>What happens next</h3>
					<div className="auth-support__item">
						<span className="auth-support__dot" />
						<p>We send a one-time token to your inbox.</p>
					</div>
					<div className="auth-support__item">
						<span className="auth-support__dot" />
						<p>Use that token on the reset password screen to set a new password.</p>
					</div>
					<Link to="/login" className="auth-support__link">Back to sign in</Link>
				</aside>
			</div>
		</div>
	);
}