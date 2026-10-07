import { validateFields } from '../utils/validation.js'

// Builds an Express middleware from a set of field rules (see utils/validation.js).
//
// If the data is wrong, it answers 400 and the controller never runs.
// If it is fine, req.body is replaced by the cleaned copy (only allowed fields,
// trimmed text), so the controllers and services only ever see safe data.
function validateBody(rules, { partial = false } = {}) {
  return (req, res, next) => {
    const { data, errors } = validateFields(req.body, rules, { partial })

    if (errors.length > 0) {
      // These messages are written by us (never copied from the request).
      return res.status(400).json({ error: 'Invalid request data', details: errors })
    }

    req.body = data
    next()
  }
}

// ---- Rules for each resource -------------------------------------------------

const projectRules = {
  title: { type: 'string', required: true, max: 200 },
  slug: { type: 'string', required: true, max: 100 },
  description: { type: 'string', required: true, max: 2000 },
  long_description: { type: 'string', max: 20000 },
  technologies: { type: 'stringArray', max: 30 },
  github_url: { type: 'url', max: 2048 },
  live_url: { type: 'url', max: 2048 },
  image_url: { type: 'url', max: 2048 },
  featured: { type: 'boolean' },
}

const skillRules = {
  name: { type: 'string', required: true, max: 100 },
  category: { type: 'string', required: true, max: 100 },
  icon: { type: 'string', max: 200 },
}

const experienceRules = {
  company: { type: 'string', required: true, max: 200 },
  role: { type: 'string', required: true, max: 200 },
  location: { type: 'string', max: 200 },
  start_date: { type: 'date', required: true, max: 10 },
  end_date: { type: 'date', max: 10 },
  description: { type: 'string', required: true, max: 5000 },
}

const educationRules = {
  institution: { type: 'string', required: true, max: 200 },
  degree: { type: 'string', required: true, max: 200 },
  field: { type: 'string', required: true, max: 200 },
  start_date: { type: 'date', required: true, max: 10 },
  end_date: { type: 'date', max: 10 },
  description: { type: 'string', max: 5000 },
}

// The public contact form. Only these four fields are accepted, so a visitor can
// never set things like the message's status or id.
const contactMessageRules = {
  name: { type: 'string', required: true, max: 100 },
  email: { type: 'email', required: true, max: 254 },
  subject: { type: 'string', max: 200 },
  message: { type: 'string', required: true, max: 5000 },
}

// ---- Ready-to-use middlewares ------------------------------------------------
// "create" needs the required fields. "update" (PATCH) checks only what is sent.

export const validateCreateProject = validateBody(projectRules)
export const validateUpdateProject = validateBody(projectRules, { partial: true })

export const validateCreateSkill = validateBody(skillRules)
export const validateUpdateSkill = validateBody(skillRules, { partial: true })

export const validateCreateExperience = validateBody(experienceRules)
export const validateUpdateExperience = validateBody(experienceRules, { partial: true })

export const validateCreateEducation = validateBody(educationRules)
export const validateUpdateEducation = validateBody(educationRules, { partial: true })

export const validateContactMessage = validateBody(contactMessageRules)
