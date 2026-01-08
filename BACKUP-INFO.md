# 🛟 Інструкція з відновлення MindFlow

## ✅ Поточна стабільна версія збережена!

**Версія:** v1.0-stable
**Коміт:** `aa1a789` - 🚀 Критичні покращення після продуктового рев'ю
**Дата:** 2026-01-08

---

## 📍 Де зберігається backup:

### 1. Remote (на сервері) ✅
- **Бранч:** `claude/mindflow-psych-platform-bIeol`
- **Коміт:** `aa1a789`
- Завжди доступний навіть якщо локальні файли пошкоджені

### 2. Локальні точки відновлення:
- **Tag:** `v1.0-stable` (найшвидший спосіб)
- **Branch 1:** `v1.0-backup`
- **Branch 2:** `claude/v1.0-stable-backup`

---

## 🔄 Як відкотитися до стабільної версії:

### Варіант 1: Через tag (рекомендовано)
```bash
# Відкат до стабільної версії
git checkout v1.0-stable

# Якщо потрібно створити новий бранч з цієї точки
git checkout -b мій-новий-бранч v1.0-stable
```

### Варіант 2: Через SHA коміту
```bash
# Відкат за номером коміту
git checkout aa1a789

# Або створити бранч
git checkout -b мій-новий-бранч aa1a789
```

### Варіант 3: Через backup бранч
```bash
# Переключитися на backup
git checkout v1.0-backup

# Або
git checkout claude/v1.0-stable-backup
```

### Варіант 4: Повне відновлення з remote (якщо все зламалося)
```bash
# Витягнути чисту версію з сервера
git fetch origin claude/mindflow-psych-platform-bIeol
git checkout origin/claude/mindflow-psych-platform-bIeol

# Створити новий робочий бранч
git checkout -b claude/новий-бранч-bIeol
```

---

## 🚨 Екстрений відкат (якщо щось пішло не так):

### Якщо зламали робочий бранч:
```bash
# Скинути всі зміни до останнього стабільного стану
git reset --hard v1.0-stable

# АБО якщо потрібно зберегти незакомічені зміни
git stash                    # Зберегти зміни
git checkout v1.0-stable     # Відкотитися
git stash pop                # Повернути зміни (опціонально)
```

### Якщо видалили файли:
```bash
# Відновити всі файли з останнього коміту
git checkout v1.0-stable -- .

# Або конкретний файл
git checkout v1.0-stable -- шлях/до/файлу.tsx
```

---

## 📦 Що включає v1.0-stable:

### Функціонал:
- ✅ 18 типів питань (Базові, Клінічні, Візуальні, Когнітивні, Системні)
- ✅ Professional Builder (3-panel: Toolbox | Canvas | Properties)
- ✅ AI JSON Import з валідацією
- ✅ Logic Jumps (умовні переходи) + валідація циклів
- ✅ Bulk Edit Scores (масове редагування балів)
- ✅ Safety Triggers система (суїцидальний ризик)
- ✅ Mobile-friendly Matrix Grid
- ✅ Покращена контрастність UI для яскравого світла
- ✅ Детальний error handling AI Import

### Технічний стек:
- Next.js 16.1.1 (Turbopack, Cache Components)
- Neon Serverless PostgreSQL + Drizzle ORM
- Zustand (state management)
- @dnd-kit (drag & drop)
- Zod (validation)
- Framer Motion (animations)
- Tailwind CSS v4 (Apple 2025 style)

### Файли:
```
9 files changed, 903 insertions(+), 47 deletions(-)

Нові:
- src/lib/logicValidator.ts (360 рядків)
- src/lib/safetyTriggers.ts (280 рядків)
- src/components/BulkEditScoresModal.tsx (160 рядків)
- src/app/builder/professional/page.tsx (920 рядків)
- src/lib/schemas.ts (300+ рядків)
- src/store/formBuilder.ts (296 рядків)
- src/components/AIImportModal.tsx
```

---

## 🎯 Перевірка чи ви на правильній версії:

```bash
# Показати поточний коміт
git log -1 --oneline

# Має бути:
# aa1a789 🚀 Критичні покращення після продуктового рев'ю
```

```bash
# Перевірити всі доступні backup точки
git tag -l
git branch --list | grep v1.0
```

---

## 💡 Поради:

1. **Перед експериментами:** Завжди створюйте новий бранч
   ```bash
   git checkout -b claude/експеримент-bIeol
   ```

2. **Після успішних змін:** Комітьте часто
   ```bash
   git add .
   git commit -m "Опис змін"
   ```

3. **Якщо сумніваєтеся:** Перевірте статус
   ```bash
   git status
   git log --oneline -5
   ```

---

## 📞 Допомога:

Якщо виникли проблеми з відкатом:
1. Перевірте чи є коміт `aa1a789` у git log
2. Використайте команду `git reflog` щоб побачити всю історію
3. У найгіршому випадку: склонуйте проект заново з remote

**Важливо:** Версія v1.0-stable **протестована** та **готова до використання**!
