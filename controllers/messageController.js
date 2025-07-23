import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

export const composeMessage = async (req, res) => {
    try {
        const { subject, body, isDraft } = req.body;
        const reciever = await User.findOne({ email: req.body.recipient })
        if (!reciever) return res.status(404).json({ success: false, message: "No reciever found" })

        if (!isDraft && !reciever) {
            return res.status(400).json({ success: false, message: "Recipient is required unless if you want to save as draft" })
        }

        if (!body) {
            return res.status(400).json({
                success: false,
                message: "Body cannot be empty"
            })
        }
        const newMessage = await Message.create({
            sender: req.user.id,
            recipient: reciever._id,
            subject,
            body,
            isDraft,
        })
        return res.status(201).json({
            success: true,
            message: newMessage
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error xx" })
    }
}

export const inboxMessages = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.max(parseInt(req.query.limit) || 10, 1)
        const skip = (page - 1) * limit


        const filterRecieveMessages = {
            recipient: req.user.id,
            deletedByRecipient: false,
            isDraft: false,
            $or: [
                { snoozedUntil: null },
                { snoozedUntil: { $lte: new Date() } }
            ]
        }

        const totalMessageCount = await Message.countDocuments(filterRecieveMessages)

        const messages = await Message.find(filterRecieveMessages)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username email')
            .populate('recipient', 'username email')
            .lean()

        return res.status(200).json({
            success:true,
            page,
            limit,
            totalMessageCount,
            messages,
        })
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const SenderMessages = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.max(parseInt(req.query.limit) || 10, 1)
        const skip = (page - 1) * limit

        const filterSendMessages = {
            sender: req.user.id,
            deletedBySender: false,
            isDraft: false
        }

        const totalMessageCount = await Message.countDocuments(filterSendMessages)


        const messages = await Message.find(filterSendMessages)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('recipient', 'username email')
            .populate('sender', 'username email')

        return res.status(200).json({
            page,
            limit,
            totalMessageCount,
            messages,
        })
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const deleteMessageById = async (req, res) => {
    try {
        const userId = req.user.id
        const messageId = req.params.id
        console.log("kk", messageId)

        const message = await Message.findOne({ _id: messageId, $or: [{ sender: userId }, { recipient: userId }] })

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "No message found"
            })
        }
        if (message.sender.equals(userId)) message.deletedBySender = true
        if (message.recipient.equals(userId)) message.deletedByRecipient = true

        if (message.deletedBySender && message.deletedByRecipient) {
            await message.deleteOne()
        }

        await message.save()
        return res.status(200).json({
            success: true,
            message: "Successfully deleted"
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const deletedAllMessages = async (req, res) => {
    try {
        const userId = req.user.id

        const senderMessages = await Message.updateMany(
            { sender: userId, deletedBySender: false },
            { $set: { deletedBySender: true } }
        )


        const RecipientMessages = await Message.updateMany(
            { recipient: userId, deletedByRecipient: false },
            { $set: { deletedByRecipient: true } }
        )

        const deleteAllFromDb = await Message.deleteMany({
            deletedBySender: true,
            deletedByRecipient: true
        })

        return res.status(200).json({
            success: true,
            SenderSoftDeleteCount: senderMessages.modifiedCount,
            RecipientSoftDeleteCount: RecipientMessages.modifiedCount,
            deleteFromDb: deleteAllFromDb.deletedCount,
            message: "All message are deleted successfully"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const bulkDeleteMessages = async (req, res) => {
    try {
        const { messageIds } = req.body || {}
        const userId = req.user.id 

        if(!Array.isArray(messageIds) || messageIds.length === 0){
            return res.status(404).json({
                success:false,
                message:"No message select to be deleted"
            })
        }

        const messageDeleteForRecipient = await Message.updateMany({
            _id: { $in: messageIds },
            recipient: userId,
            deletedByRecipient: false
        },
            { $set: { deletedByRecipient: true } }
        );
       const messageDeleteForSender =  await Message.updateMany({
            _id: { $in: messageIds },
            sender: userId,
            deletedBySender: false
        },
            { $set: { deletedBySender: true } }
        );

       const deleteFromDb =  await Message.deleteMany({
            _id:{$in: messageIds},
            deletedByRecipient:true,
            deletedBySender:true
        })

        return res.status(200).json({
            success:true,
            deletedBySender:messageDeleteForSender.modifiedCount,
            deletedByRecipient:messageDeleteForRecipient.modifiedCount,
            deleteFromDB: deleteFromDb.deletedCount,

        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            
            success: false,
            message: "Internal server error"
        })
    }
}

export const toggleStarMessageById = async (req, res) => {
    try {
        const userId = req.user.id
        const messageId = req.params.id
        const message = await Message.findOne({ _id: messageId, $or: [{ sender: userId }, { recipient: userId }] })

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "No message found"
            })
        }
        const isRecipient = message.recipient.equals(userId)
        if (!isRecipient) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to starred this message. Only Recipient can"
            })
        }
        message.isStarred = !message.isStarred
        await message.save()

        return res.status(200).json({
            success: true,
            messageId: message._id,
            isStarred: message.isStarred,
            message: `Message ${message.isStarred? "Starred" : "Unstarred"} successfully`
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const bulkStarMessages = async(req, res)=>{
    try {
        const  {messageIds} = req.body || {}
        const   userId = req.user.id

        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({
                 success: false, 
                 message: "No messages selected to star." 
                });
        }


        const messages = await Message.updateMany({
            _id: {$in: messageIds},
            recipient:userId,
            isStarred:false

        }, {$set: {isStarred: true}}) 

        if(messages.matchedCount === 0){
            return res.status(404).json({
                 success:false,
                 message:"Message not found or you are not the recipient to star these messages"
            })
        }


        return res.status(200).json({
            success:true,
            totalCount:messages.modifiedCount,
            message:"Messages starred successfully"
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const bulkUnStarMessages = async(req, res)=>{
    try {
        const  {messageIds} = req.body || {}
        const   userId = req.user.id

        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({
                 success: false, 
                 message: "No messages selected to Unstar." 
                });
        }


        const messages = await Message.updateMany({
            _id: {$in: messageIds},
            recipient:userId,
            isStarred:true

        }, {$set: {isStarred: false}}) 

        if(messages.matchedCount === 0){
            return res.status(404).json({
                 success:false,
                 message:"Message not found or you are not the recipient"
            })
        }


        return res.status(200).json({
            success:true,
            totalCount:messages.modifiedCount,
            message:"Messages Unstarred successfully"
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const getAllStarredMessages = async (req, res) => {
    try {
        const userId = req.user.id

        const filter = {
            recipient: userId,
            isStarred: true,
            isDraft: false,
            deletedByRecipient: false
        }

        const messages = await Message.find(filter)
            .sort({ updatedAt: -1 })


        return res.status(200).json({
            success: true,
            totalcount: messages.length,
            messages
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
 
export const notifications = async (req, res,) => {
    try {
        const userId = req.user.id

        const filter = {
            recipient: userId,
            isRead: false,
            isDraft: false,
            deletedByRecipient: false,
        }


        const unreadMessages = await Message.find(filter).sort({ createdAt: -1 })

        const unreadMessagesCount = await Message.countDocuments(filter)

        return res.status(200).json({
            success: true,
            message: unreadMessagesCount === 0 ?
                "No unread messages" : `you have ${unreadMessagesCount} unread ${unreadMessagesCount === 1 ? "message" : "messages"}`,
            unreadMessages,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getMessageById = async (req, res) => {
    try {
        const messageId = req.params.id
        const userId = req.user.id


        const message = await Message.findOne({
            _id: messageId,
            $or: [{ sender: userId }, { recipient: userId }]
        })
            .populate('sender', 'username email')
            .populate('recipient', 'username email')

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "No message found"
            })
        }


        if (message.recipient.equals(userId) && !message.isRead) {
            message.isRead = true,
                message.readAt = new Date(),
                await message.save()
        }

        return res.status(200).json({
            success: true,
            message
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const markAsRead = async (req, res) => {
    try {
        const messageId = req.params.id
        const message = await Message.findById(messageId)
        if (!message) {
            return res.status(404).json({
                message: "No message here"
            })
        }
        if (!message.recipient.equals(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Not allowed for you"
            })
        }
        message.isRead = true,
            message.readAt = new Date()
        await message.save()

        return res.status(200).json({
            success: true,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}



