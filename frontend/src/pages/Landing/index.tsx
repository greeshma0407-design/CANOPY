import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  BarChart3,
  Sliders,
  Lightbulb,
  FileText,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  TreePine,
} from 'lucide-react';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { useAuth } from '../../context/AuthContext';
import { NATURE_IMAGES } from '../../data/images';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--warm-ivory)', minHeight: '100vh', color: 'var(--charcoal)', overflowX: 'hidden' }}>
      {/* 3.1 Navigation Bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(247, 245, 240, 0.94)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border)',
          transition: 'all 0.2s ease'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: 'var(--charcoal)'
            }}
          >
            <CanopyLogo size={34} />
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.65rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--forest-green)'
              }}
            >
              Canopy
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}
            className="landing-desktop-links"
          >
            <button
              onClick={() => scrollToSection('home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--charcoal)', fontWeight: 500 }}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              How It Works
            </button>
          </div>

          {/* Auth Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
            className="landing-desktop-auth"
          >
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/overview')}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: 'var(--forest-green)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    padding: '0.5rem 0.8rem'
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/onboard"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="landing-mobile-toggle"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--charcoal)',
              padding: '0.4rem'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--white)',
              borderBottom: '1px solid var(--border)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <button
              onClick={() => scrollToSection('home')}
              style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', color: 'var(--charcoal)', fontWeight: 500, padding: '0.4rem 0' }}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '0.4rem 0' }}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '0.4rem 0' }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '0.4rem 0' }}
            >
              How It Works
            </button>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/overview')}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Go to Dashboard
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/onboard"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* 3.2 Hero Section */}
      <section
        id="home"
        style={{
          position: 'relative',
          padding: '4.5rem 1.5rem 5rem 1.5rem',
          maxWidth: '1240px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: '3rem',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* Left Column: Text & CTAs */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--forest-green-subtle)',
                color: 'var(--forest-green)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                letterSpacing: '0.02em'
              }}
            >
              <TreePine size={15} />
              Campus Carbon Accounting Platform
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontFamily: 'var(--font-editorial)',
                lineHeight: 1.15,
                color: 'var(--charcoal)',
                marginBottom: '1.25rem',
                fontWeight: 400
              }}
            >
              Small shifts.<br />
              <span style={{ color: 'var(--forest-green)' }}>Greener campuses.</span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: '2.25rem',
                maxWidth: '540px'
              }}
            >
              Understand your campus carbon footprint, discover meaningful insights and take steps towards a more sustainable future.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/overview')}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                >
                  Open Campus Dashboard
                  <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <Link
                    to="/onboard"
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="btn btn-secondary"
                    style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
                  >
                    Explore Features
                  </button>
                </>
              )}
            </div>

            {/* Credibility badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '2.75rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
              className="hero-badges"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--forest-green)" />
                <span>Standardized GHG Accounting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--forest-green)" />
                <span>Scope 1, 2 & 3 Categories</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--forest-green)" />
                <span>Verified Emission Factors</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Nature Photograph Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid var(--white)',
                position: 'relative',
                aspectRatio: '4/5',
                maxHeight: '520px',
                width: '100%'
              }}
            >
              <img
                src={NATURE_IMAGES.heroForest}
                alt="Lush green forest canopy with gentle sunlight"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(43, 45, 66, 0.45) 0%, transparent 60%)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  padding: '1.15rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: 'var(--charcoal)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--forest-green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Institutional Environmental Stewardship
                </div>
                <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--charcoal)', marginTop: '0.2rem' }}>
                  A clearer picture of your campus footprint.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.3 About Canopy Section */}
      <section
        id="about"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--white)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.1fr',
            gap: '3.5rem',
            alignItems: 'center'
          }}
          className="about-grid"
        >
          {/* Nature photograph */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                aspectRatio: '4/3'
              }}
            >
              <img
                src={NATURE_IMAGES.sunlitCanopy}
                alt="Sunlight filtering through vibrant green forest leaves"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </div>

          {/* About content */}
          <div>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--forest-green)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.75rem'
              }}
            >
              About Canopy
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)',
                fontFamily: 'var(--font-editorial)',
                lineHeight: 1.25,
                color: 'var(--charcoal)',
                marginBottom: '1.5rem',
                fontWeight: 400
              }}
            >
              Every campus has an impact.<br />
              <span style={{ color: 'var(--forest-green)' }}>Make yours a positive one.</span>
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.65,
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem'
              }}
            >
              Higher education campuses are vibrant, bustling ecosystems with thousands of students, faculty, residential halls, laboratories, transit networks, and dining facilities. Measuring and reducing that environmental impact doesn't have to be overwhelming.
            </p>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.65,
                color: 'var(--text-secondary)',
                marginBottom: '2rem'
              }}
            >
              Canopy was built specifically for colleges and universities to measure electricity, commuter travel, and waste streams using verified regional emission factors. We empower academic institutions to replace guesswork with clarity and model real reduction pathways.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem'
              }}
            >
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--warm-ivory)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.75rem', color: 'var(--forest-green)', marginBottom: '0.25rem' }}>
                  3 Core Streams
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Grid & solar electricity, transit fleets, and solid waste diversion.
                </div>
              </div>

              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--warm-ivory)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.75rem', color: 'var(--forest-green)', marginBottom: '0.25rem' }}>
                  Zero Guesswork
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Transparent, verifiable calculation models anchored to reputable factors.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.4 Features Section */}
      <section
        id="features"
        style={{
          padding: '5.5rem 1.5rem',
          maxWidth: '1240px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--forest-green)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.5rem'
            }}
          >
            Application Features
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontFamily: 'var(--font-editorial)',
              color: 'var(--charcoal)',
              fontWeight: 400
            }}
          >
            Purpose-built tools for campus sustainability teams
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            A streamlined suite designed to measure, simulate, and report emissions across academic institutions.
          </p>
        </div>

        {/* 5 Distinct Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--forest-green-subtle)',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Calculator size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.35rem', color: 'var(--charcoal)', marginBottom: '0.65rem', fontWeight: 400 }}>
                Carbon Footprint Calculator
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Record monthly grid electricity, rooftop solar generation, commuter shuttles, personal vehicles, and landfill waste with instant carbon factor conversion.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--sage)', fontWeight: 600 }}>
              Scope 1, 2 & 3 Input Engines
            </div>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--forest-green-subtle)',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.35rem', color: 'var(--charcoal)', marginBottom: '0.65rem', fontWeight: 400 }}>
                Emission Analytics Dashboard
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Visualize annual trends, category breakdowns, and carbon intensity per student and per square meter of campus built-up space.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--sage)', fontWeight: 600 }}>
              Live Recharts Trend Visualizations
            </div>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--forest-green-subtle)',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Sliders size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.35rem', color: 'var(--charcoal)', marginBottom: '0.65rem', fontWeight: 400 }}>
                What-If Simulator
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Simulate decarbonization initiatives before investing capital: model rooftop solar expansions, EV fleet transitions, and on-site food composting.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--sage)', fontWeight: 600 }}>
              Interactive Reduction Projections
            </div>
          </div>

          {/* Feature 4 */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--forest-green-subtle)',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Lightbulb size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.35rem', color: 'var(--charcoal)', marginBottom: '0.65rem', fontWeight: 400 }}>
                Sustainability Recommendations
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Receive prioritized, campus-tailored interventions evaluated by implementation effort, expected financial payback, and carbon mitigation impact.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--sage)', fontWeight: 600 }}>
              Actionable Campus Roadmap
            </div>
          </div>

          {/* Feature 5 */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--forest-green-subtle)',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <FileText size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.35rem', color: 'var(--charcoal)', marginBottom: '0.65rem', fontWeight: 400 }}>
                Reports & Insights
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Generate institutional compliance summaries, audit-ready inventory documentation, and structured CSV exports for university governing boards.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--sage)', fontWeight: 600 }}>
              Board-Ready Compliance Exports
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 How Canopy Works */}
      <section
        id="how-it-works"
        style={{
          padding: '5.5rem 1.5rem',
          backgroundColor: 'var(--white)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--forest-green)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem'
              }}
            >
              How It Works
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontFamily: 'var(--font-editorial)',
                color: 'var(--charcoal)',
                fontWeight: 400
              }}
            >
              Three stages to campus decarbonization
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem'
            }}
            className="how-it-works-grid"
          >
            {/* Stage 1 */}
            <div
              style={{
                backgroundColor: 'var(--warm-ivory)',
                padding: '2.25rem 2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--forest-green)',
                  letterSpacing: '0.08em',
                  marginBottom: '1rem'
                }}
              >
                STAGE 01 — MEASURE
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '0.75rem', fontWeight: 400 }}>
                Activity Inventory
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enter campus activity data across utility bills, commuter bus distance, vehicle fleets, and waste manifests. Canopy automatically pairs entries with verified regional emissions factors.
              </p>
            </div>

            {/* Stage 2 */}
            <div
              style={{
                backgroundColor: 'var(--warm-ivory)',
                padding: '2.25rem 2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--forest-green)',
                  letterSpacing: '0.08em',
                  marginBottom: '1rem'
                }}
              >
                STAGE 02 — UNDERSTAND
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '0.75rem', fontWeight: 400 }}>
                Emissions Analytics
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Explore emission patterns, identify seasonal spikes, evaluate per-capita intensity across students and staff, and benchmark against previous reporting cycles.
              </p>
            </div>

            {/* Stage 3 */}
            <div
              style={{
                backgroundColor: 'var(--warm-ivory)',
                padding: '2.25rem 2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--forest-green)',
                  letterSpacing: '0.08em',
                  marginBottom: '1rem'
                }}
              >
                STAGE 03 — REDUCE
              </div>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '0.75rem', fontWeight: 400 }}>
                Scenario Simulation
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Discover recommended efficiency interventions, test scenarios interactively with the what-if engine, and generate stakeholder reports to guide climate action plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.6 Nature-Inspired Visual Break */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(43, 45, 66, 0.7), rgba(43, 45, 66, 0.7)), url(${NATURE_IMAGES.forestPanorama})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'var(--white)',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <TreePine size={40} style={{ margin: '0 auto 1.5rem auto', color: '#B8D4BA' }} />
          <blockquote
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              lineHeight: 1.35,
              fontWeight: 400,
              fontStyle: 'italic',
              marginBottom: '1.5rem'
            }}
          >
            "The clearest way into the Universe is through a forest wilderness."
          </blockquote>
          <p style={{ fontSize: '1.05rem', color: '#E2E8DF', maxWidth: '600px', margin: '0 auto' }}>
            Educational institutions shape tomorrow's leaders. Leading by example through sustainable campus operations creates a lasting generational legacy.
          </p>
        </div>
      </section>

      {/* 3.7 Final Call to Action */}
      <section
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--forest-green)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}
          >
            Join Campus Decarbonization
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              fontFamily: 'var(--font-editorial)',
              color: 'var(--charcoal)',
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: '1.25rem'
            }}
          >
            A greener campus starts here.
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6
            }}
          >
            Join institutions taking meaningful steps toward carbon neutrality. Register your campus today or sign in to your existing account.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/overview')}
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1.02rem' }}
              >
                Go to Campus Dashboard
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link
                  to="/onboard"
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 2rem', fontSize: '1.02rem' }}
                >
                  Create Your Campus Account
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ padding: '0.85rem 2rem', fontSize: '1.02rem' }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3.8 Footer */}
      <footer
        style={{
          backgroundColor: 'var(--white)',
          borderTop: '1px solid var(--border)',
          padding: '3.5rem 1.5rem 2.5rem 1.5rem'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '2rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                <CanopyLogo size={28} />
                <span
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontSize: '1.4rem',
                    fontWeight: 400,
                    color: 'var(--forest-green)'
                  }}
                >
                  Canopy
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                Small shifts. Greener campuses. A modern sustainability platform for educational institutions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                  Platform
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Features</button>
                  <button onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>How It Works</button>
                  <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>About</button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                  Access
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign In</Link>
                  <Link to="/onboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Register Campus</Link>
                  <Link to="/join" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Join with Code</Link>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)'
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} Canopy Carbon Platform. All rights reserved.
            </div>
            <div>
              Standardized environmental accounting for academic campuses.
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .landing-desktop-links, .landing-desktop-auth {
            display: none !important;
          }
          .landing-mobile-toggle {
            display: block !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-badges {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};
