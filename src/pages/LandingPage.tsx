import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif">Questbook</h1>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm text-teal hover:text-amber">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm text-teal font-medium">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <span className="eyebrow">Field Manual No. 01</span>
          <h1 className="text-5xl font-serif text-ink mt-4 mb-6">
            The Architecture of You
          </h1>
          <p className="text-xl text-ink-soft max-w-2xl mx-auto mb-8">
            Discover the hidden operating system behind how you think, create,
            and make decisions — through evidence, not assumptions.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a
            href="/architecture_of_you.pdf"
            download
            className="btn btn-secondary"
          >
            ↓ Download Free PDF (15 pages)
          </a>
          <Link to="/signup" className="btn btn-primary">
            Start Interactive Quest →
          </Link>
        </div>

        <p className="text-sm text-ink-soft">
          Free PDF available now. Interactive Questbook requires account.
        </p>
      </section>

      {/* Value Proposition */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8 my-12">
        <div className="p-6 bg-white border border-line rounded">
          <h3 className="eyebrow mb-3">Discovery Through Evidence</h3>
          <p className="text-sm text-ink-soft">
            20 carefully designed questions across 3 rounds—Pattern Finder,
            Friction Test, Market Reality Test.
          </p>
        </div>
        <div className="p-6 bg-white border border-line rounded">
          <h3 className="eyebrow mb-3">Real-Time Pattern Detection</h3>
          <p className="text-sm text-ink-soft">
            Watch patterns emerge as you answer. The system reflects back what
            it finds.
          </p>
        </div>
        <div className="p-6 bg-white border border-line rounded">
          <h3 className="eyebrow mb-3">Your Personal Architecture</h3>
          <p className="text-sm text-ink-soft">
            Personalised Skills Canvas, positioning statement, and 7-day proof
            plan you can download.
          </p>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="max-w-6xl mx-auto px-4 py-16 bg-paper-light rounded p-8">
        <h2 className="text-3xl font-serif mb-8 text-center">
          What You'll Leave With
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="eyebrow mb-2">Personal Artifact</h3>
            <p className="text-ink-soft mb-4">
              A personalised PDF containing your:
            </p>
            <ul className="text-sm text-ink-soft space-y-1 ml-4">
              <li>• Strongest patterns detected</li>
              <li>• Innate strengths</li>
              <li>• Marketable skills</li>
              <li>• Unique positioning</li>
              <li>• One-sentence answer to "what do you do?"</li>
              <li>• 7-day proof plan</li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-2">Evolutionary Process</h3>
            <p className="text-ink-soft mb-4">
              Your Architecture is Version 01, not a final answer.
            </p>
            <p className="text-sm text-ink-soft">
              Return anytime to revisit your answers as you grow, create
              Version 02, and watch your self-understanding evolve with real-world
              evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16 my-12">
        <h2 className="text-3xl font-serif mb-8 text-center">
          Subscription Plans
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 bg-white border-2 border-line rounded">
            <h3 className="text-xl font-serif mb-2">Free</h3>
            <p className="eyebrow mb-4">Forever</p>
            <p className="text-2xl font-serif mb-6">£0</p>
            <ul className="text-sm text-ink-soft space-y-2 mb-8">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Download PDF workbook</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Preview Quest 01</span>
              </li>
              <li className="flex gap-2">
                <span>×</span>
                <span className="line-through">
                  Complete interactive quest
                </span>
              </li>
            </ul>
            <button disabled className="w-full btn btn-secondary opacity-50">
              You're Here
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 bg-white border-2 border-teal rounded">
            <h3 className="text-xl font-serif mb-2">Pro</h3>
            <p className="eyebrow mb-4 text-teal">Recommended</p>
            <p className="text-2xl font-serif mb-2">£7/month</p>
            <p className="text-xs text-ink-soft mb-6">or £70/year (2 months free)</p>
            <ul className="text-sm text-ink-soft space-y-2 mb-8">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Complete all interactive quests</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Save and track versions</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Pattern detection in real-time</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Download personalized PDFs</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Early access to new modules</span>
              </li>
            </ul>
            <Link to="/signup" className="w-full btn btn-primary block text-center">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-paper text-center py-8 mt-12">
        <p className="text-sm">© 2024 Questbook. All rights reserved.</p>
        <p className="text-xs text-paper-light mt-2">
          Helping multidisciplinary creators and founders discover their value.
        </p>
      </footer>
    </div>
  )
}
