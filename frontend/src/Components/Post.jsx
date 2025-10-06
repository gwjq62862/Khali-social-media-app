import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaComment, FaHeart, FaThumbsUp, FaTrash } from "react-icons/fa";
import CommentList from "./CommentList";
import { useNavigate } from "react-router-dom";

const Post = ({ user, title, text, img, _id, commentCount, likes }) => {
  const [isMypost, setIsMypost] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likecount, setLikeCount] = useState(likes?.length || 0);

  const { mutate: liketoggle, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`api/posts/likes/${_id}`, { method: "POST" });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message);
        return resData;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      const newLikedState = data.message.includes("liked");
      setLiked(newLikedState);
      setLikeCount(data.likeCount);
       queryClient.invalidateQueries({queryKey:["unreadNotifications"]})
      if (newLikedState) {
        toast.success("You liked the post successfully");
      } else {
        toast.success("You unliked the post successfully");
      }
      
    },
    onError: (error) => {
      setLiked((prevLiked) => !prevLiked);
      setLikeCount((prevCount) => (liked ? prevCount + 1 : prevCount - 1));
      toast.error(error.message);
    }
  });

  const {
    mutate: deletePost,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`api/posts/deletePost/${_id}`, {
          method: "DELETE",
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message);

        return resData;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllPost"] });
      queryClient.invalidateQueries({ queryKey: ["userpost", user.username] });
      toast.success("You have deleted the post successfully");
    },
  });

  useEffect(() => {
    if (authUser?._id === user?._id) {
      setIsMypost(true);
    } else {
      setIsMypost(false);
    }
    if (likes?.includes(authUser?._id)) setLiked(true);
  }, [authUser, user, likes]);

  const handleDelete = async () => {
    deletePost();
    setIsDeleteModalOpen(false);
  };

  const handleUserClick = () => {
    navigate(`/profile/${user.username}`);
  }

  return (
    <div className="card bg-base-200 relative shadow-md mb-4 w-full p-4">
      {isMypost && (
        <FaTrash
          className="absolute right-10 top-10 cursor-pointer text-red-800 hover:text-red-600 transition"
          onClick={() => setIsDeleteModalOpen(true)}
        />
      )}

      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={handleUserClick}>
          <img
            src={user.profileImg || "/default-avatar.png"}
            alt={user.username}
            className="w-10 h-10 rounded-full border border-base-300 object-cover"
          />
          <span className="font-bold text-base hover:underline">{user.username}</span>
        </div>

        <h2 className="card-title text-base-content">{title}</h2>
        <p className="text-sm text-base-content/70 whitespace-pre-wrap">{text}</p>
      </div>

      {img && (
        <figure>
          <img
            src={img}
            alt="post"
            className="w-full object-cover rounded-3xl max-h-96"
          />
        </figure>
      )}

      <div className="p-4 flex gap-4 text-base-content">
        <button
         
          onClick={() => {
            setLiked((prevLiked) => !prevLiked);
            setLikeCount((prevCount) =>
              liked ? prevCount - 1 : prevCount + 1
            );

            liketoggle();
            return !prevLiked
          }}
          disabled={isLiking}
         className={`btn btn-sm ${liked ? "btn-success" : "btn-ghost"}`}>
        {isLiking ? (
  <span className="loading loading-spinner"></span>
) : liked ? (
  <>
    <FaHeart/> Liked
  </>
) : (
  <>
    <FaThumbsUp /> Like
  </>
)} {likecount}
        </button>
        <button className="btn btn-sm btn-ghost">
          <FaComment/> Comment {commentCount || 0}
        </button>
      </div>

      {isDeleteModalOpen && (
        <dialog
          open
          className="modal modal-open"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="modal-box bg-base-300 p-6 shadow-2xl">
            <h3 className="font-bold text-xl text-error flex items-center mb-4">
              Confirm Delete
            </h3>
            <p className="py-4 text-white">
              Are you sure you want to <b>delete this post</b>? This action
              cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error text-white"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsDeleteModalOpen(false)}>Close</button>
          </form>
        </dialog>
      )}
      <CommentList postId={_id} user={user} />
    </div>
  );
};

export default Post;