const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      quiet: true,
    });

    // Best video+audio format URL বের করা
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
    res.status(500).json({ ok: false, error: error.message || error.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
