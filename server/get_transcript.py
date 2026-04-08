import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi


def _normalize_transcript(raw_items):
    normalized = []
    for item in raw_items:
        if isinstance(item, dict):
            normalized.append(
                {
                    "text": item.get("text", ""),
                    "start": item.get("start", 0),
                    "duration": item.get("duration", 0),
                }
            )
        else:
            normalized.append(
                {
                    "text": getattr(item, "text", ""),
                    "start": getattr(item, "start", 0),
                    "duration": getattr(item, "duration", 0),
                }
            )
    return normalized


def fetch_transcript(video_id):
    api = YouTubeTranscriptApi()

    try:
        fetched = api.fetch(video_id, languages=["en"])
    except Exception as e:
        try:
            fetched = api.fetch(video_id)
        except Exception as e2:
            print(json.dumps({"success": False, "error": str(e2)}))
            return

    if hasattr(fetched, "to_raw_data"):
        transcript_data = fetched.to_raw_data()
        language = getattr(fetched, "language", None)
        language_code = getattr(fetched, "language_code", None)
    else:
        transcript_data = fetched
        language = None
        language_code = None

    transcript = _normalize_transcript(transcript_data)
    text = " ".join(entry["text"] for entry in transcript if entry.get("text"))

    print(
        json.dumps(
            {
                "success": True,
                "language": language,
                "languageCode": language_code,
                "transcript": transcript,
                "text": text,
                "segments": len(transcript),
            }
        )
    )


if __name__ == "__main__":
    if len(sys.argv) <= 1:
        print(json.dumps({"success": False, "error": "video_id argument is required"}))
        sys.exit(1)

    fetch_transcript(sys.argv[1])