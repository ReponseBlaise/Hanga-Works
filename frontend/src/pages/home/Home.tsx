import { useState, useEffect, useRef, FC, ReactNode, CSSProperties } from "react";
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getJobs, type JobSummary } from '../../services/jobs.service';
import { getCourses, type BackendCourse } from '../../services/courses.service';
import {
  MdVerified,
  MdPerson,
  MdSchool,
  MdWork,
  MdWorkHistory,
  MdBolt,
  MdHub,
  MdApartment,
  MdAccountBalance,
  MdTrendingDown,
  MdMail,
  MdShare,
  MdPublic,
  MdHandshake,
  MdCheckCircle,
  MdStar,
  MdBarChart,
} from "react-icons/md";
import type { IconType } from "react-icons";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}

interface NavbarProps {
  activeNav: string;
  setActiveNav: (item: string) => void;
}

interface EcosystemCard {
  title: string;
  desc: string;
  items: string[];
  color: string;
  bg: string;
  Icon: IconType;
}

interface Step {
  step: string;
  title: string;
  desc: string;
  Icon: IconType;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

interface FooterColumn {
  title: string;
  links: string[];
}

interface NetworkNode {
  Icon: IconType;
  label: string;
}
function useFadeIn(threshold = 0.15): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}
const FadeIn: FC<FadeInProps> = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={`hw-fade ${visible ? "hw-fade-visible" : "hw-fade-hidden"}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
};
interface Auth {
  isAuthenticated: boolean;
}
const HeroSection: FC<Auth> = ({ isAuthenticated }) => {
  const skills: string[] = ["Python", "Project Mgmt", "Data Analytics", "Azure Cloud"];
  const stats: [string, string][] = [["96%", "Match Score"], ["04", "Active Paths"]];

  return (
    <section className="hw-hero">
      {/* Left copy */}
      <FadeIn>
        <div className="hw-hero-badge">
          <MdVerified size={13} />
          Skills-First Hiring Platform
        </div>
        <h1 className="hw-hero-title">
          Skills. Verified.<br />
          <span>Opportunities.</span> Connected.
        </h1>
        <p className="hw-hero-sub">
          Build verified competency profiles, advance through structured learning
          pathways, and connect with employment opportunities through intelligent
          skills-based matching.
        </p>
        <div className="hw-hero-btns">
          {
                !isAuthenticated && (
                  <Button to={isAuthenticated ? '/jobs' : '/register'} variant="primary" className="button--lg button--pill">
                    {isAuthenticated ? 'Explore opportunities' : 'Create your profile'}
                  </Button>
                )
              }
          <Button to={"/jobs"} className="hw-btn-lg hw-btn-lg-outline">
            Explore Opportunities
          </Button>
        </div>
      </FadeIn>

      {/* Right – Dashboard Mockup */}
      <FadeIn
        delay={0.2}
        style={{ position: "relative", height: 520, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="hw-hero-visual" style={{ position: "relative", width: "100%" }}>
          {/* Main card */}
          <div className="hw-glass hw-dash-card">
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--outline-variant)", paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MdPerson size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--primary)" }}>Kamil Isaro</div>
                  <div style={{ fontSize: 10, color: "var(--outline)" }}>Software Engineer Level III</div>
                </div>
              </div>
              <div style={{ background: "rgba(0,51,33,0.85)", color: "var(--tertiary-dim)", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <MdVerified size={12} /> Verified
              </div>
            </div>

            {/* Stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {stats.map(([v, l]) => (
                <div key={l} style={{ background: "var(--surface-container)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "var(--outline)", marginBottom: 4 }}>{l}</div>
                  <div className="hw-display" style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <div style={{ fontSize: 10, color: "var(--outline)", marginBottom: 8 }}>Top Verified Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.map((s) => <span key={s} className="hw-skill-pill">{s}</span>)}
              </div>
            </div>
          </div>

          {/* Floating chip – Certification */}
          <div className="hw-glass hw-float-chip hw-float" style={{ top: "5%", right: "-4%", borderLeft: "4px solid var(--tertiary-dim)", zIndex: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MdVerified size={14} color="var(--tertiary-dim)" />
              <span>Certification Earned</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--outline)", marginTop: 4, fontWeight: 400 }}>Advanced Cloud Architecture</div>
          </div>

          {/* Floating chip – Employer */}
          <div className="hw-glass hw-float-chip hw-float-delay" style={{ bottom: "18%", left: "-8%", borderLeft: "4px solid var(--secondary)", zIndex: 3, width: 204 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MdHandshake size={14} color="var(--secondary)" />
              <span>Employer Approved</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--outline)", marginTop: 4, fontWeight: 400 }}>Recommended by 4 Fortune 500</div>
          </div>

          {/* Floating chip – Match */}
          <div className="hw-glass hw-float-chip hw-float" style={{ top: "58%", right: "-10%", zIndex: 3, textAlign: "center", animationDelay: "1s" }}>
            <div style={{ fontSize: 10, color: "var(--outline)" }}>Job Match</div>
            <div className="hw-display" style={{ fontSize: 32, fontWeight: 900, color: "var(--secondary)", lineHeight: 1.1 }}>96%</div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

/* ─────────────────────────────────────────────
   Partners Bar
───────────────────────────────────────────── */
const PartnersBar: FC = () => {
  const logos: string[] = ["UNIVEST", "GOVTECH", "AFRIHUB", "GLOBALSOFT", "SKILLNODE"];
  return (
    <section style={{ padding: "40px 40px", background: "#fff", borderTop: "1px solid var(--outline-variant)", borderBottom: "1px solid var(--outline-variant)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--outline)", marginBottom: 24 }}>
          Empowering the workforce with global partners
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 48, opacity: 0.45, filter: "grayscale(1)" }}>
          {logos.map((p) => (
            <div key={p} className="hw-display" style={{ fontWeight: 800, fontSize: 18, color: "#64748b", letterSpacing: "0.05em" }}>{p}</div>
          ))}
        </div>
      </div>
    </section>
  );
};
const EcosystemSection: FC = () => {
  const cards: EcosystemCard[] = [
    { title: "Talent Development", desc: "Dynamic learning pathways that track skills in real-time, providing digital credentials that the market trusts.", items: ["Learning Pathways", "Skill Tracking", "Certifications"], color: "#3b82f6", bg: "rgba(59,130,246,0.06)", Icon: MdSchool },
    { title: "Workforce Intelligence", desc: "Granular insights into labor market trends, skill gaps, and competency distribution across entire industries.", items: ["Competency Analytics", "Talent Insights", "Market Intelligence"], color: "var(--secondary)", bg: "rgba(0,81,213,0.06)", Icon: MdBarChart },
    { title: "Employment Pipeline", desc: "Precision matching engines that connect verified talent directly into optimized recruitment workflows.", items: ["AI Matching", "Recruitment Workflows", "Placement Tracking"], color: "#059669", bg: "rgba(5,150,105,0.06)", Icon: MdWork },
  ];

  return (
    <section className="hw-section" style={{ background: "var(--surface)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="hw-section-label">Platform</div>
          <h2 className="hw-section-title hw-display">A Unified Skills Ecosystem</h2>
          <p className="hw-section-sub" style={{ maxWidth: 520, margin: "12px auto 0" }}>
            End-to-end infrastructure for skill verification, talent analytics, and workforce development.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {cards.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.12}>
              <div className="hw-eco-card">
                <div style={{ height: 160, background: c.bg, borderRadius: 14, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, background: c.color, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                      <c.Icon size={28} color="#fff" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--on-surface-variant)" }}>Powered by HANGA AI</span>
                  </div>
                </div>
                <h3 className="hw-display" style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)", marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--on-surface-variant)", marginBottom: 16 }}>{c.desc}</p>
                {c.items.map((item) => (
                  <div key={item} className="hw-check-item" style={{ color: c.color }}>
                    <MdCheckCircle size={15} /> {item}
                  </div>
                ))}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
const HowItWorksSection: FC = () => {
  const steps: Step[] = [
    { step: "01", title: "Create Profile",     desc: "Build your digital portfolio with existing credentials and experience.",            Icon: MdPerson      },
    { step: "02", title: "Learning Pathways",  desc: "Follow structured roadmaps to gain the specific skills industry demands.",          Icon: MdSchool      },
    { step: "03", title: "Earn Verification",  desc: "Complete assessments to get your skills officially verified by partners.",          Icon: MdVerified    },
    { step: "04", title: "Get Matched",        desc: "Connect with high-value roles that fit your verified competency profile.",          Icon: MdWorkHistory },
  ];

  return (
    <section className="hw-steps">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="hw-display" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            The Journey to Verification
          </h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32 }}>
          {steps.map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.1} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 12 }}>{s.step}</div>
              <div className="hw-step-circle"><s.Icon size={30} color="var(--primary)" /></div>
              <h4 className="hw-display" style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 8 }}>{s.title}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{s.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
const SkillsFirstSection: FC = () => {
  const icons: IconType[] = [MdTrendingDown, MdBolt, MdVerified];

  return (
    <section className="hw-section" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48, alignItems: "center" }}>
        <FadeIn>
          <div className="hw-section-label">The Revolution</div>
          <h2 className="hw-section-title hw-display" style={{ marginBottom: 16 }}>The Skills-First Revolution</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", lineHeight: 1.7, marginBottom: 28 }}>
            Traditional hiring is broken. We're moving from "who you know" and "where you went" to "what you can actually do."
          </p>

          <div style={{ borderLeft: "4px solid var(--error)", borderRadius: 8, background: "rgba(186,26,26,0.04)", padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "var(--error)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <MdTrendingDown size={16} /> Traditional Model
            </div>
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
              CV-based selection. Bias-heavy. Slow verification. 40% miss-hire rate. 45 days to fill a role.
            </p>
          </div>

          <div style={{ borderLeft: "4px solid var(--secondary)", borderRadius: 8, background: "rgba(0,81,213,0.04)", padding: "16px 20px" }}>
            <div style={{ fontWeight: 700, color: "var(--secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <MdVerified size={16} /> HANGA WORKS Model
            </div>
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
              Skills-based matching. Verified accuracy. Bias-free analytics. 95% placement success. 12 days to fill a role.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))", borderRadius: 28, padding: 48, textAlign: "center", color: "#fff", position: "relative", overflow: "hidden", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50%,rgba(255,255,255,0.07),transparent 70%)" }} />
            <div className="hw-display" style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 8, position: "relative" }}>80%</div>
            <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.85, position: "relative" }}>Reduction in Time-to-Hire</div>
            <div style={{ display: "flex", gap: 16, marginTop: 28, position: "relative" }}>
              {icons.map((Ic, i) => (
                <div key={i} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic size={20} color="rgba(255,255,255,0.8)" />
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
const StatsSection: FC = () => {
  const stats: [string, string][] = [
    ["50,000+", "Professionals"],
    ["2,000+",  "Global Partners"],
    ["95%",     "Match Accuracy"],
    ["100k+",   "Skills Verified"],
  ];

  return (
    <section style={{ padding: "64px 40px", background: "var(--surface-container)", borderTop: "1px solid var(--outline-variant)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32, textAlign: "center" }}>
        {stats.map(([v, l], i) => (
          <FadeIn key={l} delay={i * 0.08}>
            <div className="hw-stat-num">{v}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--on-surface-variant)", marginTop: 4 }}>{l}</div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   Testimonials
───────────────────────────────────────────── */
const TestimonialsSection: FC = () => {
  const items: Testimonial[] = [
    { name: "Jean Bosco",       role: "Verified Senior Developer", quote: "The verified badges gave me the confidence to apply for international roles I previously felt underqualified for. Within 3 weeks, I was matched with my current lead developer role." },
    { name: "Sarah Jenkins",    role: "HR Director, GlobalTech",   quote: "Our recruitment cycle dropped from 40 days to 9 days. Every candidate we interview has the exact technical competency required for the project." },
    { name: "Dr. Samuel Okafor",role: "University Dean",           quote: "Bridging the gap between academia and industry is our priority. HANGA WORKS gives our students a clear path to align their learning with real-world market demands." },
  ];

  return (
    <section className="hw-section" style={{ background: "var(--surface)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="hw-section-title hw-display">Trusted by Every Stakeholder</h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {items.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.12}>
              <div className="hw-testi-card">
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, j) => <MdStar key={j} size={16} color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--on-surface-variant)", fontStyle: "italic", marginBottom: 20 }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MdPerson size={24} color="var(--outline)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--primary)" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--outline)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const AfricaNetworkSection: FC = () => {
  const nodes: NetworkNode[] = [
    { Icon: MdHub,            label: "Learners"    },
    { Icon: MdApartment,      label: "Employers"   },
    { Icon: MdAccountBalance, label: "Government"  },
  ];

  return (
    <section className="hw-section" style={{ background: "#eff4ff", textAlign: "center" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <h2 className="hw-section-title hw-display" style={{ marginBottom: 12 }}>Building Africa's Skills-Driven Workforce Future</h2>
          <p className="hw-section-sub" style={{ maxWidth: 560, margin: "0 auto 40px" }}>
            A decentralized network of trust connecting millions of learners, thousands of employers, and government agencies into one high-performance ecosystem.
          </p>
          <div style={{ background: "linear-gradient(135deg,var(--primary),#0a3d91)", borderRadius: 28, padding: "60px 40px", position: "relative", overflow: "hidden", minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.07, background: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.15) 40px,rgba(255,255,255,0.15) 41px)" }} />
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 48, position: "relative", zIndex: 1 }}>
              {nodes.map(({ Icon, label }) => (
                <div key={label} style={{ textAlign: "center", color: "#fff" }}>
                  <Icon size={44} color="rgba(255,255,255,0.9)" />
                  <div style={{ fontWeight: 700, marginTop: 8, fontSize: 14 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

const CTASection: FC = () => (
  <section className="hw-section">
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <FadeIn>
        <div className="hw-cta-inner">
          <h2 className="hw-display" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16, position: "relative" }}>
            Transform Skills Into Opportunity
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 36, position: "relative" }}>
            Join the workforce intelligence platform designed for the new economy.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, position: "relative" }}>
            <button className="hw-cta-btn-white">Get Started for Free</button>
            <button className="hw-cta-btn-outline">Contact Sales Team</button>
          </div>
        </div>
      </FadeIn>
    </div>
  </section>
);

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <SiteLayout>
      <main>
        <HeroSection isAuthenticated={isAuthenticated} />
        <PartnersBar />
        <EcosystemSection />
        <HowItWorksSection />
        <SkillsFirstSection />
        <StatsSection />
        <TestimonialsSection />
        <AfricaNetworkSection />
        <CTASection />
      </main>
    </SiteLayout>
  );
}
