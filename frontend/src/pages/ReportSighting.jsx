import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ReportSighting() {
  const navigate = useNavigate();

  const [animalType, setAnimalType] = useState('dog');
  const [urgencyLevel, setUrgencyLevel] = useState('healthy');
  const [receiveUpdates, setReceiveUpdates] = useState(true);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b', paddingBottom: '60px' }}>
      
      {/* FORM CONTAINER */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* BACK LINK */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/sightings')}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ← Back to Sighting Feed
          </button>
        </div>

        {/* MAIN CARD */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          {/* HEADER */}
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📜</span> COMMUNITY RESCUE LOG
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Report an Animal Sighting
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 32px 0', lineHeight: '1.5' }}>
            Share details with local volunteers and foster caregivers to quickly coordinate rescue, safe shelter, or reunite lost pets.
          </p>

          {/* SECTION 1: ANIMAL CATEGORY & APPEARANCE */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>1</span>
              Animal Category & Appearance
            </div>

            {/* ANIMAL TYPE SELECTOR */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Animal Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                
                {/* DOG CARD */}
                <div 
                  onClick={() => setAnimalType('dog')}
                  style={{ 
                    border: animalType === 'dog' ? '2px solid #c25e38' : '1px solid #e2e8f0', 
                    backgroundColor: animalType === 'dog' ? '#fff7ed' : '#fff', 
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#a04322', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🐶</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Dog</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Stray, lost, or wandering canine</div>
                    </div>
                  </div>
                  {animalType === 'dog' && <span style={{ color: '#c25e38', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                </div>

                {/* CAT CARD */}
                <div 
                  onClick={() => setAnimalType('cat')}
                  style={{ 
                    border: animalType === 'cat' ? '2px solid #c25e38' : '1px solid #e2e8f0', 
                    backgroundColor: animalType === 'cat' ? '#fff7ed' : '#fff', 
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#e2e8f0', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🐱</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Cat</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Feral, lost domestic, or stray feline</div>
                    </div>
                  </div>
                  {animalType === 'cat' && <span style={{ color: '#c25e38', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                </div>

              </div>
            </div>

            {/* SIZE & FEATURES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Approximate Size *</label>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#f8fafc', outline: 'none' }}>
                  <option>Medium (20 - 50 lbs / adult cat or mid dog)</option>
                  <option>Small (Under 20 lbs)</option>
                  <option>Large (Over 50 lbs)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Key Features / Collar / Coat</label>
                <input type="text" placeholder="e.g. Red woven collar, white chest patch, limp" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: PHOTO OF THE ANIMAL */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>2</span>
                Photo of the Animal
              </div>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#c25e38', letterSpacing: '0.5px' }}>RECOMMENDED</span>
            </div>

            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🖼️</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Click to upload or drag & drop</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>PNG, JPG, or WEBP up to 10MB</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span>✓ Clear photos help local fosters verify breeds & matches</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION & TIMING */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>3</span>
              Location & Sighting Timing
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Neighborhood or Landmark Location *</label>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>No coordinates needed</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>📍</span>
                  <input type="text" placeholder="e.g. Beside North Park gazebo, near 4th Ave bakery" style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>When Spotted *</label>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', outline: 'none' }}>
                  <option>Earlier today</option>
                  <option>Just now</option>
                  <option>Yesterday</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Observed Condition / Urgency Level *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'healthy', title: 'Appears Healthy', desc: 'Wandering / active' },
                  { id: 'vet', title: 'Needs Vet Care', desc: 'Limping / visible hurt' },
                  { id: 'trapped', title: 'Trapped or Scared', desc: 'Hiding in bushes / ...' },
                  { id: 'calm', title: 'Calm / Eating', desc: 'Peaceful, approach...' }
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setUrgencyLevel(item.id)}
                    style={{ 
                      border: urgencyLevel === item.id ? '2px solid #c25e38' : '1px solid #e2e8f0', 
                      backgroundColor: urgencyLevel === item.id ? '#fff7ed' : '#fff',
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: VOLUNTEER FIELD NOTES */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>4</span>
              Volunteer Field Notes & Dispatch Contact
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Behavioral Clues & Exact Spotting Context</label>
              <textarea 
                placeholder="e.g. Scared of sudden movements. Friendly when whistled. Was drinking water from a puddle behind the laundromat."
                style={{ width: '100%', height: '70px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Reporter Phone (Optional)</label>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Volunteers only</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>📞</span>
                  <input type="text" placeholder="(555) 234-8902" style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingTop: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={receiveUpdates} 
                  onChange={(e) => setReceiveUpdates(e.target.checked)} 
                  id="updates" 
                  style={{ marginTop: '2px', accentColor: '#c25e38', cursor: 'pointer' }}
                />
                <label htmlFor="updates" style={{ fontSize: '11px', color: '#334155', cursor: 'pointer', lineHeight: '1.4' }}>
                  <strong>Receive Rescue Updates</strong><br/>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>Alert me immediately when a volunteer heads out or claims this rescue.</span>
                </label>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <button 
              onClick={() => navigate('/sightings')}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel & Return to Feed
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📂 Save Draft
              </button>
              <button 
                onClick={() => {
                  alert('Sighting Post published successfully!');
                  navigate('/sightings');
                }}
                style={{ backgroundColor: '#8c3518', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📢 Publish Sighting Post
              </button>
            </div>
          </div>

          {/* FOOTER INFO */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 14px', borderRadius: '8px', marginTop: '20px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>ℹ️</span> Your post will appear instantly in the community Sighting Feed with an active <strong>Needs Help</strong> status tag. Nearby caregivers are notified automatically.
          </div>

        </div>
      </div>

    </div>
  );
}