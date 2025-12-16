'use client';

import { useState, useEffect } from 'react';
import { Streamdown } from 'streamdown';
import { Header } from '@/components/header';
import FooterSection from '@/components/footer';
import { ArrowRight, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Types
interface ResearchPost {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  content?: string;
  image?: string;
}

interface ResearchTeam {
  name: string;
  slug: string;
  description: string;
}

// Data
const RESEARCH_TEAMS: ResearchTeam[] = [
  {
    name: 'Fact Verification',
    slug: 'fact-verification',
    description: 'The Fact Verification team builds the core engines that cross-reference claims against trusted databases and real-time web sources to determine accuracy with high confidence.'
  },
  {
    name: 'Bias & Sentiment',
    slug: 'bias-sentiment',
    description: 'Our Bias Detection team develops high-dimensional vector models to quantify political leaning, emotional manipulation, and subjective framing in news media.'
  },
  {
    name: 'Source Intelligence',
    slug: 'source-intelligence',
    description: 'The Source Intelligence team maps the reputation and history of domains, authors, and organizations to provide context behind the information.'
  },
  {
    name: 'Agent Safety',
    slug: 'agent-safety',
    description: 'We ensure our investigation agents operate within strict ethical boundaries, preventing hallucination and maintaining neutrality in sensitive topics.'
  }
];

export default function ResearchPage() {
  const [selectedPost, setSelectedPost] = useState<ResearchPost | null>(null);
  const [posts, setPosts] = useState<ResearchPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch('/api/research/posts');
        if (response.ok) {
          const postsData = await response.json();
          setPosts(Array.isArray(postsData) ? postsData : [postsData]);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const handleSelectPost = async (post: ResearchPost) => {
    if (!post.content) {
      // Load full content if not already loaded
      try {
        const response = await fetch(`/api/research/posts/${post.id}`);
        if (response.ok) {
          const fullPost = await response.json();
          setSelectedPost(fullPost);
        } else {
          setSelectedPost(post);
        }
      } catch (error) {
        console.error('Failed to load post content:', error);
        setSelectedPost(post);
      }
    } else {
      setSelectedPost(post);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] dark:bg-background text-[#1a1a1a] dark:text-foreground">
        <Header />
        <article className="pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto font-serif">
          <button 
            onClick={handleBack}
            className="group flex items-center text-sm font-sans text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowRight className="mr-2 h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            Back to Research
          </button>
          
          <header className="mb-12 space-y-6">
            <div className="flex items-center gap-4 font-sans text-sm tracking-wide text-muted-foreground uppercase">
              <span>{selectedPost.category}</span>
              <span>•</span>
              <span>{selectedPost.date}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium leading-tight tracking-tight">
              {selectedPost.title}
            </h1>
            <p className="text-xl leading-relaxed text-muted-foreground font-sans">
              {selectedPost.description}
            </p>
          </header>

          <div className="markdown-content font-serif text-lg leading-relaxed dark:text-foreground">
             <Streamdown shikiTheme={['github-light', 'github-dark']}>
                {selectedPost.content || 'Content coming soon...'}
             </Streamdown>
          </div>
        </article>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] dark:bg-background text-[#1a1a1a] dark:text-foreground transition-colors duration-300">
      <Header />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <h1 className="text-6xl md:text-7xl font-serif font-medium tracking-tight text-black dark:text-foreground">
                Checkmate Research
              </h1>
            </div>
            <div className="space-y-8">
              <p className="text-2xl md:text-3xl font-serif leading-tight text-[#1a1a1a] dark:text-muted-foreground">
                We investigate the fundamental challenges of information accuracy, bias detection, and automated reasoning — building the infrastructure for a more truthful internet.
              </p>
              
              <div className="flex flex-wrap items-baseline gap-4 pt-4 border-t border-black/10 dark:border-border">
                <span className="font-sans font-medium text-sm text-muted-foreground">Research areas:</span>
                <div className="flex flex-wrap gap-4">
                  {RESEARCH_TEAMS.map(team => (
                    <button 
                      key={team.slug}
                      className="font-serif underline decoration-1 underline-offset-4 hover:text-muted-foreground dark:hover:text-foreground transition-colors text-lg text-black dark:text-foreground"
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-black/10 dark:bg-border w-full mb-16" />

        {/* Teams Grid */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {RESEARCH_TEAMS.map((team) => (
              <div key={team.slug} className="space-y-3">
                <h3 className="font-serif text-2xl font-medium text-black dark:text-foreground">{team.name}</h3>
                <p className="font-serif text-base leading-relaxed text-black/70 dark:text-muted-foreground">
                  {team.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-black/10 dark:bg-border w-full mb-16" />

        {/* Featured & Recent Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Featured Image Area (Left) */}
          <div className="lg:col-span-7 relative group cursor-pointer overflow-hidden rounded-lg  bg-neutral-200 dark:bg-muted">
             <Image
               src="/research/factbench.png"
               alt="Checkmate FactBench Terminal Output"
               fill
               className="object-contain"
               priority
             />
             {/* Overlay */}
             <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-black/90 backdrop-blur px-4 py-2 rounded-full shadow-sm flex items-center gap-2 transition-transform group-hover:scale-105">
                <Play className="h-3 w-3 fill-black dark:fill-white text-black dark:text-white" />
                <span className="font-sans text-xs font-medium uppercase tracking-wide text-black dark:text-white">Checkmate FactBench</span>
             </div>
          </div>

          {/* Recent List (Right) */}
          <div className="lg:col-span-5 flex flex-col">
            {loading ? (
              <div className="py-8">
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
                <div className="h-8 w-full bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-8 text-muted-foreground font-serif">
                No research posts available.
              </div>
            ) : (
              posts.map((post, idx) => (
                <div 
                  key={post.id} 
                  className={cn(
                    "py-8 cursor-pointer group transition-colors",
                    idx !== 0 && "border-t border-black/10 dark:border-border",
                    idx === posts.length - 1 && "border-b border-black/10 lg:border-b-0 dark:border-border"
                  )}
                  onClick={() => handleSelectPost(post)}
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3 font-sans text-xs uppercase tracking-wider text-black/60 dark:text-muted-foreground">
                      <span className="font-medium text-black dark:text-foreground">{post.category}</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-medium group-hover:underline decoration-1 underline-offset-4 transition-all text-black dark:text-foreground">
                      {post.title}
                    </h3>
                    <p className="font-serif text-black/70 dark:text-muted-foreground leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            <div className="mt-8 pt-4">
              <button className="font-sans text-sm font-medium border border-black/20 dark:border-border rounded-full px-6 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-black dark:text-foreground">
                View all research
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <FooterSection />
    </div>
  );
}
