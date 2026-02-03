'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { DotMapping } from '@/types/dot';
import { iconToEmoji } from '@/utils/icons';

interface DotListProps {
  onEdit: (dot: DotMapping) => void;
  onAdd: () => void;
}

export interface DotListRef {
  refreshDots: () => void;
}

const DotList = forwardRef<DotListRef, DotListProps>(({ onEdit, onAdd }, ref) => {
  const [dots, setDots] = useState<DotMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dots');
      if (!response.ok) {
        throw new Error('Failed to fetch dots');
      }

      const data = await response.json();
      setDots(data.mappings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDots();
  }, [fetchDots]);

  useImperativeHandle(ref, () => ({
    refreshDots: fetchDots,
  }));

  const handleDelete = async (dot: DotMapping) => {
    if (!window.confirm(`Delete "${dot.playlistName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/dots/${encodeURIComponent(dot.tagId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dot');
      }

      // Refresh the list
      await fetchDots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dot');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-pink-primary font-magic text-lg">Loading dots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="text-4xl mb-4">😢</span>
        <p className="text-pink-accent font-semibold text-lg">Couldn&apos;t load your dots</p>
        <p className="text-pink-primary/70 text-sm mt-2">{error}</p>
        <button
          onClick={fetchDots}
          className="mt-4 px-6 py-2 bg-pink-primary text-white rounded-full hover:bg-pink-accent transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Add New Dot Button */}
      <button
        onClick={onAdd}
        className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-pink-primary to-magic-purple text-white font-magic text-xl rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        <span className="text-2xl">✨</span>
        Add New Dot
        <span className="text-2xl">✨</span>
      </button>

      {/* Empty State */}
      {dots.length === 0 && (
        <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-pink-secondary">
          <span className="text-5xl block mb-4">🎵</span>
          <h3 className="font-magic text-2xl text-pink-dark mb-2">No Dots Yet!</h3>
          <p className="text-pink-primary">
            Add your first dot to get started with magical music!
          </p>
        </div>
      )}

      {/* Dots List */}
      <div className="space-y-4">
        {dots.map((dot) => (
          <div
            key={dot.tagId}
            data-testid="dot-card"
            className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${dot.color}30` }}
            >
              {iconToEmoji[dot.icon] || '🎵'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-magic text-xl text-pink-dark truncate">
                {dot.playlistName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div
                  data-testid="color-swatch"
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: dot.color }}
                />
                <span className="text-sm text-pink-primary/70 truncate">
                  Tag: {dot.tagId.slice(0, 12)}...
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(dot)}
                aria-label="Edit"
                className="px-4 py-2 bg-pink-light hover:bg-pink-secondary text-pink-dark rounded-lg transition-colors font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dot)}
                aria-label="Delete"
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DotList.displayName = 'DotList';

export default DotList;
