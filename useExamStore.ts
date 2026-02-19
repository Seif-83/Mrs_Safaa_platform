import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, push, get, child } from 'firebase/database';
import { db } from './firebase';
import { Exam, ExamResult } from './types';

const EXAMS_PATH = 'exams';
const EXAM_RESULTS_PATH = 'exam_results';

export function useExamStore() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dbRef = ref(db, EXAMS_PATH);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Firebase RTDB might store as object keyed by id or as array
        const list: Exam[] = Array.isArray(val) ? val : Object.keys(val).map(k => val[k]);
        setExams(list);
      } else {
        setExams([]);
      }
      setIsLoading(false);
    }, (err) => {
      console.error('Failed to read exams:', err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createExam = useCallback(async (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    const newRef = push(ref(db, EXAMS_PATH));
    const id = newRef.key as string;
    const payload: Exam = { ...exam as Exam, id, createdAt: Date.now() };
    await set(newRef, payload);
    return id;
  }, []);

  const updateExam = useCallback(async (examId: string, data: Partial<Exam>) => {
    const examRef = child(ref(db), `${EXAMS_PATH}/${examId}`);
    const snapshot = await get(examRef);
    if (!snapshot.exists()) throw new Error('Exam not found');
    const existing = snapshot.val();
    await set(examRef, { ...existing, ...data });
  }, []);

  const deleteExam = useCallback(async (examId: string) => {
    const examRef = child(ref(db), `${EXAMS_PATH}/${examId}`);
    await set(examRef, null);
  }, []);

  const listExams = useCallback(() => exams, [exams]);

  const submitResult = useCallback(async (result: Omit<ExamResult, 'id' | 'submittedAt'>) => {
    const newRef = push(ref(db, EXAM_RESULTS_PATH));
    const id = newRef.key as string;
    const payload: ExamResult = { ...result as ExamResult, id, submittedAt: Date.now() };
    await set(newRef, payload);
    return id;
  }, []);

  const getResultsForExam = useCallback(async (examId: string) => {
    const resRef = ref(db, EXAM_RESULTS_PATH);
    const snapshot = await get(resRef);
    if (!snapshot.exists()) return [] as ExamResult[];
    const val = snapshot.val();
    const list: ExamResult[] = Array.isArray(val) ? val : Object.keys(val).map(k => val[k]);
    return list.filter(r => r.examId === examId);
  }, []);

  return {
    exams,
    isLoading,
    createExam,
    updateExam,
    deleteExam,
    listExams,
    submitResult,
    getResultsForExam,
  };
}
