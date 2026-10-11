// Errors we raise on purpose, with a message that is safe to show to the client.
// Controllers answer with exactly this status and message. Any other error
// (Supabase, Storage, a bug) is treated as private: it is logged, and the client
// only gets a generic message.
export function httpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.isHttpError = true
  return error
}

// An error's message, safe to write to a log: anything that looks like a Supabase key
// or a signed token is blanked out first, whatever a library put in the message.
export function logSafeMessage(error) {
  return String(error?.message ?? error)
    .replace(/sb_(secret|publishable)_[\w-]+/g, '[key]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]')
}

// True when Supabase says a table (or the link between two tables) does not exist.
// That happens until backend/sql/image-storage.sql has been run.
export function isMissingTable(error) {
  return ['PGRST200', 'PGRST205', '42P01'].includes(error?.code)
}
