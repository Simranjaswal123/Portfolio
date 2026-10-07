// A very small in-memory rate limiter. No extra packages or services.
//
// It counts requests per IP address inside a time window and answers 429 when an
// address goes over the limit. The counts live in this server's memory, so they
// reset when the server restarts, and they are not shared if you run several servers.
// That is fine for a single development/personal-portfolio server.
function createRateLimiter({ windowMs, max }) {
  const hits = new Map() // ip -> { count, resetAt }

  // Every so often, forget addresses whose window has ended, so the map can't grow forever.
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of hits) {
      if (entry.resetAt <= now) {
        hits.delete(ip)
      }
    }
  }, windowMs).unref() // unref(): this timer alone never keeps the server running

  return (req, res, next) => {
    const now = Date.now()
    const ip = req.ip
    let entry = hits.get(ip)

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(ip, entry)
    }

    entry.count += 1

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }

    next()
  }
}

// Visitors may send at most 5 contact messages per 15 minutes from one address.
// NOTE: if the app is later deployed behind a proxy or load balancer, enable Express's
// "trust proxy" setting, or every visitor will look like the same address.
export const contactRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })
