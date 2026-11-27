import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "python"))
from youtube_transcript_sdk import YouTubeTranscriptClient

url = sys.argv[1] if len(sys.argv) > 1 else "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
client = YouTubeTranscriptClient()
items = client.get_transcripts([url], preferred_language="en")
if items:
    v = items[0]
    print(f"{v.get('title')} | Words: {v.get('transcriptWordCount')} | Heatmap Peaks: {len(v.get('goldenPeaks') or [])}")
