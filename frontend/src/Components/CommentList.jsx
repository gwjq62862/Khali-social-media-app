import React, { useState, useEffect } from "react";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CommentList = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
 const queryClient= useQueryClient();
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments/getcm/${postId}`);
      const data = await res.json();

      const buildTree = (list, parent = null) =>
        list
          .filter((c) => String(c.parent) === String(parent))
          .map((c) => ({ ...c, replies: buildTree(list, c._id) }));

      setComments(buildTree(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (parentId, text) => {
    try {
      await fetch(`/api/comments/createComment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parent: parentId }),
      });
      fetchComments();
      queryClient.invalidateQueries({queryKey:["AllPost"]})
      queryClient.invalidateQueries({queryKey:["unreadNotifications"]})
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await fetch(`/api/comments/likescm/${commentId}`, { method: "POST" });
      fetchComments();
      queryClient.invalidateQueries({queryKey:["unreadNotifications"]})
    } catch (err) {
      console.error(err);
    }
  };
  const { mutate: delComment } = useMutation({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/comments/deleteComment/${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { commentId, ...data };
    },
    onMutate: async (commentId) => {
      setComments((prev) => {
        const removeRecursively = (list, id) =>
          list
            .filter((c) => c._id !== id)
            .map((c) => ({
              ...c,
              replies: removeRecursively(c.replies, id),
            }));

        return removeRecursively(prev, commentId);
      });
    },
    onSuccess: () => {
      toast.success("Deleted comment successfully");
      fetchComments();
      queryClient.invalidateQueries({queryKey:["AllPost"]})
    },
    onError: (err) => {
      toast.error(err.message);
      fetchComments();
    },
  });

  return (
    <div className="mt-2">
      <button
        onClick={() => {
          setVisible(!visible);
          if (!visible) fetchComments();
        }}
        className="text-sm text-white hover:text-green-600 mb-2"
      >
        {visible ? "Hide Comments" : "Show Comments"}
      </button>

      {visible && (
        <div className="mt-2 p-3">
          <div>
            <CommentInput onAddComment={handleAddComment} />
          </div>

          {loading && <p>Loading comments…</p>}

          {comments.length === 0 && !loading && (
            <p className="text-gray-500">No comments yet</p>
          )}

          {comments.map((c) => (
            <Comment
              key={c._id}
              comment={c}
              currentUser={user}
              onReply={handleAddComment}
              onLike={handleLikeComment}
              onDelete={delComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
