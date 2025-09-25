import mongoose  from "mongoose";

export const  ConnectDB =async ()=>{
    try {
        const conn=await mongoose.connect(process.env.DB_URL)
        console.log(`monogo db database has successfully connected ${conn.connection.host}`)
    } catch (error) {
        console.log('error in connecting database mongodb ',error)
    }
} 