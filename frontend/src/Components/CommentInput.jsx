import React, { useState } from "react";
import Picker from "emoji-picker-react"; // assuming you installed emoji-picker-react
import { FaPaperPlane } from "react-icons/fa";

const CommentInput = ({ onAddComment }) => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await onAddComment(null, text);
    setText("");
    setLoading(false);
    setShowEmoji(false);
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          className="input input-bordered w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && text.trim()) {
              await handleSend();
            }
          }}
        />
        <button
          className="btn btn-ghost"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          😀
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>

      {showEmoji && (
        <div className="absolute bottom-12">
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default CommentInput;
