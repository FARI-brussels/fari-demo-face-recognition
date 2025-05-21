export interface WebcamState {
  running: boolean
}

export async function startWebcam(
  video: HTMLVideoElement | null,
  constraints: MediaStreamConstraints = {
    video: { width: { ideal: 320 }, height: { ideal: 240 } },
  },
): Promise<void> {
  if (!video || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Webcam or getUserMedia not supported')
  }

  // Validate constraints
  if (!constraints.video && !constraints.audio) {
    throw new Error('At least one of audio or video must be requested in constraints')
  }

  try {
    console.log('Requesting webcam with constraints:', constraints)
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
  } catch (error) {
    console.error('getUserMedia failed:', error)
    throw error
  }
}

export function stopWebcam(video: HTMLVideoElement | null): void {
  if (video?.srcObject) {
    const stream = video.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())
    video.srcObject = null
  }
}

export function hasGetUserMedia(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}
