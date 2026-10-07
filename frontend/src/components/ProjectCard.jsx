// Displays a single project. The project object is passed in as a prop.
function ProjectCard({ project }) {
  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-xl font-semibold">{project.title}</h2>
      <p className="mt-1 text-gray-600">{project.description}</p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {(project.technologies ?? []).map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default ProjectCard
