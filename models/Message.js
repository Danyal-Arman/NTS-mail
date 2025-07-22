import mongoose, { mongo } from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        maxLength: 120,
    },
    body: String,
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    isDraft: {
        type: Boolean,
        default: false,
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    isSnoozed: {
        type: Boolean,
        default: false,
    },
    snoozedUntil:{
        type:Date,
        default:null

    },
    deletedBySender: { type: Boolean, default: false },
    deletedByRecipient: { type: Boolean, default: false },

}, { timestamps: true })

export const Message = mongoose.model('Message', messageSchema) 