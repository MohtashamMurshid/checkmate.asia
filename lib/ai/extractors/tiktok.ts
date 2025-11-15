/**
 * TikTok content extractor
 */

import { openai } from '../services';
import type { ExtractedContent } from './types';

export async function extractTikTokContent(url: string): Promise<ExtractedContent> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    // Dynamically import TikTok downloader
    const Downloader = (await import('@tobyg74/tiktok-api-dl')).default;

    const videoResponse = await Downloader.Downloader(url, {
      version: 'v1',
    });

    if (!videoResponse || videoResponse.status !== 'success' || !videoResponse.result) {
      throw new Error('Could not fetch TikTok video data');
    }

    const videoData = videoResponse.result;
    const metadata = {
      description: videoData.desc || '',
      author: videoData.author?.nickname || 'unknown',
      videoUrl: videoData.videoHD || videoData.videoSD || videoData.videoWatermark || null,
      duration: videoData.video?.duration || 0,
      likes: typeof videoData.statistics?.likeCount === 'string'
        ? parseInt(videoData.statistics.likeCount)
        : videoData.statistics?.likeCount || 0,
      url,
    };

    // Transcribe video if URL is available
    let transcription = '';
    if (metadata.videoUrl && openai) {
      try {
        const videoResponse = await fetch(metadata.videoUrl);
        if (videoResponse.ok) {
          const videoBuffer = await videoResponse.arrayBuffer();
          const videoFile = new File([videoBuffer], 'tiktok-video.mp4', {
            type: 'video/mp4',
          });

          const transcriptionResponse = await openai.audio.transcriptions.create({
            file: videoFile,
            model: 'whisper-1',
          });

          transcription = transcriptionResponse.text;
        }
      } catch (transcriptionError) {
        console.error('Transcription error:', transcriptionError);
        transcription = '[Transcription failed]';
      }
    }

    return {
      content: `${metadata.description}\n\nTranscription: ${transcription}`,
      metadata,
      sourceType: 'tiktok',
    };
  } catch (error) {
    throw new Error(
      `Failed to scrape TikTok: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

