import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Components/Sidebar";
import SuggestedUsers from "../../Components/SuggestedUser";
import Post from "../../Components/Post";
import CreatePost from "../../Components/CreatePost";
import { useMutation, useQuery } from "@tanstack/react-query";

const Home = ({ user }) => {
  const [tab, setTab] = useState("foryou");
  const apiEndPoint = () =>
    tab === "foryou" ? "/api/posts/all" : "/api/posts/following";
  const {
    isLoading,
    data: post,
    isError,
    error,
  } = useQuery({
    queryKey: ["AllPost", tab],
    queryFn: async () => {
      try {
        const res = await fetch(apiEndPoint(), { method: "GET" });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message);

        return resData;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });
  console.log(post)
  const [showCreatePost, setShowCreatePost] = useState(false);

  const forYouRef = useRef(null);
  const followingRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({});

  useEffect(() => {
    const updateUnderline = () => {
      const activeRef = tab === "foryou" ? forYouRef : followingRef;
      if (activeRef.current) {
        setUnderlineStyle({
          width: activeRef.current.offsetWidth,
          left: activeRef.current.offsetLeft,
        });
      }
    };

    updateUnderline();

    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [tab]);


  const currentPosts =
    tab === "following"
      ? Array.isArray(post?.posts)
        ? post.posts
        : []
      : Array.isArray(post)
      ? post
      : [];

  return (
    <div className="flex min-h-screen bg-base-100 ">

      <div className="flex-1 p-4 w-full max-w-4xl mx-auto">
        <div className="relative mb-3 ">
          <div className="flex space-x-8">
            <button
              ref={forYouRef}
              className={`py-2 font-semibold transition-colors duration-300 flex-1 ${
                tab === "foryou"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-green-500"
              }`}
              onClick={() => setTab("foryou")}
            >
              For You
            </button>
            <button
              ref={followingRef}
              className={`py-2 font-semibold transition-colors duration-300 flex-1 ${
                tab === "following"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-green-500"
              }`}
              onClick={() => setTab("following")}
            >
              Following
            </button>
          </div>

          <motion.div
            className="absolute bottom-0 h-1 bg-green-600 rounded"
            layout
            layoutTransition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={underlineStyle}
          />
        </div>

        <div
          className="card bg-base-300 shadow-md p-4 cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => setShowCreatePost(true)}
        >
          <div className="flex items-center gap-3 ">
            <img
              src={user.profileImg}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />

            <span className="text-gray-400 select-none">
              What's on your mind?
            </span>
          </div>
        </div>

    
        <div
          className={`transition-all duration-300 ease-in-out transform overflow-hidden mb-4 ${
            showCreatePost
              ? "max-h-[1000px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4"
          }`}
        >
          {showCreatePost && (
            <CreatePost user={user} onCancel={() => setShowCreatePost(false)} />
          )}
        </div>

    
        <AnimatePresence mode="wait">
          <motion.div
            key={tab} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {isLoading && <p className="text-center py-4">Loading posts…</p>}

            {!isLoading && currentPosts.length === 0 && (
              <p className="text-center py-4 text-gray-500">
                {post?.message || "No posts available"}
              </p>
            )}
            {currentPosts.map((post) => (
              <Post key={post._id} {...post} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>


      <div className="hidden lg:block w-72 p-4">
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default Home;
