import app from './app.js'

// The server decides *where* the app runs: it starts listening on a port.
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
