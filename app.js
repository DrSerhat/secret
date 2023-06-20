//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require ('mongoose');
const encrypt = require ("mongoose-encryption");

const app = express();
main().catch(err=>console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/secretDB');
}

const userSchema = new mongoose.Schema({email: String, password: String});

// Add any other plugins or middleware here. For example, middleware for hashing passwords
// Aşağıdaki çift anahtarlı yöndem yerine daha aşağıdakini kullandık.
//const encKey = process.env.SOME_32BYTE_BASE64_STRING;
//const sigKey = process.env.SOME_64BYTE_BASE64_STRING;
//userSchema.plugin(encrypt,{encryptionKey:encKey, signingKey:sigKey, encryptedFields: ['password']});

//var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

//Yukarıdakilerin modelden önce olması önemlidir.
const User = mongoose.model("User",userSchema);


app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", (req,res)=>{
  res.render("home")
});

app.get("/login", (req,res)=>{
  res.render("login")
});

app.get("/register", (req,res)=>{
  res.render("register")
});

app.post("/register", (req,res)=>{

  User.findOne({email:req.body.username}).then((userfound)=>{
      if(userfound)
      {console.log(userfound.email+"bu eposta zaten kayıtlı.");
      res.redirect("register");
      }
      else
      {
      if(!req.body.username)
      {console.log("Email can not be null"); res.redirect("register");}
      else
        {const newUser = new User({email: req.body.username, password: req.body.password});
        newUser.save().then((result,err)=>{if(!err){res.render("secrets")}}).catch((err)=>{res.send(err)});}
        console.log("girdiniz.")
        }
    });
});

app.post("/login",(req,res)=>{
  const username=req.body.username;
  const password=req.body.password;
  User.findOne({email:username}).then((result)=>
  { console.log(result);
    if (result)
    {if (result.password===req.body.password)
      {
          console.log("Hoş geldiniz "+ result.email);
          return res.render("secrets");
      }
    }
    console.log("Kullanıcı adı veya şifre hatalı.");
    return res.redirect("login");
  }).catch((err)=>{console.log(err)})
});


app.post("/register:/user", (req,res)=>{
  console.log(req.body.username);
  console.log(req.body.password);

const newUser = User.find({email:req.params.user}).then((userfound)=>{
  if(!userfound)
    {console.log("girdiniz.")}
    else
    {console.log("bu eposta zaten kayıtlı.")}
})


})

app.listen(process.env.PORT);

let port=process.env.PORT;

if(port==null||port=="")
{
  port=3000;
  app.listen(port,function() {
    console.log("Server started on port 3000");
  });
} else{
  console.log("Now on port: "+port);
}
