/** Same IndexedDB as NotesSection (Course Vault) for courses/modules. */
const DB_NAME = "StudyBuddyVault";
const DB_VERSION = 3;
const STORE_COURSES = "courses";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_COURSES)) db.createObjectStore(STORE_COURSES, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllCourses = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_COURSES, "readonly").objectStore(STORE_COURSES).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};
