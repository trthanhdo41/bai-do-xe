export type AiDetectionResult = {
  plate: string;
  confidence: number;
  rawText: string;
  vehicleType: string;
  imageHash: string;
};

export async function detectVehicleImage(file: File): Promise<AiDetectionResult> {
  const serviceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
  const form = new FormData();
  form.append("file", file, file.name);

  const response = await fetch(`${serviceUrl}/detect`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("AI service detection failed");
  }

  return response.json();
}
