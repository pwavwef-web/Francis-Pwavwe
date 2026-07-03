// Shared Firestore-backed podcast data layer.
// This replaces the old local episode file for both listener and admin pages.

(function (global) {
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyB6lxgjNY4CRNHAe3pAgR5SYv1ohL8brOI',
    authDomain: 'francis-pwavwe.firebaseapp.com',
    projectId: 'francis-pwavwe',
    storageBucket: 'francis-pwavwe.firebasestorage.app',
    messagingSenderId: '658069378543',
    appId: '1:658069378543:web:87b1dcb0dd27d3255bd21a'
  };

  const ADMIN_EMAIL = 'pwavwef@gmail.com';
  const EPISODES_COLLECTION = 'podcast_episodes';
  const SETTINGS_COLLECTION = 'podcast_settings';
  const SHOW_SETTINGS_ID = 'show';
  const QUEUE_KEY = 'blue_mind_radio_queue';
  const PLAYING_KEY = 'blue_mind_radio_playing';

  const DEFAULT_SETTINGS = {
    podcastName: 'Blue Mind Radio',
    podcastTagline: 'Exploring Gen Z culture, philosophy, and personal growth.',
    podcastDesc: 'Blue Mind Radio explores Gen Z culture, philosophy, personal growth, and the ideas shaping how we live.',
    podcastHost: 'Francis Pwavwe',
    podcastLang: 'en',
    podcastCategory: 'society-culture',
    spotifyShow: '',
    appleShow: '',
    youtubeChannel: '',
    autoPublish: true,
    notifySubscribers: false
  };

  let sdkPromise = null;
  let cachedEpisodes = [];

  function getSdk() {
    if (!sdkPromise) {
      sdkPromise = Promise.all([
        import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'),
        import('https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js')
      ]).then(([appMod, authMod, firestoreMod, storageMod]) => {
        const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(FIREBASE_CONFIG);
        return {
          app,
          auth: authMod.getAuth(app),
          db: firestoreMod.getFirestore(app),
          storage: storageMod.getStorage(app),
          authMod,
          firestoreMod,
          storageMod
        };
      });
    }
    return sdkPromise;
  }

  function waitForAuth(authMod, auth) {
    return new Promise((resolve) => {
      const unsubscribe = authMod.onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user || null);
      });
    });
  }

  async function getCurrentUser() {
    const { authMod, auth } = await getSdk();
    return waitForAuth(authMod, auth);
  }

  async function requireAdminUser() {
    const user = await getCurrentUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      throw new Error('Please sign in with the podcast admin Firebase account first.');
    }
    return user;
  }

  async function signInAdmin(password) {
    const { authMod, auth } = await getSdk();
    const result = await authMod.signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    if (!result.user || result.user.email !== ADMIN_EMAIL) {
      await authMod.signOut(auth);
      throw new Error('Access denied for this account.');
    }
    return result.user;
  }

  async function signOutAdmin() {
    const { authMod, auth } = await getSdk();
    await authMod.signOut(auth);
  }

  function cleanUrl(value) {
    const url = String(value || '').trim();
    return url && url !== '#' ? url : '';
  }

  function timestampToDate(value) {
    if (!value) return null;
    if (value.toDate) return value.toDate();
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function parseDuration(value) {
    if (!value) return 0;
    if (typeof value === 'number') return Math.max(0, Math.round(value));
    const parts = String(value).split(':').map((part) => parseInt(part, 10));
    if (parts.some((part) => Number.isNaN(part))) return 0;
    return parts.reduce((total, part) => total * 60 + part, 0);
  }

  function formatDuration(seconds) {
    const safe = Math.max(0, Math.round(Number(seconds) || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function formatDate(value, options) {
    const date = timestampToDate(value);
    if (!date) return '';
    return date.toLocaleDateString('en-GB', options || { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function sortEpisodes(list) {
    return list.slice().sort((a, b) => {
      const aTime = a.sortTime || 0;
      const bTime = b.sortTime || 0;
      if (aTime !== bTime) return bTime - aTime;
      if (a.season !== b.season) return b.season - a.season;
      return b.episode - a.episode;
    });
  }

  function normalizeTags(value) {
    if (Array.isArray(value)) {
      return value.map((tag) => String(tag).trim()).filter(Boolean);
    }
    if (!value) return [];
    return String(value).split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  function normalizeEpisode(id, data) {
    const episodeNumber = Number(data.episode || data.episodeNum || 1) || 1;
    const seasonNumber = Number(data.season || 1) || 1;
    const publishedDate = timestampToDate(data.publishedAt);
    const createdDate = timestampToDate(data.createdAt);
    const updatedDate = timestampToDate(data.updatedAt);
    const durationSecs = Number(data.durationSecs || data.durationSeconds || 0) || parseDuration(data.duration);
    return {
      ...data,
      id,
      season: seasonNumber,
      episode: episodeNumber,
      title: data.title || 'Untitled Episode',
      description: data.description || '',
      guest: data.guest || '',
      tags: normalizeTags(data.tags),
      durationSecs,
      duration: data.duration || (durationSecs ? formatDuration(durationSecs) : '0:00'),
      date: formatDate(data.publishedAt || data.createdAt),
      coverImage: cleanUrl(data.coverImage || data.coverUrl),
      audioUrl: cleanUrl(data.audioUrl),
      spotifyUrl: cleanUrl(data.spotifyUrl),
      applePodcastsUrl: cleanUrl(data.applePodcastsUrl || data.appleUrl),
      youtubeUrl: cleanUrl(data.youtubeUrl),
      isPublished: data.isPublished === true,
      sortTime: (publishedDate || createdDate || updatedDate || new Date(0)).getTime()
    };
  }

  async function fetchPublishedWithFallback(firestoreMod, db) {
    const col = firestoreMod.collection(db, EPISODES_COLLECTION);
    try {
      const q = firestoreMod.query(
        col,
        firestoreMod.where('isPublished', '==', true),
        firestoreMod.orderBy('publishedAt', 'desc')
      );
      return await firestoreMod.getDocs(q);
    } catch (error) {
      const q = firestoreMod.query(col, firestoreMod.where('isPublished', '==', true));
      return await firestoreMod.getDocs(q);
    }
  }

  async function loadEpisodes(options) {
    const opts = options || {};
    const publishedOnly = opts.publishedOnly !== false;
    const { firestoreMod, db } = await getSdk();
    const col = firestoreMod.collection(db, EPISODES_COLLECTION);
    const snap = publishedOnly
      ? await fetchPublishedWithFallback(firestoreMod, db)
      : await firestoreMod.getDocs(col);
    let episodes = snap.docs.map((docSnap) => normalizeEpisode(docSnap.id, docSnap.data()));
    if (publishedOnly) {
      episodes = episodes.filter((episode) => episode.isPublished);
    }
    episodes = sortEpisodes(episodes);
    cachedEpisodes = episodes;
    if (opts.limit) episodes = episodes.slice(0, opts.limit);
    return episodes;
  }

  async function getEpisode(id) {
    if (!id) return null;
    const cached = getEpisodeById(id);
    if (cached) return cached;
    const { firestoreMod, db } = await getSdk();
    const ref = firestoreMod.doc(db, EPISODES_COLLECTION, String(id));
    const snap = await firestoreMod.getDoc(ref);
    return snap.exists() ? normalizeEpisode(snap.id, snap.data()) : null;
  }

  async function saveEpisode(episode, id) {
    await requireAdminUser();
    const { firestoreMod, db } = await getSdk();
    const now = firestoreMod.serverTimestamp();
    const payload = {
      season: Number(episode.season || 1),
      episode: Number(episode.episode || 1),
      title: String(episode.title || '').trim(),
      description: String(episode.description || '').trim(),
      guest: String(episode.guest || '').trim(),
      tags: normalizeTags(episode.tags),
      duration: episode.duration || formatDuration(episode.durationSecs),
      durationSecs: Number(episode.durationSecs || 0),
      spotifyUrl: cleanUrl(episode.spotifyUrl),
      applePodcastsUrl: cleanUrl(episode.applePodcastsUrl),
      youtubeUrl: cleanUrl(episode.youtubeUrl),
      coverImage: cleanUrl(episode.coverImage),
      coverPath: episode.coverPath || '',
      audioUrl: cleanUrl(episode.audioUrl),
      audioPath: episode.audioPath || '',
      audioFileName: episode.audioFileName || '',
      audioContentType: episode.audioContentType || '',
      audioSize: Number(episode.audioSize || 0),
      isPublished: episode.isPublished === true,
      updatedAt: now
    };

    if (episode.publishedAt) {
      payload.publishedAt = episode.publishedAt;
    } else if (payload.isPublished) {
      payload.publishedAt = now;
    } else {
      payload.publishedAt = null;
    }

    if (id) {
      await firestoreMod.updateDoc(firestoreMod.doc(db, EPISODES_COLLECTION, String(id)), payload);
      return String(id);
    }

    payload.createdAt = now;
    const ref = await firestoreMod.addDoc(firestoreMod.collection(db, EPISODES_COLLECTION), payload);
    return ref.id;
  }

  async function updateEpisode(id, data) {
    await requireAdminUser();
    const { firestoreMod, db } = await getSdk();
    await firestoreMod.updateDoc(firestoreMod.doc(db, EPISODES_COLLECTION, String(id)), {
      ...data,
      updatedAt: firestoreMod.serverTimestamp()
    });
  }

  async function toggleEpisodePublished(id, publish, episode) {
    const payload = { isPublished: publish === true };
    if (publish && !(episode && episode.publishedAt)) {
      const { firestoreMod } = await getSdk();
      payload.publishedAt = firestoreMod.serverTimestamp();
    }
    await updateEpisode(id, payload);
  }

  function safeFileName(fileName) {
    return String(fileName || 'file')
      .trim()
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'file';
  }

  async function uploadEpisodeFile(file, kind) {
    if (!file) return null;
    const user = await requireAdminUser();
    const { storageMod, storage } = await getSdk();
    const path = `podcast/${user.uid}/${kind}/${Date.now()}-${safeFileName(file.name)}`;
    const storageRef = storageMod.ref(storage, path);
    await storageMod.uploadBytes(storageRef, file, { contentType: file.type || undefined });
    const url = await storageMod.getDownloadURL(storageRef);
    return {
      url,
      path,
      name: file.name,
      size: file.size,
      type: file.type || ''
    };
  }

  async function deleteStoragePath(path) {
    if (!path) return;
    const { storageMod, storage } = await getSdk();
    try {
      await storageMod.deleteObject(storageMod.ref(storage, path));
    } catch (error) {
      if (error && error.code !== 'storage/object-not-found') {
        throw error;
      }
    }
  }

  async function deleteEpisode(id, episode) {
    await requireAdminUser();
    const { firestoreMod, db } = await getSdk();
    const ep = episode || await getEpisode(id);
    await firestoreMod.deleteDoc(firestoreMod.doc(db, EPISODES_COLLECTION, String(id)));
    await Promise.all([
      deleteStoragePath(ep && ep.audioPath),
      deleteStoragePath(ep && ep.coverPath)
    ]);
  }

  async function loadSettings() {
    const { firestoreMod, db } = await getSdk();
    const ref = firestoreMod.doc(db, SETTINGS_COLLECTION, SHOW_SETTINGS_ID);
    const snap = await firestoreMod.getDoc(ref);
    return {
      ...DEFAULT_SETTINGS,
      ...(snap.exists() ? snap.data() : {})
    };
  }

  async function saveSettings(settings) {
    await requireAdminUser();
    const { firestoreMod, db } = await getSdk();
    const payload = {
      podcastName: String(settings.podcastName || '').trim(),
      podcastTagline: String(settings.podcastTagline || '').trim(),
      podcastDesc: String(settings.podcastDesc || '').trim(),
      podcastHost: String(settings.podcastHost || '').trim(),
      podcastLang: String(settings.podcastLang || 'en').trim(),
      podcastCategory: String(settings.podcastCategory || 'society-culture').trim(),
      spotifyShow: cleanUrl(settings.spotifyShow),
      appleShow: cleanUrl(settings.appleShow),
      youtubeChannel: cleanUrl(settings.youtubeChannel),
      autoPublish: settings.autoPublish === true,
      notifySubscribers: settings.notifySubscribers === true,
      updatedAt: firestoreMod.serverTimestamp()
    };
    await firestoreMod.setDoc(firestoreMod.doc(db, SETTINGS_COLLECTION, SHOW_SETTINGS_ID), payload, { merge: true });
  }

  function getQueue() {
    try {
      const parsed = JSON.parse(global.localStorage.getItem(QUEUE_KEY)) || [];
      return parsed.map((id) => String(id)).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function saveQueue(queue) {
    global.localStorage.setItem(QUEUE_KEY, JSON.stringify((queue || []).map((id) => String(id))));
  }

  function addToQueue(episodeId) {
    const id = String(episodeId || '');
    if (!id) return;
    const queue = getQueue();
    if (!queue.includes(id)) {
      queue.push(id);
      saveQueue(queue);
    }
  }

  function removeFromQueue(episodeId) {
    const id = String(episodeId || '');
    saveQueue(getQueue().filter((queuedId) => queuedId !== id));
  }

  function setNowPlaying(episodeId) {
    const id = String(episodeId || '');
    if (id) global.localStorage.setItem(PLAYING_KEY, id);
  }

  function getNowPlaying() {
    return global.localStorage.getItem(PLAYING_KEY) || null;
  }

  function getEpisodeById(id) {
    const wanted = String(id || '');
    return cachedEpisodes.find((episode) => String(episode.id) === wanted) || null;
  }

  function setCachedEpisodes(episodes) {
    cachedEpisodes = sortEpisodes((episodes || []).map((episode) => normalizeEpisode(episode.id, episode)));
    return cachedEpisodes;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
  }

  function coverHtml(episode, classes, fallback) {
    if (episode && episode.coverImage) {
      return `<img src="${escapeAttr(episode.coverImage)}" alt="${escapeAttr(episode.title || 'Episode cover')}" class="${classes || 'w-full h-full object-cover'}">`;
    }
    return fallback || '<i data-lucide="mic" class="w-8 h-8" style="color:#fbbf24"></i>';
  }

  global.PodcastData = {
    ADMIN_EMAIL,
    EPISODES_COLLECTION,
    DEFAULT_SETTINGS,
    getSdk,
    getCurrentUser,
    requireAdminUser,
    signInAdmin,
    signOutAdmin,
    loadEpisodes,
    getEpisode,
    saveEpisode,
    updateEpisode,
    toggleEpisodePublished,
    uploadEpisodeFile,
    deleteEpisode,
    loadSettings,
    saveSettings,
    cleanUrl,
    normalizeEpisode,
    sortEpisodes,
    formatDate,
    formatDuration,
    parseDuration,
    timestampToDate,
    escapeHtml,
    escapeAttr,
    coverHtml,
    getQueue,
    saveQueue,
    addToQueue,
    removeFromQueue,
    setNowPlaying,
    getNowPlaying,
    getEpisodeById,
    setCachedEpisodes
  };

  global.getQueue = getQueue;
  global.saveQueue = saveQueue;
  global.addToQueue = addToQueue;
  global.removeFromQueue = removeFromQueue;
  global.setNowPlaying = setNowPlaying;
  global.getNowPlaying = getNowPlaying;
  global.getEpisodeById = getEpisodeById;
})(window);
