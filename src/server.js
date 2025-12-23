import express from "express";

const app = express();
const PORT = "3000";

// ได้แล้ว 1 endpoint
app.get('/', (req, res) => {
    res.send("Hello World!, I am your Server!");
});

app.listen(PORT, () => {
    console.log("Server running on port 3000!");
});