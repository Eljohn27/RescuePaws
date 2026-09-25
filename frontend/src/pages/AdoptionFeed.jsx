import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdoptionFeed() {
  const navigate = useNavigate();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(['ready', 'foster']);


  const petsData = [
    {
      id: 1,
      author: 'Kevin Joshua Ramirez',
      time: '8 hours ago',
      location: 'Peoples Park, Davao City',
      description: 'Meet Milo! He’s a sweet, fluffy scruffy-coated dog who was rescued off the streets and is now looking for a permanent home because his rescuer can no longer foster him due to limited space and resources. Despite his rough start, Milo is gentle, curious, and friendly. He is fully healthy, well-behaved, and ready to find a loving owner who will give him the proper care and attention he deserves!',
      image: '/milo.jpg',
      category: 'dog',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Milo',
      age: '4 Year Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 2,
      author: 'Angelica Mae Domingo',
      time: '14 hours ago',
      location: 'Davao City',
      description: "Hi everyone, I really need to find someone who can take good care of my dog, Siopao. 😞 He’s a 3yrs old Shih Tzu mix na super fluffy, quiet, at sobrang lambing. As much as I want to keep him, medyo nagigipit na kasi kami financially right now and I can't afford his special diet and vet checkups anymore. It breaks my heart to let him go, but I just want what’s best for him. Please let me know if anyone here is willing to open their home and love Siopao the way he deserves!",
      image: '/siopao.jpg',
      category: 'dog',
      statusTag: 'Ready to Adopt',
      statusTagBg: '#dcfce7',
      statusTagColor: '#166534',
      petName: 'Siopao',
      age: '3 Years Old',
      gender: 'Male',
      status: 'ready'
    },
    {
      id: 3,
      author: 'Jayson Paul Mendoza',
      time: '14 hours ago',
      location: 'Katipunan Ave, Quezon City',
      description: "Bantay is currently looking for a new family because his previous owner recently had to relocate for work and couldn't bring pets along. He is extremely energetic, affectionate, and loves playing outdoor catch. Bantay is healthy, fully house-trained, and eager to bring tons of joy to a home that can match his cheerful, loving energy!",
      image: '/bantay.jpg',
      category: 'dog',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Bantay',
      age: '3 Years',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 4,
      author: 'Angeline Suarez',
      time: 'Yesterday',
      location: 'El nido, Palawan',
      description: "Hi everyone, posting this for a stray dog I spotted wandering around the town in El nido, Palawan. 🥺 Kape is a super friendly tan Aspin with short fur and soulful eyes. Napaka-lambing at maamo niya sa mga naglalakad na tao, looking for food or just a bit of affection. Living on the streets is dangerous for him, especially with heavy traffic and unpredictable weather. I’m hoping someone here can adopt him, give him a safe place to sleep, and help get his vaccinations updated. Please send a message to Ms. Angelica Reyes in facebook if you want to give Kape a home! ",
      image: '/kape.jpg',
      category: 'dog',
      statusTag: 'Ready to Adopt',
      statusTagBg: '#dcfce7',
      statusTagColor: '#166534',
      petName: 'Kape',
      age: '2.5 Years Old',
      gender: 'Male',
      status: 'ready'
    },
    {
      id: 5,
      author: 'Maria Gloria Basa',
      time: '2 days ago',
      location: '#88 J.P. Laurel Avenue, Brgy. Bajada, Davao City, Davao del Sur',
      description: "She’s a 2-year-old fluffball na sobrang ganda ng long fluffy coat, striking calico markings, and cute split-face pattern. I really need to find a new forever home for my baby, Callie.  Pinangalanan namin siyang  Callie kasi super affectionate niya and she loves sleeping on beds and soft blankets. The main reason I need to rehome her is due to personal circumstances—nagka-health issues and financial strain ako dito sa Davao, so I can no longer give her the level of attention and care that she truly deserves. Fully indoor cat si Callie, complete sa vaccines, spayed, and very well-behaved. It breaks my heart to let her go, but I just want to make sure she finds an owner who can shower her with love. Please send me a DM sa fb Maria Gloria Basa if you're interested!!",
      image: '/callie.jpg',
      category: 'dog',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Callie',
      age: '2 Years Old',
      gender: 'Female',
      status: 'foster'
    },
    {
      id: 6,
      author: 'Nadine Paningbatan',
      time: '2 days ago',
      location: '#27 Arellano Street, Brgy. Pantal, Dagupan City, Pangasinan',
      description: "Nakita namin si Putol sa may palengke na maraming galos at sugat sa mukha at tainga, mukhang napaaway sa ibang stray cats at napabayaan talaga sa kalsada. Pinangalanan namin siyang Putol dahil sa gupit o notched ear niya. Sobrang kawawa kasi nanginginig at gutom na gutom nung nahanap namin, pero sa kabila ng lahat ng pinagdaanan niya, napaka-gentle at tahimik niya pa rin. Ginagamot na namin siya ngayon at binibigyan ng antibiotics, pero kailang-kailangan talaga namin ng temporary foster o permanent adopter na makakapagbigay sa kanya ng malinis, ligtas, at tahimik na lugar para makapag-recover siya nang maayos. Message nyo ako sa aking facebook (Nadine Paningbatan) kung pwede niyo siyang ma-foster o ma-adopt!",
      image: '/putol.jpg',
      category: 'cat',
      statusTag: 'Ready to Adopt',
      statusTagBg: '#dcfce7',
      statusTagColor: '#166534',
      petName: 'Putol',
      age: '4-5 Years Old',
      gender: 'Male',
      status: 'ready'
    },
    {
      id: 7,
      author: 'Christian John Valdez',
      time: '16 hours ago',
      location: 'Taft Ave, Manila',
      description: 'Si pobre ay isang super lambing na black-and-white shih tzu dog na dating stray bago namin nirescue. Tinawag siyang "Pobre" kasi medyo nakakaawa talaga yung state niya nung nahanap, pero super okay, healthy, at ready na siya ngayon for his forever home! Ipapa-adopt siya kasi medyo kulang na kami sa space at resources to take care of him long-term. Sobrang bait at maamo ni Pobre sa tao, and he’s just waiting for a loving family na mag-aampon sa kanya!' ,
      image: '/pobre.jpg',
      category: 'dog',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Pobre',
      age: '1.5 Years Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 8,
      author: 'Mary Ann Flores',
      time: '1 hr 15 mins ago',
      location: '#42 B. Gonzales Street, Brgy. Loyola Heights, Quezon City metro manila.',
      description: "Hi everyone, I really need to find someone who can take in and foster or adopt this poor little kitten. 🥺 Nahanap ko siya kanina sa gilid ng kalsada, basang-basa sa ulan at mukhang nanginginig sa takot at lamig. I wiped her down and gave her food, but I can't keep her in my place long-term because my roommate is allergic to cats. She has big round eyes, super expressive ears, and just wants to feel safe and warm. Please message me if you can give this tiny baby the loving home and care she desperately needs!",
      image: '/kuting.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Kuting',
      age: '8 Months',
      gender: 'Female',
      status: 'foster'
    },
    {
      id: 9,
      author: 'Angelo Miguel Soriano',
      time: '2 days ago',
      location: '#88 Rizal Avenue, Brgy. San Pedro, Puerto Princesa city.',
      description:  "Hi guys, I’m posting to see if anyone is willing to adopt Puto. 🥺 He’s a handsome brown tabby with striking green-yellow eyes and a sleek patterned coat. Nakita ko siyang palakad-lakad lang sa tabi ng kalsada dito sa Palawan, looking for food and scraps. Super gentle at hindi matatakutin sa tao, as in kakausapin ka pa niya with small meows! I can't keep him long-term since I'm only staying in temporary housing here. Please send me a message in facebook Yael hasman if you can give Puto a safe and permanent home!",
      image: '/puto.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Puto',
      age: '1.5 Years Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 10,
      author: 'Jane Marie Salazar',
      time: '5 Hours Ago',
      location: 'Unit 4B, Camella Homes, Brgy. San Jose, Dasmariñas City, Cavite',
      description: "Hi everyone, I really need to find someone who can take care of my cat, Tilapia. I named her tilapia because that her favorite food. She’s a 2-year-old dark tabby na sobrang lambing at mahilig sa chin scratches. I've raised her since she was a kitten, but unfortunately, we are relocating abroad for work next month at hindi namin siya kayang isama agad dahil sa strict pet import regulations. Fully indoor, litter-trained, and complete sa vaccines si Tilapia. It breaks my heart to rehome her, but I just want to make sure she goes to a loving owner who will give her all the affection she's used to. Please send me a DM(Rose Talaveno in fb) if you're interested!",
      image: '/tilapia.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Tilapia',
      age: '2 Years Old',
      gender: 'Female',
      status: 'foster'
    },
    {
      id: 11,
      author: 'Carlo Vincent Navarro',
      time: '5 Hours Ago',
      location: 'IT Park, Cebu City',
      description: "Tigre is up for adoption because me and my family is moving to a new country and sadly cannot take him along. He is highly active, intelligent, and very well-behaved. Tigre loves long walks and is fully trained. He is ready to find a loving new home with a yard and an active family who can give him the space and exercise he deserves!",
      image: '/tigre.jpg',
      category: 'dog',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Tigre',
      age: '4 Years Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 12,
      author: 'Marvin Joseph',
      time: '6 Hours Ago',
      location: '#18 Mahogany Street, Town & Country Executive Village, Brgy. Mayamot, Antipolo City, Rizal',
      description: "Hi everyone, I’m posting to find a forever home for my foster cat, Panda! 🖤🤍 Nakuha namin siyang patpatin at pagala-gala malapit sa gate ng subdivision, so I took him into temporary foster care to get him cleaned up, fed, and neutered. Pinangalanan siyang Panda dahil sa cute na black patch sa kanang mata at sa kanyang black tail. Sobrang behaved at quiet lang nitong si Panda—medyo shy pa nung una pero ngayon mahilig na mag-purr kapag hihimasin. Since temporary foster lang ako at puno na rin ng pets ang bahay, we really need to find someone who can adopt him permanently. Please send me a message if you want to welcome Panda into your family!",
      image: '/panda.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Panda',
      age: '3-4 Years Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 13,
      author: 'Erika Mae Padilla',
      time: '2 Hours Ago',
      location: 'Cavite, Philippines',
      description: "Hi guys, I’m looking for a loving home for Tagppi. 🥺 He’s a 1-year-old Aspin with a unique black head and a beautiful speckled/spotted coat. I rescued him off the street a few months ago, but I’m currently living in a small condo and space constraints are making it really tough to give him the freedom he needs. Tagppi is super gentle, sweet, and quiet, but he definitely needs a family with a bit more room or a yard to run around in. Please let me know if you can give this sweet boy his forever home!",
      image: '/tagppi.jpg',
      category: 'dog',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Tagppi',
      age: '1 Year Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 14,
      author: 'Michelle Andrea',
      time: '10 Hours Ago',
      location: '#69 Marcos Avenue, Brgy. Palamis, Alaminos City, Pangasinan',
      description: "Hi guys, rehoming post lang para kay Oreo! 🖤🤍 Nakuha namin si Oreo sa tapat ng aming shop nung nanganak yung pusa sa kapitbahay at hindi na nila kayang pakainin dahil sa dami na nilang pusa. Pinangalanan ko siyang Oreo dahil sa cute na black mask and white fur combo niya. Sobrang lambing at mahilig maglaro ng lubid o maliliit na laruan. The main reason we need to find him a home is because baka magkaroon ng allergic reaction ang bagong baby sa aming bahay, so as much as we love having Panda around, kailangan na talaga namin siyang mahanapan ng bagong pamilya. My fb acc is Michelle Andrea.",
      image: '/oreo.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Oreo',
      age: '3 Months Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 15,
      author: 'Michelle Andrea',
      time: '10 Hours Ago',
      location: '#67 Diversion Road, Brgy. Mandurriao, Iloilo City',
      description: "Rehoming my cat Lingkod! 😸 Pinangalanan siyang Lingkod kasi palagi siyang nakatayo sa dalawang paa at humihingi ng lambing sa tuwing uuwi ako galing trabaho. Neutered at litter-trained na siya. The main reason for rehoming Lingkod is due to full-time work setup changes and frequent out-of-town business trips. Ayaw ko siyang maiwang mag-isa sa bahay dito sa Iloilo nang matagal nang walang nag-aasikaso o nagpapakain sa kanya. Super affectionate, malambing, at energetic nitong si Lingkod. I’m gonna drop my ig (User.tyla123) username here because i don’t have fb.",
      image: '/lingkod.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Lingkod',
      age: '1-2 Years Old',
      gender: 'Male',
      status: 'foster'
    },
    {
      id: 16,
      author: 'Karen Nicole Ramos',
      time: '17 Hours Ago',
      location: '#34 P. Burgos Street, Brgy. Poblacion, Batangas City, Batangas',
      description: "Hi guys, urgent adoption appeal for Wink! 🌸 Pinangalanan namin siyang Wink dahil nakasara pa ang kaliwang mata niya nung nahanap namin sa kalsada. Medyo okay na siya ngayon at nag-e-eye drops daily. The main reason we need to rehome her is because nagkaroon ng asthma at severe pet dander allergy ang kapatid ko, at pinagbawalan na talaga kami ng doktor na mag-alaga ng pusa sa loob ng bahay. Sobrang lambing at pala-kaibigan ni Wink kahit marami siyang pinagdaanan. Contact me here 0912345678.",
      image: '/wink.jpg',
      category: 'cat',
      statusTag: 'In Foster Care',
      statusTagBg: '#e0f2fe',
      statusTagColor: '#0369a1',
      petName: 'Wink',
      age: '5-7 Months Old',
      gender: 'Female',
      status: 'foster'
    },
  ];

  // Filter Handling logic
  const filteredPets = petsData.filter((pet) => {
    if (selectedCategory !== 'all' && pet.category !== selectedCategory) return false;
    if (selectedGender !== 'all' && pet.gender.toLowerCase() !== selectedGender) return false;
    if (selectedStatus.length > 0 && !selectedStatus.includes(pet.status)) return false;
    return true;
  });

  const toggleStatus = (statusKey) => {
    if (selectedStatus.includes(statusKey)) {
      setSelectedStatus(selectedStatus.filter(s => s !== statusKey));
    } else {
      setSelectedStatus([...selectedStatus, statusKey]);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b', paddingBottom: '60px' }}>
      
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '24px' }}>
        
        {/* LEFT SIDEBAR: FILTERS */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚙️</span> Filter Adoption
            </div>
            <button 
              onClick={() => { setSelectedCategory('all'); setSelectedGender('all'); setSelectedStatus(['ready', 'foster']); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {/* CATEGORY SELECTOR */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', padding: '6px 8px', textTransform: 'uppercase' }}>PET CATEGORY</div>
            
            <div 
              onClick={() => setSelectedCategory('all')}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: selectedCategory === 'all' ? '#c25e38' : 'transparent', color: selectedCategory === 'all' ? '#fff' : '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
            >
              🐾 All Rescue Pets ({petsData.length})
            </div>

            <div 
              onClick={() => setSelectedCategory('dog')}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: selectedCategory === 'dog' ? 'bold' : 'normal', cursor: 'pointer', backgroundColor: selectedCategory === 'dog' ? '#fff7ed' : 'transparent', color: selectedCategory === 'dog' ? '#c25e38' : '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
            >
              🐶 Dogs (10)
            </div>

            <div 
              onClick={() => setSelectedCategory('cat')}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: selectedCategory === 'cat' ? 'bold' : 'normal', cursor: 'pointer', backgroundColor: selectedCategory === 'cat' ? '#fff7ed' : 'transparent', color: selectedCategory === 'cat' ? '#c25e38' : '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              🐱 Cats (10)
            </div>
          </div>

          {/* STATUS FILTER */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>STATUS</div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedStatus.includes('ready')} onChange={() => toggleStatus('ready')} style={{ accentColor: '#c25e38' }} />
              Ready for Adoption
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedStatus.includes('foster')} onChange={() => toggleStatus('foster')} style={{ accentColor: '#c25e38' }} />
              In Foster Care
            </label>
          </div>

          {/* GENDER FILTER */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>GENDER</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'male', 'female'].map((g) => (
                <button 
                  key={g} 
                  onClick={() => setSelectedGender(g)}
                  style={{ flex: 1, padding: '6px 0', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', cursor: 'pointer', backgroundColor: selectedGender === g ? '#c25e38' : '#fff', color: selectedGender === g ? '#fff' : '#475569' }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* NOTICE BOX */}
          <div style={{ backgroundColor: '#fff7ed', borderRadius: '10px', border: '1px solid #ffedd5', padding: '12px', fontSize: '11px', color: '#9a3412', lineHeight: '1.4' }}>
            💡 Every pet listed here is verified by partner rescuers and caregiver foster networks.
          </div>
        </div>

        {/* RIGHT FEED */}
        <div style={{ flex: 1 }}>
          
          {/* HEADER BANNER WITH CREATE POST BUTTON */}
          <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#c25e38', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                🏠
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Fostering a rescue in need of a home?</h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Create an adoption listing to match with loving community adopters.</p>
              </div>
            </div>

            {/* ✅ PUPUNTA SA CREATE ADOPTION POST */}
            <button 
              onClick={() => navigate('/create-adoption')}
              style={{ backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(194, 94, 56, 0.2)', whiteSpace: 'nowrap' }}
            >
              ➕ Create a Post
            </button>
          </div>

          {/* PET LISTINGS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredPets.map((pet) => (
              <div key={pet.id} style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                
                {/* AUTHOR INFO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#334155', fontSize: '13px' }}>
                      {pet.author[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{pet.author}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{pet.authorRole} • {pet.time} • 📍 {pet.location}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', color: '#94a3b8', cursor: 'pointer' }}>•••</span>
                </div>

                {/* DESCRIPTION */}
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {pet.description}
                </p>

                {/* SIDE-BY-SIDE CONTENT: PHOTO + PET SUMMARY CARD */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', alignItems: 'stretch' }}>
                  
                  {/* LEFT: IMAGE */}
                  <div style={{ borderRadius: '10px', overflow: 'hidden', height: '240px', backgroundColor: '#f1f5f9' }}>
                    <img src={pet.image} alt={pet.petName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* RIGHT: PET DESCRIPTION CARD */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>PET DESCRIPTION</span>
                        <span style={{ backgroundColor: pet.statusTagBg, color: pet.statusTagColor, fontSize: '10px', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                          {pet.statusTag}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Name</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>{pet.petName}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Age</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>{pet.age}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Gender</span>
                        <div style={{ fontSize: '11px', color: '#334155', display: 'flex', gap: '8px' }}>
                          <span style={{ fontWeight: pet.gender === 'Male' ? 'bold' : 'normal', color: pet.gender === 'Male' ? '#c25e38' : '#94a3b8' }}>
                            {pet.gender === 'Male' ? '🔘 Male' : '⚪ Male'}
                          </span>
                          <span style={{ fontWeight: pet.gender === 'Female' ? 'bold' : 'normal', color: pet.gender === 'Female' ? '#c25e38' : '#94a3b8' }}>
                            {pet.gender === 'Female' ? '🔘 Female' : '⚪ Female'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ PUPUNTA NA SA REPORT SIGHTING PAGE */}
                    <button 
                      onClick={() => navigate('/adoption-validation', { state: { pet } })}
                      style={{ 
                        backgroundColor: '#c25e38', 
                        color: '#fff', 
                        border: 'none', 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontWeight: 'bold', 
                        fontSize: '12px', 
                        cursor: 'pointer', 
                        marginTop: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justify: 'center', 
                        gap: '6px', 
                        boxShadow: '0 2px 4px rgba(194, 94, 56, 0.2)' 
                      }}
                    >
                      <span>🙋</span> Request to Adopt
                    </button>

                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}