import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaCamera,
  FaEdit,
  FaLink,
  FaSignOutAlt,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { followUnfollow } from "../../hooks/followUnfollow.hook";
import Post from "../../Components/Post";

const UserProfile = ({ authUser }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username: profileUsername } = useParams();

  const {
    data: profilePost,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userpost", profileUsername],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/posts/userpost/${profileUsername}`, {
          method: "GET",
        });
        const resData = await res.json();
        return resData;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const {
    data: profileUser,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", profileUsername],
    queryFn: async () => {
      const res = await fetch(`/api/users/profile/${profileUsername}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    enabled: !!profileUsername,
  });

  const user = profileUser;
  const isOwnProfile = authUser?._id === user?._id;

  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(null);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    bio: "",
    link: "",
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileImg(user.profileImg);
      setCoverImg(user.coverImg);
      setFormData({
        username: user.username || "",
        fullname: user.fullname || "",
        email: user.email || "",
        bio: user.bio || "",
        link: user.link || "",
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (formDataToSend) => {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      return data;
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["authUser"], updatedUser);

      const newUsername = updatedUser.username;

      if (profileUsername !== newUsername) {
        queryClient.removeQueries({ queryKey: ["profile", profileUsername] });
        navigate(`/profile/${newUsername}`, { replace: true });
      }
      queryClient.setQueryData(["profile", newUsername], updatedUser);

      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);

      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: updateProfileImg, isPending: isUpdatingProfileImg } = useMutation({
    mutationFn: async (formDataToSend) => {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile image");
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["authUser"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["profile", profileUsername] }); 
      toast.success("Profile image updated successfully!");
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: updateCoverImg, isPending: isUpdatingCoverImg } = useMutation({
    mutationFn: async (formDataToSend) => {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update cover image");
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["authUser"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["profile", profileUsername] });
      toast.success("Cover image updated successfully!");
    },
    onError: (error) => toast.error(error.message),
  });


  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logout successfully");
      navigate("/login");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "profile") setProfileImg(reader.result);
      if (type === "cover") setCoverImg(reader.result);
    };
    reader.readAsDataURL(file);

    const formDataToSend = new FormData();

    if (type === "profile") {
      formDataToSend.append("profileImg", file);
      updateProfileImg(formDataToSend);
    } else if (type === "cover") {
      formDataToSend.append("coverImg", file);
      updateCoverImg(formDataToSend);
    }

  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append("username", formData.username);
    formDataToSend.append("fullname", formData.fullname);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("bio", formData.bio);
    formDataToSend.append("link", formData.link);

    if (formData.newPassword) {
      formDataToSend.append("oldPassword", formData.oldPassword);
      formDataToSend.append("newPassword", formData.newPassword);
    }

    
    updateProfile(formDataToSend);
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };
  
  const { follow, isPending: isFollowing } = followUnfollow();
  const isFollowed = authUser?.following?.includes(user?._id);

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );
  }

  if (isProfileError || !user) {
    return (
      <div className="text-center p-20">
        <h2 className="text-3xl font-bold text-error">Profile Not Found</h2>
        <p className="text-lg mt-2 text-gray-500">
          {profileError?.message ||
            `Could not load profile for @${profileUsername}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-10 bg-base-100 shadow-2xl rounded-xl overflow-hidden">
      <div className="relative">
        <div className="h-64 w-full">
          <img
            src={coverImg || "/default-cover.jpg"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isOwnProfile && (
            <label className={`absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 bg-gray-800/60 text-white rounded-full cursor-pointer transition duration-150 ${isUpdatingCoverImg ? 'animate-pulse' : 'hover:bg-gray-700'}`}>
                {isUpdatingCoverImg ? (
                    <span className="loading loading-spinner text-white w-5 h-5" />
                ) : (
                    <FaCamera />
                )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, "cover")}
                disabled={isUpdatingCoverImg}
              />
            </label>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center p-6 bg-base-100 border-b border-base-300">
          <div className="relative flex-shrink-0 mb-4 md:mb-0">
            <img
              src={profileImg || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-xl"
            />
            {isOwnProfile && (
                <label className={`absolute bottom-0 right-0 z-20 flex items-center justify-center w-8 h-8 bg-gray-800/60 text-white rounded-full cursor-pointer transition duration-150 ${isUpdatingProfileImg ? 'animate-pulse' : 'hover:bg-gray-700'}`}>
                    {isUpdatingProfileImg ? (
                        <span className="loading loading-spinner text-white w-4 h-4" />
                    ) : (
                        <FaCamera className="text-sm" />
                    )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "profile")}
                  disabled={isUpdatingProfileImg}
                />
              </label>
            )}
          </div>

          <div className="flex-grow md:ml-6 mt-0 text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-gray-800 leading-tight">
              {user?.fullname}
            </h2>
            <p className="text-lg text-gray-500 font-light">
              @{user?.username}
            </p>
            <div className="flex gap-8 justify-center md:justify-start mt-3">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">
                  {user?.followers?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-primary">
                  {user?.following?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
            </div>
          </div>

          {isOwnProfile ? (
            <div className="flex gap-3 mt-4 md:mt-0 md:self-center justify-center md:justify-end">
              <button
                className="btn btn-primary btn-md text-white"
                onClick={() => setIsEditModalOpen(true)}
                disabled={isUpdating || isUpdatingCoverImg || isUpdatingProfileImg}
              >
                <FaEdit />
                {isUpdating ? "Saving..." : "Edit Profile"}
              </button>
              <button
                className="btn btn-error btn-md text-white"
                onClick={() => setIsLogoutModalOpen(true)}
                disabled={isLoggingOut || isUpdating}
              >
                <FaSignOutAlt />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          ) : (
            <div className="flex gap-3 mt-4 md:mt-0 md:self-center justify-center md:justify-end">
              <button
                onClick={() => {
                  follow(user._id, user.username);
                }}
                className={`btn btn-md text-white ${
                  isFollowed ? "btn-warning" : "btn-primary"
                }`}
                disabled={isFollowing}
              >
                  {" "}
                {isFollowing
                  ? "Processing..."
                  : isFollowed
                  ? "Unfollow"
                  : "Follow"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 p-6 bg-base-200 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-3 text-gray-400 pb-1">
              bio
            </h3>
            <p className="text-white whitespace-pre-wrap leading-relaxed">
              {user?.bio || "No biography provided."}
            </p>
          </div>

          <div className="lg:col-span-1 p-6 bg-base-200 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-3 text-gray-300 border-b pb-1 border-gray-300">
              Contact & Links
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-200">
                <FaEnvelope className="mr-3 text-primary flex-shrink-0" />
                <span className="truncate" title={user?.email}>
                  {user?.email}
                </span>
              </div>
              {user?.link && (
                <div className="flex items-center text-sm">
                  <FaLink className="mr-3 text-primary flex-shrink-0" />
                  <a
                    href={user.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition duration-150 truncate"
                  >
                    {
                      user.link
                        .replace(/^(https?:\/\/)?(www\.)?/, "")
                        .split("/")[0]
                    }
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="tabs tabs-boxed w-full">
            <button
              className={`tab flex-1 ${
                activeTab === "posts" ? "tab-active bg-primary text-white" : ""
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`tab flex-1 ${
                activeTab === "liked" ? "tab-active bg-primary text-white" : ""
              }`}
              onClick={() => setActiveTab("liked")}
            >
              Liked Posts
            </button>
          </div>
          <div className="mt-4 p-6  rounded-xl bg-base-100 min-h-[150px] flex flex-col items-center justify-center shadow-md">
            {activeTab === "posts" ? (
              profilePost?.ownPosts?.length > 0 ? (
                profilePost.ownPosts.map((post) => (
                  <Post key={post._id} {...post} />
                ))
              ) : (
                <p className="text-gray-500">No posts found.</p>
              )
            ) : profilePost?.likedPosts?.length > 0 ? (
              profilePost.likedPosts.map((post) => (
                <Post key={post._id} {...post} />
              ))
            ) : (
              <p className="text-gray-500">No posts found.</p>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <dialog
          id="edit_profile_modal"
          className={`modal ${isEditModalOpen ? "modal-open" : ""}`}
        >
          <div className="modal-box p-6 bg-base-100 rounded-lg shadow-2xl max-w-3xl">
            <h3 className="font-bold text-2xl text-center mb-6 text-primary">
              Edit Profile
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Full Name</span>
                  </div>
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    className="input input-bordered w-full"
                    value={formData.fullname}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Username</span>
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="input input-bordered w-full"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Email</span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="input input-bordered w-full"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Link</span>
                  </div>
                  <input
                    type="url"
                    name="link"
                    placeholder="Your website link..."
                    className="input input-bordered w-full"
                    value={formData.link}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Bio</span>
                </div>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered w-full"
                  placeholder="Write a short bio..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                />
              </label>
              <div className="divider">Change Password</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Old Password</span>
                  </div>
                  <input
                    type="password"
                    name="oldPassword"
                    placeholder="Current Password"
                    className="input input-bordered w-full"
                    value={formData.oldPassword}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">New Password</span>
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    className="input input-bordered w-full"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="modal-action mt-8 flex justify-between">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success text-white"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsEditModalOpen(false)}>Close</button>
          </form>
        </dialog>
      )}

      <dialog
        id="logout_modal"
        className={`modal ${isLogoutModalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box bg-base-300 p-6 shadow-2xl">
          <h3 className="font-bold text-xl text-error flex items-center mb-4">
            <FaSignOutAlt className="mr-3" />
            Confirm Logout
          </h3>
          <p className="py-4 text-white">
            Are you sure you want to log out of your account?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error text-white"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsLogoutModalOpen(false)}>Close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UserProfile;