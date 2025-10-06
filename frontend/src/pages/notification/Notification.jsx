import React from "react";
import { FiBell, FiTrash2, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const fetchNotifications = async () => {
  const res = await fetch("/api/notification/");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

const clearAllAPI = async () => {
  const res = await fetch("/api/notification/", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear notifications");
  return res.json();
};

const NotificationItem = ({ notification }) => {
  const sender = notification.from;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`flex gap-4 items-start p-4 rounded-md border border-base-300 hover:shadow-sm transition ${
        notification.read ? "bg-base-100" : "bg-base-200"
      }`}
    >
      <Link to={`/profile/${sender?.username}`}>
        <img
          src={sender?.profileImg || "/default-avatar.png"}
          alt={sender?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/profile/${sender?.username}`}
            className="font-semibold text-sm truncate hover:underline"
          >
            {sender?.username || "Unknown User"}
          </Link>
          <span className="text-xs text-neutral-400 whitespace-nowrap">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-neutral-500 mt-1">{notification.message}</p>
      </div>
    </motion.li>
  );
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: clearAllAPI,
    onSuccess: () => {
      toast.success("All notifications cleared");
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen p-6 bg-base-200">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white rounded-lg w-12 h-12 flex items-center justify-center shadow">
              <FiBell size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-neutral-400">
                Recent updates and activity related to you
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              className="btn btn-sm btn-error"
              onClick={() => clearAllMutation.mutate()}
            >
              <FiTrash2 className="mr-2" />
              Clear all
            </button>
          )}
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <FiX className="mx-auto text-4xl text-neutral-400 mb-3" />
                <h3 className="font-semibold">You're all caught up 🎉</h3>
                <p className="text-sm text-neutral-400">
                  No notifications to show right now.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence>
                  {notifications.map((n) => (
                    <NotificationItem key={n._id} notification={n} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
