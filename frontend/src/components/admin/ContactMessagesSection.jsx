import { Fragment, useEffect, useState } from 'react'
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../../services/contact.service.js'

// Turns a database timestamp into something readable, like "Oct 7, 2026, 3:45 PM".
function formatDateTime(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// The Contact Messages section of the admin dashboard: a table of messages
// with View, Mark as Read/Unread and Delete buttons per row.
function ContactMessagesSection() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null) // id of the message shown in full
  const [successMessage, setSuccessMessage] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null) // id of the message changing status
  const [deletingId, setDeletingId] = useState(null) // id of the message being deleted

  // While one change is running, the other buttons wait.
  const busy = updatingId !== null || deletingId !== null

  // Fetches the latest messages. On a reload the old table stays visible
  // until the new data arrives.
  async function loadMessages() {
    try {
      const data = await getContactMessages()
      setMessages(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Could not load contact messages. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs once, when the section first appears.
  useEffect(() => {
    loadMessages()
  }, [])

  // Show or hide the full message under its row.
  function handleToggleClick(message) {
    setExpandedId(expandedId === message.id ? null : message.id)
  }

  async function handleStatusClick(message) {
    const newStatus = message.status === 'unread' ? 'read' : 'unread'

    setUpdatingId(message.id) // disables the buttons until we finish
    setSuccessMessage(null)
    setActionError(null)

    try {
      await updateContactMessageStatus(message.id, newStatus)
      setSuccessMessage(`Message marked as ${newStatus}.`)
      await loadMessages() // show the new status right away
    } catch (err) {
      console.error(err)
      setActionError('Could not update the message status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDeleteClick(message) {
    // Ask first. If the admin cancels, do nothing.
    const confirmed = window.confirm(
      `Delete the message "${message.subject}" from ${message.name}? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(message.id) // disables the buttons until we finish
    setSuccessMessage(null)
    setActionError(null)

    try {
      await deleteContactMessage(message.id)

      // If this message was open, close it.
      if (expandedId === message.id) {
        setExpandedId(null)
      }

      setSuccessMessage('Message deleted successfully.')
      await loadMessages() // show the updated list right away
    } catch (err) {
      console.error(err)
      setActionError('Could not delete the message. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  let content

  if (loading) {
    content = <p className="text-gray-600">Loading contact messages...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (messages.length === 0) {
    content = <p className="text-gray-600">No contact messages yet.</p>
  } else {
    content = (
      // overflow-x-auto lets the table scroll sideways on small screens.
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messages.map((message) => {
              const isUnread = message.status === 'unread'
              const isExpanded = expandedId === message.id

              return (
                <Fragment key={message.id}>
                  <tr className="hover:bg-gray-50">
                    <td
                      className={`px-4 py-3 text-gray-900 ${isUnread ? 'font-semibold' : 'font-medium'}`}
                    >
                      {message.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{message.email}</td>
                    <td className="px-4 py-3 text-gray-600">{message.subject}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isUnread
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDateTime(message.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleClick(message)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        >
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusClick(message)}
                          disabled={busy}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === message.id
                            ? 'Updating...'
                            : isUnread
                              ? 'Mark as Read'
                              : 'Mark as Unread'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(message)}
                          disabled={busy}
                          className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium whitespace-nowrap text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === message.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* The full message, shown under its row when "View" is clicked. */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-4 py-4">
                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                          Message
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-gray-900">
                          {message.message}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Contact Messages</h2>

      {successMessage && (
        <p role="status" className="mt-4 text-sm font-medium text-green-700">
          {successMessage}
        </p>
      )}

      {actionError && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600">
          {actionError}
        </p>
      )}

      <div className="mt-4">{content}</div>
    </section>
  )
}

export default ContactMessagesSection
