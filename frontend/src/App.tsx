const themeTokens = [
	{ name: 'Ink Navy', value: '#0d2f67' },
	{ name: 'Electric Blue', value: '#3f66f4' },
	{ name: 'Cloud Tint', value: '#f5f8fe' },
	{ name: 'Border Mist', value: '#dde5f4' },
];

function App() {
	return (
		<main className="app-shell">
			<header className="topbar">
				<div className="brand-lockup">
					<div className="brand-mark" aria-hidden="true">
						<span />
					</div>
					<div>
						<p className="brand-kicker">HANGA WORKS</p>
						<h1 className="brand-name">Work, styled with clarity</h1>
					</div>
				</div>

				<nav className="topnav" aria-label="Primary">
					<a href="#palette">Palette</a>
					<a href="#preview">Preview</a>
					<a href="#tokens">Tokens</a>
				</nav>
			</header>

			<section className="hero" id="preview">
				<div className="hero-copy">
					<p className="eyebrow">Color theme preview</p>
					<h2>
						The easiest way to bring the screenshot palette into the app.
					</h2>
					<p className="hero-text">
						A soft cloud background, deep navy text, and a vivid blue accent
						create the same clean, modern feel as the reference page.
					</p>

					<div className="cta-row">
						<a className="button button-primary" href="#tokens">
							Explore tokens
						</a>
						<a className="button button-secondary" href="#palette">
							View palette
						</a>
					</div>
				</div>

				<div className="hero-visual" aria-label="Theme preview illustration">
					<div className="hero-card">
						<div className="hero-card__glow" />
						<div className="hero-card__panel">
							<div className="hero-card__stats">
								<span>Focused</span>
								<span>Bright</span>
								<span>Professional</span>
							</div>
							<div className="hero-card__shape hero-card__shape--one" />
							<div className="hero-card__shape hero-card__shape--two" />
							<div className="hero-card__shape hero-card__shape--three" />
						</div>
					</div>
				</div>
			</section>

			<section className="palette" id="palette">
				{themeTokens.map((token) => (
					<article className="palette-card" key={token.name}>
						<span
							className="palette-swatch"
							style={{ backgroundColor: token.value }}
							aria-hidden="true"
						/>
						<div>
							<p>{token.name}</p>
							<strong>{token.value}</strong>
						</div>
					</article>
				))}
			</section>
		</main>
	);
}

export default App;
