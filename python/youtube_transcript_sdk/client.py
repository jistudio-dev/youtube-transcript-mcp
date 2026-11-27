"""Zero-dependency Python SDK for YouTube Transcripts, SRT, Heatmaps & Media Downloads (Apify)."""
import json
import os
import urllib.parse
import urllib.request


class YouTubeTranscriptClient:
    def __init__(self, apify_token: str | None = None, timeout: int = 120):
        self.token = apify_token or os.environ.get("APIFY_TOKEN", "")
        if not self.token:
            raise ValueError("Provide apify_token or set APIFY_TOKEN environment variable.")
        self.timeout = timeout

    def _run_actor(self, actor_id: str, payload: dict) -> list[dict]:
        qs = urllib.parse.urlencode({"token": self.token})
        url = f"https://api.apify.com/v2/acts/{actor_id}/run-sync-get-dataset-items?{qs}"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def get_transcripts(self, video_urls: list[str], preferred_language: str = "en", country: str = "US") -> list[dict]:
        return self._run_actor(
            "jistudio~youtube-transcript-scraper",
            {
                "mode": "transcript_and_heatmap",
                "videoUrls": video_urls,
                "preferredLanguage": preferred_language,
                "country": country,
            },
        )

    def download_media(
        self,
        video_urls: list[str],
        download_format: str = "muxed_mp4",
        max_download_size_mb: int = 50,
        country: str = "US",
    ) -> list[dict]:
        return self._run_actor(
            "jistudio~youtube-video-downloader",
            {
                "mode": "video_download",
                "videoUrls": video_urls,
                "downloadFormat": download_format,
                "maxDownloadSizeMB": max_download_size_mb,
                "country": country,
            },
        )
