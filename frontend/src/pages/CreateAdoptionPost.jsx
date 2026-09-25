import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAdoptionPost() {
  const navigate = useNavigate();

  const [animalType, setAnimalType] = useState('dog');
  const [gender, setGender] = useState('male');
  const [uploadedPhotos, setUploadedPhotos] = useState([
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'
  ]);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b', paddingBottom: '60px' }}>
      
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* BACK BUTTON */}
        <div style={{ marginBottom: '16px' }}>
          <button 
            onClick={() => navigate('/pet-adoption')}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ← Back to Pet Adoption Feed
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          {/* HEADER */}
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Pet for Adoption
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 32px 0', lineHeight: '1.5' }}>
            Connect your foster rescue with verified adopters. Share their personality, care routine, and health status to find their ideal forever home.
          </p>

          {/* SECTION 1: PET IDENTITY & CATEGORY */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>1</span>
                Pet Identity & Category
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>* Required fields</span>
            </div>

            {/* ANIMAL TYPE SELECTOR */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Animal Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
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
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ backgroundColor: '#a04322', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🐶</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Dog</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Canine rescue companion</div>
                  </div>
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
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ backgroundColor: '#e2e8f0', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🐱</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Cat</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Feline rescue friend</div>
                  </div>
                </div>

              </div>
            </div>

            {/* PET NAME & GENDER */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Pet Name *</label>
                <input type="text" defaultValue="Buster" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Gender *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={() => setGender('male')}
                    style={{ padding: '9px', border: gender === 'male' ? '1px solid #c25e38' : '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: gender === 'male' ? '#fff7ed' : '#fff', color: gender === 'male' ? '#c25e38' : '#475569', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    ♂ Male
                  </button>
                  <button 
                    onClick={() => setGender('female')}
                    style={{ padding: '9px', border: gender === 'female' ? '1px solid #c25e38' : '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: gender === 'female' ? '#fff7ed' : '#fff', color: gender === 'female' ? '#c25e38' : '#475569', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    ♀ Female
                  </button>
                </div>
              </div>
            </div>

            {/* AGE, BREED & STATUS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Estimated Age *</label>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#f8fafc', outline: 'none' }}>
                  <option>Young (1.5 Years)</option>
                  <option>Puppy/Kitten (Under 1 Year)</option>
                  <option>Adult (2-6 Years)</option>
                  <option>Senior (7+ Years)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Breed / Mix Description</label>
                <input type="text" defaultValue="Golden Shepherd Mix" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Initial Post Status</label>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#f8fafc', outline: 'none' }}>
                  <option>Ready for Home</option>
                  <option>In Foster Care</option>
                  <option>Needs Medical Care First</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PET PHOTOS & GALLERY */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>2</span>
                Pet Photos & Gallery
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Up to 6 images</span>
            </div>

            {/* UPLOAD BOX */}
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px 20px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🖼️</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Upload photos of your foster pet</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 12px 0' }}>
                Clear, well-lit photos showing their face and body help pets find loving homes faster. Supports JPG, PNG up to 10MB each.
              </div>
              <button style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '6px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                Browse Photo Library
              </button>
            </div>

            {/* UPLOADED THUMBNAILS */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Current Uploaded Photos (First is Cover)</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} style={{ width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
                    <img src={url} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                
                <div style={{ width: '90px', height: '90px', borderRadius: '8px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                  <span style={{ fontSize: '18px' }}>+</span>
                  <span style={{ fontSize: '10px' }}>Add Photo</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: DESCRIPTION & CAPTION */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Household Compatibility & Training Attributes</label>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>285 characters</span>
            </div>
            <textarea 
              defaultValue="Meet Buster! A gentle, resilient boy who was found stray and has blossomed in foster care. He loves brisk morning walks, snoozing by your feet while you work, and shows remarkable patience with older kids. He is fully crate-trained, quiet through the night, and ready for a patient, loving forever companion."
              style={{ width: '100%', height: '90px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', lineHeight: '1.5' }}
            />
          </div>

          {/* SECTION 4: FOSTER CAREGIVER & SCREENING */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#ffedd5', color: '#c25e38', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>3</span>
                Foster Caregiver & Screening Criteria
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Coordination Logistics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Primary Foster Caregiver</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '14px' }}>👤</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', flex: 1 }}>Sarah Jenkins</span>
                  <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>VERIFIED FOSTER</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Removal Area / City *</label>
                <input type="text" defaultValue="Mission Valley Area" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', maxWidth: '380px', lineHeight: '1.4' }}>
              ℹ️ Your listing is published immediately to verified adopters. You can review applicant questionnaires and schedule meet-and-greets at your own pace.
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => navigate('/pet-adoption')}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button 
                onClick={() => {
                  alert('Pet Adoption Listing published successfully!');
                  navigate('/pet-adoption');
                }}
                style={{ backgroundColor: '#8c3518', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📢 Publish Adoption Post
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}