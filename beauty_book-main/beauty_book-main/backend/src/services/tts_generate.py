import edge_tts
import asyncio
import sys
import json
import os

async def main():
    text = sys.argv[1] if len(sys.argv) > 1 else "Bonjour"
    voice = sys.argv[2] if len(sys.argv) > 2 else "fr-FR-DeniseNeural"
    output = sys.argv[3] if len(sys.argv) > 3 else "C:/Users/G15/Desktop/tts_output.mp3"
    
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output)
    
    # Output JSON with file info
    size = os.path.getsize(output) if os.path.exists(output) else 0
    print(json.dumps({"status": "ok", "file": output, "size": size, "voice": voice}))

asyncio.run(main())
