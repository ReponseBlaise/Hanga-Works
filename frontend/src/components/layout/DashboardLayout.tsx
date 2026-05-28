import { type ReactNode } from 'react';
import Footer from './Footer';
import Navbar from './Topbar';
import { DashboardTopbar } from './Topbar';
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
 	const { user } = useAuth();
 	const userRole = user?.role ? user.role.toUpperCase() : 'Learner';

 	return (
 		<div className="dashboard-main">
 			<DashboardTopbar userName={user?.name} role={userRole} unreadCount={4} />
 			<main className="dashboard-content">{children}</main>
 		</div>
 	);
}
