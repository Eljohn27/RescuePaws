import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import PostCard, { fromSighting, fromAdoption } from '../components/PostCard';
import { RequestForm, ProofForm, ReportForm } from '../components/PostActions';
import './Browse.css';
import './PublicProfile.css';

// What other members see when they click a poster: public name, picture, member-since and their live posts.
export default function PublicProfile({ isLoggedIn, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [sent, setSent] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user?._id && user._id === id) { navigate('/profile', { replace: true }); return; }
    setData(null); setError('');
    api(`/users/${id}/public`).then(setData).catch((e) => setError(e.message));
  }, [id, user?._id, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  if (error) return <div className="pp rp-page"><div className="rp-alert rp-alert--bad">{error}</div><button type="button" className="rp-btn rp-btn--ghost" onClick={() => navigate('/browse')}>Back to Browse</button></div>;
  if (!data) return <div className="pp rp-page"><p style={{ color: '#64748b' }}>Loading...</p></div>;

  const { user: poster, stats } = data;
  const posts = [...data.sightings.map(fromSighting), ...data.fosters.map(fromAdoption)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const respond = (item) => (isLoggedIn ? setModal({ type: 'respond', item }) : navigate('/login'));
  const report = (item) => (isLoggedIn ? setModal({ type: 'report', item }) : navigate('/login'));
  const done = (item, msg) => { if (modal?.type === 'respond') setSent((s) => [...s, item.key]); setModal(null); setToast(msg); };
  const joined = poster.memberSince ? new Date(poster.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="pp rp-page">
      <button type="button" className="rp-link pp__back" onClick={() => navigate(-1)}>Back</button>
      <section className="pp__card">
        {poster.avatar
          ? <img className="rp-avatar" src={poster.avatar} alt={`${poster.name}'s profile`} style={{ width: 84, height: 84 }} />
          : <span className="rp-avatar" style={{ width: 84, height: 84, fontSize: 32 }}>{poster.name[0].toUpperCase()}</span>}
        <div className="pp__info">
          <h1>{poster.name}</h1>
          {joined && <div className="pp__since"><Icon name="clock" size={14} /> Member since {joined}</div>}
          <div className="pp__stats">
            <div><strong>{stats.livePosts}</strong><span>Live posts</span></div>
            <div><strong>{stats.strayRescued}</strong><span>Strays rescued</span></div>
            <div><strong>{stats.petsAdopted}</strong><span>Pets adopted out</span></div>
          </div>
        </div>
      </section>

      <h2 className="pp__title">Posts by {poster.name}</h2>
      {posts.length === 0 && <div className="browse__empty">No live posts right now.</div>}
      <div className="browse__feed">
        {posts.map((i) => <PostCard key={i.key} item={i} meId={user?._id} isLoggedIn={isLoggedIn} alreadySent={sent.includes(i.key)} onAction={respond} onReport={report} />)}
      </div>

      {modal?.type === 'respond' && (
        <Modal onClose={() => setModal(null)} icon="heart" title={modal.item.kind === 'stray' ? 'Proof of adoption' : `Request to adopt ${modal.item.title}`}
          subtitle={modal.item.kind === 'stray' ? 'Show the admin that you took in this stray.' : 'Your request goes to the person who posted this pet.'}>
          {modal.item.kind === 'stray' ? <ProofForm item={modal.item} onDone={done} /> : <RequestForm item={modal.item} user={user} onDone={done} />}
        </Modal>
      )}
      {modal?.type === 'report' && (
        <Modal onClose={() => setModal(null)} icon="flag" tone="bad" title="Report this post" subtitle="Tell us what is wrong. An admin will review it.">
          <ReportForm item={modal.item} onDone={done} />
        </Modal>
      )}
      {toast && <div className="rp-toast rp-toast--ok" role="status">{toast}</div>}
    </div>
  );
}
