import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type DashboardLayoutProps = {
	children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className="dashboard-shell">
			<div className={`sidebar-backdrop ${isSidebarOpen ? 'is-visible' : ''}`.trim()} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				brand={
					<div className="brand-lockup brand-lockup--sidebar">
						<div className="brand-mark" aria-hidden="true">
							<span />
						</div>
						<div>
							<p className="brand-kicker">HANGA WORKS</p>
							<h2 className="brand-name">Workforce dashboard</h2>
						</div>
					</div>
				}
			/>

			<div className="dashboard-main">
				<Topbar onMenuToggle={() => setIsSidebarOpen(true)} userName="Amina Kato" role="Career growth analyst" unreadCount={4} />
				<main className="dashboard-content">{children}</main>
			</div>
		</div>
	);
}
