/**
 * Single IndexedDB definition for the Course Vault (courses, modules, notes,
 * files) and its study plans. Both the Course Vault and Flashcards pages use it.
 *
 * Version history:
 *  3 — courses + goals stores. A second copy of this code (Flashcards) also
 *      opened v3 but only created `courses`; visiting Flashcards first left the
 *      DB without a `goals` store and broke the Course Vault permanently.
 *  4 — upgrade creates whichever stores are missing, repairing such databases.
 */
export const DB_NAME = "StudyBuddyVault";
export const DB_VERSION = 4;
export const STORE_COURSES = "courses";
export const STORE_GOALS = "goals";

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_COURSES)) db.createObjectStore(STORE_COURSES, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_GOALS)) db.createObjectStore(STORE_GOALS, { keyPath: "id" });
    };
    request.onsuccess = () => {
      const db = request.result;
      // Let a newer tab upgrade the schema instead of blocking it forever
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Course Vault database is open in another tab with an older version. Close other tabs and retry."));
  });
};

const run = async (storeName, mode, operation) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const req = operation(tx.objectStore(storeName));
    // Resolve on transaction completion so writes are durable before callers continue
    tx.oncomplete = () => { db.close(); resolve(req.result); };
    tx.onerror = () => { db.close(); reject(tx.error || req.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Transaction aborted")); };
  });
};

export const dbAPI = {
  getAll: (storeName) => run(storeName, "readonly", (store) => store.getAll()).then((r) => r || []),
  save: (storeName, val) => run(storeName, "readwrite", (store) => store.put(val)),
  delete: (storeName, id) => run(storeName, "readwrite", (store) => store.delete(id)).then(() => undefined),
};

export const getAllCourses = () => dbAPI.getAll(STORE_COURSES);
