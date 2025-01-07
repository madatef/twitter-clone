import Notification from "../models/notifyModel";



export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ receiver: userId }).sort({ createdAt: -1 }).populate("sender", "profilePicture fullname username");
        await Notification.updateMany({ receiver: userId }, { $set: { read: true } });
        res.json( notifications );
    } catch (error) {
        console.log(`error in getNotifications: ${error.message}`)
        return res.status(500).json({ error: "Internal server error" })
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ receiver: userId });
        res.json({ msg: "Notification deleted" })
    } catch (error) {
        console.log(`error in deleteNotifications: ${error.message}`)
        return res.status(500).json({ error: "Internal server error" })
    }
}
