import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaBell, FaHome, FaTimes, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/notification/unread-count", {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    refetchInterval: 10000,
  });

  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <>
   
      <div className="lg:hidden absolute top-1 right-4 z-50">
        <button className="btn btn-ghost" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      <div
        className={`fixed lg:static top-0 right-0 h-screen w-64 bg-base-100 shadow-md flex flex-col justify-between z-50 transform ${
          open ? "" : "translate-x-full"
        } lg:translate-x-0 transition-transform duration-300`}
      >
        <div className="-z-50">
          {open && (
            <button
              className="lg:hidden absolute top-4 right-4 z-50 btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              <FaTimes />
            </button>
          )}
          <h2 className="text-2xl font-bold p-4">Khali Social</h2>
          <ul className="menu p-4">
            <li>
              <Link to={"/"}>
                <FaHome /> Home
              </Link>
            </li>
            <li className="relative">
              <Link to={"/notification"} className="flex items-center gap-2">
                <FaBell /> Notifications
                {unreadCount > 0 && (
                  <span className="badge badge-error text-white text-xs ml-2">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>

            <li>
              <Link to={`/profile/${user.username}`}>
                <FaUser /> Profile
              </Link>
            </li>
          </ul>
        </div>
        <Link to={`/profile/${user.username}`}>
          <div className="p-5 border-t flex items-center gap-3 relative">
            <img
              src={user.profileImg}
              alt="avatar"
              className="w-10 h-10 rounded-full mb-2"
            />

            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
