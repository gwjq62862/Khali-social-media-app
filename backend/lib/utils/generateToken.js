import jwt from'jsonwebtoken'

export const generateTokenAndSetCookie =async (userId, res) => {
    const token=jwt.sign({userId},process.env.JWT_SECRET, { expiresIn: '15d' })
     res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days mileseconds
        httpOnly: true,                    // to protect XSS attack
        sameSite: "strict",                // to protect  CSRF attack 
        secure: process.env.NODE_ENV !== "development", // for production http
    });
}