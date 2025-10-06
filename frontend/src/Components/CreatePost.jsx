import React, { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CreatePost = ({ user, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  const queryClient = useQueryClient();
  const handleEmojiClick = (emojiData) => {
    setDescription((prev) => prev + emojiData.emoji);
  };
  const {
    isError,
    isPending,
    error,
    mutate: createPost,
  } = useMutation({
    mutationFn: async ({ title, description, imageFile }) => {
      try {
     
        const formData=new FormData()
         formData.append("title", title);
        formData.append("text", description);
        if(imageFile){
          formData.append("img", imageFile); 
        }
        const res = await fetch("api/posts/createPost", {
          method: "POST",
          body: formData,
        });
        return res.json();
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("post created successfully");
      queryClient.invalidateQueries({ queryKey: ["AllPost"] });
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title && !description && !imageFile) return;
    createPost({ title, description, imageFile });
    setIsVisible(false);
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setShowEmoji(false);
      setIsVisible(true);
    }, 300);
  };

  return (
    <div
      className={`card bg-base-200 shadow-md p-4 mb-4 transition-all duration-300 ease-in-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      } relative`}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 mb-3">
          <img
            src={user.profileImg}
            alt={user.username}
            className="w-10 h-10 rounded-full border border-base-300"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Title..."
              className="input input-bordered w-full mb-2 transition-colors duration-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="What's on your mind?"
              className="textarea textarea-bordered w-full mb-2 transition-colors duration-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Icons Row */}
            <div className="flex items-center gap-2 mb-2">
              {/* Image icon */}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fileInputRef.current.click()}
              >
                📷 Upload
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Emoji icon */}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowEmoji(!showEmoji)}
              >
                😊 Emoji
              </button>
            </div>

            {/* Emoji Picker */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showEmoji ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {showEmoji && (
                <div className="z-50 shadow-lg rounded-lg">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    height={350}
                    width="100%"
                  />
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div
                className="relative mb-2 transition-all duration-300 ease-in-out"
                key={imagePreview}
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full rounded-lg object-cover max-h-60"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                  onClick={handleRemoveImage}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Post
          </button>
          <button
            type="button"
            className="btn btn-ghost flex-1"
            disabled={isPending}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onCancel(), 300);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
