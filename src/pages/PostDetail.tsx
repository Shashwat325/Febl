import { API_URL, fixImageUrl } from "@/lib/config";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import {Header} from "@/components/Header";

export default function PostDetail() {
  const { postId } = useParams();
  const location = useLocation();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔥 Fetch post
  const fetchPost = async () => {
    const res = await fetch(`${API_URL}/api/posts/${postId}`);
    const data = await res.json();
    setPost(data);
  };

  // 🔥 Fetch comments
  const fetchComments = async () => {
    const res = await fetch(`${API_URL}/api/comments/${postId}`);
    const data = await res.json();
    setComments(data);
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  // 🔥 Focus comment input
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("focus") === "comment") {
      inputRef.current?.focus();
    }
  }, []);

  // 🔥 Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const res = await fetch(`${API_URL}/api/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newComment,
        userId: user._id,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setComments([data, ...comments]);
      setNewComment("");
    }
  };

  if (!post) return <div className="p-4 text-white">Loading...</div>;
  console.log(post.author.username)
  return (
    
    <div className="max-w-3xl mx-auto p-4 text-white">
      
      {/* 🔥 POST SECTION */}
      <div className="border rounded-xl p-4 bg-card mb-6">

        {/* Title */}
        <h2 className="text-sm text-muted-foreground mb-1">
          r/{ post.community?.name}
        </h2>
        <h1 className="text-xl font-bold mb-2">{post.title}</h1>

        {/* Meta */}
        <div className="text-xs text-muted-foreground mb-3">
          Posted by u/{post.author?.username || post.author}
        </div>

        {/* Content */}
        <p className="text-sm mb-4">{post.content}</p>

        {/* Media */}
        {/* Media */}
{post.media?.map((url: string, i: number) => {
  const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
  return isVideo ? (
    <video
      key={i}
      src={fixImageUrl(url)}
      className="w-full rounded-lg mb-2 max-h-96"
      controls
      playsInline
    />
  ) : (
    <img key={i} src={fixImageUrl(url)} className="w-full rounded-lg mb-2" />
  );
})}

      </div>

      {/* ✍️ COMMENT INPUT */}
      <div className="mb-4">
        <input
          ref={inputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 rounded bg-secondary text-black"
          onKeyDown={(e)=>{if(e.key=="Enter"){
            handleAddComment()
          }}}
        />
        <button
          onClick={handleAddComment}
          className="mt-2 px-3 py-1 bg-primary rounded"
        >
          Comment
        </button>
      </div>

      {/* 💬 COMMENTS */}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c._id} className="p-3 border rounded bg-card">
            <p className="text-xs text-muted-foreground">
             u/{c.author?.username || "loading..."}
            </p>
            <p>{c.content}</p>
          </div>
        ))}
      </div>

    </div>
  );
}