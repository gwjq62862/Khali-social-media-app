import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Signup = () => {
  const queryClient = useQueryClient();
  const [data, setData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(data);
  };
  const { isError, error, mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      try {
        const res = await fetch("api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || "somthing went wrong");

        console.log(resData);

        return resData;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("created acount successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="hero w-full max-w-4xl p-6">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12">
          <div className="card bg-base-100 w-full max-w-md shadow-xl rounded-2xl">
            <form className="card-body" onSubmit={handleSubmit}>
              <h2 className="text-4xl font-bold text-center mb-6 text-green-800">
                Sign Up
              </h2>

              <div className="form-control">
                <input
                  type="text"
                  placeholder="Username"
                  className="input input-bordered rounded-lg"
                  required
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control mt-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input input-bordered rounded-lg"
                  required
                  name="fullname"
                  value={data.fullname}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control mt-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered rounded-lg"
                  required
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control mt-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="input input-bordered rounded-lg"
                  required
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary btn-block text-lg font-bold"
                  disabled={isPending}
                >
                  {isPending ? "loading" : "Create Account"}
                </button>
              </div>
              <p className="text-red-800 text-center mt-2 font-semibold ">
                {isError ? error?.message : ""}
              </p>
              <p className="text-center text-sm text-gray-400 mt-4">
                Already have an account?{" "}
                <a href="/login" className="link link-primary font-semibold">
                  Login
                </a>
              </p>
            </form>
          </div>

          <div className="text-center lg:text-left max-w-lg">
            <h1 className="text-5xl font-extrabold mb-4 text-green-900">
              Welcome to Khali Social!
            </h1>
            <p className="text-gray-300 text-lg">
              Connect with friends, share your moments, and explore new stories.
              Sign up now and enjoy your forest-themed social journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
