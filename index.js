//Importing the necessary modules
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

//Creating the express app
const app = express();
const PORT = 3000;

//Connecting to Database
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

//Body parsing and declaring static files
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let items = [];

//GET requests
app.get("/", async (req, res)=>{
    try{
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        items = result.rows;

        res.render("index.ejs", {
            listTitle: "To-Do App",
            listItems: items,
        });
    }
    catch(err){
        console.log(err);
    }
})

//Getting Date and Time Formats
function get_formatted_date(){
    const now = new Date();
    // Format Date - DD-MM-YY
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}
function get_formatted_time(){
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
}


//Handing Post request
app.post("/add", async(req, res)=>{
    const new_task = req.body.newItem;
    const date = get_formatted_date();
    const time = get_formatted_time();
    const date_time = time + " | " + date;
    try{
         await db.query("INSERT INTO items (title,date) VALUES ($1,$2)", [new_task,date_time]);

         res.redirect("/");
    }
    catch(err){
        console.log(err);
    }
})

//handling EDIT POST
app.post("/edit", async(req, res)=>{
    const item = req.body.updatedItemTitle;
    const id = req.body.updatedItemId;
    const date = get_formatted_date();
    const time = get_formatted_time();
    const date_time = time + " | " + date;

    try{
        await db.query("UPDATE items SET title = ($1), date = ($2) WHERE id = ($3)",[item,date_time,id]);

        res.redirect("/");
    }
    catch(err){
        console.log(err);
    }
})

//Delete the Item
app.post("/delete", async(req,res)=>{
    const item = req.body.deleteItemId;
    try{
        await db.query("DELETE FROM items WHERE id = ($1)",[item]);

        res.redirect("/");
    }
    catch(err){
        console.log(err);
    }
})


app.listen(PORT, ()=>{
    console.log(`Server is Listening on http://localhost:${PORT} `)
})