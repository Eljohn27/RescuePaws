import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import SightingMap from '../components/SightingMap';
import PostCard, { fromSighting, fromAdoption } from '../components/PostCard';
import { RequestForm, ProofForm, ReportForm } from '../components/PostActions';
import './Browse.css';

// Dogs / Cats pick the animal, Sight / Foster pick the kind of post. Any mix can be chosen at once.
const ANIMAL_CATS = [['Dog', 'Dogs'], ['Cat', 'Cats']];
const KIND_CATS = [['stray', 'Sight'], ['foster', 'Foster']];

function Cat({ label, on, onClick, n }) {
  return (
    <button type="button" className={`browse__cat${on ? ' is-on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span className="browse__cat-left"><span className="browse__tick"><Icon name="check" size={12} stroke={3.5} /></span>{label}</span>
      <span className="browse__cat-count">{n}</span>
    </button>
  );
}

export default function Browse({ isLoggedIn, user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animals, setAnimals] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [modal, setModal] = useState(null); // { type: 'respond' | 'report', item }
  const [sent, setSent] = useState([]);
  const [toast, setToast] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => (
    typeof window === 'undefined' || window.sessionStorage.getItem('browseWelcomeMinimized') !== 'true'
  ));

  const minimizeWelcome = () => {
    window.sessionStorage.setItem('browseWelcomeMinimized', 'true');
    setShowWelcome(false);
  };

  const restoreWelcome = () => {
    window.sessionStorage.removeItem('browseWelcomeMinimized');
    setShowWelcome(true);
  };

  useEffect(() => {
    Promise.all([api('/sightings?limit=100'), api('/adoptions?limit=100')])
      .then(([s, a]) => setItems([...s.map(fromSighting), ...a.map(fromAdoption)].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt)))) // newest on top
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = (list, setList, value) => setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  const shown = useMemo(
    () => items.filter((i) => (!animals.length || animals.includes(i.animal)) && (!kinds.length || kinds.includes(i.kind))),
    [items, animals, kinds]
  );
  const count = (test) => items.filter(test).length;
  const noFilter = !animals.length && !kinds.length;

  const respond = (item) => (isLoggedIn ? setModal({ type: 'respond', item }) : navigate('/login'));
  const report = (item) => (isLoggedIn ? setModal({ type: 'report', item }) : navigate('/login'));
  const done = (item, msg) => {
    setModal(null);
    if (modal?.type === 'respond') setSent((s) => [...s, item.key]);
    setToast({ msg, bad: false });
  };

  return (
    <div className="browse rp-page">
      <aside className="browse__side">
        <div className="browse__panel">
          <h2>Categories</h2>
          <p>Pick one or more to narrow the feed.</p>
          <div className="browse__cats">
            <Cat label="All" on={noFilter} n={items.length} onClick={() => { setAnimals([]); setKinds([]); }} />
            <div className="browse__divider" />
            {ANIMAL_CATS.map(([v, label]) => <Cat key={v} label={label} on={animals.includes(v)} n={count((i) => i.animal === v)} onClick={() => toggle(animals, setAnimals, v)} />)}
            {KIND_CATS.map(([v, label]) => <Cat key={v} label={label} on={kinds.includes(v)} n={count((i) => i.kind === v)} onClick={() => toggle(kinds, setKinds, v)} />)}
          </div>
        </div>
        <button type="button" className="rp-btn rp-btn--ghost rp-btn--block" onClick={() => setShowMap((v) => !v)}>
          <Icon name="map" size={16} /> {showMap ? 'Hide map' : 'Show map'}
        </button>
      </aside>

      <main>
        {showWelcome ? (
          <section className="browse__hello">
            <button type="button" className="browse__hello-close" onClick={minimizeWelcome} aria-label="Minimize welcome message" title="Minimize welcome message">
              <Icon name="x" size={17} />
            </button>
            <h1>Every paw deserves a home</h1>
            <p>Say hello to the strays and foster pets of Dagupan City. Follow a poster, send an adoption request, or share a sighting to help someone find safety.</p>
            <div className="browse__hello-actions">
              <button type="button" className="rp-btn rp-btn--light" onClick={() => navigate('/post')}>Post a sighting or foster pet</button>
            </div>
          </section>
        ) : (
          <div className="browse__hello-minimized">
            <button type="button" className="browse__hello-reopen" onClick={restoreWelcome}>
              <Icon name="sparkles" size={15} /> Show welcome message
            </button>
          </div>
        )}

        {showMap && !loading && (
          <section className="browse__map">
            <h2>Pet and sighting locations</h2>
            <p>Approved sightings and available foster listings in Dagupan City. Select a pin for details.</p>
            <SightingMap sightings={shown} />
          </section>
        )}

        {loading && <p style={{ color: '#64748b' }}>Loading posts...</p>}
        {error && <div className="rp-alert rp-alert--bad">Could not load posts. Is the backend running?</div>}
        {!loading && !error && shown.length === 0 && (
          <div className="browse__empty">
            <Icon name="paw" size={30} />
            <p style={{ margin: '10px 0 0' }}>{items.length ? 'No posts match these categories yet.' : 'No posts yet. Be the first to share one!'}</p>
          </div>
        )}

        <div className="browse__feed">
          {shown.map((i) => (
            <PostCard key={i.key} item={i} meId={user?._id} isLoggedIn={isLoggedIn} alreadySent={sent.includes(i.key)} onAction={respond} onReport={report} />
          ))}
        </div>
      </main>

      {modal?.type === 'respond' && (
        <Modal onClose={() => setModal(null)} icon="heart" maxWidth={modal.item.kind === 'stray' ? 440 : 540}
          title={modal.item.kind === 'stray' ? 'Proof of adoption' : `Request to adopt ${modal.item.title}`}
          subtitle={modal.item.kind === 'stray' ? 'Show the admin that you took in this stray.' : 'Your request goes to the person who posted this pet.'}>
          {modal.item.kind === 'stray' ? <ProofForm item={modal.item} onDone={done} /> : <RequestForm item={modal.item} user={user} onDone={done} />}
        </Modal>
      )}
      {modal?.type === 'report' && (
        <Modal onClose={() => setModal(null)} icon="flag" tone="bad" title="Report this post" subtitle="Tell us what is wrong. An admin will review it and the poster will not see who reported.">
          <ReportForm item={modal.item} onDone={done} />
        </Modal>
      )}
      {toast && <div className={`rp-toast rp-toast--${toast.bad ? 'bad' : 'ok'}`} role="status">{toast.msg}</div>}
    </div>
  );
}
