import React, { useState } from 'react';

const AdoptionRequestValidation = () => {
  const [formData, setFormData] = useState({
    fullName: 'Alex Vance',
    phone: '(555) 349-2180',
    email: 'alex.vance@rescuepaws.community',
    workMode: 'Hybrid (2-3 days remote)',
    address: '418 Oak Ridge Way, Maplewood',
    housingType: 'Single Family House',
    ownershipStatus: 'Own Residence',
    yardType: 'Fully Fenced Private Yard',
    allowPetsConfirmed: true,
    currentPets: '1 Dog (Friendly)',
    hoursAlone: '0 - 3 Hours',
    vetCareCommitted: 'Yes, I am fully committed to regular vet checku',
    experience: 'Experienced dog owner (had 2+ dogs)',
    notes: 'Hi Sarah! I love Buster\'s warm energy and gentle eyes. I work 3 days from home, take daily morning walks in the river park, and have an enclosed backyard with a 6ft cedar fence...'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Application Data:', formData);
    alert('Adoption Request Submitted Successfully!');
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        
        {/* Title Header */}
        <div style={styles.topHeader}>
          <span style={styles.categoryBadge}>🐾 ADOPTION READINESS PROCESS</span>
          <h1 style={styles.mainTitle}>Adoption Request & Validation</h1>
          <p style={styles.subTitle}>
            Complete these 4 simple steps to connect directly with the foster caregiver. Straightforward, verified, and free of complex checks.
          </p>
        </div>

        {/* Pet Summary Card */}
        <div style={styles.card}>
          <div style={styles.petCardContent}>
            <div style={styles.petImageContainer}>
              <img 
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300" 
                alt="Buster" 
                style={styles.petImage} 
              />
            </div>
            <div style={styles.petDetails}>
              <div style={styles.badgeRow}>
                <span style={styles.badgeWarning}>DOG • FRIENDLY</span>
                <span style={styles.badgeInfo}>In Foster Care</span>
              </div>
              <h2 style={styles.petTitle}>Applying to Adopt: Buster</h2>
              <p style={styles.petMeta}>
                <span>Age: <strong>1.5 Years</strong></span> • 
                <span>Foster Caregiver: <strong>Sarah Jenkins</strong></span> • 
                <span>ID: <strong>#DOG-8841</strong></span>
              </p>
            </div>
            <button type="button" style={styles.changePetBtn}>
              <span style={{ marginRight: '4px' }}>⇆</span> Change Pet
            </button>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div style={styles.card}>
          <div style={styles.stepperContainer}>
            {/* Step 1 */}
            <div style={{ ...styles.stepItem, opacity: 0.8 }}>
              <div style={styles.stepIconCompleted}>✓</div>
              <div>
                <div style={styles.stepLabelSmall}>Step 1</div>
                <div style={styles.stepTitle}>Identify</div>
              </div>
            </div>

            {/* Step 2 (Active) */}
            <div style={{ ...styles.stepItem, ...styles.stepItemActive }}>
              <div style={styles.stepIconActive}>2</div>
              <div>
                <div style={styles.stepLabelActiveSmall}>Current</div>
                <div style={styles.stepTitleActive}>Household</div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ ...styles.stepItem, opacity: 0.4 }}>
              <div style={styles.stepIconDisabled}>3</div>
              <div>
                <div style={styles.stepLabelSmall}>Step 3</div>
                <div style={styles.stepTitle}>Readiness</div>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ ...styles.stepItem, opacity: 0.4 }}>
              <div style={styles.stepIconDisabled}>4</div>
              <div>
                <div style={styles.stepLabelSmall}>Step 4</div>
                <div style={styles.stepTitle}>Review</div>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div style={styles.progressTrack}>
            <div style={styles.progressBarFill}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Section A: Applicant Verification */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleRow}>
                <span style={styles.sectionIcon}>🪪</span>
                <h3 style={styles.sectionTitle}>Section A: Applicant Verification</h3>
              </div>
              <span style={styles.verifiedTag}>Verified Profile</span>
            </div>
            <p style={styles.sectionDescription}>
              Basic contact data to match your user account with shelter foster records.
            </p>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Full Legal Name *</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName} 
                  onChange={handleChange}
                  style={styles.input} 
                  required 
                />
              </div>
              <div>
                <label style={styles.label}>Phone Number *</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange}
                  style={styles.input} 
                  required 
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  style={styles.input} 
                  required 
                />
              </div>
              <div>
                <label style={styles.label}>Occupation / Work Mode</label>
                <select 
                  name="workMode" 
                  value={formData.workMode} 
                  onChange={handleChange} 
                  style={styles.select}
                >
                  <option value="Hybrid (2-3 days remote)">Hybrid (2-3 days remote)</option>
                  <option value="Fully Remote">Fully Remote</option>
                  <option value="On-site / Full Time">On-site / Full Time</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Residential Street Address *</label>
              <input 
                type="text" 
                name="address"
                value={formData.address} 
                onChange={handleChange}
                style={styles.input} 
                required 
              />
            </div>
          </div>

          {/* Section B: Household & Living Environment */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleRow}>
                <span style={styles.sectionIcon}>🏠</span>
                <h3 style={styles.sectionTitle}>Section B: Household & Living Environment</h3>
              </div>
            </div>
            <p style={styles.sectionDescription}>
              Ensures Buster fits your accommodation style and family space safely.
            </p>

            {/* Housing Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Housing Type *</label>
              <div style={styles.grid3}>
                {[
                  { id: 'Apartment / Flat', title: 'Apartment / Flat', sub: 'Shared building access' },
                  { id: 'Single Family House', title: 'Single Family House', sub: 'Standalone residential' },
                  { id: 'Townhouse / Condo', title: 'Townhouse / Condo', sub: 'Private entrance patio' },
                ].map((item) => (
                  <label 
                    key={item.id} 
                    style={{
                      ...styles.radioCard,
                      ...(formData.housingType === item.id ? styles.radioCardSelected : {})
                    }}
                  >
                    <input 
                      type="radio" 
                      name="housingType" 
                      value={item.id} 
                      checked={formData.housingType === item.id} 
                      onChange={handleChange}
                      style={styles.radioInput}
                    />
                    <div>
                      <div style={styles.radioTitle}>{item.title}</div>
                      <div style={styles.radioSub}>{item.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Ownership & Yard */}
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Ownership Status *</label>
                <select 
                  name="ownershipStatus" 
                  value={formData.ownershipStatus} 
                  onChange={handleChange} 
                  style={styles.select}
                >
                  <option value="Own Residence">Own Residence</option>
                  <option value="Renting (Landlord Approved)">Renting (Landlord Approved)</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Yard / Outdoor Space</label>
                <select 
                  name="yardType" 
                  value={formData.yardType} 
                  onChange={handleChange} 
                  style={styles.select}
                >
                  <option value="Fully Fenced Private Yard">Fully Fenced Private Yard</option>
                  <option value="Partially Fenced Yard">Partially Fenced Yard</option>
                  <option value="No Yard (Public Parks Nearby)">No Yard (Public Parks Nearby)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Confirmation */}
            <div style={styles.checkboxBanner}>
              <input 
                type="checkbox" 
                id="allowPetsConfirmed"
                name="allowPetsConfirmed"
                checked={formData.allowPetsConfirmed} 
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="allowPetsConfirmed" style={styles.checkboxText}>
                I confirm that animals are permitted on the property, and that landlord or HOA guidelines permit a dog up to 55 lbs without breed restrictions.
              </label>
            </div>

            {/* Current Pets */}
            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>Current Pets in Your Household</label>
              <div style={styles.grid3}>
                {[
                  { id: 'No other pets', title: 'No other pets', sub: '' },
                  { id: '1 Dog (Friendly)', title: '1 Dog (Friendly)', sub: '' },
                  { id: 'Cats Only', title: 'Cats Only', sub: '' },
                ].map((item) => (
                  <label 
                    key={item.id} 
                    style={{
                      ...styles.radioCard,
                      ...(formData.currentPets === item.id ? styles.radioCardSelected : {})
                    }}
                  >
                    <input 
                      type="radio" 
                      name="currentPets" 
                      value={item.id} 
                      checked={formData.currentPets === item.id} 
                      onChange={handleChange}
                      style={styles.radioInput}
                    />
                    <div style={styles.radioTitle}>{item.title}</div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Section C: Pet Readiness & Routine */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleRow}>
                <span style={styles.sectionIcon}>⏰</span>
                <h3 style={styles.sectionTitle}>Section C: Pet Readiness & Routine</h3>
              </div>
            </div>
            <p style={styles.sectionDescription}>
              Practical care habits and veterinary dedication.
            </p>

            {/* Hours Alone */}
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Estimated Hours Buster will be Alone Daily *</label>
              <div style={styles.grid3}>
                {[
                  { id: '0 - 3 Hours', title: '0 - 3 Hours', sub: 'Ideal for younger pups' },
                  { id: '4 - 6 Hours', title: '4 - 6 Hours', sub: 'Standard work shift' },
                  { id: '7+ Hours', title: '7+ Hours', sub: 'Pet walker planned' },
                ].map((item) => (
                  <label 
                    key={item.id} 
                    style={{
                      ...styles.radioCard,
                      ...(formData.hoursAlone === item.id ? styles.radioCardSelected : {})
                    }}
                  >
                    <input 
                      type="radio" 
                      name="hoursAlone" 
                      value={item.id} 
                      checked={formData.hoursAlone === item.id} 
                      onChange={handleChange}
                      style={styles.radioInput}
                    />
                    <div>
                      <div style={styles.radioTitle}>{item.title}</div>
                      <div style={styles.radioSub}>{item.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Vet Care & Experience */}
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Annual Vet Care & Vaccinations *</label>
                <select 
                  name="vetCareCommitted" 
                  value={formData.vetCareCommitted} 
                  onChange={handleChange} 
                  style={styles.select}
                >
                  <option value="Yes, I am fully committed to regular vet checku">Yes, I am fully committed to regular vet checkups</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Experience with Rescue Animals</label>
                <select 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleChange} 
                  style={styles.select}
                >
                  <option value="Experienced dog owner (had 2+ dogs)">Experienced dog owner (had 2+ dogs)</option>
                  <option value="First-time owner">First-time owner</option>
                  <option value="Previous foster volunteer">Previous foster volunteer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section D: Notes to Foster Volunteer */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleRow}>
                <span style={styles.sectionIcon}>📝</span>
                <h3 style={styles.sectionTitle}>Section D: Notes to Foster Volunteer (Sarah Jenkins)</h3>
              </div>
            </div>
            <p style={styles.sectionDescription}>
              Introduce your lifestyle and tell Sarah why Buster would thrive in your care.
            </p>

            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows={4} 
              style={styles.textarea}
            />

            {/* Zero-friction Banner */}
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>🛡️</div>
              <div>
                <div style={styles.infoTitle}>Zero-friction foster coordination</div>
                <div style={styles.infoText}>
                  Your request will be sent directly to Sarah Jenkins for review. No payment or complex requirements are required at this stage. Sarah typically responds within 24-48 hours to schedule a casual meet-and-greet.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={styles.footerActions}>
            <button type="button" style={styles.cancelBtn}>
              Cancel & Return to Pet Adoption
            </button>
            <button type="submit" style={styles.submitBtn}>
              <span style={{ marginRight: '8px' }}>➤</span> Submit Adoption Request
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '16px 8px', // Dinagdagan ang allowance para sa maliliit na screen
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#334155',
    boxSizing: 'border-box'
  },
  wrapper: {
    maxWidth: '860px',
    width: '100%',
    margin: '0 auto'
  },
  topHeader: {
    marginBottom: '20px',
    padding: '0 4px'
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.5px'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '4px 0 8px 0'
  },
  subTitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px', // Bawas padding para sa mobile
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9'
  },
  petCardContent: {
    display: 'flex',
    flexWrap: 'wrap', // Kusa na itong bababa kapag masikip ang screen
    alignItems: 'center',
    gap: '12px',
    position: 'relative'
  },
  petImageContainer: {
    width: '70px',
    height: '70px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0
  },
  petImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  petDetails: {
    flex: '1 1 200px'
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '4px'
  },
  badgeWarning: {
    backgroundColor: '#ffedd5',
    color: '#9a3412',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '12px'
  },
  badgeInfo: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '12px'
  },
  petTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#0f172a'
  },
  petMeta: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0
  },
  changePetBtn: {
    background: 'none',
    border: 'none',
    color: '#a0421b',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0
  },
  stepperContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', // Auto wrap sa mobile
    gap: '12px',
    alignItems: 'center',
    paddingBottom: '12px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  stepItemActive: {
    backgroundColor: '#fff7ed',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #ffedd5'
  },
  stepIconCompleted: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0d9488',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '11px',
    flexShrink: 0
  },
  stepIconActive: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#9a3412',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '11px',
    flexShrink: 0
  },
  stepIconDisabled: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '11px',
    flexShrink: 0
  },
  stepLabelSmall: {
    fontSize: '10px',
    color: '#94a3b8'
  },
  stepLabelActiveSmall: {
    fontSize: '10px',
    color: '#9a3412',
    fontWeight: '600'
  },
  stepTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155'
  },
  stepTitleActive: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#9a3412'
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    marginTop: '4px'
  },
  progressBarFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#9a3412',
    borderRadius: '2px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '4px'
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sectionIcon: {
    fontSize: '16px'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  verifiedTag: {
    backgroundColor: '#ccfbf1',
    color: '#0f766e',
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  sectionDescription: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '16px'
  },
  // Dynamic CSS Grid: Gagawin nitong 1 column sa mobile at 2 o 3 sa desktop
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  radioCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  radioCardSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#9a3412'
  },
  radioInput: {
    accentColor: '#9a3412'
  },
  radioTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1e293b'
  },
  radioSub: {
    fontSize: '10px',
    color: '#64748b'
  },
  checkboxBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '10px 12px',
    borderRadius: '8px',
    marginTop: '12px'
  },
  checkbox: {
    marginTop: '2px',
    accentColor: '#0284c7'
  },
  checkboxText: {
    fontSize: '11px',
    color: '#334155',
    lineHeight: '1.4',
    cursor: 'pointer'
  },
  infoBox: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#e0f2fe',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '16px'
  },
  infoIcon: {
    color: '#0284c7',
    fontSize: '16px'
  },
  infoTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0369a1',
    marginBottom: '2px'
  },
  infoText: {
    fontSize: '11px',
    color: '#0369a1',
    lineHeight: '1.4'
  },
  footerActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px',
    paddingBottom: '30px'
  },
  cancelBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    width: 'auto',
    textAlign: 'left'
  },
  submitBtn: {
    backgroundColor: '#a0421b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto'
  }
};
export default AdoptionRequestValidation;