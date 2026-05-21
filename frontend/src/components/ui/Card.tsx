import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
	as?: 'div' | 'article' | 'section';
	children: ReactNode;
};

export function Card({ as: Component = 'article', className = '', children, ...props }: CardProps) {
	return (
		<Component className={`card ${className}`.trim()} {...props}>
			{children}
		</Component>
	);
}

export function CardEyebrow({ children }: { children: ReactNode }) {
	return <p className="card-eyebrow">{children}</p>;
}

export function CardTitle({ children }: { children: ReactNode }) {
	return <h3 className="card-title">{children}</h3>;
}

export function CardMeta({ children }: { children: ReactNode }) {
	return <p className="card-meta">{children}</p>;
}
