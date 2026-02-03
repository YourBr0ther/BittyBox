import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinGate from '@/components/admin/PinGate';

describe('PinGate Component', () => {
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    // Reset env variable before each test
    process.env.NEXT_PUBLIC_ADMIN_PIN = '1234';
  });

  it('renders the PIN entry interface when not unlocked', () => {
    render(<PinGate>{mockChildren}</PinGate>);

    expect(screen.getByText('Grown-Up Settings')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('Grown-Up Settings');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('displays a friendly icon in the header', () => {
    render(<PinGate>{mockChildren}</PinGate>);

    // Should have a lock or settings icon
    expect(screen.getByText(/🔐|⚙️/)).toBeInTheDocument();
  });

  it('renders number buttons 0-9', () => {
    render(<PinGate>{mockChildren}</PinGate>);

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('renders a delete/backspace button', () => {
    render(<PinGate>{mockChildren}</PinGate>);

    expect(screen.getByRole('button', { name: /delete|backspace|⌫/i })).toBeInTheDocument();
  });

  it('shows PIN input dots (4 dots for 4-digit PIN)', () => {
    render(<PinGate>{mockChildren}</PinGate>);

    const pinDots = screen.getAllByTestId('pin-dot');
    expect(pinDots).toHaveLength(4);
  });

  it('fills dots as digits are entered', async () => {
    const user = userEvent.setup();
    render(<PinGate>{mockChildren}</PinGate>);

    await user.click(screen.getByRole('button', { name: '1' }));

    const filledDots = screen.getAllByTestId('pin-dot-filled');
    expect(filledDots).toHaveLength(1);
  });

  it('clears last digit when delete is pressed', async () => {
    const user = userEvent.setup();
    render(<PinGate>{mockChildren}</PinGate>);

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));

    let filledDots = screen.getAllByTestId('pin-dot-filled');
    expect(filledDots).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /delete|backspace|⌫/i }));

    filledDots = screen.getAllByTestId('pin-dot-filled');
    expect(filledDots).toHaveLength(1);
  });

  it('unlocks and shows children when correct PIN is entered', async () => {
    const user = userEvent.setup();
    render(<PinGate>{mockChildren}</PinGate>);

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('shows error and clears PIN when incorrect PIN is entered', async () => {
    const user = userEvent.setup();
    render(<PinGate>{mockChildren}</PinGate>);

    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: '9' }));

    await waitFor(() => {
      expect(screen.getByText(/wrong|try again|incorrect/i)).toBeInTheDocument();
    });

    // PIN should be cleared after timeout
    await waitFor(() => {
      const filledDots = screen.queryAllByTestId('pin-dot-filled');
      expect(filledDots).toHaveLength(0);
    }, { timeout: 1000 });
  });

  it('uses NEXT_PUBLIC_ADMIN_PIN environment variable for validation', async () => {
    process.env.NEXT_PUBLIC_ADMIN_PIN = '5678';
    const user = userEvent.setup();

    render(<PinGate>{mockChildren}</PinGate>);

    // Old PIN should not work
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  it('defaults to PIN 1234 when env variable is not set', async () => {
    delete process.env.NEXT_PUBLIC_ADMIN_PIN;
    const user = userEvent.setup();

    render(<PinGate>{mockChildren}</PinGate>);

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('has large touch targets for number buttons', () => {
    render(<PinGate>{mockChildren}</PinGate>);

    const button = screen.getByRole('button', { name: '1' });
    // Buttons should have minimum touch target size (44px recommended)
    expect(button).toHaveClass('min-w-14', 'min-h-14');
  });
});
