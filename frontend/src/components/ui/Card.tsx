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

type CardTextProps = HTMLAttributes<HTMLElement> & { children: ReactNode };

export function CardEyebrow({ children, className = '', ...props }: CardTextProps) {
	return (
		<p className={`card-eyebrow ${className}`.trim()} {...props}>
			{children}
		</p>
	);
}

export function CardTitle({ children, className = '', ...props }: CardTextProps) {
	return (
		<h3 className={`card-title ${className}`.trim()} {...props}>
			{children}
		</h3>
	);
}

export function CardMeta({ children, className = '', ...props }: CardTextProps) {
	return (
		<p className={`card-meta ${className}`.trim()} {...props}>
			{children}
		</p>
	);
}
