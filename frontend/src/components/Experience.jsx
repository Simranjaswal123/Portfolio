// TEMPORARY placeholder data so we can build the UI.
// This will later be replaced with real data from the backend/database.
const experiences = [
  {
    id: 1,
    role: 'Web Development Intern',
    company: 'Example Company',
    location: 'City, Country',
    startDate: 'Jun 2025',
    endDate: 'Aug 2025',
    description:
      'Placeholder: Built and improved user-facing features with React and worked with a team using Git and code reviews.',
  },
  {
    id: 2,
    role: 'Freelance Developer',
    company: 'Self-employed',
    location: 'Remote',
    startDate: 'Jan 2025',
    endDate: 'Present',
    description:
      'Placeholder: Designed and built small websites for clients, from planning and development to deployment.',
  },
]

function Experience() {
  return (
    <section id="experience" className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Experience
        </h2>

        {/* The left border is the timeline line; each dot marks one entry. */}
        <ol className="mt-8 ml-2 space-y-8 border-l-2 border-gray-200">
          {experiences.map((item) => (
            <li key={item.id} className="relative pl-6 sm:pl-8">
              <span className="absolute top-6 -left-[9px] h-4 w-4 rounded-full border-2 border-gray-400 bg-white" />

              <div className="rounded-lg border border-gray-200 p-5 shadow-sm hover:border-gray-400 hover:shadow-md">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.role}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    {item.startDate} – {item.endDate}
                  </p>
                </div>

                <p className="mt-1 font-medium text-gray-700">
                  {item.company}
                  <span className="font-normal text-gray-500">
                    {' '}
                    · {item.location}
                  </span>
                </p>

                <p className="mt-3 text-gray-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Experience
