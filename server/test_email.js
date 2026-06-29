require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Let's try service 'gmail' first
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        console.log("Testing with service: 'gmail'");
        await transporter.verify();
        console.log("Success with service: 'gmail'!");
    } catch(err) {
        console.error("Error with service: 'gmail':", err.message);
        
        try {
            console.log("\nTesting with host: smtp.gmail.com, port: 465, secure: true");
            const transporter2 = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            await transporter2.verify();
            console.log("Success with port 465!");
        } catch (err2) {
            console.error("Error with port 465:", err2.message);
            
            try {
                console.log("\nTesting with host: smtp.gmail.com, port: 587, secure: false");
                const transporter3 = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                await transporter3.verify();
                console.log("Success with port 587!");
            } catch (err3) {
                console.error("Error with port 587:", err3.message);
            }
        }
    }
};

testEmail();
