
import { useState, useEffect, useCallback } from 'react';
import { PrepData, Lesson } from './types';
import { PREP_LEVELS_DATA } from './constants';

const STORAGE_KEY = 'platform_content_data';

function getStoredData(): PrepData[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading from localStorage:', e);
    }
    // Seed with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PREP_LEVELS_DATA));
    return [...PREP_LEVELS_DATA];
}

function saveData(data: PrepData[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useContentStore() {
    const [levels, setLevels] = useState<PrepData[]>(getStoredData);

    // Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                setLevels(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const addLesson = useCallback((levelId: string, lesson: Lesson) => {
        setLevels(prev => {
            const updated = prev.map(level =>
                level.id === levelId
                    ? { ...level, lessons: [...level.lessons, lesson] }
                    : level
            );
            saveData(updated);
            return updated;
        });
    }, []);

    const removeLesson = useCallback((levelId: string, lessonId: string) => {
        setLevels(prev => {
            const updated = prev.map(level =>
                level.id === levelId
                    ? { ...level, lessons: level.lessons.filter(l => l.id !== lessonId) }
                    : level
            );
            saveData(updated);
            return updated;
        });
    }, []);

    const updateLesson = useCallback((levelId: string, lessonId: string, data: Partial<Lesson>) => {
        setLevels(prev => {
            const updated = prev.map(level =>
                level.id === levelId
                    ? {
                        ...level,
                        lessons: level.lessons.map(l =>
                            l.id === lessonId ? { ...l, ...data } : l
                        ),
                    }
                    : level
            );
            saveData(updated);
            return updated;
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        const defaults = [...PREP_LEVELS_DATA];
        saveData(defaults);
        setLevels(defaults);
    }, []);

    return { levels, addLesson, removeLesson, updateLesson, resetToDefaults };
}
