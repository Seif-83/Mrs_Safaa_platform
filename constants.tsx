
import { PrepData } from './types';

export const VALID_ACCESS_CODES = [
  '123',
  'safaa2025',
  'science-is-fun',
  'prep-master',
  'student-access-77'
];

export const PREP_LEVELS_DATA: PrepData[] = [
  {
    id: '1st-prep',
    title: '1st Prep',
    titleAr: 'الصف الأول الإعدادي',
    image: 'https://picsum.photos/seed/science1/800/600',
    description: 'Explore the basics of matter, energy, and living organisms.',
    lessons: [
      { id: '1-1', title: 'المادة وخواصها', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'public/sections/CV.pdf', description: 'تعريف المادة وخصائصها الفيزيائية والكيميائية' },
      { id: '1-2', title: 'تركيب المادة', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep1_lesson2.pdf', description: 'الجزيئات والذرات والروابط الكيميائية' },
      { id: '1-3', title: 'الطاقة الحرارية', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep1_lesson3.pdf', description: 'مصادر الطاقة وطرق انتقال الحرارة' },
    ]
  },
  {
    id: '2nd-prep',
    title: '2nd Prep',
    titleAr: 'الصف الثاني الإعدادي',
    image: 'https://picsum.photos/seed/science2/800/600',
    description: 'Dive deep into periodic tables, waves, and sound mechanics.',
    lessons: [
      { id: '2-1', title: 'دورية العناصر وخواصها', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep2_lesson1.pdf', description: 'محاولات تصنيف العناصر والجدول الدوري الحديث' },
      { id: '2-2', title: 'تآكل طبقة الأوزون', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep2_lesson2.pdf', description: 'الغلاف الجوي وحماية كوكب الأرض' },
      { id: '2-3', title: 'الحركة الموجية', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep2_lesson3.pdf', description: 'خصائص الموجات وتطبيقاتها' },
    ]
  },
  {
    id: '3rd-prep',
    title: '3rd Prep',
    titleAr: 'الصف الثالث الإعدادي',
    image: 'https://picsum.photos/seed/science3/800/600',
    description: 'Master physics, genetics, and the wonders of the universe.',
    lessons: [
      { id: '3-1', title: 'الحركة في اتجاه واحد', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep3_lesson1.pdf', description: 'السرعة المنتظمة والسرعة المتجهة' },
      { id: '3-2', title: 'العدسات والمرايا', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep3_lesson2.pdf', description: 'انعكاس وانكسار الضوء وتطبيقاته' },
      { id: '3-3', title: 'الكون والنظام الشمسي', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', pdfUrl: 'prep3_lesson3.pdf', description: 'نشأة الكون والمجرات' },
    ]
  }
];
