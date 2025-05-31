export class LocalStorageService {
    loadData<T>(key: string): T[] {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error loading data from localStorage for key "${key}":`, error);
            return [];
        }
    }

    saveData<T>(key: string, data: T[]): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving data to localStorage for key "${key}":`, error);
        }
    }
}