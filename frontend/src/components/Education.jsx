// TEMPORARY placeholder data so we can build the UI.
// This will later be replaced with real data from the backend/database.
const educationEntries = [
  {
    id: 1,
    institution: 'Example University',
    degree: 'Bachelor of Technology (B.Tech)',
    field: 'Computer Science and Engineering',
    startDate: '2023',
    endDate: 'Present',
    description:
      'Placeholder: Studying core computer science subjects such as data structures, algorithms, databases and web development.',
  },
  {
    id: 2,
    institution: 'Example School',
    degree: 'Senior Secondary (Class XII)',
    field: 'Science (PCM)',
    startDate: '2021',
    endDate: '2023',
    description:
      'Placeholder: Completed senior secondary education with a focus on physics, chemistry and mathematics.',
  },
]

function Education() {
  return (
    <section id="education" className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Education
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {educationEntries.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-400 hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {item.degree}
              </h3>
              <p className="mt-1 font-medium text-gray-700">
                {item.institution}
              </p>
              <p className="text-gray-500">{item.field}</p>

              <p className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {item.startDate} – {item.endDate}
              </p>

              <p className="mt-4 text-gray-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Education
