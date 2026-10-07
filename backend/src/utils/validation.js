// Small, dependency-free input validation.
//
// You describe each allowed field with a rule, and validateFields() returns:
//   data   - a clean copy that holds ONLY the allowed fields (strings are trimmed)
//   errors - a list of plain messages such as "title is required"
//
// Fields that are not in the rules are dropped. That stops a request from setting
// columns it should never control, like id, created_at or a message's status.
//
// Rule options:
//   type      'string' | 'url' | 'date' | 'email' | 'boolean' | 'stringArray'
//   required  the field must be present and not empty (on create)
//   max       longest allowed text (or most items, for 'stringArray')
//
// partial = true is for updates (PATCH): only fields that are sent are checked, so a
// request may change just one field. An optional text field sent as "" or null is
// stored as null, which is how the admin clears a value.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isValidUrl(text) {
  try {
    const url = new URL(text)
    // Only web links. This blocks values like "javascript:alert(1)".
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidDate(text) {
  if (!DATE_PATTERN.test(text)) {
    return false
  }

  // Reject dates like 2025-02-31 that look right but don't exist.
  const date = new Date(`${text}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateFields(body, rules, { partial = false } = {}) {
  const data = {}
  const errors = []

  if (!isPlainObject(body)) {
    return { data, errors: ['Request body must be a JSON object'] }
  }

  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field]

    // Not sent at all.
    if (value === undefined) {
      if (rule.required && !partial) {
        errors.push(`${field} is required`)
      }
      continue
    }

    if (rule.type === 'boolean') {
      if (typeof value === 'boolean') {
        data[field] = value
      } else {
        errors.push(`${field} must be true or false`)
      }
      continue
    }

    if (rule.type === 'stringArray') {
      const allText = Array.isArray(value) && value.every((item) => typeof item === 'string')
      const cleaned = allText ? value.map((item) => item.trim()).filter((item) => item !== '') : []

      if (!allText) {
        errors.push(`${field} must be an array of text`)
      } else if (rule.required && cleaned.length === 0) {
        errors.push(`${field} must have at least one item`)
      } else if (cleaned.length > rule.max || cleaned.some((item) => item.length > 100)) {
        errors.push(`${field} has too many items or an item is too long`)
      } else {
        data[field] = cleaned
      }
      continue
    }

    // Everything else is text: 'string', 'url', 'date' or 'email'.
    if (value !== null && typeof value !== 'string') {
      errors.push(`${field} must be text`)
      continue
    }

    const text = value === null ? '' : value.trim()

    if (text === '') {
      if (rule.required) {
        errors.push(`${field} is required`)
      } else if (partial) {
        data[field] = null // the admin emptied this field, so clear it
      }
      // On create, an empty optional field is simply left out.
      continue
    }

    if (text.length > rule.max) {
      errors.push(`${field} is too long`)
    } else if (rule.type === 'url' && !isValidUrl(text)) {
      errors.push(`${field} must be a valid http(s) URL`)
    } else if (rule.type === 'date' && !isValidDate(text)) {
      errors.push(`${field} must be a valid date (YYYY-MM-DD)`)
    } else if (rule.type === 'email' && !EMAIL_PATTERN.test(text)) {
      errors.push(`${field} must be a valid email address`)
    } else {
      data[field] = text
    }
  }

  // An update that changes nothing is a mistake.
  if (partial && errors.length === 0 && Object.keys(data).length === 0) {
    errors.push('No valid fields to update')
  }

  return { data, errors }
}
