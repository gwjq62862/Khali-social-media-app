import Notification from "../models/notification.model.js"

export const getNoti=async(req,res)=>{
    try {
        const userId=req.user._id
        const  notification=await Notification.find({to:userId}).populate({path:'from',select:'username profileImg'})
        await Notification.updateMany({to:userId},{read:true})
        res.status(200).json(notification)
    } catch (error) {
        console.log('erorr in getnoti controller',error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteNotification=async(req,res)=>{
    try {
       const userId=req.user._id
       await Notification.deleteMany({to:userId})
       res.status(200).json({message:"deleted notification successfully"})
    } catch (error) {
     console.log('erorr  in deletenotification erorr',error)
     res.status(500).json({ message: "Internal server error" })
    }
}

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ to: userId, read: false });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.log("error in getUnreadCount controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
