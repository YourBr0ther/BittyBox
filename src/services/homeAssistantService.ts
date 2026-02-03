// src/services/homeAssistantService.ts

interface HAServiceCallPayload {
  entity_id: string;
  media_content_id: string;
  media_content_type: string;
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

export const HomeAssistantService = {
  async callService(
    domain: string,
    service: string,
    payload: HAServiceCallPayload,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    const response = await fetch(`${haUrl}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
    const response = await fetch(`${haUrl}/api/services/media_player/media_stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: speakerEntityId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }
  },

  async getState(
    entityId: string,
    haUrl: string,
    haToken: string
  ): Promise<HAState> {
    const response = await fetch(`${haUrl}/api/states/${entityId}`, {
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }

    return response.json();
  },

  async checkConnection(haUrl: string, haToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${haUrl}/api/`, {
        headers: {
          'Authorization': `Bearer ${haToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
