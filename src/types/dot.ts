export interface DotMapping {
  tagId: string;
  playlistName: string;
  playlistUrl: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface DotMappingsData {
  mappings: DotMapping[];
}

export const DOT_ICONS = [
  'star', 'heart', 'music', 'sparkles', 'rainbow',
  'unicorn', 'castle', 'butterfly', 'flower', 'sun',
  'moon', 'cloud', 'cat', 'dog', 'bunny'
] as const;

export const DOT_COLORS = [
  '#FF6B9D', '#FFB5D4', '#FF3A7A', '#9D4EDD', '#7B2CBF',
  '#5A189A', '#FF85A1', '#FFC2D1', '#A855F7', '#EC4899'
] as const;

export type DotIcon = typeof DOT_ICONS[number];
export type DotColor = typeof DOT_COLORS[number];
