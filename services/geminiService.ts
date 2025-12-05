import { GoogleGenAI, GenerateContentResponse, Type, LiveServerMessage, Modality } from "@google/genai";

// Helper to get a fresh instance with the current API key safely
const getAi = () => {
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// --- Live Voice Session (Real-time Audio) ---
export class LiveSession {
  private ai: GoogleGenAI;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime: number = 0;
  private session: any = null;
  private active: boolean = false;

  constructor() {
    this.ai = getAi();
  }

  async connect(onStatusChange: (status: string) => void, onError: (err: string) => void) {
    try {
      this.active = true;
      onStatusChange("Requesting Microphone...");
      
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      onStatusChange("Connecting to AI...");

      const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are a helpful, smart, and friendly AI assistant. CRITICAL INSTRUCTION: You MUST detect the language the user is speaking (e.g., Urdu, Hindi, English, Punjabi) and respond IN THAT EXACT SAME LANGUAGE. If they speak Urdu, reply in Urdu. If they speak English, reply in English. Do not switch languages unless asked.",
        },
        callbacks: {
          onopen: () => {
            onStatusChange("Connected! Speak now...");
            this.startAudioInput(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!this.active) return;
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              await this.playAudioChunk(base64Audio);
            }
          },
          onclose: () => {
            onStatusChange("Disconnected");
            this.disconnect();
          },
          onerror: (e: any) => {
            console.error(e);
            onError("Connection Error");
            this.disconnect();
          }
        }
      });
      
      this.session = sessionPromise;

    } catch (error: any) {
      onError(error.message || "Failed to start live session");
      this.disconnect();
    }
  }

  private startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputContext || !this.stream) return;

    this.source = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.active) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    
    // Manual base64 encoding for raw PCM
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
      mimeType: 'audio/pcm;rate=16000',
      data: base64
    };
  }

  private async playAudioChunk(base64: string) {
    if (!this.outputContext) return;

    // Manual base64 decoding
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // PCM decoding
    const dataInt16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
      float32[i] = dataInt16[i] / 32768.0;
    }

    const buffer = this.outputContext.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);

    const now = this.outputContext.currentTime;
    this.nextStartTime = Math.max(this.nextStartTime, now);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  disconnect() {
    this.active = false;
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.inputContext) {
      this.inputContext.close();
      this.inputContext = null;
    }
    if (this.outputContext) {
      this.outputContext.close();
      this.outputContext = null;
    }
    this.session = null;
    this.nextStartTime = 0;
  }
}

// --- Chat Helper (Text) ---
export const generateChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are Samiullah Official's Advanced AI Assistant. You are an expert in coding, design, 3D modeling, and creative writing. IMPORTANT: You are multilingual. Always detect the language of the user's last message (e.g., Urdu, Hindi, Spanish, English) and respond FLUENTLY in that same language. Be helpful, concise, and friendly.",
      },
      history: history
    });
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

// --- Image Generation (Logos, Thumbnails, 3D Characters) ---
export const generateImage = async (prompt: string, options: { isHighQuality?: boolean, aspectRatio?: '1:1'|'16:9'|'9:16'|'4:3'|'3:4' } = {}): Promise<string> => {
  const ai = getAi();
  
  // Attempt 1: Gemini 2.5 Flash Image (Nano Banana) - PRIMARY
  try {
    console.log("Attempting image gen with gemini-2.5-flash-image (Nano Banana)...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      // Note: responseModalities omitted to allow model default behavior which is more robust for simple image gen
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.warn("Gemini 2.5 Flash Image failed:", errorMsg);
    // If blocked by safety, stop here and inform user.
    if (errorMsg.includes("SAFETY") || errorMsg.includes("blocked")) {
        throw new Error("Image generation blocked by safety filters. Please modify your prompt.");
    }
  }

  // Attempt 2: Gemini 3 Pro (High Quality Fallback)
  try {
     console.log("Attempting fallback with gemini-3-pro-image-preview...");
     const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { 
            aspectRatio: options.aspectRatio === '9:16' ? '9:16' : 
                         options.aspectRatio === '16:9' ? '16:9' : 
                         options.aspectRatio === '4:3' ? '4:3' : 
                         options.aspectRatio === '3:4' ? '3:4' : '1:1',
            imageSize: '1K'
        }
      }
    });
     for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
     console.warn("Gemini 3 Pro failed:", error?.message);
  }

  // Attempt 3: Imagen 3 (Vertex AI Fallback)
  try {
      console.log("Attempting fallback with imagen-3.0-generate-001...");
      const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: prompt,
          config: {
              numberOfImages: 1,
              aspectRatio: options.aspectRatio === '9:16' ? '9:16' : 
                           options.aspectRatio === '16:9' ? '16:9' : 
                           options.aspectRatio === '4:3' ? '4:3' : 
                           options.aspectRatio === '3:4' ? '3:4' : '1:1',
              outputMimeType: 'image/jpeg',
          },
      });
      const b64 = response.generatedImages?.[0]?.image?.imageBytes;
      if (b64) return `data:image/jpeg;base64,${b64}`;
  } catch (error: any) {
       console.warn("Imagen failed:", error?.message);
  }
  
  throw new Error("Unable to generate image. Please try again or check your API quota.");
};

// --- Image Editing / Style Transfer ---
export const editImageStyle = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = getAi();
    const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';
    const data = base64Image.split(',')[1];

    // For editing, we use standard prompt + image input
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          { text: `Edit this image: ${prompt}` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("AI could not process the edit request. Try a different prompt.");
  } catch (error: any) {
    console.error("Style Transfer Error:", error);
    throw new Error(`Edit failed: ${error.message}`);
  }
};

