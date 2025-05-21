import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

export type FaceLandmark = NormalizedLandmark

export interface BlendShapeCategory {
  categoryName: string
  displayName?: string
  score: number
}

export type BlendShapes = Array<{
  categories: BlendShapeCategory[]
}>

export interface WebcamState {
  running: boolean
}

export type Emotion = 'Happiness' | 'Sadness' | 'Surprise' | 'Anger' | 'Fear' | 'Neutral'
export type Gender = 'male' | 'female'

export type Shape = {
  label: string
  shapeKey: string
  value: number
}
