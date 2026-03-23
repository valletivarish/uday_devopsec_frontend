/**
 * Layout Component Tests
 *
 * Verifies that the Layout component renders the navbar, sidebar
 * navigation links, and brand text correctly when mounted inside
 * a MemoryRouter (avoiding the BrowserRouter conflict in App).
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';

// Render the Layout component inside a MemoryRouter
const renderLayout = () => {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Layout />
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  it('should render the application title in the navbar', () => {
    renderLayout();

    expect(
      screen.getByText('Order Processing & Management')
    ).toBeInTheDocument();
  });

  it('should render all sidebar navigation links', () => {
    renderLayout();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('should display the OPM System brand text in the sidebar', () => {
    renderLayout();

    expect(screen.getByText('OPM System')).toBeInTheDocument();
  });
});
