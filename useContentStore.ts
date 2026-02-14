import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { db } from './firebase';
import { PrepData, Lesson } from './types';
import { PREP_LEVELS_DATA } from './constants';

const DB_PATH = 'platform_content';

export function useContentStore() {
    const [levels, setLevels] = useState<PrepData[]>(PREP_LEVELS_DATA);
    const [isLoading, setIsLoading] = useState(true);

    // Listen for real-time updates from Firebase
    useEffect(() => {
        const dbRef = ref(db, DB_PATH);

        const unsubscribe = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                setLevels(snapshot.val() as PrepData[]);
            } else {
                // First time: seed Firebase with default data
                set(dbRef, PREP_LEVELS_DATA);
                setLevels(PREP_LEVELS_DATA);
            }
            setIsLoading(false);
        }, (error) => {
            console.error('Firebase read error:', error);
            // Fallback to defaults if Firebase fails
            setLevels(PREP_LEVELS_DATA);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addLesson = useCallback((levelId: string, lesson: Lesson) => {
        const updated = levels.map(level =>
            level.id === levelId
                ? { ...level, lessons: [...level.lessons, lesson] }
                : level
        );
        set(ref(db, DB_PATH), updated);
    }, [levels]);

    const removeLesson = useCallback((levelId: string, lessonId: string) => {
        const updated = levels.map(level =>
            level.id === levelId
                ? { ...level, lessons: level.lessons.filter(l => l.id !== lessonId) }
                : level
        );
        set(ref(db, DB_PATH), updated);
    }, [levels]);

    const updateLesson = useCallback((levelId: string, lessonId: string, data: Partial<Lesson>) => {
        const updated = levels.map(level =>
            level.id === levelId
                ? {
                    ...level,
                    lessons: level.lessons.map(l =>
                        l.id === lessonId ? { ...l, ...data } : l
                    ),
                }
                : level
        );
        set(ref(db, DB_PATH), updated);
    }, [levels]);

    const resetToDefaults = useCallback(() => {
        set(ref(db, DB_PATH), PREP_LEVELS_DATA);
    }, []);

    return { levels, isLoading, addLesson, removeLesson, updateLesson, resetToDefaults };
}
