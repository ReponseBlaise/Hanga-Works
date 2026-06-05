import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type SharedProps = {
	variant?: ButtonVariant;
	className?: string;
	children: ReactNode;
};

type NativeButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & {
	href?: undefined;
	to?: undefined;
};

type AnchorButtonProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string;
	to?: undefined;
};

type RouterLinkButtonProps = SharedProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
	to: string;
	href?: undefined;
};

function getButtonClassName(variant: ButtonVariant = 'primary', className = '') {
	return `button button-${variant} ${className}`.trim();
}

export function Button(props: NativeButtonProps | AnchorButtonProps | RouterLinkButtonProps) {
	if ('to' in props && props.to) {
		const { variant = 'primary', className = '', children, to, href: _href, ...rest } = props as RouterLinkButtonProps;
		return (
			<Link className={getButtonClassName(variant, className)} to={to} {...rest}>
				{children}
			</Link>
		);
	}

	if ('href' in props && props.href) {
		const { variant = 'primary', className = '', children, ...anchorProps } = props;
		return (
			<a className={getButtonClassName(variant, className)} {...anchorProps}>
				{children}
			</a>
		);
	}

	const { variant = 'primary', className = '', children, ...buttonProps } = props as NativeButtonProps;
	return (
		<button className={getButtonClassName(variant, className)} {...buttonProps}>
			{children}
		</button>
	);
}
