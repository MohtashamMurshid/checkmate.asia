import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postsDir = join(process.cwd(), 'app', 'research', 'posts');
    const filePath = join(postsDir, `${id}.md`);
    
    const fileContent = readFileSync(filePath, 'utf-8');
    
    // Parse frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = fileContent.match(frontmatterRegex);
    
    if (!match) {
      return NextResponse.json({ error: 'Invalid markdown format' }, { status: 400 });
    }
    
    const frontmatter = match[1];
    const content = match[2];
    
    // Parse frontmatter fields
    const metadata: Record<string, string> = {};
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    return NextResponse.json({
      id,
      title: metadata.title || '',
      date: metadata.date || '',
      category: metadata.category || '',
      description: metadata.description || '',
      content: content.trim(),
    });
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}

