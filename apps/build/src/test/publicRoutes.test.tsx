import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

describe('public routes', () => {
  it('renders the homepage request journey', () => { render(<MemoryRouter><HomePage /></MemoryRouter>); expect(screen.getByRole('heading', { level: 1, name: /bring the idea/i })).toBeInTheDocument(); expect(screen.getAllByRole('link', { name: /request a build/i }).length).toBeGreaterThan(0); });
  it('renders a useful 404', () => { render(<MemoryRouter><NotFoundPage /></MemoryRouter>); expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/route did not/i); expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/'); });
});
