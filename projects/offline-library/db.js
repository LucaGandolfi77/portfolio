/* Offline Library — single-connection IndexedDB store */

const DB_NAME = 'OfflineLibraryDB';
const VERSION = 1;

function asPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class LibraryDB {
  constructor() { this.db = null; }

  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('bm')) {
          db.createObjectStore('bm', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        this.db.onversionchange = () => { this.db.close(); this.db = null; };
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async all(store) {
    const db = await this.open();
    return asPromise(db.transaction(store, 'readonly').objectStore(store).getAll());
  }

  async add(store, value) {
    const db = await this.open();
    return asPromise(db.transaction(store, 'readwrite').objectStore(store).add(value));
  }

  async put(store, value) {
    const db = await this.open();
    return asPromise(db.transaction(store, 'readwrite').objectStore(store).put(value));
  }

  async remove(store, key) {
    const db = await this.open();
    return asPromise(db.transaction(store, 'readwrite').objectStore(store).delete(key));
  }

  async get(store, key) {
    const db = await this.open();
    return asPromise(db.transaction(store, 'readonly').objectStore(store).get(key));
  }

  getBooks() { return this.all('books'); }
  getBookmarks() { return this.all('bm'); }

  async updateBook(id, patch) {
    const book = await this.get('books', id);
    if (!book) return null;
    Object.assign(book, patch, { saved: new Date().toISOString() });
    await this.put('books', book);
    return book;
  }

  async addBook(book) {
    return {
      id: await this.add('books', { saved: new Date().toISOString(), progress: 0, ...book }),
      ...book
    };
  }

  async addBookmark(bookmark) {
    return this.add('bm', { created: Date.now(), ...bookmark });
  }

  deleteBook(id) { return this.remove('books', id); }
  deleteBookmark(id) { return this.remove('bm', id); }
}
