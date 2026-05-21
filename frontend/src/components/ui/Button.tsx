import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type SharedProps = {
	variant?: ButtonVariant;
	className?: string;
	children: ReactNode;
};

type NativeButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & {
	href?: undefined;
};

type AnchorButtonProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string;
};

function getButtonClassName(variant: ButtonVariant = 'primary', className = '') {
	return `button button-${variant} ${className}`.trim();
}

export function Button(props: NativeButtonProps | AnchorButtonProps) {
	if ('href' in props && props.href) {
		const { variant = 'primary', className = '', children, ...anchorProps } = props;
		return (
			<a className={getButtonClassName(variant, className)} {...anchorProps}>
				{children}
			</a>
		);
	}

	const { variant = 'primary', className = '', children, ...buttonProps } = props;
	return (
		<button className={getButtonClassName(variant, className)} {...buttonProps}>
			{children}
		</button>
	);
}
