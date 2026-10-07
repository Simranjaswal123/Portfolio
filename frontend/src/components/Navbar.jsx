// Each link points to a section on the same page via its id (e.g. #about).
const links = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
]

function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-4 sm:flex-row sm:justify-between">
        <a href="#" className="text-xl font-bold">
          Simran
        </a>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600 sm:gap-x-6">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-black">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
