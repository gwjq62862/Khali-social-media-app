import {  useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { followUnfollow } from "../hooks/followUnfollow.hook";
import { Link } from "react-router-dom";

const SuggestedUsers = () => {




 const{follow,isPending}=followUnfollow()

   const {isError,error,data,isLoading} =useQuery({
    queryKey:["SuggestedUsers"],
    queryFn:async()=>{
      try {
        const res=await fetch('api/users/suggested',{method:"GET"})
        const resData=await res.json()
        if(!res.ok)throw new Error(resData.message)
          return resData
      } catch (error) {
        console.error(error)
        throw error
      }
    }
   })
   const users=data ||[]
  return (
    <div className="card bg-base-100 shadow-md p-4 md:noen">
      <h3 className="text-lg font-bold mb-2">Suggested Users</h3>
      <ul>
        {users.map((user,) => (
          <Link key={user._id}  to={`/profile/${user.username}`}>
          <li className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={user.profileImg}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <span>@{user.username}</span>
            </div>
            <button disabled={isPending}
            onClick={(e)=>   {
              e.preventDefault()
              follow(user._id)}}
             className="btn btn-sm btn-primary">Follow</button>
          </li></Link>
        ))}
        
      </ul>
    </div>
  );
};

export default SuggestedUsers;
