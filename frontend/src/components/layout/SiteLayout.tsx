import { type ReactNode } from 'react';
import Navbar from './Topbar';
import Footer from './Footer';

type SiteLayoutProps = {
	children: ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
	return (
		<div className="site-page">
			<Navbar />
			<main className="site-main">{children}</main>
			<Footer />
		</div>
	);
}

export default SiteLayout;