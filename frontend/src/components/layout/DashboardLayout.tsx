import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import Footer from './Footer';
import Navbar from './Topbar';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';

type DashboardLayoutProps = {
	children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="dashboard-page">
			<Navbar />
			<div className="dashboard-shell">
				<DashboardFrame>{children}</DashboardFrame>
			</div>
			<Footer />
		</div>
	);
}

function DashboardFrame({ children }: DashboardLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { user } = useAuth();
	const userRole = user?.role ? user.role.toUpperCase() : 'Learner';

	return (
		<>
			<div className={`sidebar-backdrop ${isSidebarOpen ? 'is-visible' : ''}`.trim()} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				userName={user?.name}
				userRole={userRole}
				userEmail={user?.email}
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
				<Topbar
					userName={user?.name}
					role={userRole}
					unreadCount={4}
					onMenuToggle={() => setIsSidebarOpen(true)}
				/>
				<main className="dashboard-content">{children}</main>
			</div>
		</>
	);
}
