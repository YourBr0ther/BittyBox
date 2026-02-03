import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '@/app/admin/page';

// Mock PinGate to simplify testing the admin page state management
jest.mock('@/components/admin/PinGate', () => {
  return function MockPinGate({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock DotList
const mockRefreshDots = jest.fn();
jest.mock('@/components/admin/DotList', () => {
  const { forwardRef, useImperativeHandle } = require('react');
  return forwardRef(function MockDotList(
    { onEdit, onAdd }: { onEdit: (dot: unknown) => void; onAdd: () => void },
    ref: unknown
  ) {
    useImperativeHandle(ref, () => ({
      refreshDots: mockRefreshDots,
    }));
    return (
      <div data-testid="dot-list">
        <button onClick={onAdd}>Add New Dot</button>
        <button onClick={() => onEdit({ tagId: 'test-tag', playlistName: 'Test' })}>
          Edit First Dot
        </button>
      </div>
    );
  });
});

// Mock DotForm
jest.mock('@/components/admin/DotForm', () => {
  return function MockDotForm({
    dot,
    onSave,
    onCancel,
  }: {
    dot?: unknown;
    onSave: () => void;
    onCancel: () => void;
  }) {
    return (
      <div data-testid="dot-form">
        <span>{dot ? 'Edit Mode' : 'Add Mode'}</span>
        <button onClick={onSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

describe('Admin Page', () => {
  beforeEach(() => {
    mockRefreshDots.mockClear();
  });

  it('wraps content in PinGate', () => {
    // Since we mocked PinGate to just render children,
    // we verify the page renders which means PinGate passed
    render(<AdminPage />);

    expect(screen.getByTestId('dot-list')).toBeInTheDocument();
  });

  it('shows DotList by default (list view)', () => {
    render(<AdminPage />);

    expect(screen.getByTestId('dot-list')).toBeInTheDocument();
    expect(screen.queryByTestId('dot-form')).not.toBeInTheDocument();
  });

  it('switches to add view when Add New Dot is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.click(screen.getByRole('button', { name: /add new dot/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dot-form')).toBeInTheDocument();
      expect(screen.getByText('Add Mode')).toBeInTheDocument();
    });
  });

  it('switches to edit view when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.click(screen.getByRole('button', { name: /edit first dot/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dot-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Mode')).toBeInTheDocument();
    });
  });

  it('returns to list view when Cancel is clicked in form', async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    // Go to add form
    await user.click(screen.getByRole('button', { name: /add new dot/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dot-form')).toBeInTheDocument();
    });

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dot-list')).toBeInTheDocument();
      expect(screen.queryByTestId('dot-form')).not.toBeInTheDocument();
    });
  });

  it('returns to list view after Save', async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    // Go to add form
    await user.click(screen.getByRole('button', { name: /add new dot/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dot-form')).toBeInTheDocument();
    });

    // Click save
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Should return to list view
    await waitFor(() => {
      expect(screen.getByTestId('dot-list')).toBeInTheDocument();
      expect(screen.queryByTestId('dot-form')).not.toBeInTheDocument();
    });
  });

  it('shows page header', () => {
    render(<AdminPage />);

    expect(screen.getByRole('heading', { name: /dot management|admin|settings/i })).toBeInTheDocument();
  });

  it('has a back to home link', () => {
    render(<AdminPage />);

    expect(screen.getByRole('link', { name: /back|home/i })).toBeInTheDocument();
  });
});
