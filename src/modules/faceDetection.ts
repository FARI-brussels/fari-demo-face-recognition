import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import type { BlendShapes, FaceLandmark } from '@/types'

export async function initializeFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
  )

  return await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 1,
  })
}

export async function detectFaces(
  faceLandmarker: FaceLandmarker,
  video: HTMLVideoElement,
  startTimeMs: number,
): Promise<FaceLandmarkerResult> {
  return faceLandmarker.detectForVideo(video, startTimeMs, {
    runningMode: 'VIDEO',
  })
}
