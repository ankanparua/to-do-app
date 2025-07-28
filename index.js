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
            listTitle: "Today",
            listItems: items,
        });
    }
    catch(err){
        console.log(err);
    }
})

//Handing Post request
app.post("/add", async(req, res)=>{
    const new_task = req.body.newItem;
    try{
         await db.query("INSERT INTO items (title) VALUES ($1)", [new_task]);

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

    try{
        await db.query("UPDATE items SET title = ($1) WHERE id = ($2)",[item,id]);

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