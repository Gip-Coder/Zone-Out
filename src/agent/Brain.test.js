import { describe, it, expect, vi, beforeEach } from 'vitest';

const post = vi.fn();
vi.mock('../services/apiClient', () => ({ api: { post: (...args) => post(...args) } }));

const { Brain } = await import('./Brain');

const makeBrain = () => {
  const dispatch = vi.fn();
  const brain = new Brain(() => ({ availableWidgets: ['timer'] }), dispatch);
  return { brain, dispatch };
};

beforeEach(() => {
  post.mockReset();
  vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
});

describe('Brain', () => {
  // Regression: Course Vault called brain.generateWithRouter(), which did not
  // exist, so every AI feature there silently used the manual fallback.
  it('exposes generateWithRouter returning the model text', async () => {
    post.mockResolvedValue({ response: '{"quiz":true}' });
    const { brain } = makeBrain();
    await expect(brain.generateWithRouter('prompt')).resolves.toBe('{"quiz":true}');
    expect(post).toHaveBeenCalledWith('/ai/generate', { prompt: 'prompt' });
  });

  it('generateWithRouter rejects on empty output or request failure so callers can fall back', async () => {
    const { brain } = makeBrain();
    post.mockResolvedValue({ response: '' });
    await expect(brain.generateWithRouter('p')).rejects.toThrow();
    post.mockRejectedValue(new Error('503: down'));
    await expect(brain.generateWithRouter('p')).rejects.toThrow();
  });

  it('handles simple timer commands locally, including hours', async () => {
    const { brain, dispatch } = makeBrain();
    const text = await brain.think('start a 2 hour timer');
    expect(text).toMatch(/120 minute/);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TIMER', minutes: 120 });
    expect(post).not.toHaveBeenCalled();
  });

  it('refuses out-of-range local timer commands without dispatching', async () => {
    const { brain, dispatch } = makeBrain();
    const text = await brain.think('set timer for 900 min');
    expect(text).toMatch(/between 1 and 300/);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('never dispatches unsafe actions returned by the AI', async () => {
    const { brain, dispatch } = makeBrain();
    post.mockResolvedValue({ text: 'Sure!', action: { type: 'DELETE_ALL_GOALS' } });
    await expect(brain.think('please clean everything up for me')).resolves.toBe('Sure!');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches valid AI actions', async () => {
    const { brain, dispatch } = makeBrain();
    post.mockResolvedValue({ text: 'Added', action: { type: 'ADD_GOAL', title: 'Finish lab' } });
    await brain.think('remember that I must finish my lab record');
    expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_GOAL', title: 'Finish lab', plan: [] });
  });

  it('returns a friendly message when the AI is offline', async () => {
    const { brain } = makeBrain();
    post.mockRejectedValue(new Error('network'));
    await expect(brain.think('explain recursion and set something up')).resolves.toMatch(/offline/);
  });
});
