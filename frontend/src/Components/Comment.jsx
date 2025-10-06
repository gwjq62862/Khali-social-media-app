import React, { useState } from "react";
import { FaHeart, FaTrashAlt, FaReply } from "react-icons/fa";

const Comment = ({ comment, onReply, onLike, onDelete, currentUser }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(comment.likes?.includes(currentUser?._id));
  const [showdia, setShowdia] = useState(false);
  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  };

  const handleLike = async () => {
    await onLike(comment._id);
    setLiked(!liked);
  };

  const handleDelete = async () => {
    await onDelete(comment._id);
    setShowdia(false);
  };

  return (
    <div className="ml-4 mt-3">
      <div className="card bg-base-200 shadow-sm p-3 ">
        <div className="flex items-start gap-3">
          <img
            src={comment.user?.profileImg || "/default.png"}
            alt={comment.user?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-gray-700">
                {comment.user?.username || "User"}
              </p>

              {currentUser?._id === comment.user?._id && (
                <button
                  onClick={() => setShowdia(true)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <FaTrashAlt />
                </button>
              )}
            </div>
            <p className="text-white  mt-1">{comment.text}</p>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center gap-1 hover:text-green-600"
              >
                <FaReply /> Reply
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center gap-1 ${
                  liked ? "text-red-600" : "hover:text-red-500"
                }`}
              >
                <FaHeart /> {comment.likes?.length || 0}
              </button>
            </div>

            {showReplyBox && (
              <div className="mt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="input input-bordered w-full input-sm"
                />
                <button
                  onClick={handleReply}
                  className="btn btn-sm btn-success mt-1"
                >
                  Reply
                </button>
              </div>
            )}

            {comment.replies?.length > 0 && (
              <div className="mt-2 border-l border-gray-300 pl-4">
                {comment.replies.map((r) => (
                  <Comment
                    key={r._id}
                    comment={r}
                    onReply={onReply}
                    onLike={onLike}
                    onDelete={onDelete}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
   {showdia && (
  <dialog open className="modal">
    <div className="modal-box">
      <h3 className="font-bold text-lg">Delete Comment?</h3>
      <p className="py-4">Are you sure you want to delete this comment?</p>
      <div className="modal-action">
        <button onClick={() => setShowdia(false)} className="btn">
          Close
        </button>
        <button onClick={handleDelete} className="btn btn-error">
          Delete
        </button>
      </div>
    </div>
  </dialog>
)}

    </div>
  );
};

export default Comment;
