const { MailtrapClient } = require("mailtrap");
const dotenv = require("dotenv");

console.log("Mailtrap config is working!");

dotenv.config();

const mailtrapClient = new MailtrapClient({
    endpoint: process.env.MAILTRAP_ENDPOINT,
    token: process.env.MAILTRAP_TOKEN,
});

const sender = {
    email: "bouteraa.yassmine@esprit.tn",
    name: "yasmine",
};

