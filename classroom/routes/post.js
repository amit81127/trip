const express=require("express");
const router= express.Router();



router.get("/",(req,res)=>{
    res.send("Get for show users");
})
router.post("/:id",(req,res)=>{
    res.send("GEt for show router");
})
router.post("/",(req,res)=>{
    res.send("post for show router");
})

router.delete("/",(req,res)=>{
    res.send("delete for show router");
})


module.exports=router;