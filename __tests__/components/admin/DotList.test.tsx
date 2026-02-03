import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DotList from '@/components/admin/DotList';
import { DotMapping } from '@/types/dot';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockDots: DotMapping[] = [
  {
    tagId: 'tag-001',
    playlistName: 'Frozen Songs',
    playlistUrl: 'https://youtube.com/playlist?list=123',
    icon: 'star',
    color: '#FF6B9D',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    tagId: 'tag-002',
    playlistName: 'Moana Playlist',
    playlistUrl: 'https://youtube.com/playlist?list=456',
    icon: 'rainbow',
    color: '#9D4EDD',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

describe('DotList Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches dots from /api/dots on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/dots');
    });
  });

  it('displays loading state while fetching', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays all configured dots as cards', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Frozen Songs')).toBeInTheDocument();
      expect(screen.getByText('Moana Playlist')).toBeInTheDocument();
    });
  });

  it('shows icon emoji for each dot', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('⭐')).toBeInTheDocument(); // star
      expect(screen.getByText('🌈')).toBeInTheDocument(); // rainbow
    });
  });

  it('shows color swatch for each dot', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      const swatches = screen.getAllByTestId('color-swatch');
      expect(swatches).toHaveLength(2);
    });
  });

  it('shows Edit button for each dot', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(2);
    });
  });

  it('shows Delete button for each dot', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(2);
    });
  });

  it('calls onEdit with dot when Edit button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    const onEdit = jest.fn();
    const user = userEvent.setup();

    render(<DotList onEdit={onEdit} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Frozen Songs')).toBeInTheDocument();
    });

    const card = screen.getByText('Frozen Songs').closest('[data-testid="dot-card"]');
    const editButton = within(card!).getByRole('button', { name: /edit/i });

    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockDots[0]);
  });

  it('deletes dot when Delete button is clicked and confirmed', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mappings: mockDots }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mappings: [mockDots[1]] }),
      });

    const user = userEvent.setup();
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Frozen Songs')).toBeInTheDocument();
    });

    const card = screen.getByText('Frozen Songs').closest('[data-testid="dot-card"]');
    const deleteButton = within(card!).getByRole('button', { name: /delete/i });

    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dots/tag-001'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    confirmSpy.mockRestore();
  });

  it('shows "Add New Dot" button at top', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add new dot/i })).toBeInTheDocument();
    });
  });

  it('calls onAdd when "Add New Dot" button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: mockDots }),
    });

    const onAdd = jest.fn();
    const user = userEvent.setup();

    render(<DotList onEdit={jest.fn()} onAdd={onAdd} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add new dot/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add new dot/i }));

    expect(onAdd).toHaveBeenCalled();
  });

  it('shows empty state with friendly message when no dots configured', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mappings: [] }),
    });

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No Dots Yet!')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Couldn't load your dots")).toBeInTheDocument();
    });
  });

  it('exposes refreshDots function via ref', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mappings: mockDots }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mappings: [] }),
      });

    const ref = { current: null as { refreshDots: () => void } | null };

    render(<DotList onEdit={jest.fn()} onAdd={jest.fn()} ref={ref} />);

    await waitFor(() => {
      expect(screen.getByText('Frozen Songs')).toBeInTheDocument();
    });

    // Call refresh
    ref.current?.refreshDots();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
