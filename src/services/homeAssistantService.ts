// src/services/homeAssistantService.ts

interface HAServiceCallPayload {
  entity_id: string;
  [key: string]: unknown;
}

interface HAState {
  entity_id: string;
  state: string;
  attributes: {
    media_title?: string;
    media_artist?: string;
    media_content_id?: string;
    friendly_name?: string;
    [key: string]: unknown;
  };
}

const TIMEOUT_MS = 10000; // 10 second timeout

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
      throw new Error('Home Assistant request timed out');
    }
    if (error instanceof TypeError) {
      throw new Error('Cannot connect to Home Assistant. Check network and URL.');
    }
    throw error;
  }
}

export const HomeAssistantService = {
  async callService(
    domain: string,
    service: string,
    payload: HAServiceCallPayload,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    const response = await fetchWithTimeout(
      `${haUrl}/api/services/${domain}/${service}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }
  },

  async playMedia(
    speakerEntityId: string,
    mediaUrl: string,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    await this.callService(
      'media_player',
      'play_media',
      {
        entity_id: speakerEntityId,
        media_content_id: mediaUrl,
        media_content_type: 'music',
      },
      haUrl,
      haToken
    );
  },

  async stopMedia(
    speakerEntityId: string,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    await this.callService(
      'media_player',
      'media_stop',
      {
        entity_id: speakerEntityId,
      },
      haUrl,
      haToken
    );
  },

  async getState(
    entityId: string,
    haUrl: string,
    haToken: string
  ): Promise<HAState> {
    const response = await fetchWithTimeout(
      `${haUrl}/api/states/${entityId}`,
      {
        headers: {
          'Authorization': `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }

    return response.json();
  },

  async checkConnection(haUrl: string, haToken: string): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${haUrl}/api/`,
        {
          headers: {
            'Authorization': `Bearer ${haToken}`,
          },
        },
        5000 // Shorter timeout for connection check
      );
      return response.ok;
    } catch {
      return false;
    }
  },
};
