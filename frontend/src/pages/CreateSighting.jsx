import React, { useState } from 'react';

export default function CreateSighting() {
  const [animalType, setAnimalType] = useState('dog');
  const [urgencyLevel, setUrgencyLevel] = useState('healthy');
  const [receiveUpdates, setReceiveUpdates] = useState(true);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b', paddingBottom: '40px' }}>
      
      {/* HEADER / NAVIGATION BAR */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>
          <span style={{ backgroundColor: '#c25e38', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>RP</span>
          RescuePaws
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b', alignItems: 'center' }}>
          <span>Home</span>
          <span>Sightings</span>
          <span>Pet Adoption</span>
          <button style={{ backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Report Sighting</button>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div style={{ maxWidth: '680px', margin: '24px auto', padding: '0 16px' }}>
        
        {/* BACK LINK */}
        <div style={{ marginBottom: '16px' }}>
          <a href="#back" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Back to Sighting Feed
          </a>
        </div>

        {/* MAIN CARD */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
            📜 COMMUNITY RESCUE LOG
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Report an Animal Sighting</h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 24px 0' }}>
            Share details with local volunteers and foster caregivers to quickly coordinate rescue, safe shelter, or reunite lost pets.
          </p>

          {/* SECTION 1 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>1</span>
              Animal Category & Appearance
            </div>

            {/* ANIMAL TYPE SELECTOR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div 
                onClick={() => setAnimalType('dog')}
                style={{ 
                  border: animalType === 'dog' ? '2px solid #c25e38' : '1px solid #e2e8f0', 
                  backgroundColor: animalType === 'dog' ? '#fff7ed' : '#fff', 
                  borderRadius: '10px', 
                  padding: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ backgroundColor: '#c25e38', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐶</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Dog</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Stray, lost, or wandering canine</div>
                </div>
              </div>

              <div 
                onClick={() => setAnimalType('cat')}
                style={{ 
                  border: animalType === 'cat' ? '2px solid #c25e38' : '1px solid #e2e8f0', 
                  backgroundColor: animalType === 'cat' ? '#fff7ed' : '#fff', 
                  borderRadius: '10px', 
                  padding: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ backgroundColor: '#e2e8f0', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐱</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Cat</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Feral, lost domestic, or stray feline</div>
                </div>
              </div>
            </div>

            {/* SIZE & FEATURES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Approximate Size *</label>
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', color: '#334155', backgroundColor: '#f8fafc' }}>
                  <option>Medium (20 - 50 lbs / adult cat or mid dog)</option>
                  <option>Small (Under 20 lbs)</option>
                  <option>Large (Over 50 lbs)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Key Features / Collar / Coat</label>
                <input type="text" placeholder="e.g. Red woven collar, white chest patch, limp" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>2</span>
                Photo of the Animal
              </div>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#c25e38', letterSpacing: '0.5px' }}>RECOMMENDED</span>
            </div>

            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🖼️</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Click to upload or drag & drop</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>PNG, JPG, or WEBP up to 10MB</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px' }}>✓ Clear photos help local fosters verify breeds & matches</div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>3</span>
              Location & Sighting Timing
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Neighborhood or Landmark Location *</label>
                <input type="text" placeholder="📍 e.g. Beside North Park gazebo, near 4th Ave bakery" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>When Spotted *</label>
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#f8fafc' }}>
                  <option>Earlier today</option>
                  <option>Just now</option>
                  <option>Yesterday</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Observed Condition / Urgency Level *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
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
                      border: urgencyLevel === item.id ? '1px solid #c25e38' : '1px solid #e2e8f0', 
                      backgroundColor: urgencyLevel === item.id ? '#fff7ed' : '#fff',
                      padding: '8px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      cursor: 'pointer' 
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>4</span>
              Volunteer Field Notes & Dispatch Contact
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Behavioral Clues & Exact Spotting Context</label>
              <textarea 
                placeholder="e.g. Scared of sudden movements. Friendly when whistled. Was drinking water from a puddle behind the laundromat."
                style={{ width: '100%', height: '60px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Reporter Phone (Optional)</label>
                <input type="text" placeholder="📞 (555) 234-8902" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={receiveUpdates} 
                  onChange={(e) => setReceiveUpdates(e.target.checked)} 
                  id="updates" 
                />
                <label htmlFor="updates" style={{ fontSize: '10px', color: '#334155', cursor: 'pointer' }}>
                  <strong>Receive Rescue Updates</strong><br/>
                  <span style={{ color: '#64748b' }}>Alert me immediately when a volunteer heads out</span>
                </label>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <button style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel & Return to Feed
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                📁 Save Draft
              </button>
              <button style={{ backgroundColor: '#8c3518', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📢 Publish Sighting Post
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', marginTop: '16px', fontSize: '10px', color: '#64748b' }}>
            ℹ️ Your post will appear instantly in the community Sighting Feed with an active <strong>Needs Help</strong> status tag.
          </div>

        </div>
      </div>

    </div>
  );
}