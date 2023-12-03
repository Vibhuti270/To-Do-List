const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");


const app = express();
// let items = ["Eat", "Walk", "Chat with friend", "Web Development"];

// let workItems = [];
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to to do list"
});

const item2 = new Item({
  name: "Hit the + button to add item to the list"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);
// Item.deleteOne({ _id:"64e465ed9b456fe8cfea69ea"}).then(function(){
//   console.log("Data deleted"); // Success
// }).catch(function(error){
//   console.log(error); // Failure
// });

app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
          console.log("Inserted successfully");
        }).catch((err)=>{
          console.log(err);
        });
        res.redirect("/");
    } else{
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
    }
    
  }).catch((err)=>{
    console.log(err);
  });

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
      const list = new List({
        name:customListName,
        items: defaultItems
      });
      list.save();
      res.redirect(`/${customListName}`)
    } else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
    }
    
  }).catch((err)=>{
    console.log(err);
  });
});


  app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name: itemName
    });
    if(listName === "Today"){
      item.save();
    res.redirect("/");
    } else{
      List.findOne({name: listName}).then(function(foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
      }).catch((err)=>{
        console.log(err);
      })
    }
  });

  app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
   if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(err){
          console.log("Successfully deleted checked item");
        }).catch((err)=>{
          console.log(err);
        });
        res.redirect("/");
    } else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(err,foundList){
          if(!err){
            res.redirect(`/${listName}`);
          }
        }).catch((err)=>{
          console.log(err);
        });
   }
  });

const port = 4000;

app.listen(port, function (){
  console.log(`Server is running on port ${port} `);
});

