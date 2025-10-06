import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

 export const followUnfollow=()=>{
 const queryClient=useQueryClient()
 const {isPending,mutate:follow,error}=useMutation({
    mutationFn:async(userId)=>{
        try {
            const res=await fetch(`/api/users/follow/${userId}`,{method:"POST"})
            const resData=await res.json()
            if(!res.ok)throw new Error(resData.message)
                return resData
        } catch (error) {
            console.error(error)
            throw error;
        }
    },
    onSuccess:()=>{
        toast.success('follow or unfollowed successfully')
        queryClient.invalidateQueries({queryKey: ["SuggestedUsers"]})
        queryClient.invalidateQueries({queryKey:["authUser"]})
    },
    onError:(error)=>{
        toast.error(error.message||"something went wrong ")
    }
 })
 return{follow,isPending}
 }