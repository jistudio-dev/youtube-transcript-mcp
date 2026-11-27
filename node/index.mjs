/** Zero-dependency Node.js 18+ ESM SDK for YouTube Transcripts, Heatmaps & Cloud Downloads (Apify). */
export class YouTubeTranscriptClient {
  constructor(apifyToken = process.env.APIFY_TOKEN || "") {
    if (!apifyToken) throw new Error("Provide apifyToken or set APIFY_TOKEN.");
    this.token = apifyToken;
  }

  async _run(actorId, payload) {
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(this.token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  }

  getTranscripts({ videoUrls, preferredLanguage = "en", country = "US" }) {
    return this._run("jistudio~youtube-transcript-scraper", {
      mode: "transcript_and_heatmap",
      videoUrls,
      preferredLanguage,
      country,
    });
  }

  downloadMedia({ videoUrls, downloadFormat = "muxed_mp4", maxDownloadSizeMB = 50, country = "US" }) {
    return this._run("jistudio~youtube-video-downloader", {
      mode: "video_download",
      videoUrls,
      downloadFormat,
      maxDownloadSizeMB,
      country,
    });
  }
}
