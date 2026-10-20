import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icons';

// One common card shape for both kinds of post
export const fromSighting = (s) => ({ key: `s-${s._id}`, kind: 'stray', id: s._id, _id: s._id, animal: s.animalType, image: s.image, mine: s.isMine, title: s.name, location: s.location, cityMunicipalityCode: s.cityMunicipalityCode, barangayCode: s.barangayCode, latitude: s.latitude, longitude: s.longitude, time: s.time, text: s.description, createdAt: s.createdAt, poster: s.poster, chips: [s.approximateSize && `${s.approximateSize} size`, s.condition].filter(Boolean), badge: s.badge });
export const fromAdoption = (p) => ({ key: `a-${p._id}`, kind: 'foster', id: p._id, _id: p._id, animal: p.animalType, image: p.image, mine: p.isMine, title: p.petName, location: p.location, cityMunicipalityCode: p.cityMunicipalityCode, barangayCode: p.barangayCode, availableInDagupan: p.availableInDagupan !== false, latitude: p.latitude, longitude: p.longitude, time: p.time, text: p.description, createdAt: p.createdAt, poster: p.poster, chips: [p.gender, p.age, p.breed].filter(Boolean), badge: p.statusTag });

const since = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

export function PosterChip({ poster, time, meId }) {
  const navigate = useNavigate();
  const linkable = !!poster?.id;
  const go = () => navigate(meId && poster.id === meId ? '/profile' : `/user/${poster.id}`);
  const initial = (poster?.name || '?')[0].toUpperCase();
  const body = (
    <>
      {poster?.avatar
        ? <img className="rp-avatar" src={poster.avatar} alt="" style={{ width: 42, height: 42 }} />
        : <span className="rp-avatar" style={{ width: 42, height: 42, fontSize: 16 }}>{initial}</span>}
      <span className="pc__poster-text">
        <strong>{poster?.name || 'Deleted user'}</strong>
        <small>{[time, poster?.memberSince && `Member since ${since(poster.memberSince)}`].filter(Boolean).join(' · ')}</small>
      </span>
    </>
  );
  return linkable
    ? <button type="button" className="pc__poster" onClick={go} aria-label={`View ${poster.name}'s profile`}>{body}</button>
    : <div className="pc__poster pc__poster--static">{body}</div>;
}

export default function PostCard({ item, meId, isLoggedIn, alreadySent, onAction, onReport }) {
  const isStray = item.kind === 'stray';
  return (
    <article className="pc">
      <header className="pc__head">
        <PosterChip poster={item.poster} time={item.time} meId={meId} />
        {!item.mine && (
          <button type="button" className="pc__flag" onClick={() => onReport(item)} aria-label="Report this post" title="Report this post"><Icon name="flag" size={17} /></button>
        )}
      </header>

      <div className="pc__photo">
        <img src={item.image} alt={item.title} loading="lazy" />
        <span className={`pc__kind pc__kind--${item.kind}`}>{isStray ? 'Sighting' : 'For adoption'}</span>
        <span className="pc__animal">{item.animal}</span>
      </div>

      <div className="pc__body">
        <h3>{item.title}</h3>
        {item.kind === 'foster' && !item.availableInDagupan && <p className="pc__unavailable" role="status">Unavailable for adoption: location not confirmed in Dagupan City</p>}
        <div className="pc__meta"><Icon name="pin" size={15} /> <span>{item.location}</span></div>
        {item.chips.length > 0 && <div className="pc__chips">{item.chips.map((c) => <span key={c}>{c}</span>)}</div>}
        {item.text && <p className="pc__text">{item.text}</p>}

        <div className="pc__actions">
          {item.mine ? (
            <span className="pc__mine">This is your post</span>
          ) : item.kind === 'foster' && !item.availableInDagupan ? (
            <button type="button" className="rp-btn rp-btn--ghost" disabled>Unavailable</button>
          ) : (
            <button type="button" className="rp-btn rp-btn--primary" onClick={() => onAction(item)} disabled={alreadySent}>
              {alreadySent ? <><Icon name="check" size={15} stroke={3} /> Sent</> : isStray ? 'I adopted this stray' : 'Request to adopt'}
            </button>
          )}
          {!isLoggedIn && !item.mine && <span className="pc__hint">Log in to respond</span>}
        </div>
      </div>
    </article>
  );
}
