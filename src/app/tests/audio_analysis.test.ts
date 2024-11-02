import { segmentAudio } from "../services/audioAnalysisService";


 describe('segmentAudio', () => {
     it('should return an array of segments', async () => {
         const filePath = '/Users/fathindosunmu/DEV/MyProjects/runway-music-video-generator/src/app/tests/samples/sample.wav';
         const segments = await segmentAudio(filePath);
         expect(Array.isArray(segments)).toBe(true);
         expect(segments.length).toBeGreaterThan(0);
         segments.forEach(segment => {
             expect(segment).toHaveProperty('start_time');
             expect(segment).toHaveProperty('end_time');
             expect(segment).toHaveProperty('theme');
         });
     });

     it('should handle invalid file paths', async () => {
         const filePath = 'invalid/path/to/file.wav';
         await expect(segmentAudio(filePath)).rejects.toThrow();
     });

     it('should return segments with correct start and end times', async () => {
         const filePath = '/Users/fathindosunmu/DEV/MyProjects/runway-music-video-generator/src/app/tests/samples/sample.wav';
         const segments = await segmentAudio(filePath);
         segments.forEach((segment, index) => {
             const expectedStartTime = index * 5;
             const expectedEndTime = (index + 1) * 5;
             expect(segment.start_time).toBe(expectedStartTime);
             expect(segment.end_time).toBe(expectedEndTime);
         });
     });
 });