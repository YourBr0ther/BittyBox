import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DotForm from '@/components/admin/DotForm';
import { DotMapping, DOT_ICONS, DOT_COLORS } from '@/types/dot';

// Mock useNfcScanner hook
const mockStartScanning = jest.fn();
const mockStopScanning = jest.fn();
let mockLastScan: { tagId: string; timestamp: number } | null = null;
let mockIsScanning = false;
let mockIsSupported = true;
let mockNfcError: string | null = null;

jest.mock('@/hooks/useNfcScanner', () => ({
  useNfcScanner: () => ({
    isSupported: mockIsSupported,
    isScanning: mockIsScanning,
    lastScan: mockLastScan,
    error: mockNfcError,
    startScanning: mockStartScanning,
    stopScanning: mockStopScanning,
  }),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const existingDot: DotMapping = {
  tagId: 'tag-001',
  playlistName: 'Frozen Songs',
  playlistUrl: 'https://youtube.com/playlist?list=123',
  icon: 'star',
  color: '#FF6B9D',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('DotForm Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockStartScanning.mockClear();
    mockStopScanning.mockClear();
    mockLastScan = null;
    mockIsScanning = false;
    mockIsSupported = true;
    mockNfcError = null;
  });

  describe('Add Mode (no dot prop)', () => {
    it('renders form with empty fields', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByLabelText(/playlist name/i)).toHaveValue('');
      expect(screen.getByLabelText(/playlist url/i)).toHaveValue('');
    });

    it('shows "Scan Dot" button', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByRole('button', { name: /scan dot/i })).toBeInTheDocument();
    });

    it('starts NFC scanning when "Scan Dot" is clicked', async () => {
      const user = userEvent.setup();
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: /scan dot/i }));

      expect(mockStartScanning).toHaveBeenCalled();
    });

    it('displays scanned tagId after successful scan', async () => {
      mockLastScan = { tagId: 'scanned-tag-123', timestamp: Date.now() };

      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText(/scanned-tag-123/)).toBeInTheDocument();
    });

    it('prevents manual entry of tagId', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      // There should be no input field for tagId
      const tagIdInput = screen.queryByLabelText(/tag id/i);
      expect(tagIdInput).not.toBeInTheDocument();
    });

    it('calls POST /api/dots on save for new dot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mapping: { ...existingDot, tagId: 'new-tag' } }),
      });
      mockLastScan = { tagId: 'new-tag', timestamp: Date.now() };

      const user = userEvent.setup();
      const onSave = jest.fn();

      render(<DotForm onSave={onSave} onCancel={jest.fn()} />);

      await user.type(screen.getByLabelText(/playlist name/i), 'New Playlist');
      await user.type(screen.getByLabelText(/playlist url/i), 'https://youtube.com/playlist?list=new');

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/dots',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('new-tag'),
          })
        );
      });
    });

    it('requires a scanned tagId before saving', async () => {
      const user = userEvent.setup();
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.type(screen.getByLabelText(/playlist name/i), 'Test Playlist');
      await user.type(screen.getByLabelText(/playlist url/i), 'https://youtube.com/playlist?list=test');

      // Save button should be disabled or show error when clicked
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should show validation message about scanning dot
      expect(screen.getByText('Please scan a Dot first')).toBeInTheDocument();
    });
  });

  describe('Edit Mode (with dot prop)', () => {
    it('populates form with existing dot values', () => {
      render(<DotForm dot={existingDot} onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByLabelText(/playlist name/i)).toHaveValue('Frozen Songs');
      expect(screen.getByLabelText(/playlist url/i)).toHaveValue('https://youtube.com/playlist?list=123');
    });

    it('shows existing tagId (read-only)', () => {
      render(<DotForm dot={existingDot} onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText(/tag-001/)).toBeInTheDocument();
    });

    it('calls PUT /api/dots/[tagId] on save for existing dot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mapping: existingDot }),
      });

      const user = userEvent.setup();
      const onSave = jest.fn();

      render(<DotForm dot={existingDot} onSave={onSave} onCancel={jest.fn()} />);

      await user.clear(screen.getByLabelText(/playlist name/i));
      await user.type(screen.getByLabelText(/playlist name/i), 'Updated Playlist');

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dots/tag-001'),
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });
    });

    it('does not show "Scan Dot" button in edit mode', () => {
      render(<DotForm dot={existingDot} onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.queryByRole('button', { name: /scan dot/i })).not.toBeInTheDocument();
    });
  });

  describe('Icon Picker', () => {
    it('shows all available icons', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      // Should have buttons for all icons
      const iconPicker = screen.getByTestId('icon-picker');
      const iconButtons = within(iconPicker).getAllByRole('button');
      expect(iconButtons.length).toBe(DOT_ICONS.length);
    });

    it('allows selecting an icon', async () => {
      const user = userEvent.setup();
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      const iconPicker = screen.getByTestId('icon-picker');
      const unicornButton = within(iconPicker).getByRole('button', { name: /unicorn/i });

      await user.click(unicornButton);

      expect(unicornButton).toHaveClass('ring-2');
    });
  });

  describe('Color Picker', () => {
    it('shows all available colors', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      const colorPicker = screen.getByTestId('color-picker');
      const colorButtons = within(colorPicker).getAllByRole('button');
      expect(colorButtons.length).toBe(DOT_COLORS.length);
    });

    it('allows selecting a color', async () => {
      const user = userEvent.setup();
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      const colorPicker = screen.getByTestId('color-picker');
      const colorButtons = within(colorPicker).getAllByRole('button');

      await user.click(colorButtons[3]);

      expect(colorButtons[3]).toHaveClass('ring-2');
    });
  });

  describe('Form Actions', () => {
    it('shows Save button', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows Cancel button', () => {
      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(<DotForm onSave={jest.fn()} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('calls onSave after successful API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mapping: existingDot }),
      });

      const user = userEvent.setup();
      const onSave = jest.fn();

      render(<DotForm dot={existingDot} onSave={onSave} onCancel={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });

    it('shows error message if save fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      const user = userEvent.setup();

      render(<DotForm dot={existingDot} onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('NFC Support', () => {
    it('shows message when NFC is not supported', () => {
      mockIsSupported = false;

      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText(/nfc.*not supported|use a device/i)).toBeInTheDocument();
    });

    it('shows scanning state while scanning', () => {
      mockIsScanning = true;

      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText(/scanning|waiting|tap/i)).toBeInTheDocument();
    });

    it('shows NFC error message if scanning fails', () => {
      mockNfcError = 'NFC permission denied';

      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText(/NFC permission denied/)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('requires playlist name', async () => {
      mockLastScan = { tagId: 'test-tag', timestamp: Date.now() };
      const user = userEvent.setup();

      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.type(screen.getByLabelText(/playlist url/i), 'https://youtube.com/playlist');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByText(/name.*required|enter.*name/i)).toBeInTheDocument();
    });

    it('requires playlist URL', async () => {
      mockLastScan = { tagId: 'test-tag', timestamp: Date.now() };
      const user = userEvent.setup();

      render(<DotForm onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.type(screen.getByLabelText(/playlist name/i), 'Test Playlist');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByText(/url.*required|enter.*url/i)).toBeInTheDocument();
    });
  });
});
