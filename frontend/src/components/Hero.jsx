function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24 sm:text-left">
        <p className="text-lg font-medium text-gray-600">Hi, I'm Simran</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Full Stack Developer
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:mx-0">
          I build modern, responsive web applications from the database to the
          user interface, with a focus on clean code and great user experience.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#projects"
            className="rounded-lg bg-gray-900 px-6 py-3 text-center font-medium text-white hover:bg-gray-700"
          >
            View My Projects
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-900 hover:bg-gray-100"
          >
            Contact Me
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
