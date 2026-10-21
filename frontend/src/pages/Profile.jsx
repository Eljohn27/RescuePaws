import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, pingNotifications } from '../api';
import ImagePicker from '../components/ImagePicker';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import PasswordField from '../components/PasswordField';
import OtpField from '../components/OtpField';
import { cleanFullName, fullNameProblem, cleanPhone, phoneProblem, toLocalPhone, fromLocalPhone, passwordProblem } from '../utils/validators';
import './Profile.css';

const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='#f6efe8'/><g fill='#c9a58f'><circle cx='70' cy='92' r='13'/><circle cx='100' cy='70' r='13'/><circle cx='130' cy='92' r='13'/><path d='M100 105c-24 0-42 24-42 40 0 12 10 16 22 16 8 0 12-3 20-3s12 3 20 3c12 0 22-4 22-16 0-16-18-40-42-40z'/></g></svg>")}`;
const when = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const LOOK = {
  wait: { bg: '#fef3c7', color: '#92400e' },
  live: { bg: '#e0f2fe', color: '#0369a1' },
  done: { bg: '#dcfce7', color: '#166534' },
  bad: { bg: '#fee2e2', color: '#b91c1c' },
};
const strayStatus = (s) => ({ 'Pending for Approval': ['wait', 'Waiting for admin approval'], Approved: ['live', 'Live on Browse'], Rejected: ['bad', 'Rejected by admin'], Rescued: ['done', 'Rescued'] }[s.moderationStatus] || ['wait', s.moderationStatus]);
const fosterStatus = (p) => (p.listingStatus === 'Adopted' ? ['done', 'Adopted'] : { 'Pending for Approval': ['wait', 'Waiting for admin approval'], Approved: ['live', 'Live on Browse'], Rejected: ['bad', 'Rejected by admin'] }[p.moderationStatus] || ['wait', p.moderationStatus]);
const requestStatus = (r) => ({ 'Needs Review': ['wait', 'Waiting for the poster'], Approved: ['done', 'Approved'], Rejected: ['bad', 'Declined'] }[r.status]);
const proofStatus = (r) => ({ 'Needs Review': ['wait', 'Waiting for admin'], Approved: ['done', 'Approved, stray rescued'], Rejected: ['bad', 'Rejected'] }[r.status]);

