import { useState } from 'react'
import {
  deleteProjectImage,
  removeProjectCover,
  reorderProjectImages,
  uploadProjectCover,
  uploadProjectImage,
} from '../../../services/project.service.js'
import GalleryField from './GalleryField.jsx'
import SingleImageField from './SingleImageField.jsx'

// The images of ONE project: its cover image and its extra screenshots.
// Every change is saved straight away (it does not wait for the form's Save button).
// "onChanged" tells the parent to refresh its project list.
function ProjectImagesPanel({ project, onChanged }) {
  const [coverUrl, setCoverUrl] = useState(project.image_url ?? null)
  const [images, setImages] = useState(project.images ?? [])

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h4 className="font-semibold text-gray-900">Images</h4>
        <p className="text-xs text-gray-500">Images are saved as soon as you upload or delete them.</p>
      </div>

      <SingleImageField
        label="Cover image"
        imageUrl={coverUrl}
        alt={`Cover image for ${project.title}`}
        onUpload={(file, onProgress) => uploadProjectCover(project.id, file, onProgress)}
        onRemove={() => removeProjectCover(project.id)}
        onChanged={(result) => {
          setCoverUrl(result.image_url)
          onChanged?.()
        }}
      />

      <GalleryField
        label="Screenshots"
        images={images}
        onUpload={(file, onProgress) => uploadProjectImage(project.id, file, onProgress)}
        onDelete={(imageId) => deleteProjectImage(project.id, imageId)}
        onReorder={(order) => reorderProjectImages(project.id, order)}
        onChanged={(next) => {
          setImages(next)
          onChanged?.()
        }}
      />
    </div>
  )
}

export default ProjectImagesPanel
