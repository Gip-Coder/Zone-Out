import { describe, it, expect } from 'vitest';
import { normalizeModules, normalizeQuiz, normalizePlan, normalizeVideoRec, validFileMatches, makeFileRecord } from './notesSectionUtils';

describe('Course Vault AI output validation', () => {
  it('normalizes modules, dropping blanks and de-duplicating titles used as keys', () => {
    const modules = normalizeModules([
      { title: ' Module 1: Sets ', topics: ['Union', '', 42, 'Intersection'] },
      { title: '' },
      { title: 'Module 1: Sets', topics: 'not-an-array' },
      null,
    ]);
    expect(modules).toEqual([
      { title: 'Module 1: Sets', topics: ['Union', 'Intersection'], completed: false },
      { title: 'Module 1: Sets (2)', topics: [], completed: false },
    ]);
    expect(normalizeModules([{ title: '   ' }])).toBeNull();
    expect(normalizeModules('nope')).toBeNull();
  });

  // Regression: malformed AI quizzes crashed the quiz modal (options.map of undefined)
  it('keeps only well-formed quiz questions', () => {
    const quiz = normalizeQuiz({
      questions: [
        { q: 'Good?', options: ['a', 'b', 'c'], answer: 1, explanation: 'because' },
        { q: 'No options' },
        { q: 'Answer out of range', options: ['a', 'b'], answer: 5 },
        { q: 'String answer', options: ['a', 'b'], answer: 'a' },
      ],
    });
    expect(quiz.questions).toEqual([{ q: 'Good?', options: ['a', 'b', 'c'], answer: 1, explanation: 'because' }]);
    expect(quiz).toMatchObject({ current: 0, score: 0, showResult: false });
    expect(normalizeQuiz({})).toBeNull();
    expect(normalizeQuiz({ questions: [{ q: 'x', options: ['only one'], answer: 0 }] })).toBeNull();
  });

  it('validates plans and video recommendations', () => {
    expect(normalizePlan([{ date: '2026-11-01', task: 'Read' }, { task: '' }, { date: 'soon', task: 'Quiz', done: true }]))
      .toEqual([{ date: '2026-11-01', task: 'Read', done: false }, { date: '', task: 'Quiz', done: true }]);
    expect(normalizePlan([])).toBeNull();
    expect(normalizeVideoRec({ videoTitle: 'Intro', channelName: 'MIT' })).toEqual({ videoTitle: 'Intro', channelName: 'MIT', reason: '' });
    expect(normalizeVideoRec({})).toBeNull();
  });

  it('accepts only file matches that point at real files, courses and modules', () => {
    const courses = [{ modules: [{ title: 'A' }, { title: 'B' }] }, { modules: [] }];
    const matches = validFileMatches([
      { fileIndex: 0, courseIndex: 0, moduleIndex: 1 },
      { fileIndex: 0, courseIndex: 0, moduleIndex: 0 }, // same file twice
      { fileIndex: 1, courseIndex: 1, moduleIndex: 0 }, // course without modules
      { fileIndex: 2, courseIndex: 0, moduleIndex: 9 }, // bad module
      { fileIndex: '1', courseIndex: 0, moduleIndex: 0 }, // non-integer
      { fileIndex: 7, courseIndex: 0, moduleIndex: 0 }, // no such file
    ], 3, courses);
    expect(matches).toEqual([{ fileIndex: 0, courseIndex: 0, moduleIndex: 1 }]);
    expect(validFileMatches(undefined, 3, courses)).toEqual([]);
  });

  // Regression: files were saved as blob: URLs that die on reload
  it('stores the file Blob itself in the record', () => {
    const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' });
    const record = makeFileRecord(file);
    expect(record.blob).toBe(file);
    expect(record).toMatchObject({ title: 'notes.pdf', type: 'PDF', mimeType: 'application/pdf', size: 5 });
    expect(record.url).toBeUndefined();
    expect(makeFileRecord(file).id).not.toBe(record.id);
  });
});
