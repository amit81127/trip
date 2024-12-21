const express=require("express");
const app= express();
const users= require("./routes/user.js");
const posts= require("./routes/post.js");
const session=require("express-session");
const flash=require("connect-flash");
const path=require("path");
// const cookieParser= require("cookie-parser");

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));


const sessionOptions={
  secret:"mysupersecretstring",
  resave:false,
  saveUninitialized:true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.succesMsg=req.flash("success");
  res.locals.errorMsg=req.flash("error");
  next();
})

app.get("/register",(req,res)=>{
  let {name="anonymous"}=req.query;
  req.session.name = name;
  if(name=="anonymous"){
  req.flash(`error`,`user  not found`);
  }else{
    req.flash(`success`,`user registered successfully`);
  }
  res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
  
  res.render("page.ejs",{name : req.session.name});
})

// app.get("/test",(req,res)=>{
//     res.send("test succesfull");
// })

// app.get("/request",(req,res)=>{
//   if(req.session.count){
//     req.session.count++
//   }else {
//     req.session.count=1
//   }
  
//   res.send(`you send a request ${req.session.count} times`);
// })
// app.use(cookieParser("secretcode"));

// app.get("/getsignedcookie",(req, res, next) => {
//     res.cookie("made-in","India",{signed:true});
//     res.send("signed cookie created");
// });

// app.get("/verify",(req, res, next) => {
//     console.log(req.signedCookies);
//     res.send("verify cookie created");
// })

// app.get("/getcookies",(req,res)=>{
//     res.cookie("greet","hello");
//     res.cookie("madeIn","namesta");
//     res.send("send you some cookie");
// });
// app.get("/greet",(req,res)=>{
//     let {Name}=req.cookies;
//     res.send(`hii,${Name}`)
// });

// app.get("/",(req,res)=>{
//     console.dir(req.cookies);
//     res.send("i am working");
// });

// app.use("/users",users);
// app.use("/post",posts);



app.listen(3000,()=>{
    console.log("server is working");
});