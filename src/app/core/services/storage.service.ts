import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  // Set item in storage (local or session)
  setItem(key: string, value: any, useSession: boolean = false): void {
    const storage = useSession ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(value));
  }

  // Get item from storage (local or session)
  getItem<T>(key: string, useSession: boolean = false): T | null {
    const storage = useSession ? sessionStorage : localStorage;
    const item = storage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  // Remove item from storage (local or session)
  removeItem(key: string, useSession: boolean = false): void {
    const storage = useSession ? sessionStorage : localStorage;
    storage.removeItem(key);
  }
}
