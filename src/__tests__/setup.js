/**
 * Vitest test setup file.
 * Extends Vitest matchers with jest-dom for DOM-specific assertions
 * such as toBeInTheDocument(), toHaveTextContent(), etc.
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */

import React from 'react';
import '@testing-library/jest-dom';

// Make React available globally so JSX works in components
// that rely on the automatic JSX runtime (no explicit import)
globalThis.React = React;
