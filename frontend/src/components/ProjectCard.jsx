// Displays a single project. The project object is passed in as a prop.
function ProjectCard({ project }) {
  const hasLinks = project.github_url || project.live_url

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-400 hover:shadow-md">
      <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
      <p className="mt-2 text-gray-600">{project.description}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {(project.technologies ?? []).map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
          >
            {tech}
          </li>
        ))}
      </ul>

      {hasLinks && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              GitHub
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-700"
            >
              Live Demo
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export default ProjectCard
