/**
 * StatusBadge Component Tests
 *
 * Verifies that the StatusBadge component renders all order statuses
 * with the correct text and applies appropriate colour-coded CSS classes.
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('should render the status text', () => {
    render(<StatusBadge status="PLACED" />);

    expect(screen.getByText('PLACED')).toBeInTheDocument();
  });

  it('should apply yellow styling for PLACED status', () => {
    render(<StatusBadge status="PLACED" />);

    const badge = screen.getByText('PLACED');
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');
  });

  it('should apply green styling for DELIVERED status', () => {
    render(<StatusBadge status="DELIVERED" />);

    const badge = screen.getByText('DELIVERED');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('should apply red styling for CANCELLED status', () => {
    render(<StatusBadge status="CANCELLED" />);

    const badge = screen.getByText('CANCELLED');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });

  it('should apply blue styling for PAID status', () => {
    render(<StatusBadge status="PAID" />);

    const badge = screen.getByText('PAID');
    expect(badge.className).toContain('bg-blue-100');
  });

  it('should apply gray fallback styling for an unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />);

    const badge = screen.getByText('UNKNOWN');
    expect(badge.className).toContain('bg-gray-100');
  });
});