function Row({ img, title, sub, status, note, actions }) {
  const [look, text] = status;
  return (
    <div className="pf__row">
      <img src={img || PLACEHOLDER} alt="" />
      <div className="pf__row-body">
        <div className="pf__row-top">
          <strong>{title}</strong>
          <span className="rp-badge" style={{ background: LOOK[look].bg, color: LOOK[look].color }}>{text}</span>
        </div>
        <div className="pf__row-sub">{sub}</div>
        {note && <div className="pf__note"><strong>Admin's message:</strong> {note}</div>}
        {actions && <div className="pf__row-actions">{actions}</div>}
      </div>
    </div>
  );
}

export default function Profile({ user, setUser, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts'); // posts | requests | edit
  const [postFilter, setPostFilter] = useState('all'); // all | sighting | foster
  const [data, setData] = useState(null);
  const [me, setMe] = useState({ name: '', phone: '', avatar: '' }); // phone = the 10 digits after +63
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const say = (msg, bad = false) => { setToast({ msg, bad }); setTimeout(() => setToast(null), 4500); };

  const load = () =>
    Promise.all([api('/adoptions/mine'), api('/sightings/mine'), api('/applications/mine'), api('/proofs/mine'), api('/auth/me')])
      .then(([fosters, strays, requests, proofs, profile]) => {
        setData({ fosters, strays, requests, proofs });
        setMe({ name: profile.name || '', phone: fromLocalPhone(profile.phone), avatar: profile.avatar || '' });
        const saved = { ...(JSON.parse(localStorage.getItem('user')) || {}), name: profile.name, email: profile.email, avatar: profile.avatar || '' };
        localStorage.setItem('user', JSON.stringify(saved));
        setUser((current) => ({ ...current, ...saved }));
      })
      .catch((e) => say(e.message, true));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const remove = async () => {
    const { kind, id } = confirmDelete;
    try { await api(kind === 'foster' ? `/adoptions/${id}` : `/sightings/${id}`, { method: 'DELETE' }); say('Post deleted.'); setConfirmDelete(null); load(); }
    catch (e) { say(e.message, true); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    const issue = fullNameProblem(me.name.trim()) || phoneProblem(me.phone);
    if (issue) return setProfileError(issue);
    setSaving(true);
    try {
      const u = await api('/users/me', { method: 'PATCH', body: { name: me.name.trim(), phone: toLocalPhone(me.phone), avatar: me.avatar } });
      const saved = { ...(JSON.parse(localStorage.getItem('user')) || {}), name: u.name, avatar: u.avatar || '' };
      localStorage.setItem('user', JSON.stringify(saved));
      setUser((cur) => ({ ...cur, name: u.name, avatar: u.avatar || '' }));
      say('Profile saved.');
    } catch (err) { setProfileError(err.message); } finally { setSaving(false); }
  };

  const tabBtn = (id, name) => <button key={id} type="button" className={`pf__tab${tab === id ? ' is-on' : ''}`} onClick={() => setTab(id)}>{name}</button>;
  const editable = (kind, id, closed) => !closed && <button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => navigate(`/post/${kind}/${id}`)}><Icon name="edit" size={13} /> Edit</button>;
  const del = (kind, id) => <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setConfirmDelete({ kind, id })}><Icon name="trash" size={13} /> Delete</button>;

  const posts = data ? [
    ...data.fosters.map((p) => ({ kind: 'foster', at: p.createdAt, el: (
      <Row key={`f${p._id}`} img={p.image} title={p.petName} sub={`For adoption · ${p.location} · ${when(p.createdAt)}`} status={fosterStatus(p)} note={p.moderationStatus === 'Rejected' ? p.reviewNote : ''}
        actions={<>{editable('foster', p._id, p.listingStatus === 'Adopted')}{p.listingStatus !== 'Adopted' && del('foster', p._id)}</>} />) })),
    ...data.strays.map((s) => ({ kind: 'sighting', at: s.createdAt, el: (
      <Row key={`s${s._id}`} img={s.photoUrl} title={`${s.animalType}${s.keyFeatures ? ` (${s.keyFeatures})` : ''}`} sub={`Sighting · ${s.location} · ${when(s.createdAt)}`} status={strayStatus(s)} note={s.moderationStatus === 'Rejected' ? s.reviewNote : ''}
        actions={<>{editable('stray', s._id, s.moderationStatus === 'Rescued')}{s.moderationStatus !== 'Rescued' && del('stray', s._id)}</>} />) })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)) : [];
  const visiblePosts = postFilter === 'all' ? posts : posts.filter((post) => post.kind === postFilter);
  const postFilters = [
    { id: 'all', label: 'All Posts', count: posts.length },
    { id: 'sighting', label: 'Sightings', count: posts.filter((post) => post.kind === 'sighting').length },
    { id: 'foster', label: 'Foster', count: posts.filter((post) => post.kind === 'foster').length },
  ];

  const sent = data ? [
    ...data.requests.map((r) => ({ at: r.createdAt, el: <Row key={`r${r.id}`} img={r.img} title={`Request to adopt ${r.animal}`} sub={r.date} status={requestStatus(r)} note={r.status === 'Rejected' ? r.reviewNote : ''} /> })),
    ...data.proofs.map((p) => ({ at: p.createdAt, el: <Row key={`p${p.id}`} img={p.sighting.image} title={`Proof for the ${p.sighting.animalType.toLowerCase()} at ${p.sighting.location}`} sub={`Sent ${when(p.createdAt)}`} status={proofStatus(p)} note={p.status === 'Rejected' ? p.reviewNote : ''} /> })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)) : [];

  const empty = (text, cta, to) => (
    <div className="pf__empty"><p style={{ margin: '0 0 12px' }}>{text}</p><button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => navigate(to)}>{cta}</button></div>
  );

  return (
    <div className="pf rp-page">
      <div className="pf__head">
        <div className="pf__identity">
          {me.avatar || user?.avatar
            ? <img className="rp-avatar" src={me.avatar || user.avatar} alt={`${user?.name || 'Your'} profile`} style={{ width: 60, height: 60 }} />
            : <span className="rp-avatar" style={{ width: 60, height: 60, fontSize: 24 }}>{user?.name ? user.name[0].toUpperCase() : '?'}</span>}
          <div className="pf__identity-copy">
            <h1>{user?.name}</h1>
            <div className="pf__identity-email">{user?.email}</div>
          </div>
        </div>
        <button type="button" className="rp-btn rp-btn--ghost pf__edit-account" onClick={() => setTab('edit')}><Icon name="edit" size={14} /> Edit Account</button>
      </div>

      <div className="pf__tabs">{tabBtn('posts', 'My Posts')}{tabBtn('requests', 'My Requests')}</div>

      {!data && tab !== 'edit' && <p style={{ color: '#64748b' }}>Loading...</p>}
      {data && tab === 'posts' && <>
        <div className="pf__post-filters" aria-label="Filter your posts">
          {postFilters.map((filter) => (
            <button key={filter.id} type="button" className={`pf__tab${postFilter === filter.id ? ' is-on' : ''}`} onClick={() => setPostFilter(filter.id)} aria-pressed={postFilter === filter.id}>
              {filter.label}<span className="pf__filter-count">{filter.count}</span>
            </button>
          ))}
        </div>
        {posts.length === 0
          ? empty('You have not posted anything yet.', 'Post now', '/post')
          : visiblePosts.length
            ? <div className="pf__stack">{visiblePosts.map((p) => p.el)}</div>
            : <div className="pf__empty" role="status">No {postFilter === 'sighting' ? 'sighting' : 'foster'} posts yet.</div>}
      </>}
      {data && tab === 'requests' && (sent.length ? <div className="pf__stack">{sent.map((p) => p.el)}</div> : empty('You have not sent any requests or proofs yet.', 'Browse', '/browse'))}

      {tab === 'edit' && (
        <>
          <form className="pf__card" onSubmit={saveProfile} noValidate>
            <h3>Your details</h3>
            <div className="rp-field">
              <ImagePicker value={me.avatar} onChange={(avatar) => setMe((c) => ({ ...c, avatar }))} label="Profile picture" />
              <div className="rp-hint">Choose a JPG, PNG or WebP image, then save to keep the change.</div>
            </div>
            <div className="rp-field">
              <div className="rp-label__row"><label className="rp-label" htmlFor="pf-name">Full name</label><span className="rp-counter">{me.name.length}/50</span></div>
              <input id="pf-name" className="rp-input" value={me.name} maxLength={50} onChange={(e) => setMe({ ...me, name: cleanFullName(e.target.value) })} />
              <div className="rp-hint">First and last name, no initials, no double spaces.</div>
            </div>
            <div className="rp-field">
              <label className="rp-label" htmlFor="pf-phone">Phone number</label>
              <div className="rp-input-wrap">
                <span className="rp-input-wrap__prefix">+63</span>
                <input id="pf-phone" className="rp-input rp-input--bare" type="tel" inputMode="numeric" placeholder="9XX XXX XXXX" value={me.phone} maxLength={10} onChange={(e) => setMe({ ...me, phone: cleanPhone(e.target.value) })} />
                <span className="rp-counter">{me.phone.length}/10</span>
              </div>
            </div>
            {profileError && <div className="rp-alert rp-alert--bad" role="alert">{profileError}</div>}
            <button type="submit" className="rp-btn rp-btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          </form>

          <PasswordChange onDone={(msg) => say(msg)} />
          <AccountDeletion email={user?.email} setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
        </>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} icon="trash" tone="bad" title="Delete this post?" subtitle="This cannot be undone."
          footer={<><button type="button" className="rp-btn rp-btn--ghost" onClick={() => setConfirmDelete(null)}>Cancel</button><button type="button" className="rp-btn rp-btn--solid-danger" onClick={remove}>Delete post</button></>} />
      )}
      {toast && <div className={`rp-toast rp-toast--${toast.bad ? 'bad' : 'ok'}`} role="status">{toast.msg}</div>}
    </div>
  );
}

