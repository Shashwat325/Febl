import { API_URL, fixImageUrl } from "@/lib/config";
import { useState, useEffect } from "react";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface Post {
  _id: string;
  title: string;
  content: string;
  likesCount: number;
  upvotes: string[];
  downvotes: string[];
  fandomName: string;
  fandomIcon: string;
  author: string;
  media: string[] | null;
  createdAt: string;
  commentCount: number;
  tags: string[];
}

export function PostCard({ post }: { post: Post }) {
  const upvotesArray = Array.isArray(post.upvotes) ? post.upvotes : [];
  const downvotesArray = Array.isArray(post.downvotes) ? post.downvotes : [];
  const currentUserId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)._id
    : null;

  const [votes, setVotes] = useState(post.likesCount || 0);
  const [voteState, setVoteState] = useState<"up" | "down" | null>(
    upvotesArray.includes(currentUserId?.toString())
      ? "up"
      : downvotesArray.includes(currentUserId?.toString())
        ? "down"
        : null
  );
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleVote = async (direction: "up" | "down") => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${post._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id, userId: currentUserId, action: direction }),
      });
      if (!res.ok) throw new Error("Failed to vote");
      const data = await res.json();
      const upCount = Array.isArray(data.upvotes) ? data.upvotes.length : data.upvotes;
      const downCount = Array.isArray(data.downvotes) ? data.downvotes.length : data.downvotes;
      setVotes(upCount - downCount);
      setVoteState(data.userVote);
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    const UP = upvotesArray.some(id => id?.toString() === currentUserId?.toString());
    const DOWN = downvotesArray.some(id => id?.toString() === currentUserId?.toString());
    if (UP) setVoteState("up");
    else if (DOWN) setVoteState("down");
    else setVoteState(null);
  }, []);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`);
  };

  return (
    <article
      className="gradient-card border border-border rounded-2xl overflow-hidden hover:border-primary/25 transition-all duration-200 group cursor-pointer animate-slide-up"
      onClick={() => navigate(`/post/${post._id}`)}
    >
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 px-3 py-4 bg-muted/20 border-r border-border/50">
          <button
            onClick={(e) => { e.stopPropagation(); handleVote("up"); }}
            className={`p-1.5 rounded-lg transition-all ${
              voteState === "up"
                ? "text-upvote bg-upvote/10"
                : "text-muted-foreground hover:text-upvote hover:bg-upvote/10"
            }`}
          >
            <ArrowBigUp className="h-5 w-5" fill={voteState === "up" ? "currentColor" : "none"} />
          </button>

          <span className={`text-xs font-bold tabular-nums min-w-[1.5rem] text-center py-0.5 ${
            voteState === "up" ? "text-upvote" : voteState === "down" ? "text-downvote" : "text-muted-foreground"
          }`}>
            {Number.isNaN(votes) ? 0 : votes}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); handleVote("down"); }}
            className={`p-1.5 rounded-lg transition-all ${
              voteState === "down"
                ? "text-downvote bg-downvote/10"
                : "text-muted-foreground hover:text-downvote hover:bg-downvote/10"
            }`}
          >
            <ArrowBigDown className="h-5 w-5" fill={voteState === "down" ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-2.5 text-xs flex-wrap">
            <Link
              to={`/f/${post.fandomName?.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span>f/{post.fandomName}</span>
            </Link>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">u/{post.author || "unknown"}</span>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">{post.createdAt}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Content preview */}
          {post.content && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {post.content}
            </p>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-0 font-medium capitalize hover:bg-primary/20 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border/50">
              {post.media.map((url, i) => {
                const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
                return isVideo ? (
                  <video
                    key={i}
                    src={fixImageUrl(url)}
                    className="w-full max-h-80 object-cover"
                    controls
                    muted
                    playsInline
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img
                    key={i}
                    src={fixImageUrl(url)}
                    className="w-full max-h-80 object-cover"
                    alt=""
                  />
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 -ml-1.5">
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              onClick={(e) => { e.stopPropagation(); navigate(`/post/${post._id}`); }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{post.commentCount || 0}</span>
            </button>

            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              onClick={handleShare}
              title="Copy link"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            <button
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                saved
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              onClick={(e) => { e.stopPropagation(); setSaved(prev => !prev); }}
            >
              <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}