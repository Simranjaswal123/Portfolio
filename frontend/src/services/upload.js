import supabase from '../config/supabase.js'

// Sends an image file to the backend and reports upload progress.
//
// Why XMLHttpRequest and not fetch(): fetch cannot report how much of an upload has
// been sent, and the admin should see a progress bar.
//
// The file is the request body itself (Content-Type: image/jpeg, image/png or
// image/webp). Like authenticatedFetch, it adds the signed-in admin's access token.
// Resolves with the backend's JSON answer. Rejects with an Error whose message is
// safe to show: the backend's own message, or a plain one for network problems.
export async function authenticatedUpload(url, file, { method = 'POST', onProgress } = {}) {
  const { data, error } = await supabase.auth.getSession()
  const accessToken = data?.session?.access_token

  if (error || !accessToken) {
    throw new Error('Not signed in: no access token found')
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open(method, url)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    request.setRequestHeader('Content-Type', file.type)

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      }
    }

    request.onload = () => {
      let body = null

      try {
        body = JSON.parse(request.responseText)
      } catch {
        // not JSON: handled below
      }

      if (request.status >= 200 && request.status < 300) {
        resolve(body)
      } else {
        reject(new Error(body?.error || `Upload failed (status ${request.status})`))
      }
    }

    request.onerror = () => reject(new Error('Network error. Is the backend running?'))
    request.send(file)
  })
}
