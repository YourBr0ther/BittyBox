'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import PinGate from '@/components/admin/PinGate';
import DotList, { DotListRef } from '@/components/admin/DotList';
import DotForm from '@/components/admin/DotForm';
import { DotMapping } from '@/types/dot';

type ViewState = 'list' | 'add' | 'edit';

export default function AdminPage() {
  const [view, setView] = useState<ViewState>('list');
  const [selectedDot, setSelectedDot] = useState<DotMapping | null>(null);
  const dotListRef = useRef<DotListRef>(null);

  const handleAdd = () => {
    setSelectedDot(null);
    setView('add');
  };

  const handleEdit = (dot: DotMapping) => {
    setSelectedDot(dot);
    setView('edit');
  };

  const handleSave = () => {
    setView('list');
    setSelectedDot(null);
    // Refresh the list
    dotListRef.current?.refreshDots();
  };

  const handleCancel = () => {
    setView('list');
    setSelectedDot(null);
  };

  return (
    <PinGate>
      <div className="min-h-screen bg-gradient-to-b from-pink-light to-white pb-8">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm shadow-sm z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-pink-primary hover:text-pink-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Back Home</span>
            </Link>

            <h1 role="heading" className="font-magic text-xl text-pink-dark">
              Dot Management
            </h1>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Content */}
        <main className="max-w-2xl mx-auto px-4 py-6">
          {view === 'list' && (
            <DotList
              ref={dotListRef}
              onEdit={handleEdit}
              onAdd={handleAdd}
            />
          )}

          {(view === 'add' || view === 'edit') && (
            <DotForm
              dot={selectedDot || undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </main>
      </div>
    </PinGate>
  );
}
