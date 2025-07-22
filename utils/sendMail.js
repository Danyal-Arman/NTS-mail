import nodemailer from 'nodemailer'

const sendMail = async (req, res)=>{
    let testAccount = await nodemailer.createTestAccount()
}