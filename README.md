# YouTube Transcript, SRT & Viral Heatmap MCP Server (Zero Cookies · Cloud-IP Safe)

Zero-dependency **MCP Server (`stdio` JSON-RPC 2.0)** + **Python & Node.js SDKs** for extracting **multi-language YouTube transcripts**, millisecond-accurate JSON segments, ready-to-save **`.SRT` subtitles**, **Top-5 Most-Replayed Heatmap peaks**, and cross-IP cloud **MP4 / M4A downloads**.

Built for developers whose `youtube-transcript-api` scripts fail on AWS/GCP/Vercel/Docker cloud IPs — no browser cookies, no headless Chrome.

- **MCP Tools**: `youtube_get_transcript_and_heatmap`, `youtube_download_media`
- **Powered by**: [YouTube Transcript Scraper (`jistudio/youtube-transcript-scraper`)](https://apify.com/jistudio/youtube-transcript-scraper) & [YouTube Video Downloader (`jistudio/youtube-video-downloader`)](https://apify.com/jistudio/youtube-video-downloader)

---

## Claude Desktop / Cursor MCP Setup

```json
{
  "mcpServers": {
    "youtube-transcript-rag": {
      "command": "node",
      "args": ["/path/to/youtube-transcript-mcp/bin/youtube-mcp.mjs"],
      "env": {
        "APIFY_TOKEN": "YOUR_APIFY_TOKEN"
      }
    }
  }
}
```

## Python SDK (Zero Dependencies)

```python
from python.youtube_transcript_sdk import YouTubeTranscriptClient

client = YouTubeTranscriptClient(apify_token="YOUR_APIFY_TOKEN")
items = client.get_transcripts(["https://www.youtube.com/watch?v=dQw4w9WgXcQ"], preferred_language="en")
print(items[0]["title"], "| Words:", items[0]["transcriptWordCount"])
```

## Node.js 18+ ESM SDK (Zero Dependencies)

```javascript
import { YouTubeTranscriptClient } from "./node/index.mjs";

const client = new YouTubeTranscriptClient(process.env.APIFY_TOKEN);
const [video] = await client.getTranscripts({ videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"] });
console.log(video.title, video.transcriptWordCount, video.goldenPeaks?.length);
```

---

## JiStudio Ecosystem

- **GitHub Org**: [github.com/jistudio-dev](https://github.com/jistudio-dev) · **n8n Templates**: [`free-n8n-ecommerce-workflows`](https://github.com/jistudio-dev/free-n8n-ecommerce-workflows)
- **Apify Store**: [apify.com/jistudio](https://apify.com/jistudio)
- **License**: MIT
