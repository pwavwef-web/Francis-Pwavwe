// The AZ Podcast — Mock Episodes Data
// Replace with real data / Firebase fetch once team uploads real episodes.

const AZ_EPISODES = [
  {
    id: 1,
    season: 1,
    episode: 1,
    title: 'From Zero to Something: Starting When You Have Nothing',
    description: 'Francis opens the show with an honest look at what it takes to begin — no money, no connections, no blueprint. Just will and a clear reason why. This episode sets the tone for everything The AZ Podcast is about.',
    duration: '42:18',
    durationSecs: 2538,
    tags: ['Motivation', 'Growth'],
    date: 'Jan 6, 2026',
    spotifyUrl: '#',
    applePodcastsUrl: '#',
    youtubeUrl: '#',
    coverEmoji: '🚀',
    guest: null,
    isMock: true
  },
  {
    id: 2,
    season: 1,
    episode: 2,
    title: 'The Gen Z Identity Crisis: Who Are We Really?',
    description: 'We dissect the paradox of being the most connected generation in history yet feeling the most lost. Social media, hustle culture, mental health — a raw, unfiltered two-hour conversation about who Gen Z actually is.',
    duration: '55:34',
    durationSecs: 3334,
    tags: ['Gen Z', 'Identity'],
    date: 'Jan 13, 2026',
    spotifyUrl: '#',
    applePodcastsUrl: '#',
    youtubeUrl: '#',
    coverEmoji: '🌀',
    guest: null,
    isMock: true
  },
  {
    id: 3,
    season: 1,
    episode: 3,
    title: 'Accountability Without Shame: A New Way to Grow',
    description: 'Guest episode with life coach Ama Boateng on redefining accountability — holding yourself to standards without tearing yourself down. A conversation that will change how you approach self-improvement.',
    duration: '48:07',
    durationSecs: 2887,
    tags: ['Mindset', 'Wellness'],
    date: 'Jan 20, 2026',
    spotifyUrl: '#',
    applePodcastsUrl: '#',
    youtubeUrl: '#',
    coverEmoji: '🪞',
    guest: 'Ama Boateng',
    isMock: true
  },
  {
    id: 4,
    season: 1,
    episode: 4,
    title: 'Hustle Culture is Broken — Here\'s What Works Instead',
    description: 'The glorification of overwork is killing our generation\'s creativity. Francis breaks down why hustle culture fails most people and what sustainable high performance actually looks like in practice.',
    duration: '39:52',
    durationSecs: 2392,
    tags: ['Work', 'Productivity'],
    date: 'Jan 27, 2026',
    spotifyUrl: '#',
    applePodcastsUrl: '#',
    youtubeUrl: '#',
    coverEmoji: '⚡',
    guest: null,
    isMock: true
  },
  {
    id: 5,
    season: 1,
    episode: 5,
    title: 'Mental Load: Why Smart People Stay Stuck',
    description: 'Intelligence alone doesn\'t determine success. In this episode, we explore the invisible weight — decision fatigue, overthinking, perfectionism — that keeps brilliant people frozen in place, and how to finally break free.',
    duration: '51:19',
    durationSecs: 3079,
    tags: ['Mindset', 'Mental Health'],
    date: 'Feb 3, 2026',
    spotifyUrl: '#',
    applePodcastsUrl: '#',
    youtubeUrl: '#',
    coverEmoji: '🧠',
    guest: null,
    isMock: true
  },
  {
    id: 6,
    season: 1,
    episode: 6,
    title: 'Money, Meaning & the African Dream',
    description: 'What does financial success mean in an African context? Guest Kwesi Mensah joins Francis to talk about building wealth in Ghana, navigating family expectations, and redefining what "making it" looks like.',
    duration: '1:02:45',
    durationSecs: 3765,
    tags: ['Finance', 'Africa'],
    date: 'Feb 10, 2026',
    spotifyUrl: '#',
    applePodcastsUrl: '#',
    youtubeUrl: '#',
    coverEmoji: '💰',
    guest: 'Kwesi Mensah',
    isMock: true
  }
];

// Simple localStorage-based queue
const AZ_QUEUE_KEY = 'az_podcast_queue';
const AZ_PLAYING_KEY = 'az_podcast_playing';

function getQueue() {
  try { return JSON.parse(localStorage.getItem(AZ_QUEUE_KEY)) || []; }
  catch(e) { return []; }
}

function saveQueue(q) {
  localStorage.setItem(AZ_QUEUE_KEY, JSON.stringify(q));
}

function addToQueue(episodeId) {
  const q = getQueue();
  if (!q.includes(episodeId)) {
    q.push(episodeId);
    saveQueue(q);
  }
}

function removeFromQueue(episodeId) {
  saveQueue(getQueue().filter(id => id !== episodeId));
}

function setNowPlaying(episodeId) {
  localStorage.setItem(AZ_PLAYING_KEY, episodeId);
}

function getNowPlaying() {
  const id = localStorage.getItem(AZ_PLAYING_KEY);
  return id ? parseInt(id, 10) : null;
}

function getEpisodeById(id) {
  return AZ_EPISODES.find(ep => ep.id === parseInt(id, 10)) || null;
}
