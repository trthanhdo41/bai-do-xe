import { env } from "../config/env.js";

export type AiDetectionResult = {
  plate: string;
  confidence: number;
  rawText: string;
  vehicleType: string;
  imageHash: string;
};

export async function detectVehicleImage(file: Express.Multer.File): Promise<AiDetectionResult> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
  form.append("file", blob, file.originalname);

  const response = await fetch(`${env.aiServiceUrl}/detect`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("AI service detection failed");
  }

  return response.json() as Promise<AiDetectionResult>;
}
