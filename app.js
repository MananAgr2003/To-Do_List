//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require('fs');
var pass = '';
pass = fs.readFileSync('pass.txt' , 'utf-8');


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-manan:' + pass  + '@cluster0.ekzka69.mongodb.net/todolistDB');

const itemName = new mongoose.Schema({
  name: String,
});

const item = new mongoose.model("item", itemName);
const item1 = new item({
  name: "Welcome To Your To-Do List",
});
const item2 = new item({
  name: "Add /List-Name In the Domain To Make Your Own New List",
});
const item3 = new item({
  name: "Press The Add Button To Add A List Item",
});
const item4 = new item({
  name: "Press The CheckBoxes To Remove A Completed Task",
});

const listSchema = new mongoose.Schema({
  name: String,
  item: [itemName],
});

const List = new mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3, item4];

app.get("/", function (req, res) {
  

  item.find({}, function (err, result) {
    if (result.length === 0) {
      item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Executed");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "today",
        newListItems: result,
        newListName: null,
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item5 = new item({
    name: itemName,
  });
  if (listName == "today") {
    item5.save();

    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (!err) {
        foundList.item.push(item5);
        foundList.save();

        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function (req, res) {

  const itemId = req.body.checkbox;
  const listName = req.body.listName;
 

  if(listName == "today"){
    item.deleteOne({ _id: itemId  }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("succ del");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name : listName} , {$pull : {item : {_id : itemId}}} , function(err , foundList){
    

      if(!err){

        res.redirect("/" + listName);
         
      }

  });
  }


});

app.get("/:newListName", function (req, res) {
  const customListName = _.capitalize(req.params.newListName);

  List.findOne({ name: customListName }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result == null) {
        const list = new List({
          name: customListName,
          item: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.item,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});

