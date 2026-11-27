#!/usr/bin/env node
/**
 * Zero-dependency MCP stdio server for YouTube Transcripts, SRT Subtitles,
 * Top-5 Most-Replayed Viral Heatmap Peaks & Cloud MP4/M4A Downloads via Apify.
 */
import readline from "node:readline";

const APIFY_TOKEN = process.env.APIFY_TOKEN || "";

const TOOLS = [
  {
    name: "youtube_get_transcript_and_heatmap",
    description: "Extract clean verbatim YouTube transcripts, timestamped JSON segments, ready-to-save .SRT subtitles, and Top-5 Most-Replayed viral heatmap peaks without cookies or cloud IP blocks.",
    inputSchema: {
      type: "object",
      properties: {
        videoUrls: {
          type: "array",
          items: { type: "string" },
          description: "List of YouTube video URLs (e.g. ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'])",
        },
        preferredLanguage: { type: "string", default: "en", description: "Target ISO language code (en, vi, es, ja, ko...)" },
        country: { type: "string", default: "US" },
      },
      required: ["videoUrls"],
    },
  },
  {
    name: "youtube_download_media",
    description: "Download playable YouTube MP4 video or M4A audio directly to cross-IP cloud storage and return permanent downloadUrl + stream metadata.",
    inputSchema: {
      type: "object",
      properties: {
        videoUrls: { type: "array", items: { type: "string" } },
        downloadFormat: {
          type: "string",
          enum: ["muxed_mp4", "audio_m4a", "best_video_only", "urls_only"],
          default: "muxed_mp4",
        },
        maxDownloadSizeMB: { type: "integer", default: 50 },
        country: { type: "string", default: "US" },
      },
      required: ["videoUrls"],
    },
  },
];

async function runApifyActor(actorId, payload) {
  if (!APIFY_TOKEN) {
    throw new Error("Missing APIFY_TOKEN environment variable. Get a free token at https://apify.com/jistudio/youtube-transcript-scraper");
  }
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function executeTool(name, args = {}) {
  if (name === "youtube_get_transcript_and_heatmap") {
    return runApifyActor("jistudio~youtube-transcript-scraper", {
      mode: "transcript_and_heatmap",
      videoUrls: args.videoUrls || [],
      preferredLanguage: args.preferredLanguage || "en",
      country: args.country || "US",
    });
  }
  if (name === "youtube_download_media") {
    return runApifyActor("jistudio~youtube-video-downloader", {
      mode: "video_download",
      videoUrls: args.videoUrls || [],
      downloadFormat: args.downloadFormat || "muxed_mp4",
      maxDownloadSizeMB: args.maxDownloadSizeMB || 50,
      country: args.country || "US",
    });
  }
  throw new Error(`Unknown tool: ${name}`);
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let req;
  try {
    req = JSON.parse(trimmed);
  } catch {
    return;
  }
  const { id, method, params } = req;
  if (method === "notifications/initialized" || method === "notifications/cancelled") return;
  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "jistudio-youtube-transcript-mcp", version: "1.0.0" },
        },
      });
      return;
    }
    if (method === "ping") {
      send({ jsonrpc: "2.0", id, result: {} });
      return;
    }
    if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
      return;
    }
    if (method === "tools/call") {
      const items = await executeTool(params?.name, params?.arguments || {});
      send({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] },
      });
      return;
    }
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (err) {
    send({
      jsonrpc: "2.0",
      id,
      result: { isError: true, content: [{ type: "text", text: String(err?.message || err) }] },
    });
  }
});
