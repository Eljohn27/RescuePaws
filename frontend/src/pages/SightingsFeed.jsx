import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SightingsFeed() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPostForHelp, setSelectedPostForHelp] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterLabels = {
    all: '🐾 All Sightings',
    dogs: '🐶 Dogs Only',
    cats: '🐱 Cats Only',
    needs_help: '🚨 Status: Needs Help',
    foster: '🏠 Status: In Foster Care',
    rescued: '✅ Status: Rescued',
  };

  const initialPosts = [
    {
      id: 1,
      author: 'Mark Anthony Villarama',
      time: '22 hrs ago',
      locationTag: '📍 Sunrise Subdivision, Arellano, Dagupan City',
      statusBadge: '✅ Rescue Resolved',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      content: "Meet Bruno! He's a sweet, gentle golden-brown pup looking for his forever home. Super friendly with people and very well-behaved, he’s always up for a quiet walk or just chilling by your side. Bruno gets along great with everyone and is fully ready to bring warmth and companionship to his new family.",
      image: '/bruno.jpg',
      category: 'dog',
      status: 'rescued',
      likes: 40,
      isLiked: false
    },
    {
      id: 2,
      author: 'John Carlo Manalo',
      role: 'Head Vet Officer',
      time: '3 hrs ago',
      locationTag: '📍 España Blvd, Manila',
      statusBadge: '✅ Rescue Resolved',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      content: "Meet Bella! She’s a gentle, light-cream dog who is currently up for adoption because her owner can no longer take care for her due to personal circumstances. Bella has a sweet, calm disposition, enjoys relaxing outdoors, and gets along really well with people. She is well-behaved, healthy, and ready to bring unconditional love to a family that can give her the time and attention she deserves!",
      image: '/bella.jpg',
      category: 'dog',
      status: 'rescued',
      likes: 24,
      isLiked: false
    },
    {
      id: 3,
      author: 'Kevin Joshua Ramirez',
      time: '8 hrs ago',
      locationTag: '📍 Peoples Park, Davao City',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Meet Milo! He’s a sweet, fluffy scruffy-coated dog who was rescued off the streets and is now looking for a permanent home because his rescuer can no longer foster him due to limited space and resources. Despite his rough start, Milo is gentle, curious, and friendly. He is fully healthy, well-behaved, and ready to find a loving owner who will give him the proper care and attention he deserves!",
      image: '/milo.jpg',
      category: 'dog',
      status: 'foster',
      likes: 19,
      isLiked: false
    },
    {
      id: 4,
      author: 'Renz Michael Castillo',
      time: '12 hrs ago',
      locationTag: '📍 Session Road, Baguio City',
      statusBadge: '✅ Rescue Resolved',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      content: "He’s an energetic cream-colored puppy with adorable, big alert ears and a cheerful smile that looks a bit like a Corgi or Shiba mix. Puti is currently looking for a loving home because his owner’s family is moving to a place that doesn't allow pets. He’s super playful, affectionate, and full of life. Being so young, he’s eager to learn and ready to grow up with a family who will give him plenty of love and play time!",
      image: '/puti.jpg',
      category: 'dog',
      status: 'rescued',
      likes: 31,
      isLiked: false
    },
    {
      id: 5,
      author: 'Jayson Paul Mendoza',
      time: '14 hrs ago',
      locationTag: '📍 Katipunan Ave, Quezon City',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Bantay is currently looking for a new family because his previous owner recently had to relocate for work and couldn't bring pets along. He is extremely energetic, affectionate, and loves playing outdoor catch. Bantay is healthy, fully house-trained, and eager to bring tons of joy to a home that can match his cheerful, loving energy!",
      image: 'bantay.jpg',
      category: 'dog',
      status: 'foster',
      likes: 18,
      isLiked: false
    },
    {
      id: 6,
      author: 'Christian John Valdez',
      time: '16 hrs ago',
      locationTag: '📍 Taft Ave, Manila',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: 'Si pobre ay isang super lambing na black-and-white shih tzu dog na dating stray bago namin nirescue. Tinawag siyang "Pobre" kasi medyo nakakaawa talaga yung state niya nung nahanap, pero super okay, healthy, at ready na siya ngayon for his forever home! Ipapa-adopt siya kasi medyo kulang na kami sa space at resources to take care of him long-term. Sobrang bait at maamo ni Pobre sa tao, and he’s just waiting for a loving family na mag-aampon sa kanya!' ,
      image: '/pobre.jpg',
      category: 'dog',
      status: 'foster',
      likes: 27,
      isLiked: false
    },
    {
      id: 7,
      author: 'Mary Ann Flores',
      time: '1 hr 15 mins ago',
      locationTag: '📍 #42 B. Gonzales Street, Brgy. Loyola Heights, Quezon City metro manila.',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi everyone, I really need to find someone who can take in and foster or adopt this poor little kitten. 🥺 Nahanap ko siya kanina sa gilid ng kalsada, basang-basa sa ulan at mukhang nanginginig sa takot at lamig. I wiped her down and gave her food, but I can't keep her in my place long-term because my roommate is allergic to cats. She has big round eyes, super expressive ears, and just wants to feel safe and warm. Please message me if you can give this tiny baby the loving home and care she desperately needs!",
      image: '/kuting.jpg',
      category: 'cat',
      status: 'foster',
      likes: 8,
      isLiked: false
    },
    {
      id: 8,
      author: 'Angelo Miguel Soriano',
      time: '2 days ago',
      locationTag: '📍 #88 Rizal Avenue, Brgy. San Pedro, Puerto Princesa city.',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi guys, I’m posting to see if anyone is willing to adopt Puto. 🥺 He’s a handsome brown tabby with striking green-yellow eyes and a sleek patterned coat. Nakita ko siyang palakad-lakad lang sa tabi ng kalsada dito sa Palawan, looking for food and scraps. Super gentle at hindi matatakutin sa tao, as in kakausapin ka pa niya with small meows! I can't keep him long-term since I'm only staying in temporary housing here. Please send me a message in facebook Yael hasman if you can give Puto a safe and permanent home!",
      image: '/puto.jpg',
      category: 'cat',
      status: 'foster',
      likes: 15,
      isLiked: false
    },
    {
      id: 9,
      author: 'Jane Marie Salazar',
      time: '5 hrs ago',
      locationTag: '📍 Unit 4B, Camella Homes, Brgy. San Jose, Dasmariñas City, Cavite',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi everyone, I really need to find someone who can take care of my cat, Tilapia. I named her tilapia because that her favorite food. She’s a 2-year-old dark tabby na sobrang lambing at mahilig sa chin scratches. I've raised her since she was a kitten, but unfortunately, we are relocating abroad for work next month at hindi namin siya kayang isama agad dahil sa strict pet import regulations. Fully indoor, litter-trained, and complete sa vaccines si Tilapia. It breaks my heart to rehome her, but I just want to make sure she goes to a loving owner who will give her all the affection she's used to. Please send me a DM(Rose Talaveno in fb) if you're interested!",
      image: '/tilapia.jpg',
      category: 'cat',
      status: 'foster',
      likes: 15,
      isLiked: false
    },
    {
      id: 10,
      author: 'Carlo Vincent Navarro',
      time: '5 hrs ago',
      locationTag: '📍 IT Park, Cebu City',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Tigre is up for adoption because me and my family is moving to a new country and sadly cannot take him along. He is highly active, intelligent, and very well-behaved. Tigre loves long walks and is fully trained. He is ready to find a loving new home with a yard and an active family who can give him the space and exercise he deserves!",
      image: '/tigre.jpg',
      category: 'dog',
      status: 'foster',
      likes: 15,
      isLiked: false
    },
    {
      id: 11,
      author: 'Angelica Mae Domingo',
      time: '14 hrs ago',
      locationTag: '📍 Katipunan Ave, Quezon City',
      statusBadge: '🚨 Needs Help',
      badgeBg: '#fee2e2',
      badgeColor: '#dc2626',
      content: "Hi everyone, I really need to find someone who can take good care of my dog, Siopao. 😞 He’s a 3yrs old Shih Tzu mix na super fluffy, quiet, at sobrang lambing. As much as I want to keep him, medyo nagigipit na kasi kami financially right now and I can't afford his special diet and vet checkups anymore. It breaks my heart to let him go, but I just want what’s best for him. Please let me know if anyone here is willing to open their home and love Siopao the way he deserves! ",
      image: '/siopao.jpg',
      category: 'dog',
      status: 'needs_help',
      likes: 18,
      isLiked: false
    },
    {
      id: 12,
      author: 'Marvin Joseph',
      time: '6 hrs ago',
      locationTag: '📍 #18 Mahogany Street, Town & Country Executive Village, Brgy. Mayamot, Antipolo City, Rizal',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi everyone, I’m posting to find a forever home for my foster cat, Panda! 🖤🤍 Nakuha namin siyang patpatin at pagala-gala malapit sa gate ng subdivision, so I took him into temporary foster care to get him cleaned up, fed, and neutered. Pinangalanan siyang Panda dahil sa cute na black patch sa kanang mata at sa kanyang black tail. Sobrang behaved at quiet lang nitong si Panda—medyo shy pa nung una pero ngayon mahilig na mag-purr kapag hihimasin. Since temporary foster lang ako at puno na rin ng pets ang bahay, we really need to find someone who can adopt him permanently. Please send me a message if you want to welcome Panda into your family!",
      image: '/panda.jpg',
      category: 'cat',
      status: 'foster',
      likes: 19,
      isLiked: false
    },
    {
      id: 13,
      author: 'Erika Mae Padilla',
      time: '2 hrs ago',
      locationTag: '📍 Cavite, Philippines',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi guys, I’m looking for a loving home for Tagppi. 🥺 He’s a 1-year-old Aspin with a unique black head and a beautiful speckled/spotted coat. I rescued him off the street a few months ago, but I’m currently living in a small condo and space constraints are making it really tough to give him the freedom he needs. Tagppi is super gentle, sweet, and quiet, but he definitely needs a family with a bit more room or a yard to run around in. Please let me know if you can give this sweet boy his forever home!",
      image: '/tagppi.jpg',
      category: 'dog',
      status: 'foster',
      likes: 10,
      isLiked: false
    },
    {
      id: 14,
      author: 'Aurora Vergara',
      time: '2 hrs ago',
      locationTag: '📍 #14 Upper Session Road, Brgy. Marcoville, Baguio City, Benguet',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "I really need to find someone who can adopt my foster cat, Garfield! 🧡 Kinopkop ko muna siya temporary foster care nung nahanap siya ng friend ko sa kalsada na ginaw na ginaw nung tag-ulan. Super healthy na siya ngayon and neutered. The main reason I need to rehome him now is because my current landlord doesn't allow multiple pets in the rental unit, at napagsabihan na kami na bawal na lumagpas sa dalawang alaga. Garfield is super affectionate, vocal, and mahilig magpa-belly rub at humiga sa tabi mo habang nagtatrabaho ka. Please send me a message(Aurora Vergara in fb) if you can give this sweet orange boy his forever home!",
      image: '/garfield.jpg',
      category: 'cat',
      status: 'foster',
      likes: 23,
      isLiked: false
    },
    {
      id: 15,
      author: 'Angeline Suarez',
      time: 'Yesterday',
      locationTag: '📍 El nido, Palawan',
      statusBadge: '🚨 Needs Help',
      badgeBg: '#fee2e2',
      badgeColor: '#dc2626',
      content: "Hi everyone, posting this for a stray dog I spotted wandering around the town in El nido, Palawan. 🥺 Kape is a super friendly tan Aspin with short fur and soulful eyes. Napaka-lambing at maamo niya sa mga naglalakad na tao, looking for food or just a bit of affection. Living on the streets is dangerous for him, especially with heavy traffic and unpredictable weather. I’m hoping someone here can adopt him, give him a safe place to sleep, and help get his vaccinations updated. Please send a message to Ms. Angelica Reyes in facebook if you want to give Kape a home! ",
      image: '/kape.jpg',
      category: 'dog',
      status: 'needs_help',
      likes: 18,
      isLiked: false
    },
    {
      id:16,
      author: 'Nadine Paningbatan',
      time: '2 days ago',
      locationTag: '📍 #27 Arellano Street, Brgy. Pantal, Dagupan City, Pangasinan',
      statusBadge: '🚨 Needs Help',
      badgeBg: '#fee2e2',
      badgeColor: '#dc2626',
      content: "Nakita namin si Putol sa may palengke na maraming galos at sugat sa mukha at tainga, mukhang napaaway sa ibang stray cats at napabayaan talaga sa kalsada. Pinangalanan namin siyang Putol dahil sa gupit o notched ear niya. Sobrang kawawa kasi nanginginig at gutom na gutom nung nahanap namin, pero sa kabila ng lahat ng pinagdaanan niya, napaka-gentle at tahimik niya pa rin. Ginagamot na namin siya ngayon at binibigyan ng antibiotics, pero kailang-kailangan talaga namin ng temporary foster o permanent adopter na makakapagbigay sa kanya ng malinis, ligtas, at tahimik na lugar para makapag-recover siya nang maayos. Message nyo ako sa aking facebook (Nadine Paningbatan) kung pwede niyo siyang ma-foster o ma-adopt!",
      image: '/putol.jpg',
      category: 'cat',
      status: 'needs_help',
      likes: 102,
      isLiked: false
    },
    {
      id: 17,
      author: 'Maria Gloria Basa',
      time: '2 days ago',
      locationTag: '📍 #88 J.P. Laurel Avenue, Brgy. Bajada, Davao City, Davao del Sur',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "She’s a 2-year-old fluffball na sobrang ganda ng long fluffy coat, striking calico markings, and cute split-face pattern. I really need to find a new forever home for my baby, Callie.  Pinangalanan namin siyang  Callie kasi super affectionate niya and she loves sleeping on beds and soft blankets. The main reason I need to rehome her is due to personal circumstances—nagka-health issues and financial strain ako dito sa Davao, so I can no longer give her the level of attention and care that she truly deserves. Fully indoor cat si Callie, complete sa vaccines, spayed, and very well-behaved. It breaks my heart to let her go, but I just want to make sure she finds an owner who can shower her with love. Please send me a DM sa fb Maria Gloria Basa if you're interested!!",
      image: '/callie.jpg',
      category: 'cat',
      status: 'foster',
      likes: 23,
      isLiked: false
    },
    {
      id: 18,
      author: 'Michelle Andrea',
      time: '10 hrs ago',
      locationTag: '📍 #69 Marcos Avenue, Brgy. Palamis, Alaminos City, Pangasinan',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi guys, rehoming post lang para kay Oreo! 🖤🤍 Nakuha namin si Oreo sa tapat ng aming shop nung nanganak yung pusa sa kapitbahay at hindi na nila kayang pakainin dahil sa dami na nilang pusa. Pinangalanan ko siyang Oreo dahil sa cute na black mask and white fur combo niya. Sobrang lambing at mahilig maglaro ng lubid o maliliit na laruan. The main reason we need to find him a home is because baka magkaroon ng allergic reaction ang bagong baby sa aming bahay, so as much as we love having Panda around, kailangan na talaga namin siyang mahanapan ng bagong pamilya. My fb acc is Michelle Andrea.",
      image: '/oreo.jpg',
      category: 'cat',
      status: 'foster',
      likes: 36,
      isLiked: false
    },
    {
      id: 19,
      author: 'Princess Mae Gonzales',
      time: '10 hrs ago',
      locationTag: '📍 #67 Diversion Road, Brgy. Mandurriao, Iloilo City',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Rehoming my cat Lingkod! 😸 Pinangalanan siyang Lingkod kasi palagi siyang nakatayo sa dalawang paa at humihingi ng lambing sa tuwing uuwi ako galing trabaho. Neutered at litter-trained na siya. The main reason for rehoming Lingkod is due to full-time work setup changes and frequent out-of-town business trips. Ayaw ko siyang maiwang mag-isa sa bahay dito sa Iloilo nang matagal nang walang nag-aasikaso o nagpapakain sa kanya. Super affectionate, malambing, at energetic nitong si Lingkod. I’m gonna drop my ig (User.tyla123) username here because i don’t have fb.",
      image: '/lingkod.jpg',
      category: 'cat',
      status: 'foster',
      likes: 46,
      isLiked: false
    },
    {
      id: 20,
      author: 'Karen Nicole Ramos',
      time: '17 hrs ago',
      locationTag: '📍 #34 P. Burgos Street, Brgy. Poblacion, Batangas City, Batangas',
      statusBadge: '🏠 In Foster Care',
      badgeBg: '#ccfbf1',
      badgeColor: '#0f766e',
      content: "Hi guys, urgent adoption appeal for Wink! 🌸 Pinangalanan namin siyang Wink dahil nakasara pa ang kaliwang mata niya nung nahanap namin sa kalsada. Medyo okay na siya ngayon at nag-e-eye drops daily. The main reason we need to rehome her is because nagkaroon ng asthma at severe pet dander allergy ang kapatid ko, at pinagbawalan na talaga kami ng doktor na mag-alaga ng pusa sa loob ng bahay. Sobrang lambing at pala-kaibigan ni Wink kahit marami siyang pinagdaanan. Contact me here 0912345678.",
      image: '/wink.jpg',
      category: 'cat',
      status: 'foster',
      likes: 58,
      isLiked: false
    }
  ];

  const [posts, setPosts] = useState(initialPosts);

  const handleLike = (id) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      })
    );
  };

  const handleFilterSelect = (filterKey) => {
    setActiveFilter(filterKey);
    setVisibleCount(5);
    setIsDropdownOpen(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'dogs') return post.category === 'dog';
    if (activeFilter === 'cats') return post.category === 'cat';
    if (activeFilter === 'needs_help') return post.status === 'needs_help';
    if (activeFilter === 'foster') return post.status === 'foster';
    if (activeFilter === 'rescued') return post.status === 'rescued';
    return true;
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b', position: 'relative' }}>
      
      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* LEFT SIDEBAR - DROPDOWN FILTER */}
        <div style={{ width: '230px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '2px' }}>
            FILTER SIGHTINGS
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ width: '100%', backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '12px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            >
              <span>{filterLabels[activeFilter]}</span>
              <span style={{ fontSize: '10px', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', marginTop: '6px', zIndex: 999, overflow: 'hidden', padding: '4px 0' }}>
                {[
                  { key: 'all', label: '🐾 All Sightings' },
                  { key: 'dogs', label: '🐶 Dogs Only' },
                  { key: 'cats', label: '🐱 Cats Only' },
                  { key: 'needs_help', label: '🚨 Status: Needs Help' },
                  { key: 'foster', label: '🏠 Status: In Foster Care' },
                  { key: 'rescued', label: '✅ Status: Rescued' }
                ].map((item) => (
                  <div 
                    key={item.key}
                    onClick={() => handleFilterSelect(item.key)} 
                    style={{ 
                      padding: '10px 14px', 
                      fontSize: '12px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justify: 'space-between', 
                      alignItems: 'center',
                      color: activeFilter === item.key ? '#c25e38' : '#334155', 
                      backgroundColor: activeFilter === item.key ? '#fff7ed' : 'transparent',
                      fontWeight: activeFilter === item.key ? 'bold' : 'normal',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <span>{item.label}</span>
                    {activeFilter === item.key && <span style={{ color: '#c25e38', fontWeight: 'bold' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT FEED */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          
          {/* HEADER CARD WITH CREATE POST BUTTON */}
          <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#c25e38', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                🐕
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Community Sightings Feed</h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Reported stray animals and foster care updates across the Philippines.</p>
              </div>
            </div>

            {/* CREATE POST BUTTON (NAVIGATES TO /report-sighting) */}
            <button 
              onClick={() => navigate('/report-sighting')}
              style={{ backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(194, 94, 56, 0.2)' }}
            >
              ➕ Create a Post
            </button>
          </div>

          {/* FEED POSTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {displayedPosts.map((post) => (
              <div key={post.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                      {post.author[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{post.author}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{post.role} • ⏱️ {post.time}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', fontWeight: '500' }}>
                      {post.locationTag}
                    </span>
                    <span style={{ backgroundColor: post.badgeBg, color: post.badgeColor, fontSize: '10px', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      {post.statusBadge}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                  {post.content}
                </p>

                <div style={{ 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  maxHeight: '450px', 
                  backgroundColor: '#f1f5f9', 
                  marginBottom: '14px', 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={post.image} 
                    alt={post.category} 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      maxHeight: '450px', 
                      objectFit: 'contain' 
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button 
                    onClick={() => handleLike(post.id)}
                    style={{ background: 'none', border: 'none', color: post.isLiked ? '#dc2626' : '#64748b', fontSize: '12px', fontWeight: post.isLiked ? '700' : '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {post.isLiked ? '❤️' : '🤍'} Like ({post.likes})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* LOAD MORE BUTTON */}
          {visibleCount < filteredPosts.length && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => setVisibleCount(prev => prev + 5)}
                style={{ backgroundColor: '#fff', color: '#c25e38', border: '1px solid #c25e38', padding: '10px 24px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                🔄 Load More Sightings
              </button>
            </div>
          )}
        </div>

      </div>

      {/* FLOATING ACTION BUTTON (NAVIGATES TO /report-sighting) */}
      <button 
        onClick={() => navigate('/report-sighting')}
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          backgroundColor: '#c25e38', 
          color: '#fff', 
          border: 'none', 
          padding: '14px 22px', 
          borderRadius: '50px', 
          fontWeight: 'bold', 
          fontSize: '14px', 
          cursor: 'pointer', 
          boxShadow: '0 4px 14px rgba(194, 94, 56, 0.4)', 
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ➕ Post Sighting
      </button>

      {/* HELP MODAL */}
      {selectedPostForHelp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', maxWidth: '440px', width: '90%', position: 'relative' }}>
            <button onClick={() => setSelectedPostForHelp(null)} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#0f172a' }}>Mag-alok ng Tulong para sa {selectedPostForHelp.id}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Magpadala ng mensahe kay <strong>{selectedPostForHelp.author}</strong> para sa pagkain, temporary shelter, o gamot.</p>
            <textarea placeholder="Isulat ang iyong mensahe rito..." style={{ width: '100%', height: '90px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '14px', boxSizing: 'border-box' }}></textarea>
            <button onClick={() => { alert('Napadala na ang mensahe sa volunteer!'); setSelectedPostForHelp(null); }} style={{ width: '100%', backgroundColor: '#c25e38', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Ipadala ang Tulong</button>
          </div>
        </div>
      )}

    </div>
  );
}