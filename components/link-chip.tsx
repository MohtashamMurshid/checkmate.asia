"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, MessageSquare, Music } from "lucide-react";
import { detectInputType } from "@/lib/ai/utils";

export type LinkChipProps = {
  url: string;
  onHover: (url: string) => void;
  onLeave: () => void;
  className?: string;
};

export function LinkChip({ url, onHover, onLeave, className }: LinkChipProps) {
  const detection = detectInputType(url);
  const isTwitter = detection.type === 'twitter';
  const isTikTok = detection.type === 'tiktok';

  if (!isTwitter && !isTikTok) {
    return null;
  }

  const displayUrl = url.length > 50 ? `${url.substring(0, 50)}...` : url;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "group cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground",
        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs",
        className
      )}
      onMouseEnter={() => onHover(url)}
      onMouseLeave={onLeave}
      onClick={(e) => {
        e.preventDefault();
        window.open(url, "_blank");
      }}
    >
      {isTwitter ? (
        <MessageSquare className="h-3.5 w-3.5" />
      ) : (
        <Music className="h-3.5 w-3.5" />
      )}
      <span className="font-medium">
        {isTwitter ? "Twitter" : "TikTok"}
      </span>
      <span className="text-muted-foreground/70 truncate max-w-[200px]">
        {displayUrl}
      </span>
      <ExternalLinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Badge>
  );
}

