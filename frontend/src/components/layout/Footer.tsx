import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

const publicColumns: FooterColumn[] = [
  {
    title: 'Resources',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Mentors', href: '/mentors' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'Login', href: '/login' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'Profile', href: '/profile' },
      { label: 'Applications', href: '/applications' },
    ],
  },
  {
    title: 'More',
    links: [
      { label: 'Privacy', href: '/contact' },
      { label: 'Help', href: '/contact' },
      { label: 'Terms', href: '/contact' },
      { label: 'FAQ', href: '/contact' },
    ],
  },
];

const roleColumns: Record<string, FooterColumn[]> = {
  EMPLOYER: [
    {
      title: 'Employer',
      links: [
        { label: 'Dashboard', href: '/employer' },
        { label: 'Post a Job', href: '/employer/post-job' },
        { label: 'Applicants', href: '/employer/applicants' },
      ],
    },
    {
      title: 'Hiring',
      links: [
        { label: 'Jobs', href: '/jobs' },
        { label: 'Candidates', href: '/candidates' },
        { label: 'Profile', href: '/profile' },
      ],
    },
  ],
  INSTITUTION: [
    {
      title: 'Institution',
      links: [
        { label: 'Courses', href: '/courses' },
        { label: 'Create Course', href: '/courses/new' },
        { label: 'Profile', href: '/profile' },
      ],
    },
    {
      title: 'Learning',
      links: [
        { label: 'Certifications', href: '/certifications' },
        { label: 'Intelligence', href: '/intelligence' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ],
  MENTOR: [
    {
      title: 'Mentor',
      links: [
        { label: 'Mentors', href: '/mentors' },
        { label: 'Profile', href: '/profile' },
        { label: 'Courses', href: '/courses' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Jobs', href: '/jobs' },
        { label: 'Contact', href: '/contact' },
        { label: 'Certifications', href: '/certifications' },
      ],
    },
  ],
  ADMIN: [
    {
      title: 'Admin',
      links: [
        { label: 'Admin Home', href: '/admin' },
        { label: 'Exports', href: '/admin/export' },
        { label: 'Moderation', href: '/admin/moderation' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'Users', href: '/admin' },
        { label: 'Courses', href: '/courses' },
        { label: 'Jobs', href: '/jobs' },
      ],
    },
  ],
  LEARNER: publicColumns,
};

export default function Footer() {
  const { user } = useAuth();
  const role = (user?.role ?? 'LEARNER').toUpperCase();
  const columns = roleColumns[role] ?? publicColumns;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/hanga-works-logo.svg" alt="Hanga Works Logo" />
          <p className="site-footer__brand-text">
            Hanga Works unifies learning, hiring, and workforce intelligence in one enterprise-ready workspace.
          </p>
          <div className="site-footer__social">
            {[
              { label: 'email', href: 'mailto:hello@hanga.works' },
              { label: 'support', href: '/contact' },
              { label: 'learn', href: '/courses' },
            ].map((item) => (
              <a key={item.label} href={item.href} className="site-footer__social-link" aria-label={item.label}>
                {item.label[0].toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="site-footer__column">
            <p className="site-footer__column-title">{col.title}</p>
            <div className="site-footer__links">
              {col.links.map((link) => (
                <Link key={link.label} to={link.href} className="site-footer__link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__legal-link">Copyright © 2024. Hanga Works. All rights reserved.</p>
        <div className="site-footer__legal-links">
          {[
            { label: 'Privacy Policy', href: '/contact' },
            { label: 'Terms & Conditions', href: '/contact' },
            { label: 'Security', href: '/contact' },
          ].map((item) => (
            <Link key={item.label} to={item.href} className="site-footer__legal-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
