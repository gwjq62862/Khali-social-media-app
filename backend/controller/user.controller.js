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
            return res.status(404).json({message:"user not found"})
        }
        const isFollowing = currentUser.following.includes(userToModify._id)
        if (isFollowing) {
            //if user is alredy follow another user in this case we have to change unfollow right?
            await User.findByIdAndUpdate(id, { $pull: { follower: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
              const updatedUser = await User.findById(id).select('-password');
            const updatedCurrentUser = await User.findById(req.user._id).select('-password'); 

            res.status(200).json({ 
                message: 'unfollowed successfully',
                user: updatedUser,
                authUser: updatedCurrentUser, 
            })

        } else {
            // imagine user 1 is followed to user2 so in user1 following list user2 have to exsist in user2 follower list user1 should exssit that's what we trying to do
            await User.findByIdAndUpdate(id, { $push: { follower: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id,
                read: false,
                message: `${userToModify.username} is followed to you`
            })

            await notification.save()
            const updatedUser = await User.findById(id).select('-password');
            const updatedCurrentUser = await User.findById(req.user._id).select('-password');

            return res.status(200).json({
                message: 'Followed successfully',
                user: updatedUser,
                authUser: updatedCurrentUser,
            })


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

    const { username, fullname, email, oldPassword, newPassword, bio, link } = req.body;


    const profileFile = req.files && req.files['profileImg'] ? req.files['profileImg'][0] : null;
    const coverFile = req.files && req.files['coverImg'] ? req.files['coverImg'][0] : null;

    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) return res.status(400).json({ message: "Username already taken." });
        }
        if (email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) return res.status(400).json({ message: "Email already registered." });
        }


        if (newPassword && newPassword.length > 0) {
            if (!oldPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password" });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {

                return res.status(400).json({ message: "Incorrect current password" });
            }


            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);


        }


        user.username = username || user.username;
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;


        let profileImgUrl = user.profileImg;
        let coverImgUrl = user.coverImg;

        try {
            if (profileFile) {

                if (user.profileImg) {
                    const oldPublicId = getPublicIdFromUrl(user.profileImg, "Profile");
                    if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
                }


                const result = await cloudinary.uploader.upload(
                    `data:${profileFile.mimetype};base64,${profileFile.buffer.toString('base64')}`,
                    { folder: "Profile" }
                );
                profileImgUrl = result.secure_url;
            }

            if (coverFile) {

                if (user.coverImg) {
                    const oldPublicId = getPublicIdFromUrl(user.coverImg, "Cover");
                    if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
                }


                const result = await cloudinary.uploader.upload(
                    `data:${coverFile.mimetype};base64,${coverFile.buffer.toString('base64')}`,
                    { folder: "Cover" }
                );
                coverImgUrl = result.secure_url;
            }
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            return res.status(500).json({ message: "Image upload failed. Internal server error" });
        }


        if (profileFile) user.profileImg = profileImgUrl;
        if (coverFile) user.coverImg = coverImgUrl;


        await user.save();


        user.password = undefined;

        res.status(200).json(user);

    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};