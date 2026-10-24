// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const api = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
vi.mock('../services/apiClient', () => ({ api }));
const pushProgressEvent = vi.fn();
vi.mock('../context/ProgressContext', () => ({ useProgressContext: () => ({ pushProgressEvent }) }));

const { default: StudyGoals } = await import('./StudyGoals');

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  pushProgressEvent.mockReset();
  localStorage.clear();
});

describe('StudyGoals', () => {
  it('loads goals from the API', async () => {
    api.get.mockResolvedValue([{ _id: '1', text: 'Revise graphs', completed: false }]);
    render(<StudyGoals />);
    expect(await screen.findByText('Revise graphs')).toBeTruthy();
  });

  // Regression: rapid double submission created duplicate goals
  it('creates only one goal when Add is clicked repeatedly', async () => {
    api.get.mockResolvedValue([]);
    let resolvePost;
    api.post.mockImplementation(() => new Promise((r) => { resolvePost = r; }));
    render(<StudyGoals />);
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('New goal'), { target: { value: 'Lab record' } });
    const add = screen.getByRole('button', { name: 'Add goal' });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);
    expect(api.post).toHaveBeenCalledTimes(1);

    resolvePost({ _id: 'g1', text: 'Lab record', completed: false });
    expect(await screen.findByText('Lab record')).toBeTruthy();
    expect(screen.getAllByText('Lab record')).toHaveLength(1);
  });

  it('ignores whitespace-only goals', async () => {
    api.get.mockResolvedValue([]);
    render(<StudyGoals />);
    fireEvent.change(screen.getByLabelText('New goal'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add goal' }));
    expect(api.post).not.toHaveBeenCalled();
  });

  it('toggles and deletes goals via accessible controls', async () => {
    api.get.mockResolvedValue([{ _id: '1', text: 'Mock test', completed: false }]);
    api.put.mockResolvedValue({ _id: '1', text: 'Mock test', completed: true });
    api.delete.mockResolvedValue({ message: 'Goal deleted' });
    render(<StudyGoals />);

    const checkbox = await screen.findByRole('checkbox', { name: /Mock test/ });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(checkbox);
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /Mock test/ }).getAttribute('aria-checked')).toBe('true'));
    expect(api.put).toHaveBeenCalledWith('/goals/1', { completed: true });

    fireEvent.click(screen.getByRole('button', { name: 'Delete goal "Mock test"' }));
    await waitFor(() => expect(screen.queryByText('Mock test')).toBeNull());
  });

  it('shares state with the parent when goals/setGoals are provided', async () => {
    api.get.mockResolvedValue([{ _id: '9', text: 'From server' }]);
    const setGoals = vi.fn();
    render(<StudyGoals goals={[{ _id: '5', text: 'Added by AI' }]} setGoals={setGoals} />);
    expect(screen.getByText('Added by AI')).toBeTruthy();
    await waitFor(() => expect(setGoals).toHaveBeenCalledWith([{ _id: '9', text: 'From server' }]));
  });

  it('falls back to locally stored goals when the API is unreachable', async () => {
    localStorage.setItem('zoneout_goals', JSON.stringify([{ _id: 'local_1', text: 'Offline goal' }]));
    api.get.mockRejectedValue(new Error('Failed to fetch'));
    render(<StudyGoals />);
    expect(await screen.findByText('Offline goal')).toBeTruthy();
  });
});
