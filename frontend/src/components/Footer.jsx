// PLACEHOLDER links: replace these with your real profile URLs.
const GITHUB_URL = 'https://github.com/your-username'
const LINKEDIN_URL = 'https://www.linkedin.com/in/your-username'

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-sm text-gray-600 sm:flex-row sm:justify-between">
        <p>© 2026 Simran. All rights reserved.</p>

        <ul className="flex gap-6">
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-black"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-black"
            >
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
