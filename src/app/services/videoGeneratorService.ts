import { downloadFile } from '@/utils/fileUtils';
import RunwayML from '@runwayml/sdk';

export async function assembleVideoSequences(
  sceneImages: string[], 
  beats: number[], 
  options: { 
    motionIntensity: number,
    durationPerBeat: number 
  }
): Promise<string[]> {
  const client = new RunwayML({
    apiKey: process.env.RUNWAYML_API_KEY,
  });

  const storedVideoPaths: string[] = [];

  for (let i = 0; i < sceneImages.length; i++) {
    const imageUrl = sceneImages[i];
    const beat = beats[i];

    const imageToVideo = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: imageUrl,
      promptText: `Motion intensity: ${options.motionIntensity}, Duration: ${options.durationPerBeat * beat}`,
    });

    let task;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      task = await client.tasks.retrieve(imageToVideo.id);
    } while (!['SUCCEEDED', 'FAILED'].includes(task.status));

    if (task.status === 'FAILED') {
      throw new Error(`Video generation failed: ${task.failure || task.failureCode}`);
    }

    if (task.output && task.output.length > 0) {
      // Download and store each video output
      const videoUrls = task.output;
      for (const url of videoUrls) {
        const storedPath = await downloadFile(url, `video-${i}-${Date.now()}.mp4`);
        storedVideoPaths.push(storedPath);
      }
    }
  }

  return storedVideoPaths;
}
