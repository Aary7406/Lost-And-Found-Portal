// Input validation utilities

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRequired(value) {
  return value !== null && value !== undefined && value !== '';
}

export function validateCategory(category) {
  const validCategories = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Keys', 'Documents', 'Other'];
  return validCategories.includes(category);
}

export function validateStatus(status) {
  const validStatuses = ['admin_pending', 'lost', 'found', 'claimed', 'returned'];
  return validStatuses.includes(status);
}

export function validateRole(role) {
  const validRoles = ['student', 'admin', 'director'];
  return validRoles.includes(role);
}

export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

export function validateDate(dateStr) {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

export function validateNotFutureDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}
