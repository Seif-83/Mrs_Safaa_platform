
export type PrepLevel = '1st-prep' | '2nd-prep' | '3rd-prep';

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  pdfUrl: string;
  description: string;
}

export interface PrepData {
  id: PrepLevel;
  title: string;
  titleAr: string;
  image: string;
  description: string;
  lessons: Lesson[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
