import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Post, formatMemberCount } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [votes, setVotes] = useState(post.upvotes - post.downvotes);
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);

  const handleVote = (direction: "up" | "down") => {
    if (voteState === direction) {
      setVotes(post.upvotes - post.downvotes);
      setVoteState(null);
    } else {
      const delta = direction === "up" ? 1 : -1;
      const prevDelta = voteState === "up" ? -1 : voteState === "down" ? 1 : 0;
      setVotes(post.upvotes - post.downvotes + delta + prevDelta);
      setVoteState(direction);
    }
  };

  return (
    <article className="gradient-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all animate-slide-up group">
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 p-3 bg-secondary/30">
          <button
            onClick={() => handleVote("up")}
            className={`p-1 rounded hover:bg-secondary transition-colors ${
              voteState === "up" ? "text-upvote" : "text-muted-foreground hover:text-upvote"
            }`}
          >
            <ArrowBigUp className="h-6 w-6" fill={voteState === "up" ? "currentColor" : "none"} />
          </button>
          <span className={`text-sm font-bold ${
            voteState === "up" ? "text-upvote" : voteState === "down" ? "text-downvote" : "text-foreground"
          }`}>
            {formatMemberCount(votes)}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`p-1 rounded hover:bg-secondary transition-colors ${
              voteState === "down" ? "text-downvote" : "text-muted-foreground hover:text-downvote"
            }`}
          >
            <ArrowBigDown className="h-6 w-6" fill={voteState === "down" ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Fandom + author */}
          <div className="flex items-center gap-2 mb-2 text-xs">
            <Link to={`/f/${post.fandomName.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors">
              <span>{post.fandomIcon}</span>
              <span>f/{post.fandomName}</span>
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Posted by u/{post.author}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{post.createdAt}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors cursor-pointer">
            {post.title}
          </h3>

          {/* Content preview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
            {post.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs capitalize">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount} Comments</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
