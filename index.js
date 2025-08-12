const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');

const app = express();

// সব জায়গা থেকে CORS এক্সেস দিবে
app.use(cors());

// JSON বডি পার্স করার জন্য
app.use(express.json());

// POST /api/download এন্ডপয়েন্ট
app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // ভিডিওর ইনফো নিয়ে আসা
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      quiet: true,
    });

    // বেস্ট ভিডিও+অডিও ফরম্যাট বের করা
    let videoUrl = null;
    if (info.formats && info.formats.length) {
      const bestFormat = info.formats
        .filter(f => f.acodec !== 'none' && f.vcodec !== 'none')
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      videoUrl = bestFormat ? bestFormat.url : info.url;
    } else {
      videoUrl = info.url;
    }

    res.json({
      ok: true,
      title: info.title,
      download_url: videoUrl,
      info,
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ ok: false, error: error.message || error.toString() });
  }
});

// Vercel এর জন্য PORT সেটিংস
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});