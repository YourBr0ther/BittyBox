'use client';

import { useState, useEffect } from 'react';
import { DotMapping, DOT_ICONS, DOT_COLORS, DotIcon, DotColor } from '@/types/dot';
import { useNfcScanner } from '@/hooks/useNfcScanner';
import { iconToEmoji } from '@/utils/icons';

interface DotFormProps {
  dot?: DotMapping;
  onSave: () => void;
  onCancel: () => void;
}

interface FormErrors {
  tagId?: string;
  playlistName?: string;
  playlistUrl?: string;
}

export default function DotForm({ dot, onSave, onCancel }: DotFormProps) {
  const { isSupported, isScanning, lastScan, error: nfcError, startScanning, stopScanning } = useNfcScanner();

  const [playlistName, setPlaylistName] = useState(dot?.playlistName || '');
  const [playlistUrl, setPlaylistUrl] = useState(dot?.playlistUrl || '');
  const [icon, setIcon] = useState<DotIcon>((dot?.icon as DotIcon) || 'star');
  const [color, setColor] = useState<DotColor>((dot?.color as DotColor) || DOT_COLORS[0]);
  const [scannedTagId, setScannedTagId] = useState<string | null>(dot?.tagId || null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEditMode = !!dot;

  // Update scanned tag when NFC detects one
  useEffect(() => {
    if (lastScan && !isEditMode) {
      setScannedTagId(lastScan.tagId);
      stopScanning();
    }
  }, [lastScan, isEditMode, stopScanning]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!scannedTagId) {
      newErrors.tagId = 'Please scan a Dot first';
    }

    if (!playlistName.trim()) {
      newErrors.playlistName = 'Playlist name is required';
    }

    if (!playlistUrl.trim()) {
      newErrors.playlistUrl = 'Playlist URL is required';
    } else {
      try {
        new URL(playlistUrl);
      } catch {
        newErrors.playlistUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const url = isEditMode
        ? `/api/dots/${encodeURIComponent(dot.tagId)}`
        : '/api/dots';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagId: scannedTagId,
          playlistName,
          playlistUrl,
          icon,
          color,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      onSave();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save dot');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="font-magic text-2xl text-pink-dark mb-6">
        {isEditMode ? 'Edit Dot' : 'Add New Dot'}
      </h2>

      {/* NFC Scanner Section */}
      {!isEditMode && (
        <div className="mb-6 p-4 bg-pink-light/50 rounded-xl">
          <h3 className="font-semibold text-pink-dark mb-2">Dot Tag</h3>

          {!isSupported ? (
            <p className="text-pink-accent text-sm">
              NFC is not supported on this device. Please use a device with NFC capability.
            </p>
          ) : (
            <>
              {scannedTagId ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm text-pink-dark font-mono">
                    Tag: {scannedTagId}
                  </span>
                </div>
              ) : isScanning ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-pink-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-pink-primary">Scanning... Tap your Dot</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startScanning}
                  className="px-4 py-2 bg-pink-primary text-white rounded-lg hover:bg-pink-accent transition-colors"
                >
                  Scan Dot
                </button>
              )}

              {nfcError && (
                <p className="mt-2 text-red-500 text-sm">{nfcError}</p>
              )}
            </>
          )}

          {errors.tagId && (
            <p className="mt-2 text-red-500 text-sm">{errors.tagId}</p>
          )}
        </div>
      )}

      {/* Show existing tag in edit mode */}
      {isEditMode && (
        <div className="mb-6 p-4 bg-pink-light/50 rounded-xl">
          <h3 className="font-semibold text-pink-dark mb-2">Dot Tag</h3>
          <span className="text-sm text-pink-dark font-mono">
            Tag: {dot.tagId}
          </span>
        </div>
      )}

      {/* Playlist Name */}
      <div className="mb-4">
        <label htmlFor="playlistName" className="block text-sm font-semibold text-pink-dark mb-1">
          Playlist Name
        </label>
        <input
          type="text"
          id="playlistName"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="e.g., Frozen Songs"
          className="w-full px-4 py-3 border-2 border-pink-secondary/30 rounded-xl focus:border-pink-primary focus:outline-none transition-colors"
        />
        {errors.playlistName && (
          <p className="mt-1 text-red-500 text-sm">{errors.playlistName}</p>
        )}
      </div>

      {/* Playlist URL */}
      <div className="mb-6">
        <label htmlFor="playlistUrl" className="block text-sm font-semibold text-pink-dark mb-1">
          Playlist URL
        </label>
        <input
          type="url"
          id="playlistUrl"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://youtube.com/playlist?list=..."
          className="w-full px-4 py-3 border-2 border-pink-secondary/30 rounded-xl focus:border-pink-primary focus:outline-none transition-colors"
        />
        {errors.playlistUrl && (
          <p className="mt-1 text-red-500 text-sm">{errors.playlistUrl}</p>
        )}
      </div>

      {/* Icon Picker */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-pink-dark mb-2">
          Choose an Icon
        </label>
        <div
          data-testid="icon-picker"
          className="flex flex-wrap gap-2"
        >
          {DOT_ICONS.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              aria-label={iconName}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                icon === iconName
                  ? 'bg-pink-primary/20 ring-2 ring-pink-primary scale-110'
                  : 'bg-gray-100 hover:bg-pink-light'
              }`}
            >
              {iconToEmoji[iconName]}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-pink-dark mb-2">
          Choose a Color
        </label>
        <div
          data-testid="color-picker"
          className="flex flex-wrap gap-2"
        >
          {DOT_COLORS.map((colorValue) => (
            <button
              key={colorValue}
              type="button"
              onClick={() => setColor(colorValue)}
              aria-label={colorValue}
              className={`w-10 h-10 rounded-full transition-all ${
                color === colorValue
                  ? 'ring-2 ring-offset-2 ring-pink-dark scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: colorValue }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-pink-dark/70 mb-2">Preview</p>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${color}30` }}
          >
            {iconToEmoji[icon]}
          </div>
          <span className="font-magic text-lg text-pink-dark">
            {playlistName || 'Playlist Name'}
          </span>
        </div>
      </div>

      {/* Save Error */}
      {saveError && (
        <p className="mb-4 text-red-500 text-center font-semibold">{saveError}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border-2 border-pink-secondary text-pink-dark rounded-xl hover:bg-pink-light transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-primary to-magic-purple text-white rounded-xl hover:opacity-90 transition-opacity font-semibold disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
