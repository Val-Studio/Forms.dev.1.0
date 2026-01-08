# 🧠 MindFlow - Психологічна платформа

> Професійна платформа для психологічного тестування з автоматичним аналізом результатів

![Next.js 16](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Особливості

**MindFlow** - це альтернатива Google Forms, спеціально розроблена для психологів з унікальними можливостями:

### 🎯 Ключові переваги

- **📊 Психологічні шкали** - Автоматичний підрахунок балів по шкалах (депресія, тривожність, стрес)
- **⚖️ Вагові коефіцієнти** - Кожна відповідь має власну вагу для різних шкал оцінювання
- **🔀 Логічні переходи** - Умовні переходи між питаннями на основі відповідей
- **📈 Динаміка змін** - Відстеження стану клієнта з часом
- **🎨 Дизайн Apple 2025** - Мінімалістичний, спокійний інтерфейс
- **🔒 Анонімність** - Підтримка анонімних проходжень

### 🛠 Технології

- **Framework**: Next.js 16.1.1 (App Router, Turbopack, Cache Components)
- **UI**: Tailwind CSS v4 + Framer Motion
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Type Safety**: TypeScript (Strict mode)
- **State**: Zustand
- **Validation**: Zod

## 🚀 Швидкий старт

### Вимоги

- Node.js 18+ (рекомендовано 22+)
- npm 10+

### Встановлення

1. **Клонуйте репозиторій**
\`\`\`bash
git clone <your-repo-url>
cd Forms.dev.1.0
\`\`\`

2. **Встановіть залежності**
\`\`\`bash
npm install
\`\`\`

3. **Налаштуйте змінні середовища**
\`\`\`bash
cp .env.example .env
\`\`\`

Відредагуйте \`.env\`:
\`\`\`env
DATABASE_URL=postgresql://user:password@your-neon-db.com/db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
\`\`\`

4. **Створіть схему БД**
\`\`\`bash
npm run db:push
\`\`\`

5. **Запустіть dev сервер**
\`\`\`bash
npm run dev
\`\`\`

Відкрийте [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Структура проекту

\`\`\`
Forms.dev.1.0/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Кабінет психолога
│   │   ├── builder/           # Конструктор тестів
│   │   ├── test/[id]/         # Проходження тесту (публічне)
│   │   └── page.tsx           # Головна сторінка
│   ├── components/
│   │   └── ui/                # UI компоненти (Glass design)
│   │       ├── GlassCard.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Textarea.tsx
│   ├── db/
│   │   ├── schema.ts          # Схема БД Drizzle
│   │   └── index.ts           # Database client
│   └── lib/
│       └── utils.ts           # Утиліти
├── drizzle.config.ts          # Конфігурація Drizzle
├── tailwind.config.ts         # Tailwind CSS
└── next.config.ts             # Next.js 16 config
\`\`\`

## 🎨 Дизайн-система

### Палітра кольорів (Apple 2025)

\`\`\`css
--color-cream: #F0EEE9    /* Фон */
--color-navy: #1A1F2E     /* Текст */
--color-teal: #5FB3B3     /* Акцент */
--color-sand: #D4C5B9     /* Додатковий */
--color-slate: #6B7280    /* Вторинний текст */
\`\`\`

### Glassmorphism

Всі компоненти використовують "glass effect":
- Прозорість 60% (\`bg-white/60\`)
- Backdrop blur (\`backdrop-blur-2xl\`)
- Тонкі рамки (\`border-white/20\`)
- М'які тіні (\`shadow-glass\`)

## 📊 Схема БД

### Ключові таблиці

1. **users** - Психологи
2. **patients** - Клієнти (можуть бути анонімні)
3. **forms** - Психологічні тести
4. **scoring_scales** - Шкали оцінювання (депресія, тривожність)
5. **questions** - Питання (Лайкерт, матриця, текст, повзунок)
6. **options** - Варіанти відповідей з **ваговими коефіцієнтами**
7. **logic_jumps** - Умовні переходи між питаннями
8. **submissions** - Проходження тестів з автоматичними результатами
9. **answers** - Відповіді клієнтів

### Приклад: Scoring Weights

\`\`\`typescript
{
  "depression_scale_id": 3,  // Відповідь додає 3 бали до депресії
  "anxiety_scale_id": 1      // та 1 бал до тривожності
}
\`\`\`

## 🎯 Використання

### Для психологів

1. **Створіть тест** - Перейдіть в `/builder`
2. **Додайте питання** - Виберіть тип (Лайкерт, текст, повзунок)
3. **Налаштуйте шкали** - Створіть шкали оцінювання (напр. "Депресія")
4. **Встановіть ваги** - Призначте бали кожній відповіді
5. **Опублікуйте** - Отримайте посилання для клієнтів

### Для клієнтів

1. Отримайте посилання від психолога
2. Пройдіть тест (\`/test/[id]\`)
3. Отримайте результат автоматично

## 🔧 Доступні команди

\`\`\`bash
npm run dev          # Запустити dev сервер
npm run build        # Зібрати для production
npm run start        # Запустити production сервер
npm run lint         # Перевірити код

# База даних
npm run db:generate  # Генерувати міграції
npm run db:push      # Застосувати зміни до БД
npm run db:studio    # Відкрити Drizzle Studio
\`\`\`

## 🌟 Roadmap

- [ ] Auth.js v5 - Авторизація психологів
- [ ] PDF Export - Експорт результатів
- [ ] Графіки динаміки - Recharts charts
- [ ] Email нотифікації - Resend
- [ ] AI аналіз - Інтеграція з LLM для інтерпретації
- [ ] Mobile app - React Native

## 📝 Ліцензія

MIT License - використовуйте вільно!

## 🙏 Подяки

Створено з ❤️ для психологів, які допомагають людям

---

**MindFlow** - Коли технологія зустрічається з емпатією 🧠✨
