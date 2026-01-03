import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input - either content, contents array, or image must be provided
    const hasContent = body.content && typeof body.content === 'string' && body.content.trim();
    const hasContents = body.contents && Array.isArray(body.contents) && body.contents.length > 0;
    const hasImage = body.imageBase64 || body.image;
    
    if (!hasContent && !hasContents && !hasImage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one content source is required. Provide "content" (single string), "contents" (array of sources), or an image. Each can be text, a URL, a TikTok link, or a Twitter/X tweet link.' 
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Forward the request to the API (use local for dev, production for prod)
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/investigate'
      : 'https://api.checkmate.asia/api/investigate';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // If response isn't valid JSON, wrap it in a response object
      if (!response.ok) {
        data = { success: false, error: responseText || 'API request failed' };
      } else {
        data = { success: true, rawResponse: responseText };
      }
    }

    // Return the response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from external API' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

