import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });
         const queryClient=useQueryClient()
        const {isError,isPending,error,mutate}=useMutation({
          mutationFn:async(data)=>{
            try {
              const res=await fetch("api/auth/login",{
                method:"POST",
                headers:{
                  "Content-Type":"application/json",
                },
                body:JSON.stringify(data),
              })
              
         const resData=await res.json();
         if(!res.ok)throw new Error(resData.message ||"Someting went wrong")
          console.log(resData)
          
          
            } catch (error) {
              console.error(error)
              toast.error(error.message)
              throw error
            }
          },
          onSuccess:()=>{
                 toast.success("Logged in successfully")
                queryClient.invalidateQueries({queryKey:["authUser"]})
          }
        })
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="hero w-full max-w-4xl p-6">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12">
          {/* Login Card */}
          <div className="card bg-base-100 w-full max-w-md shadow-xl rounded-2xl">
            <form className="card-body" onSubmit={handleSubmit}>
              <h2 className="text-4xl font-bold text-center mb-6 text-green-800">
                Login
              </h2>

              {/* Email */}
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Email"
                  className="input input-bordered rounded-lg"
                  required
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
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
                >
                  Login
                </button>
              </div>
              <p className="text-red-800 font-bold mt-2 text-center ">{isError?error.message:""}</p>
              <p className="text-center text-sm text-gray-400 mt-4">
                Don't have an account?{" "}
                <a href="/signup" className="link link-primary font-semibold">
                  Sign Up
                </a>
              </p>
            </form>
          </div>

          {/* Info Section */}
          <div className="text-center lg:text-left max-w-lg">
            <h1 className="text-5xl font-extrabold mb-4 text-green-900">
              Welcome Back to Khali Social!
            </h1>
            <p className="text-gray-300 text-lg">
              Connect with friends, explore stories, and enjoy your forest-themed
              social experience. Login to continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
