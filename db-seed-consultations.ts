import "dotenv/config";
import { db } from "./server/db";
import { consultationTypes, consultationAvailability } from "./shared/schema";

async function seed() {
  console.log("Seeding consultation types...");
  await db.insert(consultationTypes).values([
    {
      title: "Discovery Call",
      titleAr: "مكالمة استكشافية",
      description: "A free 15-minute call to discuss your needs and how we can help.",
      descriptionAr: "مكالمة مجانية لمدة 15 دقيقة لمناقشة احتياجاتك وكيف يمكننا المساعدة.",
      bestFor: "New clients or those unsure which service fits.",
      bestForAr: "العملاء الجدد أو غير المتأكدين من الخدمة المناسبة.",
      price: 0,
      duration: 15,
      color: "var(--v2-teal)",
      availableOnline: true,
      availableOffline: false,
    },
    {
      title: "Strategic Session",
      titleAr: "جلسة استراتيجية",
      description: "A full 60-minute deep dive into your business strategy and financial planning.",
      descriptionAr: "تعمق كامل لمدة 60 دقيقة في استراتيجية عملك والتخطيط المالي.",
      bestFor: "Business owners needing a comprehensive plan.",
      bestForAr: "أصحاب الأعمال الذين يحتاجون إلى خطة شاملة.",
      price: 150,
      duration: 60,
      color: "var(--v2-gold)",
      availableOnline: true,
      availableOffline: true,
    }
  ]);

  console.log("Seeding consultation availability...");
  await db.insert(consultationAvailability).values([
    {
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      dayOfWeek: 2, // Tuesday
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      dayOfWeek: 3, // Wednesday
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      dayOfWeek: 4, // Thursday
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    }
  ]);

  console.log("Done seeding consultations!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding:", err);
  process.exit(1);
});
