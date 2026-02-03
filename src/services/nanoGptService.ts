// src/services/nanoGptService.ts

const TIMEOUT_MS = 15000; // 15 second timeout for TTS generation

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TTS request timed out');
    }
    if (error instanceof TypeError) {
      throw new Error('Cannot connect to TTS service. Check network.');
    }
    throw error;
  }
}

export const NanoGptService = {
  async generateSpeech(
    text: string,
    apiKey: string,
    voice: string = 'nova' // friendly female voice
  ): Promise<string> {
    const response = await fetchWithTimeout(
      'https://nano-gpt.com/api/v1/tts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          model: 'tts-1',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NanoGPT TTS error: ${error}`);
    }

    // NanoGPT returns audio as a blob/buffer
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    return `data:audio/mp3;base64,${base64Audio}`;
  },

  // Pre-defined phrases for common interactions
  phrases: {
    nowPlaying: (playlistName: string) => `Now playing ${playlistName}!`,
    unknownDot: "Hmm, I don't know that Dot yet!",
    error: "Oops, something went wrong. Try again!",
    stopped: "Bye bye!",
    welcome: "Hi Roo! Tap a Dot to play some music!",
  },
};
