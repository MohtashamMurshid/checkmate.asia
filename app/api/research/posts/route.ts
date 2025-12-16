import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

function parseMarkdownFile(filePath: string, id: string) {
  const fileContent = readFileSync(filePath, 'utf-8');
  
  // Parse frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    return null;
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
  
  return {
    id,
    title: metadata.title || '',
    date: metadata.date || '',
    category: metadata.category || '',
    description: metadata.description || '',
    content: content.trim(),
  };
}

export async function GET() {
  try {
    const postsDir = join(process.cwd(), 'app', 'research', 'posts');
    const files = readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    const posts = files
      .map(file => {
        const id = file.replace('.md', '');
        const filePath = join(postsDir, file);
        return parseMarkdownFile(filePath, id);
      })
      .filter((post): post is NonNullable<typeof post> => post !== null)
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .map(post => ({
        ...post,
        content: undefined, // Don't include full content in list
      }));
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error reading markdown files:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}

