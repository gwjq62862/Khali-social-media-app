import mongoose from "mongoose"
import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from 'cloudinary';
import { getPublicIdFromUrl } from "../lib/utils/getPublicIdfromUrl.js";
export const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select('-password')
        if (!user) {
            return res.status(404).json('Username not found')
        }
        res.status(200).json(user)
    } catch (error) {
        console.error('error in getUserProfile', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)
        if (id === req.user._id.toString()) {

            return res.status(400).json({ message: 'You cannot follow yourself' })
        }
        if (!userToModify || !currentUser) {
            return res.status(404).json('User not found')
        }
        const isFollowing = currentUser.following.includes(userToModify._id)
        if (isFollowing) {
            //if user is alredy follow another user in this case we have to change unfollow right?
            await User.findByIdAndUpdate(id, { $pull: { follower: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            res.status(200).json('unfollowed successfully')

        } else {
            // imagine user 1 is followed to user2 so in user1 following list user2 have to exsist in user2 follower list user1 should exssit that's what we trying to do
            await User.findByIdAndUpdate(id, { $push: { follower: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id,
                read: false
            })

            await notification.save()
            //Todo: we need return user data it will hepl in our client to easy
            res.status(200).json('followed successfully')
        }

    } catch (error) {
        console.error('error in followUnfollow user', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}


export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id

        const userfollowedByMe = await User.findById(userId).select('following')
        const followingId = userfollowedByMe.following

        const users = await User.aggregate(
            [{
                $match: {
                    _id: { $ne: userId, $nin: followingId },

                },


            }, { $sample: { size: 4 } }, { $project: { password: 0 } }]
        )


        res.status(200).json(users)
    } catch (error) {
        console.error('errorr in getSuggestedUser controller', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}




export const updateUserProfile = async (req, res) => {
    const { username, fullname, email, currentPassword, newPassword, bio, link,  } = req.body;
    let {profileImg,coverImg}=req.body
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ message: "You must provide both currentPassword and newPassword" });
        }


        if (currentPassword && newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }
        let profileImgUrl = user.profileImg;
        let coverImgUrl = user.coverImg;
        try {
            if (profileImg) {
                if (user.profileImg) {
                    const oldPublicId = getPublicIdFromUrl(user.profileImg, "Profile");
                    if (oldPublicId) {

                        await cloudinary.uploader.destroy(oldPublicId);
                    }
                }
                const result = await cloudinary.uploader.upload(profileImg, { folder: "Profile" });
                profileImgUrl = result.secure_url;
            }

            if (coverImg) {
                if (user.coverImg) {
                    const oldPublicId = getPublicIdFromUrl(user.coverImg, "Cover");
                    if (oldPublicId) {

                        await cloudinary.uploader.destroy(oldPublicId);
                    }
                }
                const result = await cloudinary.uploader.upload(coverImg, { folder: "Cover" });
                coverImgUrl = result.secure_url;
            }
        } catch (error) {

            console.error('error in uploading image', error);
            return res.status(500).json({ message: "Image upload failed. Internal server error" });
        }
        if (username) user.username = username;
        if (fullname) user.fullname = fullname;
        if (email && email !== user.email) {
            const exsistEmail = await User.findOne({ email })
            if (exsistEmail) {
                return res.status(400).json({ message: "emial is already in use" })
            }
            user.email = email

        } else if (email) {
            user.email = email
        }
        if (bio) user.bio = bio;
        if (link) user.link = link;
        if (profileImg) user.profileImg = profileImgUrl;
        if (coverImg) user.coverImg = coverImgUrl
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' ,userdata:user});
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};