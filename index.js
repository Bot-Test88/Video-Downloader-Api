const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');

const app = express();

// CORS সব জায়গা থেকে রিকোয়েস্ট আসতে দিবে
app.use(cors());

// JSON বডি পার্স করার জন্য
app.use(express.json());

app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // yt-dlp-exec দিয়ে ভিডিও ইনফো নেওয়া
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      quiet: true,
    });

    // ভিডিওর বেস্ট ফরম্যাট বের করা
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
