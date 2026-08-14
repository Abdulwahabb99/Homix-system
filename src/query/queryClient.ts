import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      /* كان كل رجوع لتبويب المتصفح يعيد جلب كل الاستعلامات النشطة (قائمة الشحنات
         والملخّص والـ meta معاً) فتبدو الصفحة بطيئة. البيانات ما زالت تُحدَّث عند
         التركيب وتغيّر الفلاتر وبعد أي تعديل. */
      refetchOnWindowFocus: false,
    },
  },
});
