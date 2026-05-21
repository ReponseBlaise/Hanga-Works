type AvatarProps = {
	name: string;
	imageUrl?: string;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
};

function getInitials(name: string) {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

export function Avatar({ name, imageUrl, className = '', size = 'md' }: AvatarProps) {
	return (
		<div className={`avatar avatar-${size} ${className}`.trim()} aria-label={name}>
			{imageUrl ? <img src={imageUrl} alt={name} /> : <span>{getInitials(name)}</span>}
		</div>
	);
}
