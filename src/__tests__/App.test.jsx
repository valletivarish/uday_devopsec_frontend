/**
 * Layout Component Tests
 *
 * Verifies that the Layout component renders the navbar, sidebar
 * navigation links, and brand text correctly when mounted inside
 * a MemoryRouter. Tests both admin and viewer role layouts.
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import { CartProvider } from '../context/CartContext';

const renderLayout = (role = 'admin') => {
  localStorage.setItem('opm_user', JSON.stringify({ name: 'Test', email: 'test@opm.com', role }));
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[role === 'viewer' ? '/shop' : '/dashboard']}>
        <Layout />
      </MemoryRouter>
    </CartProvider>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the application title in the navbar', () => {
    renderLayout();
    expect(screen.getByText('Order Processing & Management')).toBeInTheDocument();
  });

  it('should render admin sidebar navigation links', () => {
    renderLayout('admin');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('should display OPM System brand for admin', () => {
    renderLayout('admin');
    expect(screen.getByText('OPM System')).toBeInTheDocument();
  });

  it('should render viewer storefront navigation links', () => {
    renderLayout('viewer');
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
  });

  it('should display OPM Store brand for viewer', () => {
    renderLayout('viewer');
    expect(screen.getByText('OPM Store')).toBeInTheDocument();
  });
});
