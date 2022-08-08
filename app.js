const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

const day = date.getDate();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://primtaa:abcABC11@cluster0.c48u9sa.mongodb.net/todolistDB");


const itemschema = {
  name: String
}
const Item = mongoose.model("Item", itemschema)
const item1 = new Item({
  name: "shopping"
})
const item2 = new Item({
  name: "cook food"
})
const item3 = new Item({
  name: "workout"
})
const startingitems = [item1, item2, item3];


const listschema = {
  name : String,
  item : [itemschema]
}
const List = mongoose.model("List",listschema)

app.get("/", function(req, res) {
  Item.find({}, (err, itemsfound) => {
    if (itemsfound.length === 0) {
      Item.insertMany(startingitems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("data inserted");
        }
      })
      res.redirect("/")
    } else {

      res.render("list", {
        listTitle: day,
        newListItems: itemsfound
      });
    }
  })
});


app.get("/:listname",(req,res)=> {
  const listname = _.capitalize(req.params.listname);

List.findOne({name : listname},(err,result)=> {
  if(!err) {
    if(!result){
      const list1 = new List ({
        name : listname,
        item : startingitems
    })
    list1.save();
    res.redirect("/"+listname)
   } else {
      res.render ("list", {
        listTitle: result.name,
        newListItems: result.item
      })

  }
}

  })
})


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
const listName = req.body.list;

  const Nextitem = new Item({
    name: itemName
  })
  if(listName === day){
    Nextitem.save()
    res.redirect("/")
  } else {
List.findOne({name : listName},(err,foundlist)=> {
  foundlist.item.push(Nextitem);
  foundlist.save();
  res.redirect("/"+listName);
})
  }
});


app.post("/delete",(req,res)=>{
  const checkeditemID = req.body.checkbox;
  const openedlist = req.body.openedlist;

  if(openedlist===day) {
    Item.findByIdAndRemove(checkeditemID,(err)=>{
      if(err) {
        console.log(err);
      } else {
        console.log("item deleted");
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name : openedlist}, {$pull :{item : {_id : checkeditemID}}},(err,foundlist)=> {
      if(!err) {
        res.redirect("/"+openedlist)
      }
    })
  }


})


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port== null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started");
});
