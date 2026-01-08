// Mock user для демонстрації (замінити на real auth)
export const MOCK_USER_ID = 'demo-psychologist-001'

export function getCurrentUserId(): string {
  // TODO: Замінити на реальну авторизацію з Auth.js
  return MOCK_USER_ID
}
