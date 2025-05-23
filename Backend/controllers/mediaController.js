// mediaController.js
// mediaController.js
const axios = require('axios');

const mediaCache = new Map(); // In-memory cache for query results

const getCacheKey = (q, category, filter, page) => `${q}_${category}_${filter}_${page}`;

// ===================== FETCH MEDIA =====================
const fetchMedia = async (req, res) => {
  const { q, category = "all", filter = "popular", page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: "Query 'q' is required" });

  const order = filter === "latest" ? "latest" : "popular";

  const pixabayKey = process.env.PIXABAY_API_KEY;
  const unsplashKey = process.env.UNSPLASH_API_KEY;
  const giphyKey = process.env.GIPHY_API_KEY;
  const freesoundKey = process.env.FREESOUND_API_KEY;

  const timeout = 5000; // 5 seconds max per API

  // -------------------- API Fetch Functions --------------------
  const fetchPixabayImages = () => {
    let imageType = "photo";
    if (category === "illustrations") imageType = "illustration";
    else if (category === "vectors") imageType = "vector";

    const url = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(q)}&image_type=${imageType}&per_page=20&page=${page}&order=${order}`;
    return axios.get(url, { timeout }).then(res => res.data.hits || []);
  };

  const fetchPixabayVideos = () => {
    const url = `https://pixabay.com/api/videos/?key=${pixabayKey}&q=${encodeURIComponent(q)}&per_page=10&page=${page}&order=${order}`;
    return axios.get(url, { timeout }).then(res => res.data.hits || []);
  };

  const fetchUnsplash = () => {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&page=${page}&order_by=${order}`;
    return axios.get(url, {
      timeout,
      headers: { Authorization: `Client-ID ${unsplashKey}` }
    }).then(res => res.data.results || []);
  };

  const fetchGiphy = () => {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(q)}&limit=10&offset=${(page - 1) * 10}`;
    return axios.get(url, { timeout }).then(res => res.data.data || []);
  };

  const fetchFreesound = () => {
    const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(q)}&page=${page}&filter=duration:[0 TO 600]&fields=name,previews,username,description&order=${order}&token=${freesoundKey}`;
    return axios.get(url, { timeout }).then(res => res.data.results || []);
  };

  // -------------------- Category Map --------------------
  const fetchMap = {
    all: [fetchPixabayImages, fetchUnsplash, fetchPixabayVideos, fetchGiphy],
    photos: [fetchPixabayImages, fetchUnsplash],
    illustrations: [fetchPixabayImages],
    vectors: [fetchPixabayImages],
    videos: [fetchPixabayVideos],
    gifs: [fetchGiphy],
    audio: [fetchFreesound],
  };

  try {
    const fetchFns = fetchMap[category] || fetchMap["all"];
    const results = await Promise.allSettled(fetchFns.map(fn => fn()));

    const media = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value);

    return res.status(200).json({ success: true, results: media });
  } catch (err) {
    console.error("FetchMedia error:", err.message);
    return res.status(500).json({ error: "Media fetch failed" });
  }
};


module.exports = {
  fetchMedia,
};

// ===================== PROXY MEDIA =====================
const proxyMedia = async (req, res) => {
  const mediaUrl = req.query.url;
  if (!mediaUrl) return res.status(400).send("Missing media URL");

  try {
    const response = await axios.get(mediaUrl, {
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400");
    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).send("Failed to fetch media.");
  }
};

// ===================== TRENDING TAGS =====================
let cachedTags = null;
let cacheTimestamp = null;

const getTrendingTags = async (req, res) => {
  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
  const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
  const CACHE_DURATION = 3600000; // 1 hour

  const realWorldTags = [
    "Women's Day", "IPL 2025", "AI", "NASA", "Eid", "SpaceX", "Met Gala",
    "Crypto", "Cybersecurity", "Oscars", "Spring Festival", "Gaming", "Elon Musk",
    "Fashion Week", "Earth Day", "Summer Travel", "ChatGPT", "Formula One"
  ];

  const now = Date.now();
  if (cachedTags && (now - cacheTimestamp < CACHE_DURATION)) {
    return res.json({ tags: cachedTags });
  }

  try {
    const pixabayURL = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&per_page=10`;
    const unsplashURL = `https://api.unsplash.com/topics?client_id=${UNSPLASH_API_KEY}&per_page=10`;

    const [pixabayRes, unsplashRes] = await Promise.all([
      axios.get(pixabayURL),
      axios.get(unsplashURL)
    ]);

    const tagSet = new Set(realWorldTags);

    if (pixabayRes.data?.hits) {
      pixabayRes.data.hits.forEach(hit => {
        hit.tags?.split(',').forEach(tag => tagSet.add(tag.trim()));
      });
    }

    if (Array.isArray(unsplashRes.data)) {
      unsplashRes.data.forEach(topic => {
        if (topic.title) tagSet.add(topic.title.trim());
      });
    }

    const sortedTags = Array.from(tagSet).sort();
    cachedTags = sortedTags;
    cacheTimestamp = now;

    res.json({ tags: sortedTags });

  } catch (error) {
    console.error("Failed to fetch trending tags:", error.message);
    res.json({ tags: realWorldTags }); // fallback
  }
};

// ===================== DOWNLOAD MEDIA =====================
const downloadMedia = async (req, res) => {
  const { url, type = "file" } = req.query;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await axios.get(url, { responseType: 'stream' });

    const contentType = response.headers['content-type'];
    const ext = contentType?.split('/')[1]?.split(';')[0] || 'bin';
    const filename = `Imglys_download.${ext}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);

    response.data.pipe(res);
  } catch (error) {
    console.error('Download failed:', error.message);
    res.status(500).json({ error: 'Failed to download media' });
  }
};

module.exports = {
  fetchMedia,
  getTrendingTags,
  downloadMedia,
  proxyMedia // ✅ don't forget to export this!
};
