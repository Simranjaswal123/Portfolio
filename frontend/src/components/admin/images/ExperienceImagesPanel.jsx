import { useState } from 'react'
import {
  deleteExperienceImage,
  reorderExperienceImages,
  uploadExperienceImage,
} from '../../../services/experience.service.js'
import GalleryField from './GalleryField.jsx'

// The photographs of ONE experience entry (for example the Leadership Bootcamp photos).
// Every change is saved straight away (it does not wait for the form's Save button).
// "onChanged" tells the parent to refresh its list.
function ExperienceImagesPanel({ experience, onChanged }) {
  const [images, setImages] = useState(experience.images ?? [])

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h4 className="font-semibold text-gray-900">Photographs</h4>
        <p className="text-xs text-gray-500">Photos are saved as soon as you upload or delete them.</p>
      </div>

      <GalleryField
        label="Photographs"
        images={images}
        onUpload={(file, onProgress) => uploadExperienceImage(experience.id, file, onProgress)}
        onDelete={(imageId) => deleteExperienceImage(experience.id, imageId)}
        onReorder={(order) => reorderExperienceImages(experience.id, order)}
        onChanged={(next) => {
          setImages(next)
          onChanged?.()
        }}
      />
    </div>
  )
}

export default ExperienceImagesPanel
