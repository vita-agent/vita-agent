
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { FoodItem, MealPlan } from "../types";

// --- Audio Utilities ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}
function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

// --- Service ---

export class GeminiService {
  private ai: GoogleGenAI;
  private model = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.API_KEY;
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' });
  }

  async analyzeFood(input: string | { base64: string, mimeType: string }): Promise<FoodItem[]> {
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          servingSize: { type: Type.STRING },
          brand: { type: Type.STRING },
          verified: { type: Type.BOOLEAN }
        },
        required: ["name", "calories", "protein", "carbs", "fats", "servingSize", "verified"]
      }
    };

    let contents;
    if (typeof input === 'string') {
      contents = { parts: [{ text: `Analyze this food description and return a list of items with estimated nutrition: "${input}"` }] };
    } else {
      contents = {
        parts: [
          { inlineData: { mimeType: input.mimeType, data: input.base64 } },
          { text: "Identify all food items in this image. Estimate serving sizes and nutrition facts precisely." }
        ]
      };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction: "You are a professional nutritionist API. Return precise JSON data only. Do not hallucinate wild values. Use standard serving sizes."
        }
      });

      if (response.text) {
        const items = JSON.parse(response.text) as FoodItem[];
        return items.map(i => ({ ...i, id: Math.random().toString(36).substr(2, 9) }));
      }
      return [];
    } catch (e) {
      console.error("AI Analysis Error:", e);
      throw new Error("Analysis failed");
    }
  }

  async chat(message: string, history: any[], systemInstruction?: string): Promise<string> {
    const chat = this.ai.chats.create({
      model: this.model,
      history,
      config: {
        systemInstruction: systemInstruction || "You are Vita, an elite nutrition coach. Your tone is empathetic, professional, and data-driven. Keep responses concise for mobile reading. Use emojis sparingly but effectively."
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text || "";
  }

  async generateMealPlan(userSummary: string): Promise<MealPlan[]> {
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER }
                  }
                },
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    };

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 3-day meal plan for: ${userSummary}. Ensure meals are varied and appetizing.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: 'You are a master chef and nutritionist. Generate detailed meal plans with specific recipes and ingredients.'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MealPlan[];
    }
    return [];
  }

  async analyzeMedicalReport(base64: string, mimeType: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: "Analyze this medical record. Summarize key findings, abnormal values, and any doctor recommendations in simple terms." }
        ]
      }
    });
    return response.text || "Could not generate summary.";
  }
}

// --- Live Client (Voice & Volume) ---
export class LiveClient {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async connect(onMessage: (text: string) => void, onStatus: (s: string) => void, onVolume: (v: number) => void) {
    onStatus("Connecting...");

    // Robust AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      onStatus("Audio Not Supported");
      return;
    }

    try {
      this.inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
      this.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
      const outputNode = this.outputAudioContext!.createGain();
      outputNode.connect(this.outputAudioContext!.destination);

      // Check if getUserMedia is supported and allowed
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media Devices API not available");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            onStatus("Active");
            this.startAudioInput(stream, onVolume);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription?.text) {
              onMessage(msg.serverContent.outputTranscription.text);
            }

            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && this.outputAudioContext) {
              if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              const buffer = await decodeAudioData(decode(audio), this.outputAudioContext, 24000, 1);
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              source.start(this.nextStartTime);
              this.nextStartTime += buffer.duration;
            }
          },
          onclose: () => onStatus("Disconnected"),
          onerror: (e) => {
            console.error(e);
            onStatus("Connection Error");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {}
        }
      });
    } catch (e) {
      onStatus("Permission Denied");
      console.error("Microphone permission denied or API error:", e);
      // Do not throw, allow UI to show error state, but prevent app crash
    }
  }

  private startAudioInput(stream: MediaStream, onVolume: (v: number) => void) {
    if (!this.inputAudioContext) return;
    const source = this.inputAudioContext.createMediaStreamSource(stream);
    const processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Calculate volume (RMS) for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      onVolume(rms);

      const pcmBlob = createBlob(inputData);
      this.sessionPromise?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
    };
    source.connect(processor);
    processor.connect(this.inputAudioContext.destination);
  }

  async disconnect() {
    try {
      if (this.inputAudioContext?.state !== 'closed') await this.inputAudioContext?.close();
      if (this.outputAudioContext?.state !== 'closed') await this.outputAudioContext?.close();
      this.sessionPromise = null;
    } catch (e) { console.error("Error disconnecting", e); }
  }
}
