
import json
import os
import base64
from datetime import date
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
TODAY = date.today().isoformat()


def search_medicine(name: str) -> dict:
    prompt = f"""Provide detailed medical information about the medicine: "{name}".
Return ONLY valid JSON with no markdown or backticks:
{{"name":"full official name","generic_name":"generic/INN name","category":"drug class","purpose":"2-3 clear sentences on purpose","uses":["use1","use2","use3","use4"],"how_it_works":"1-2 sentences mechanism of action","side_effects":["se1","se2","se3"],"dosage":"typical adult dosage","storage":"storage instructions","warnings":["w1","w2"],"otc":true,"found":true}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    text = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def analyze_image(image_path: str, mime_type: str = "image/jpeg") -> dict:
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    prompt = f"""Analyze this medicine packaging image. Today is {TODAY}.
Return ONLY valid JSON with no markdown or backticks:
{{"name":"medicine name or Unknown","batch":"batch number or N/A","expiry":"date as printed or N/A","manufacturer":"company or N/A","expired":true,"days":90,"status":"Expired or Expiring Soon or Valid or Unknown","purpose":"2-3 sentence purpose","category":"drug class","uses":["use1","use2","use3"],"side_effects":["effect1","effect2","effect3"],"dosage":"typical dosage guidance","storage":"storage instructions","authenticity":"Valid or Suspect or Unknown","confidence":85,"recommendation":"1 sentence recommendation","warnings":["w1"]}}"""

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64}"}
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }],
        temperature=0.3,
    )
    text = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
    return json.loads(text)