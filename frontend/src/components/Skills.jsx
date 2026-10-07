// Each category becomes one card; each skill inside it becomes a badge.
const skillCategories = [
  {
    title: 'Frontend',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    title: 'Backend',
    skills: ['Node.js', 'Express.js', 'REST APIs'],
  },
  {
    title: 'Database',
    skills: ['PostgreSQL', 'Supabase', 'MySQL'],
  },
  {
    title: 'Tools & DevOps',
    skills: ['Git', 'GitHub', 'Docker', 'Linux'],
  },
]

function Skills() {
  return (
    <section id="skills" className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Skills
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((category) => (
            <div
              key={category.title}
              className="rounded-lg border border-gray-200 p-5 shadow-sm hover:border-gray-400 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {category.title}
              </h3>

              <ul className="mt-4 flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-900 hover:text-white"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
