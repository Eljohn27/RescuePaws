import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import './Home.css';

const HERO = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1000';

const STEPS = [
  { icon: 'camera', title: 'Report a sighting', text: 'Spotted a stray? Share a photo and where you saw it. Pin it on the map so neighbors and volunteers can find them fast.' },
  { icon: 'home', title: 'Foster and care', text: 'Rescuers post pets that need a home. Every post is checked by an admin before it goes live, so the community stays safe.' },
  { icon: 'heart', title: 'Adopt with confidence', text: 'Send an adoption request to the poster, who chooses the best home. Approved pets leave the feed and start their new life.' },
];

const HOW = [
  ['1. Browse and choose', 'Explore dogs and cats on Browse. Filter by Dogs, Cats, Sight or Foster and open a poster to see who they are.'],
  ['2. Send a request', 'Press "Request to adopt" on a foster pet and fill in your contact details.'],
  ['3. The poster decides', 'The poster reviews every request and approves the best match. You get a notification either way.'],
  ['4. Meet and welcome home', 'Coordinate with the poster to meet the pet and bring your new friend home.'],
];

export default function Home({ isLoggedIn }) {
  const navigate = useNavigate();
  const [sightings, setSightings] = useState([]);
  const [fosters, setFosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHow, setShowHow] = useState(false);
  const [welcome, setWelcome] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('justLoggedIn');
    if (raw) {
      try { setWelcome(JSON.parse(raw)); } catch { /* ignore malformed data */ }
      sessionStorage.removeItem('justLoggedIn');
    }
  }, []);

  useEffect(() => {
    Promise.all([api('/sightings?limit=100'), api('/adoptions?limit=100')])
      .then(([s, a]) => { setSightings(s); setFosters(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = [
    ...sightings.map((s) => ({ key: `s${s._id}`, kind: 'Sighting', color: '#0284c7', title: s.name, image: s.image, location: s.location, by: s.poster?.name, at: s.createdAt })),
    ...fosters.map((p) => ({ key: `a${p._id}`, kind: 'For adoption', color: '#e11d48', title: p.petName, image: p.image, location: p.location, by: p.poster?.name, at: p.createdAt })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 3);

  return (
    <div className="home rp-page">
      <section className="home__hero">
        <div className="home__hero-grid">
          <div>
            <span className="home__eyebrow"><Icon name="paw" size={14} /> COMMUNITY-LED DOG &amp; CAT RESCUE</span>
            <h1>Every stray deserves a <em>loving home</em></h1>
            <p className="home__lead">RescuePaws connects people who spot strays, volunteers who foster them and families ready to adopt, all across Pangasinan. Join in and help a rescued pet get a second chance.</p>
            <div className="home__cta">
              <button type="button" className="rp-btn rp-btn--primary" onClick={() => navigate('/browse')}><Icon name="heart" size={16} /> Meet pets to adopt</button>
              <button type="button" className="rp-btn rp-btn--ghost" onClick={() => navigate('/post')}><Icon name="camera" size={16} /> Report a sighting</button>
            </div>
          </div>
          <div className="home__photo">
            <img src={HERO} alt="A happy rescued dog" />
            <div className="home__badge">
              <span className="home__badge-icon"><Icon name="heart" size={20} /></span>
              <div><strong>{loading ? '-' : fosters.length}</strong><span>pets waiting for a home</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="home__wrap">
        <div className="home__stats">
          <div className="home__stat"><strong>{loading ? '-' : sightings.length}</strong><span>Strays reported</span></div>
          <div className="home__stat"><strong>{loading ? '-' : fosters.length}</strong><span>Foster pets</span></div>
          <div className="home__stat"><strong>48</strong><span>Cities and towns covered</span></div>
        </div>

        <section className="home__section">
          <div className="home__head">
            <small>How it works</small>
            <h2>Three simple ways to help</h2>
            <p>Whether you spotted a stray, can foster, or want to adopt, there is a place for you here.</p>
          </div>
          <div className="home__steps">
            {STEPS.map((s) => (
              <div className="home__step" key={s.title}>
                <div className="home__step-icon"><Icon name={s.icon} size={24} /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="home__section">
          <div className="home__latest-head">
            <div>
              <h2>Newest on RescuePaws</h2>
              <p>Fresh posts from our community.</p>
            </div>
            <button type="button" className="rp-btn rp-btn--ghost" onClick={() => navigate('/browse')}>See everything <Icon name="arrow" size={15} /></button>
          </div>
          <div className="home__cards">
            {loading && <div className="home__empty">Loading posts...</div>}
            {!loading && latest.length === 0 && <div className="home__empty">No posts yet. Be the first to share a sighting or foster pet!</div>}
            {latest.map((p) => (
              <button type="button" className="home__card" key={p.key} onClick={() => navigate('/browse')}>
                <div className="home__card-photo">
                  <img src={p.image} alt={p.title} loading="lazy" />
                  <span className="home__card-kind" style={{ background: p.color }}>{p.kind}</span>
                </div>
                <div className="home__card-body">
                  <h3>{p.title}</h3>
                  <div className="home__card-meta"><Icon name="pin" size={15} /><span>{p.location}</span></div>
                  {p.by && <div className="home__card-by">Posted by {p.by}</div>}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="home__banner">
          <div>
            <h2>Ready to welcome a rescued pet?</h2>
            <p>{isLoggedIn ? 'Browse the pets looking for a home, or share a stray you have seen.' : 'Create a free account to post sightings, foster pets and send adoption requests.'}</p>
          </div>
          <div className="home__cta">
            {isLoggedIn
              ? <button type="button" className="rp-btn rp-btn--light" onClick={() => navigate('/browse')}>Browse pets</button>
              : <button type="button" className="rp-btn rp-btn--light" onClick={() => navigate('/register')}>Join RescuePaws</button>}
            <button type="button" className="rp-btn rp-btn--line" onClick={() => setShowHow(true)}>How adoption works</button>
          </div>
        </section>
      </div>

      <footer className="home__footer">
        <div className="home__wrap">
          <div className="home__footer-grid">
            <div>
              <div className="home__footer-brand"><Icon name="paw" size={18} style={{ color: '#9e4624' }} /> RescuePaws</div>
              <p style={{ margin: 0, lineHeight: 1.6, maxWidth: 320 }}>A community platform for stray rescue, sighting reports and responsible pet adoption in Pangasinan.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <div className="home__footer-links">
                <button type="button" onClick={() => navigate('/browse')}>Browse pets</button>
                <button type="button" onClick={() => navigate('/post')}>Post a sighting or foster pet</button>
                <button type="button" onClick={() => setShowHow(true)}>How adoption works</button>
              </div>
            </div>
            <div>
              <h4>Account</h4>
              <div className="home__footer-links">
                {isLoggedIn ? <button type="button" onClick={() => navigate('/profile')}>My profile</button> : (
                  <>
                    <button type="button" onClick={() => navigate('/login')}>Log in</button>
                    <button type="button" onClick={() => navigate('/register')}>Create an account</button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="home__footer-bottom">© {new Date().getFullYear()} RescuePaws. Built with care for every stray.</div>
        </div>
      </footer>

      {showHow && (
        <Modal title="How adoption works" icon="heart" onClose={() => setShowHow(false)} maxWidth={520}
          subtitle="A simple, safe process so every pet finds the right home."
          footer={<button type="button" className="rp-btn rp-btn--primary rp-btn--block" onClick={() => setShowHow(false)}>Got it</button>}>
          <div className="home__how">{HOW.map(([t, d]) => <div key={t}><strong>{t}</strong><span>{d}</span></div>)}</div>
        </Modal>
      )}

      {welcome && (
        <Modal title="Welcome back!" icon="check" tone="ok" locked maxWidth={380}
          subtitle={`${welcome.name ? `${welcome.name}, you` : 'You'} are signed in and ready to explore RescuePaws.`}
          footer={<button type="button" className="rp-btn rp-btn--primary rp-btn--block" onClick={() => setWelcome(null)}>Continue</button>} />
      )}
    </div>
  );
}
