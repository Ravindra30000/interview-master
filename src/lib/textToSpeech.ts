import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Server-only module for Google Cloud TTS
let ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (ttsClient) return ttsClient;

  // In Cloud Run, Application Default Credentials (ADC) are automatically available
  // via the service account attached to the Cloud Run instance.
  // For local development, you can set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file.
  
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (credentialsPath) {
    // Local development with explicit credentials file
    ttsClient = new TextToSpeechClient({
      keyFilename: credentialsPath,
    });
  } else {
    // Cloud Run / GCP environment - use Application Default Credentials
    // ADC automatically uses the service account attached to Cloud Run
    ttsClient = new TextToSpeechClient();
  }

  return ttsClient;
}

export interface TTSOptions {
  text: string;
  voice?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: "NEUTRAL" | "MALE" | "FEMALE";
  };
  audioConfig?: {
    audioEncoding?: "MP3" | "LINEAR16" | "OGG_OPUS";
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
  };
}

export async function synthesizeSpeech(options: TTSOptions): Promise<Buffer> {
  const client = getTTSClient();

  const request = {
    input: { text: options.text },
    voice: {
      languageCode: options.voice?.languageCode || "en-US",
      name: options.voice?.name || "en-US-Neural2-D",
      ssmlGender: options.voice?.ssmlGender || "MALE",
    },
    audioConfig: {
      audioEncoding: options.audioConfig?.audioEncoding || "MP3",
      speakingRate: options.audioConfig?.speakingRate || 1.0,
      pitch: options.audioConfig?.pitch || 0,
      volumeGainDb: options.audioConfig?.volumeGainDb || 0,
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error("TTS response missing audio content");
  }

  // Convert Uint8Array to Buffer
  if (response.audioContent instanceof Uint8Array) {
    return Buffer.from(response.audioContent);
  } else if (typeof response.audioContent === "string") {
    return Buffer.from(response.audioContent, "base64");
  } else {
    return Buffer.from(response.audioContent as any);
  }
}
