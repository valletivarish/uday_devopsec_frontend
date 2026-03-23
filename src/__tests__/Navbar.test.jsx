/**
 * Navbar Component Tests
 *
 * Verifies that the Navbar renders the application title, icon,
 * and that the mobile sidebar toggle button triggers its callback.
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  it('should render the application title', () => {
    render(<Navbar onToggleSidebar={() => {}} />);

    expect(
      screen.getByText('Order Processing & Management')
    ).toBeInTheDocument();
  });

  it('should call onToggleSidebar when the menu button is clicked', () => {
    const mockToggle = vi.fn();
    render(<Navbar onToggleSidebar={mockToggle} />);

    const menuButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(menuButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should have a sticky header with border styling', () => {
    render(<Navbar onToggleSidebar={() => {}} />);

    const header = screen.getByText('Order Processing & Management').closest('header');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('border-b');
  });
});
