"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ai-elements/loader";
import { XIcon, ExternalLinkIcon, Heart, Repeat2, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

export type LinkPreviewData = {
  type: "twitter" | "tiktok";
  url: string;
  content: string;
  metadata: {
    username?: string;
    author?: string;
    likes?: number;
    retweets?: number;
    replies?: number;
    createdAt?: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
  };
};

export type LinkPreviewProps = {
  data: LinkPreviewData;
  onClose?: () => void;
  className?: string;
};

export function LinkPreview({ data, onClose, className }: LinkPreviewProps) {
  const isTwitter = data.type === "twitter";
  const isTikTok = data.type === "tiktok";

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {isTwitter ? "Twitter" : "TikTok"}
            </Badge>
            {data.metadata.author && (
              <span className="text-sm font-medium text-muted-foreground truncate">
                {data.metadata.author}
                {data.metadata.username && (
                  <span className="text-muted-foreground/70">
                    {" "}@{data.metadata.username}
                  </span>
                )}
              </span>
            )}
          </div>
          {data.metadata.createdAt && (
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(new Date(data.metadata.createdAt))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => window.open(data.url, "_blank")}
            className="h-7 w-7"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="h-7 w-7"
            >
              <XIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {data.content || data.metadata.description}
          </div>

          {/* Video preview for TikTok */}
          {isTikTok && data.metadata.videoUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              <video
                src={data.metadata.videoUrl}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {isTwitter && (
              <>
                {typeof data.metadata.likes === "number" && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {data.metadata.likes.toLocaleString()}
                  </span>
                )}
                {typeof data.metadata.retweets === "number" && (
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-3.5 w-3.5" />
                    {data.metadata.retweets.toLocaleString()}
                  </span>
                )}
                {typeof data.metadata.replies === "number" && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {data.metadata.replies.toLocaleString()}
                  </span>
                )}
              </>
            )}
            {isTikTok && (
              <>
                {typeof data.metadata.likes === "number" && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {data.metadata.likes.toLocaleString()}
                  </span>
                )}
                {data.metadata.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(data.metadata.duration)}s
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LinkPreviewLoading({ className }: { className?: string }) {
  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardContent className="py-6">
        <div className="flex items-center gap-3">
          <Loader size={16} />
          <span className="text-sm text-muted-foreground">
            Loading preview...
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function LinkPreviewError({
  error,
  onClose,
  className,
}: {
  error: string;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("w-full max-w-2xl border-destructive/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm">Preview Error</CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7"
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-destructive">{error}</p>
      </CardContent>
    </Card>
  );
}

