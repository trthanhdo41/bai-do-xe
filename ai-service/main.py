import base64
import re
import tempfile
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import cv2
import pytesseract
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, ImageFilter, ImageOps
from pydantic import BaseModel

app = FastAPI(title="Bãi Đỗ Xe AI Service")


PLATE_PATTERNS = [
    re.compile(r"\b\d{2}[A-Z]{1,2}\d?[-\s.]?\d{3}[-\s.]?\d{2}\b"),
    re.compile(r"\b\d{2}[A-Z]{1,2}[-\s.]?\d{4,5}\b"),
]


class SnapshotRequest(BaseModel):
    rtspUrl: str
    username: str | None = None
    password: str | None = None


def normalize_plate(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", value.upper())


def format_plate(value: str) -> str:
    normalized = normalize_plate(value)
    if len(normalized) >= 8:
        return normalized
    return value.upper().strip()


def camera_url(value: str, username: str | None, password: str | None) -> str:
    if not username:
        return value
    parts = urlsplit(value)
    if "@" in parts.netloc:
        return value
    auth = username if password is None else f"{username}:{password}"
    return urlunsplit((parts.scheme, f"{auth}@{parts.netloc}", parts.path, parts.query, parts.fragment))


def preprocess_variants(image: Image.Image) -> list[Image.Image]:
    gray = ImageOps.grayscale(image)
    resized = gray.resize((gray.width * 2, gray.height * 2))
    sharp = resized.filter(ImageFilter.SHARPEN)
    threshold = sharp.point(lambda pixel: 255 if pixel > 150 else 0)
    inverted = ImageOps.invert(threshold)
    return [resized, sharp, threshold, inverted]


def average_hash(image: Image.Image) -> str:
    gray = ImageOps.grayscale(image).resize((8, 8))
    pixels = list(gray.getdata())
    avg = sum(pixels) / len(pixels)
    bits = ["1" if pixel >= avg else "0" for pixel in pixels]
    return "".join(f"{int(''.join(bits[index:index + 4]), 2):x}" for index in range(0, 64, 4))


def extract_plate(raw_text: str) -> str:
    text = raw_text.upper().replace(" ", "")
    text = text.replace("O", "0").replace("I", "1")
    for pattern in PLATE_PATTERNS:
        match = pattern.search(text)
        if match:
            return format_plate(match.group(0))
    candidates = re.findall(r"\d{2}[A-Z0-9]{4,8}", text)
    if candidates:
        return format_plate(candidates[0])
    return ""


def detect_plate(image_path: Path) -> dict:
    image = Image.open(image_path).convert("RGB")
    best_text = ""
    best_confidence = 0
    best_plate = ""

    for variant in preprocess_variants(image):
        data = pytesseract.image_to_data(
            variant,
            lang="eng+vie",
            config="--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-. ",
            output_type=pytesseract.Output.DICT,
        )
        words = []
        confidences = []
        for word, confidence in zip(data.get("text", []), data.get("conf", [])):
            clean = word.strip()
            try:
                score = int(float(confidence))
            except ValueError:
                score = -1
            if clean and score >= 0:
                words.append(clean)
                confidences.append(score)

        raw_text = " ".join(words)
        plate = extract_plate(raw_text)
        confidence = int(sum(confidences) / len(confidences)) if confidences else 0
        if plate and confidence >= best_confidence:
            best_plate = plate
            best_text = raw_text
            best_confidence = confidence

    return {
        "plate": best_plate,
        "confidence": best_confidence,
        "rawText": best_text,
        "vehicleType": "Không xác định",
        "imageHash": average_hash(image),
    }


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp.write(await file.read())
        temp_path = Path(temp.name)

    try:
        result = detect_plate(temp_path)
    finally:
        temp_path.unlink(missing_ok=True)

    return result


@app.post("/snapshot")
def snapshot(request: SnapshotRequest):
    capture = cv2.VideoCapture(camera_url(request.rtspUrl, request.username, request.password))
    if not capture.isOpened():
        raise HTTPException(status_code=502, detail="Không mở được camera RTSP/HTTP.")

    ok, frame = capture.read()
    capture.release()
    if not ok or frame is None:
        raise HTTPException(status_code=502, detail="Không đọc được frame từ camera.")

    encoded_ok, encoded = cv2.imencode(".jpg", frame)
    if not encoded_ok:
        raise HTTPException(status_code=500, detail="Không mã hóa được ảnh snapshot.")

    return {
        "imageBase64": base64.b64encode(encoded.tobytes()).decode("ascii"),
        "contentType": "image/jpeg",
    }
