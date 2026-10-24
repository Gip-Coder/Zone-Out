// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { openDB, dbAPI, getAllCourses, DB_NAME, STORE_COURSES, STORE_GOALS } from './studyVaultDb';

const deleteDb = () => new Promise((resolve, reject) => {
  const req = indexedDB.deleteDatabase(DB_NAME);
  req.onsuccess = () => resolve();
  req.onerror = () => reject(req.error);
});

/** Recreates the broken state: the old Flashcards code made a v3 DB with only `courses`. */
const createBrokenV3 = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 3);
  req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_COURSES, { keyPath: 'id' });
  req.onsuccess = () => { req.result.close(); resolve(); };
  req.onerror = () => reject(req.error);
});

beforeEach(deleteDb);

describe('studyVaultDb', () => {
  it('creates both stores on a fresh database', async () => {
    const db = await openDB();
    expect([...db.objectStoreNames].sort()).toEqual([STORE_COURSES, STORE_GOALS]);
    db.close();
  });

  // Regression: visiting Flashcards before Course Vault left the DB without a
  // `goals` store, and every Course Vault load failed from then on.
  it('repairs a v3 database that is missing the goals store, keeping existing courses', async () => {
    await createBrokenV3();
    // Seed a course in the broken DB
    await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 3);
      req.onsuccess = () => {
        const tx = req.result.transaction(STORE_COURSES, 'readwrite');
        tx.objectStore(STORE_COURSES).put({ id: 1, name: 'Physics', modules: [] });
        tx.oncomplete = () => { req.result.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });

    await expect(dbAPI.getAll(STORE_GOALS)).resolves.toEqual([]);
    await expect(getAllCourses()).resolves.toEqual([{ id: 1, name: 'Physics', modules: [] }]);
  });

  it('saves, reads and deletes records, including Blobs', async () => {
    const blob = new Blob(['pdf bytes'], { type: 'application/pdf' });
    await dbAPI.save(STORE_COURSES, { id: 7, name: 'DSA', files: { M1: [{ id: 'f', blob }] } });
    const [course] = await getAllCourses();
    expect(course.name).toBe('DSA');
    expect(course.files.M1[0].blob).toBeDefined();
    await dbAPI.delete(STORE_COURSES, 7);
    await expect(getAllCourses()).resolves.toEqual([]);
  });
});