function AccountDeletion({ email, setUser, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // confirm | otp | null
  const [step, setStep] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!modal || seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [modal, seconds]);

  const open = () => {
    setError(''); setNotice('');
    setModal(step ? 'otp' : 'confirm');
  };

  const requestCode = async () => {
    setBusy(true); setError('');
    try {
      const result = await api('/users/me/delete/request', { method: 'POST' });
      setStep({ token: result.challengeToken, email: result.email });
      setOtp(''); setSeconds(result.resendAfterSeconds ?? 30); setModal('otp');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const resendCode = async () => {
    if (!step || busy || seconds > 0) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api('/users/me/delete/resend', { method: 'POST', body: { challengeToken: step.token } });
      setStep({ token: result.challengeToken, email: result.email });
      setOtp(''); setSeconds(result.resendAfterSeconds ?? 30); setNotice(result.message || 'A new code was sent.');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const confirmDeletion = async () => {
    if (!step || otp.length !== 6 || busy) return;
    setBusy(true); setError('');
    try {
      await api('/users/me', { method: 'DELETE', body: { challengeToken: step.token, otp } });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('justLoggedIn');
      setUser?.(null);
      setIsLoggedIn?.(false);
      navigate('/login', { replace: true, state: { notice: 'Your account and posts have been deleted.' } });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="pf__card pf__danger-zone">
      <h3>Delete account</h3>
      <p>Permanently delete your RescuePaws account and all your posts, adoption requests, proofs, and related account data.</p>
      {step && <div className="rp-hint">A verification code has been requested for {step.email}.</div>}
      <button type="button" className="rp-btn rp-btn--danger" onClick={open}>{step ? 'Continue deletion verification' : 'Delete my account'}</button>

      {modal === 'confirm' && (
        <Modal icon="trash" tone="bad" title="Delete your account?" subtitle="This action is permanent and cannot be undone." onClose={() => { if (!busy) setModal(null); }}
          footer={<><button type="button" className="rp-btn rp-btn--ghost" disabled={busy} onClick={() => setModal(null)}>Cancel</button><button type="button" className="rp-btn rp-btn--solid-danger" disabled={busy} onClick={requestCode}>{busy ? 'Sending code...' : 'Yes, continue'}</button></>}>
          <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.6 }}>Your profile, sightings, foster posts, adoption requests, rescue proofs, and notifications will be deleted. We’ll email a 6-digit code to <strong>{email}</strong> before deleting anything.</p>
          {error && <div className="rp-alert rp-alert--bad" role="alert" style={{ marginTop: 12 }}>{error}</div>}
        </Modal>
      )}

      {modal === 'otp' && step && (
        <Modal icon="mail" title="Confirm account deletion" subtitle={<>Enter the 6-digit code sent to <strong>{step.email}</strong>. It expires in 5 minutes.</>} onClose={() => { if (!busy) setModal(null); }}>
          {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
          {notice && <div className="rp-alert rp-alert--ok" role="status">{notice}</div>}
          <OtpField value={otp} onChange={setOtp} />
          <button type="button" className="rp-btn rp-btn--solid-danger rp-btn--block" disabled={busy || otp.length !== 6} onClick={confirmDeletion}>{busy ? 'Deleting account...' : 'Verify and delete account'}</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
            <button type="button" className="rp-link" disabled={busy || seconds > 0} onClick={resendCode}>{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</button>
            <button type="button" className="rp-link" style={{ color: '#64748b' }} disabled={busy} onClick={() => setModal(null)}>Close</button>
          </div>
          {error && /expired|start again/i.test(error) && <button type="button" className="rp-link" style={{ marginTop: 12 }} disabled={busy} onClick={() => { setStep(null); setError(''); setModal('confirm'); }}>Start over and request a new code</button>}
        </Modal>
      )}
    </section>
  );
}

// Change password: current + new (same rules as sign-up) -> 6-digit code sent to your email -> confirm.
function PasswordChange({ onDone }) {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(null); // null | { token, email }
  const [otp, setOtp] = useState('');
  const [modalError, setModalError] = useState('');
  const [notice, setNotice] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!step || seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const request = async (e) => {
    e.preventDefault();
    setError('');
    const issue = passwordProblem(f.next);
    if (issue) return setError(issue.replace('Password', 'New password'));
    if (f.next === f.current) return setError('New password must be different from the current one.');
    if (f.next !== f.confirm) return setError('New password and confirmation do not match.');
    setBusy(true);
    try {
      const r = await api('/users/me/password/request', { method: 'POST', body: { currentPassword: f.current, newPassword: f.next } });
      setStep({ token: r.challengeToken, email: r.email });
      setSeconds(r.resendAfterSeconds ?? 30);
      setOtp(''); setModalError(''); setNotice('');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true); setModalError('');
    try {
      const r = await api('/users/me/password', { method: 'PATCH', body: { challengeToken: step.token, otp } });
      if (r.token) localStorage.setItem('token', r.token); // other devices are signed out; this one stays signed in
      setStep(null); setF({ current: '', next: '', confirm: '' });
      onDone('Password updated. Other devices were signed out.');
      pingNotifications();
    } catch (err) { setModalError(err.message); } finally { setBusy(false); }
  };

  const resend = async () => {
    if (busy || seconds > 0) return;
    setBusy(true); setModalError(''); setNotice('');
    try {
      const r = await api('/users/me/password/resend', { method: 'POST', body: { challengeToken: step.token } });
      setStep({ token: r.challengeToken, email: r.email });
      setSeconds(r.resendAfterSeconds ?? 30); setOtp('');
      setNotice(r.message || 'A new code was sent.');
    } catch (err) { setModalError(err.message); } finally { setBusy(false); }
  };

  return (
    <>
    <form className="pf__card" onSubmit={request} noValidate>
      <h3>Change password</h3>
      <PasswordField label="Current password" value={f.current} onChange={(v) => setF({ ...f, current: v })} autoComplete="current-password" lenient />
      <PasswordField label="New password" value={f.next} onChange={(v) => setF({ ...f, next: v })} autoComplete="new-password" meter />
      <PasswordField label="Confirm new password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} autoComplete="new-password" error={f.confirm && f.next !== f.confirm ? 'Passwords do not match.' : ''} />
      {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
      <button type="submit" className="rp-btn rp-btn--primary" disabled={busy || !f.current || !f.next || !f.confirm}>{busy && !step ? 'Sending code...' : 'Send verification code'}</button>
      <div className="rp-hint" style={{ marginTop: 8 }}>We email a 6-digit code to confirm the change.</div>
    </form>

      {step && (
        <Modal title="Confirm password change" icon="mail" locked maxWidth={400} subtitle={<>Enter the 6-digit code sent to <strong>{step.email}</strong>. It expires in 5 minutes.</>}>
          <div>
            {modalError && <div className="rp-alert rp-alert--bad" role="alert">{modalError}</div>}
            {notice && <div className="rp-alert rp-alert--ok" role="status">{notice}</div>}
            <OtpField value={otp} onChange={setOtp} />
            <button type="button" className="rp-btn rp-btn--primary rp-btn--block" disabled={busy || otp.length !== 6} onClick={confirm}>{busy ? 'Saving...' : 'Confirm and update password'}</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
              <button type="button" className="rp-link" disabled={busy || seconds > 0} onClick={resend}>{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</button>
              <button type="button" className="rp-link" style={{ color: '#64748b' }} onClick={() => setStep(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
