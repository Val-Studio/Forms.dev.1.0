/**
 * Safety Triggers System
 * Система виявлення критичних відповідей у психологічних тестах
 */

export interface SafetyTrigger {
  id: string
  questionId: string
  optionId?: string
  type: 'suicide_risk' | 'self_harm' | 'violence' | 'severe_depression' | 'psychosis' | 'custom'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  actions: SafetyAction[]
}

export interface SafetyAction {
  type: 'email' | 'sms' | 'in_app_alert' | 'show_resources' | 'log'
  config: {
    recipient?: string
    template?: string
    resources?: CrisisResource[]
    priority?: 'normal' | 'urgent' | 'immediate'
  }
}

export interface CrisisResource {
  name: string
  phone: string
  url?: string
  available: string
}

export interface SafetyAlert {
  triggerId: string
  submissionId: string
  type: SafetyTrigger['type']
  severity: SafetyTrigger['severity']
  message: string
  timestamp: Date
  patientId?: string
  psychologistId: string
}

/**
 * Перевірка відповідей на наявність safety triggers
 */
export function checkSafetyTriggers(
  answers: Record<string, any>,
  triggers: SafetyTrigger[]
): SafetyAlert[] {
  const alerts: SafetyAlert[] = []

  for (const trigger of triggers) {
    const answer = answers[trigger.questionId]

    if (!answer) continue

    let isTriggered = false

    // Перевірка за optionId (для single choice, multiple choice)
    if (trigger.optionId) {
      if (answer.optionId === trigger.optionId) {
        isTriggered = true
      } else if (answer.optionIds?.includes(trigger.optionId)) {
        isTriggered = true
      }
    }
    // Перевірка за текстом (для text input) - шукаємо ключові слова
    else if (answer.text) {
      const keywords = getTriggerKeywords(trigger.type)
      const lowerText = answer.text.toLowerCase()
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        isTriggered = true
      }
    }

    if (isTriggered) {
      alerts.push({
        triggerId: trigger.id,
        submissionId: '', // Буде заповнено при збереженні
        type: trigger.type,
        severity: trigger.severity,
        message: trigger.message,
        timestamp: new Date(),
        psychologistId: '', // Буде заповнено при збереженні
      })
    }
  }

  return alerts
}

/**
 * Отримати ключові слова для типу тригера
 */
function getTriggerKeywords(type: SafetyTrigger['type']): string[] {
  const keywordsMap: Record<SafetyTrigger['type'], string[]> = {
    suicide_risk: [
      'самогубство',
      'покінчити',
      'вбити себе',
      'не хочу жити',
      'краще померти',
      'суїцид',
      'смерть',
      'suicide',
      'kill myself',
    ],
    self_harm: [
      'різати себе',
      'порізи',
      'самопошкодження',
      'боляче собі',
      'self harm',
      'cut myself',
    ],
    violence: [
      'вбити',
      'завдати шкоди',
      'насильство',
      'фізична розправа',
      'kill someone',
      'hurt someone',
      'violence',
    ],
    severe_depression: [
      'безнадійність',
      'порожнеча',
      'нічого не відчуваю',
      'життя не має сенсу',
      'hopeless',
      'emptiness',
    ],
    psychosis: [
      'голоси',
      'бачу те що інші не бачать',
      'переслідують',
      'voices',
      'hallucinations',
      'paranoia',
    ],
    custom: [],
  }

  return keywordsMap[type] || []
}

/**
 * Кризові ресурси України
 */
export const UKRAINE_CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: 'Лінія підтримки ЗСУ та ветеранів',
    phone: '0 800 500 335',
    available: '24/7',
  },
  {
    name: 'Національна гаряча лінія з попередження домашнього насильства',
    phone: '0 800 500 335',
    url: 'https://www.msp.gov.ua',
    available: '24/7',
  },
  {
    name: 'Телефон довіри для дітей та молоді',
    phone: '116 111',
    available: '24/7',
  },
  {
    name: 'Центр психологічної допомоги',
    phone: '0 800 100 102',
    url: 'https://www.7ya.com.ua',
    available: 'Пн-Пт 9:00-21:00',
  },
]

/**
 * Генерація повідомлення для психолога
 */
export function generateAlertMessage(alert: SafetyAlert, patientInfo?: any): string {
  const severityEmoji = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
    critical: '🚨',
  }

  return `
${severityEmoji[alert.severity]} ПОПЕРЕДЖЕННЯ: ${alert.type.toUpperCase()}

Рівень: ${alert.severity}
Час: ${alert.timestamp.toLocaleString('uk-UA')}
${patientInfo ? `Пацієнт: ${patientInfo.name || 'Анонім'}` : ''}

Повідомлення: ${alert.message}

Рекомендується:
${getRecommendations(alert.type, alert.severity)}
  `.trim()
}

/**
 * Отримати рекомендації залежно від типу та серйозності
 */
function getRecommendations(type: SafetyTrigger['type'], severity: SafetyTrigger['severity']): string {
  if (severity === 'critical') {
    return `
- ⚠️ НЕГАЙНО зв'яжіться з клієнтом
- 📞 Надайте контакти кризової служби
- 🏥 За необхідності викликайте швидку допомогу
- 📝 Задокументуйте всі дії
    `.trim()
  }

  const recommendationsMap: Partial<Record<SafetyTrigger['type'], string>> = {
    suicide_risk: `
- Зв'яжіться з клієнтом найближчим часом
- Оцініть рівень ризику більш детально
- Надайте контакти кризової служби
- Розгляньте необхідність екстреної консультації
    `.trim(),
    self_harm: `
- Заплануйте додаткову сесію
- Обговоріть здорові копінг-стратегії
- Оцініть рівень дистресу
    `.trim(),
    severe_depression: `
- Моніторте стан клієнта
- Розгляньте необхідність медикаментозного лікування
- Оцініть підтримку з боку близьких
    `.trim(),
  }

  return recommendationsMap[type] || 'Зверніть увагу на цю відповідь під час наступної сесії'
}

/**
 * Перевірка чи потрібно показати кризові ресурси клієнту
 */
export function shouldShowCrisisResources(alerts: SafetyAlert[]): boolean {
  return alerts.some(
    (alert) =>
      alert.severity === 'critical' ||
      (alert.severity === 'high' && alert.type === 'suicide_risk')
  )
}
