import { promises as fs } from 'fs';
import path from 'path';
import { DotMapping, DotMappingsData } from '../types/dot';

// Use /data in production (Docker volume), ./data for local development
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : './data';
const MAPPINGS_FILE = path.join(DATA_DIR, 'nfc-mappings.json');

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Read all mappings from the JSON file
 */
async function readMappings(): Promise<DotMappingsData> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(MAPPINGS_FILE, 'utf-8');
    return JSON.parse(data) as DotMappingsData;
  } catch (error) {
    // File doesn't exist or is invalid, return empty mappings
    return { mappings: [] };
  }
}

/**
 * Write mappings to the JSON file
 */
async function writeMappings(data: DotMappingsData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(MAPPINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * DotMappingService - Handles CRUD operations for NFC Dot mappings
 */
export const DotMappingService = {
  /**
   * Get all dot mappings
   */
  getAll: async (): Promise<DotMapping[]> => {
    const data = await readMappings();
    return data.mappings;
  },

  /**
   * Get a specific dot mapping by tag ID
   */
  getByTagId: async (tagId: string): Promise<DotMapping | undefined> => {
    const data = await readMappings();
    return data.mappings.find((mapping) => mapping.tagId === tagId);
  },

  /**
   * Create a new dot mapping
   */
  create: async (mapping: Omit<DotMapping, 'createdAt'>): Promise<DotMapping> => {
    const data = await readMappings();

    // Check if tagId already exists
    const existingIndex = data.mappings.findIndex((m) => m.tagId === mapping.tagId);
    if (existingIndex !== -1) {
      throw new Error(`Mapping for tag ID "${mapping.tagId}" already exists`);
    }

    const newMapping: DotMapping = {
      ...mapping,
      createdAt: new Date().toISOString(),
    };

    data.mappings.push(newMapping);
    await writeMappings(data);

    return newMapping;
  },

  /**
   * Update an existing dot mapping
   */
  update: async (
    tagId: string,
    updates: Partial<Omit<DotMapping, 'tagId' | 'createdAt'>>
  ): Promise<DotMapping | undefined> => {
    const data = await readMappings();
    const index = data.mappings.findIndex((m) => m.tagId === tagId);

    if (index === -1) {
      return undefined;
    }

    data.mappings[index] = {
      ...data.mappings[index],
      ...updates,
    };

    await writeMappings(data);
    return data.mappings[index];
  },

  /**
   * Delete a dot mapping by tag ID
   */
  delete: async (tagId: string): Promise<boolean> => {
    const data = await readMappings();
    const index = data.mappings.findIndex((m) => m.tagId === tagId);

    if (index === -1) {
      return false;
    }

    data.mappings.splice(index, 1);
    await writeMappings(data);

    return true;
  },
};
