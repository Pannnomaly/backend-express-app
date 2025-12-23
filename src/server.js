import express from "express";

const app = express();

// ได้แล้ว 1 endpoint
app.get('/', (req, res) => {
    res.send("Hello World!, I am your Server!");
});

app.listen("3000", () => {
    console.log("Server running on port 3000!");
});