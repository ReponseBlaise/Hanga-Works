import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const plans = [
  {
    name: 'Basic',
    price: '$19',
    description: 'For individuals and small teams getting started with skills-first hiring.',
    features: ['Unlimited updates', 'Custom designs & features', 'Custom permissions', 'Free support ticket'],
  },
  {
    name: 'Standard',
    price: '$29',
    description: 'For growing teams that need stronger workflows and wider access.',
    features: ['Unlimited updates', 'Priority support', 'Custom permissions', 'Team reporting'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    description: 'For organizations that need more governance, scale, and assistance.',
    features: ['Unlimited updates', 'Dedicated success support', 'Custom permissions', 'Advanced analytics'],
  },
];

const faqs = [
  'I have a promotional or discount code?',
  'Where is my order?',
  'How can I return an item purchased online?',
  'What are the delivery types you use?',
  'How can I pay for my purchases?',
  'What are the delivery types you use?',
];

export default function Pricing() {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <CardEyebrow>Pricing</CardEyebrow>
            <h1>Pricing built to suit teams of all sizes.</h1>
            <p className="landing-lead">Choose the plan that fits your recruitment, learning, and workforce intelligence needs.</p>
          </div>

          <div className="landing-hero__visual">
            <Card className="hero-visual-card">
              <CardTitle>Flexible plans</CardTitle>
              <CardMeta>Start small, then scale as your team grows.</CardMeta>
              <CardMeta>Monthly billing with support for enterprise onboarding.</CardMeta>
            </Card>
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Pricing table</p>
              <h2>Choose the best plan that's for you</h2>
            </div>
          </div>

          <div className="landing-category-row pricing-grid">
            {plans.map((plan) => (
              <Card key={plan.name} className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`}>
                <CardEyebrow>{plan.name}</CardEyebrow>
                <div className="pricing-card__price">{plan.price}<span>/month</span></div>
                <CardMeta>{plan.description}</CardMeta>
                <ul className="pricing-card__list">
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <Button to="/register" variant={plan.featured ? 'primary' : 'secondary'}>Choose plan</Button>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">FAQ</p>
              <h2>Frequently asked questions</h2>
            </div>
          </div>

          <div className="landing-category-row faq-grid">
            {faqs.map((question) => (
              <Card key={question} className="faq-card">
                <CardTitle>{question}</CardTitle>
                <CardMeta>Support articles and detailed help content can be connected here when the knowledge base is ready.</CardMeta>
                <Button to="/contact" variant="ghost">Keep reading</Button>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
