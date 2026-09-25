import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 🔹 FALLBACK DATA
const defaultSightings = [
  {
    id: 'SGT-001',
    name: 'Milo (Calico Cat)',
    description: 'Spotted near the University Library. Very friendly and looks well-fed.',
    location: 'Main Library Plaza',
    time: '10 mins ago',
    image: '/milo.jpg',
    badge: 'Needs Foster',
    badgeBg: '#e11d48',
    type: 'Cat',
    sighter: 'Sarah K.'
  },
  {
    id: 'SGT-002',
    name: 'Brownie (Askal/Stray)',
    description: 'Resting near the Student Union cafeteria. Has a blue collar.',
    location: 'Student Center',
    time: '1 hour ago',
    image: '/bruno.jpg',
    badge: 'Spotted',
    badgeBg: '#0284c7',
    type: 'Dog',
    sighter: 'Mark T.'
  },
  {
    id: 'SGT-003',
    name: 'Luna (White Kitten)',
    description: 'Found hiding near the Engineering Lab building entrance.',
    location: 'Engg Complex',
    time: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=500',
    badge: 'Needs Foster',
    badgeBg: '#e11d48',
    type: 'Cat',
    sighter: 'Anna R.'
  }
];

export default function Home() {
  const [selectedPet, setSelectedPet] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Reports');
  const [sightingsData, setSightingsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: welcome-back modal shown once after login
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('justLoggedIn');
    if (raw) {
      try {
        setWelcomeUser(JSON.parse(raw));
        setShowWelcome(true);
      } catch (e) {
        // ignore malformed data
      }
      sessionStorage.removeItem('justLoggedIn');
    }
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/sightings')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSightingsData(data);
        } else {
          setSightingsData(defaultSightings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching sightings, using default data:', err);
        setSightingsData(defaultSightings);
        setLoading(false);
      });
  }, []);

  const filteredSightings = sightingsData.filter((pet) => {
    if (activeFilter === 'Needs Foster') return pet.needsFoster || pet.badge?.includes('Needs Foster');
    if (activeFilter === 'Dogs Only') return pet.type === 'Dog' || pet.name?.toLowerCase().includes('dog');
    if (activeFilter === 'Cats Only') return pet.type === 'Cat' || pet.name?.toLowerCase().includes('cat');
    return true;
  });

  const homeDisplaySightings = filteredSightings.slice(0, 3);
  const filterOptions = ['All Reports', 'Needs Foster', 'Dogs Only', 'Cats Only'];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b' }}>
      
      {/* HERO SECTION */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '48px 20px', display: 'flex', gap: '40px', alignItems: 'center' }}>
        <div style={{ flex: '1.2' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#c25e38', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            🐾 COMMUNITY-LED DOG & CAT RESCUE
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#0f172a', margin: '12px 0 16px 0', lineHeight: '1.25' }}>
            Welcome to RescuePaws — <br />
            Connecting Rescued Pets with Loving Homes
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '28px', maxWidth: '520px' }}>
            Dedicated community volunteers caring for rescued cats, dogs, and other animals in need. Connecting verified foster homes and loving adopters to give every rescued pet a second chance at life.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/adoption" style={{ backgroundColor: '#c25e38', color: '#fff', padding: '12px 22px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(194, 94, 56, 0.2)' }}>
              🐾 Go to Browse Pets
            </Link>
            <Link to="/report-sighting" style={{ backgroundColor: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '12px 22px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📷 Report a Sighting
            </Link>
          </div>
        </div>

        <div style={{ flex: '0.9', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800" 
              alt="Rescued Golden Retriever" 
              style={{ width: '380px', height: '270px', borderRadius: '14px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ backgroundColor: '#f1f5f9', padding: '56px 20px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>TRANSPARENT LIFECYCLE</span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '6px 0 0 0' }}>How RescuePaws Coordinates Care</h2>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '380px', margin: 0, textAlign: 'right', lineHeight: '1.5' }}>
              Every report triggers a collaborative campus pipeline that protects lost pets, supports students, and prevents shelter overflow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#c25e38', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>1</span>
                <span style={{ fontSize: '18px' }}>📸</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Report Sighting</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Share a quick photo and nearby campus location. Our local volunteer and foster network is promptly notified to check on the animal.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> Open reporting for all campus students and neighbors
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#c25e38', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>2</span>
                <span style={{ fontSize: '18px' }}>🐾</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Foster & Medical Care</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                University animal care volunteers intake the pet for microchip scanning, emergency hydration, core vaccines, and placement in vetted dorms or homes.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> Partnered with Southside Vet Hospital
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ccfbf1', color: '#0f766e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>3</span>
                <span style={{ fontSize: '18px' }}>📋</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Apply to Adopt</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Found your companion? Submit an adoption request. You will then complete our simple Readiness Check verifying housing guidelines and pet care budget.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> Readiness Check Initiative after application
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT FOSTER SIGHTINGS */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '56px 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🐾</span> Recent Foster Sightings
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Showing latest reports • <Link to="/sightings" style={{ color: '#c25e38', fontWeight: 'bold', textDecoration: 'none' }}>View all sightings ({sightingsData.length}) ➔</Link>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  style={{
                    border: 'none',
                    backgroundColor: isActive ? '#c25e38' : 'transparent',
                    color: isActive ? '#fff' : '#475569',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isActive ? 'bold' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* CARDS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Naglo-load ng mga sightings...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {homeDisplaySightings.length > 0 ? (
                homeDisplaySightings.map((pet, idx) => (
                  <div key={pet._id || pet.id || idx} style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* IMAGE */}
                    <div style={{ height: '190px', position: 'relative' }}>
                      <img src={pet.image || pet.imageUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: pet.badgeBg || '#0284c7', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600' }}>
                        {pet.badge || '📍 Sighting'}
                      </span>
                    </div>

                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                          <span>⏱️ {pet.time || 'Recently'}</span>
                          <span>ID: {pet.id || pet._id}</span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>{pet.name}</h3>
                        <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                          {pet.desc || pet.description}
                        </p>
                      </div>

                      <div style={{ 
                        backgroundColor: '#fff7ed', 
                        border: '1px solid #ffedd5', 
                        borderRadius: '10px', 
                        padding: '12px', 
                        marginTop: '8px' 
                      }}>
                        <div style={{ fontSize: '11px', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>📍 <strong>Location:</strong> {pet.location}</span>
                          <button 
                            onClick={() => setSelectedPet(pet)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#c25e38', 
                              fontWeight: 'bold', 
                              cursor: 'pointer', 
                              padding: 0, 
                              fontSize: '11px' 
                            }}
                          >
                            Details ➔
                          </button>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                          👤 Reported by {pet.sighter || pet.reportedBy || 'Anonymous'}
                        </div>
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Walang nakitang pet sa filter na ito.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <Link 
                to="/sightings" 
                style={{ 
                  display: 'inline-block',
                  backgroundColor: '#fff', 
                  color: '#c25e38', 
                  border: '1px solid #c25e38', 
                  padding: '11px 26px', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  fontWeight: '700', 
                  fontSize: '13px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                See All Sightings ({sightingsData.length} Total Posts) ➔
              </Link>
            </div>
          </>
        )}
      </section>

      {/* CALL TO ACTION BANNER */}
      <section style={{ maxWidth: '1140px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
              Ready to welcome a rescued dog or cat into your home?
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Campus dogs and cats currently in foster care. Submit an application on any pet profile to begin the guided adoption and readiness process.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/adoption" style={{ backgroundColor: '#c25e38', color: '#fff', padding: '11px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
              🐾 Browse Adoptable Dogs & Cats
            </Link>
            <button 
              onClick={() => setShowHowItWorks(true)}
              style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', padding: '11px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              How Adoption Works <span>🛡️</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '40px 20px 24px 20px', fontSize: '12px', color: '#64748b' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🐾</span> RescuePaws
              </div>
              <p style={{ margin: 0, lineHeight: '1.6', maxWidth: '300px', fontSize: '12px', color: '#64748b' }}>
                Campus-centered stray rescue, swift sightings reporting, and verified pet adoption platform.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>QUICK ACTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/report-sighting" style={{ color: '#64748b', textDecoration: 'none' }}>Report Sighting</Link>
                <Link to="/adoption" style={{ color: '#64748b', textDecoration: 'none' }}>Browse Adoptable Pets</Link>
                <span onClick={() => setShowHowItWorks(true)} style={{ cursor: 'pointer' }}>How Adoption Works</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>COMMUNITY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ cursor: 'pointer' }}>Campus Volunteer Network</span>
                <span style={{ cursor: 'pointer' }}>Emergency Vet Contacts</span>
                <span style={{ cursor: 'pointer' }}>Fostering Guidelines</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>ACCOUNT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Sign In</Link>
                <Link to="/register" style={{ color: '#64748b', textDecoration: 'none' }}>Register Volunteer Profile</Link>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
            <div>© 2025 RescuePaws Initiative. Built for compassionate campus pet rescue.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }}>Rescue Protocol</span>
            </div>
          </div>
        </div>
      </footer>

      {/* DETAILS MODAL POPUP */}
      {selectedPet && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', maxWidth: '480px', width: '90%', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <button 
              onClick={() => setSelectedPet(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}
            >
              ✕
            </button>
            <img src={selectedPet.image || selectedPet.imageUrl} alt={selectedPet.name} style={{ width: '100%', height: '220px', borderRadius: '12px', objectFit: 'cover', marginBottom: '16px' }} />
            <div style={{ fontSize: '12px', color: '#c25e38', fontWeight: 'bold', marginBottom: '4px' }}>{selectedPet.id || selectedPet._id} • {selectedPet.time || 'Recently'}</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>{selectedPet.name}</h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>{selectedPet.desc || selectedPet.description}</p>
            
            <div style={{ 
              backgroundColor: '#fff7ed', 
              border: '1px solid #ffedd5', 
              padding: '14px', 
              borderRadius: '10px', 
              fontSize: '12px', 
              color: '#475569', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              <div>📍 <strong style={{ color: '#0f172a' }}>Location:</strong> {selectedPet.location}</div>
              <div>👤 <strong style={{ color: '#0f172a' }}>Reported By:</strong> {selectedPet.sighter || selectedPet.reportedBy || 'Anonymous'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏷️ <strong style={{ color: '#0f172a' }}>Status:</strong> 
                <span style={{ 
                  backgroundColor: selectedPet.badgeBg || '#0284c7', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: '600' 
                }}>
                  {selectedPet.badge || 'Active'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedPet(null)} 
              style={{ width: '100%', backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', marginTop: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* HOW ADOPTION WORKS MODAL POPUP */}
      {showHowItWorks && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: '800' }}>How Adoption Works</h2>
              <button 
                onClick={() => setShowHowItWorks(false)} 
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', fontSize: '16px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
              Adopting through RescuePaws is a simple and secure process designed to ensure our campus rescue pets find loving, safe homes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#c25e38', fontSize: '14px', fontWeight: '700' }}>1. Browse & Choose</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  <li>Explore our list of available dogs and cats on the "Browse Pets" page.</li>
                  <li>Check their profiles for health and vaccination status, gender, and current foster location.</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#c25e38', fontSize: '14px', fontWeight: '700' }}>2. Submit an Application</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  <li>Click the "Request to adopt" button on the pet's profile and fill out the online application form.</li>
                  <li>Provide your basic contact information to verify your eligibility.</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#c25e38', fontSize: '14px', fontWeight: '700' }}>3. Post a Pet for Adoption</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  <li>Registered users can also click "Post a Pet for Adoption" to submit a dog or cat that needs a new home.</li>
                  <li>Upload photos, vaccination details, gender, and current foster location.</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#c25e38', fontSize: '14px', fontWeight: '700' }}>4. Screening & Review</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  The RescuePaws team reviews your application to match the pet's needs with your living environment.
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#c25e38', fontSize: '14px', fontWeight: '700' }}>5. Meet & Greet</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  Visit the pet at their current foster home to interact with them in person and ensure a great match.
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#c25e38', fontSize: '14px', fontWeight: '700' }}>6. Finalize & Welcome Home</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  Once approved, coordinate with the foster parent to bring your new furry friend home!
                </p>
              </div>

            </div>

            <button 
              onClick={() => setShowHowItWorks(false)}
              style={{ width: '100%', marginTop: '20px', backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Got it!
            </button>

          </div>
        </div>
      )}

      {/* WELCOME BACK MODAL POPUP — shown once after login */}
      {showWelcome && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '36px 32px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Successfully Logged in!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>
              Welcome back{welcomeUser?.name ? `, ${welcomeUser.name}` : ''}! You're all set to explore RescuePaws.
            </p>
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              style={{
                width: '100%',
                backgroundColor: '#9E4624',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}