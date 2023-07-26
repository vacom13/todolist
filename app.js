//jshint esversion:6
const { config } = require('dotenv');
const express = require("express");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

config()
const PASS=process.env.DBPASSWORD
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
let day= date.getDate();
mongoose.connect(`mongodb+srv://admin-vansh:${PASS}@cluster0.drf9btt.mongodb.net/todolistDB`);

const todoListSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("todolist", todoListSchema);
// const entry1 = new Item({
//     name: "Data Structures"
// });
// const entry2 = new Item({
//     name: "Computer Networks"
// });
// const entry3 = new Item({
//     name: "JavaScript"
// });
// const entry4 = new Item({
//     name: "Azure"
// });
// const entry5 = new Item({
//     name: "Web Development"
// });
const defaultItems = [];

const listSchema = {
    name: String,
    items: [todoListSchema]
}
const List = mongoose.model("list", listSchema)

app.get("/", async function(req, res){
    let items = await Item.find({});
    res.render("list",{day: day, newListItems:items});
});

app.get("/:customListName", async function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    const temp = await List.findOne({name:customListName});
    if(temp){
        res.render("list", {day: customListName, newListItems:temp.items});
    }
    else{
        const list = new List({
            name: customListName,
            items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
    }
});

app.post("/", async function(req, res){
    let itemName = req.body.newItem;
    let listname = req.body.button;
    const entry = new Item({
        name: itemName
    });
    if(listname===day){
        entry.save();
        res.redirect("/");
    }
    else{
        const custlist = await List.findOne({name: listname});
        custlist.items.push(entry);
        custlist.save();
        res.redirect("/" + listname);
    }
});
app.post("/delete", async function(req, res){
    const listName = req.body.listname;
    const ob_id = req.body._id;
    if(listName === day){
        await Item.findByIdAndRemove(req.body._id);
        res.redirect("/");
    }
    else{
        await List.findOneAndUpdate({name: listName},{$pull:{items:{_id: ob_id}}});
        res.redirect("/" + listName);
    }
});
app.listen(3000, function(){
    console.log("Server starter on port 3000");
});