// --- Code Generation ---
export const generateCode = async (prompt: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert full-stack web developer.
      Task: Create a fully functional, single-file HTML solution (embedding all CSS and JS inside <style> and <script> tags) for the following request: "${prompt}".
      Requirement: 
      1. Ensure the code is modern, responsive, and looks beautiful.
      2. The output MUST be a valid HTML5 document starting with <!DOCTYPE html>.
      3. Do not include markdown backticks (like \`\`\`html) in the final output if possible.
      4. Ensure all external libraries (like Three.js, Tailwind, etc.) are imported via CDN links.
      5. The website should fill the screen height if possible.
      Return ONLY the code.`,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    return response.text || "<!-- No code generated -->";
  } catch (error) {
    console.error("Code Gen Error:", error);
    return `<!-- Error generating code: ${error} -->`;
  }
};

// --- Video / Animation (Using Google Veo) ---
export const generateAnimation = async (prompt: string, imageBase64?: string, aspectRatio: '16:9'|'9:16' = '16:9'): Promise<string> => {
  try {
    const ai = getAi();
    
    let finalPrompt = prompt;
    // Only enhance prompt if NO image is provided.
    if (!imageBase64) {
        try {
            const enhancer = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Rewrite this video prompt to be highly detailed for a generative video model (like Veo). 
                Include keywords like 'cinematic lighting', '4k', 'smooth motion', 'photorealistic'.
                Keep it under 60 words. 
                Prompt: "${prompt}"`
            });
            if (enhancer.text) finalPrompt = enhancer.text;
        } catch(e) {
            console.warn("Prompt enhancement failed, using original.");
        }
    }

    const validAspectRatio = (aspectRatio === '9:16' || aspectRatio === '16:9') ? aspectRatio : '16:9';
    const model = 'veo-3.1-generate-preview';
    
    console.log(`Starting video generation with model: ${model}`);

    const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: validAspectRatio
    };

    let operation;
    
    if (imageBase64) {
        const mimeType = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';
        const data = imageBase64.split(',')[1];
        
        operation = await ai.models.generateVideos({
            model: model,
            prompt: finalPrompt,
            image: {
                imageBytes: data,
                mimeType: mimeType
            },
            config: config
        });
    } else {
        operation = await ai.models.generateVideos({
            model: model,
            prompt: finalPrompt,
            config: config
        });
    }

    if (!operation) {
        throw new Error("Failed to initialize video generation operation.");
    }

    // Polling loop as per recommended Veo usage (10s intervals)
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
      console.log("Polling video status...");
    }

    if (operation.error) {
        throw new Error(`Video Generation Failed: ${operation.error.message || 'Unknown Veo error'}`);
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("No video URI returned from the model.");
    
    // Append API key for download
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    const videoUrl = `${uri}&key=${apiKey}`;
    
    const response = await fetch(videoUrl);
    if (!response.ok) {
        throw new Error(`Failed to download video content: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("Video Gen Error:", error);
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes("404") || errorMsg.includes("NOT_FOUND") || errorMsg.includes("Requested entity was not found")) {
        throw new Error("Video Model Not Found (404). Please ensure 'Vertex AI' and 'Veo' APIs are enabled in your Google Cloud Console and your API key has access.");
    }
    if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
        throw new Error("Permission denied (403). Your API Key may not have access to Veo.");
    }
    throw error;
  }
};

// --- Text to Speech (TTS) Helper Functions ---

const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

const addWavHeader = (pcmData: Uint8Array, sampleRate: number, numChannels: number = 1) => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const dataLen = pcmData.length;
    const totalLen = dataLen + 36;

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLen, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLen, true);

    const wavBuffer = new Uint8Array(header.byteLength + pcmData.byteLength);
    wavBuffer.set(new Uint8Array(header), 0);
    wavBuffer.set(pcmData, header.byteLength);

    return wavBuffer;
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data found in response");
        }
        
        const pcmBytes = base64ToUint8Array(base64Audio);
        const wavBytes = addWavHeader(pcmBytes, 24000, 1);
        const wavBase64 = arrayBufferToBase64(wavBytes.buffer);

        return `data:audio/wav;base64,${wavBase64}`; 
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};

// --- CGI Ad Concept Generator ---
export const generateAdConcept = async (productName: string, description: string, style: string): Promise<{ visualPrompt: string, slogan: string, voiceover: string }> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a world-class CGI director and advertising expert. 
      Create a concept for a high-end CGI product commercial video (5 seconds).
      
      Product Name: ${productName}
      Description: ${description}
      Visual Style: ${style}
      
      Output a JSON object with three fields:
      1. visualPrompt: A highly detailed, photorealistic prompt for a generative video model (like Veo). Describe the camera movement (e.g., slow pan, zoom), lighting (e.g., studio softbox, cinematic, neon), background, and how the product looks. Focus on visual fidelity.
      2. slogan: A short, catchy, professional marketing slogan (max 10 words) that matches the vibe.
      3. voiceover: A short, cinematic narration script (1 sentence) synchronized with the visual.
      
      Return ONLY raw JSON. No markdown.`,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  visualPrompt: { type: Type.STRING },
                  slogan: { type: Type.STRING },
                  voiceover: { type: Type.STRING }
              },
              required: ["visualPrompt", "slogan", "voiceover"]
          }
      }
    });
    
    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Ad Concept Error:", error);
    return {
        visualPrompt: `Cinematic product shot of ${productName} in ${style} style. ${description}. High quality 4k render.`,
        slogan: `Experience ${productName}`,
        voiceover: `Discover the new ${productName}, where innovation meets design.`
    };
  }
};