import { useState } from 'react'
import { createContactMessage } from '../services/contact.service.js'

const emptyForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'

function Contact() {
  // All four form values live in one state object.
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every keystroke. The input's "name" tells us which field to update.
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    // Start fresh: hide any message from a previous attempt.
    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      await createContactMessage(formData)
      setSuccessMessage("Thank you! Your message has been sent. I'll get back to you soon.")
      setFormData(emptyForm) // clear the form only after a successful send
    } catch (err) {
      console.error(err)
      // The form data is kept, so the visitor can try again without retyping.
      setErrorMessage('Sorry, your message could not be sent. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {/* Left column: message */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Get In Touch</h2>
            <p className="mt-4 text-lg text-gray-600">
              I'm open to internships, entry-level roles and interesting
              projects. Whether you're a recruiter, a fellow developer or
              someone with an idea, I'd be glad to hear from you.
            </p>
            <p className="mt-4 text-gray-600">
              Send me a message using the form and I'll get back to you as soon
              as I can.
            </p>
          </div>

          {/* Right column: form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {successMessage && (
              <p role="status" className="text-sm font-medium text-green-700">
                {successMessage}
              </p>
            )}

            {errorMessage && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
