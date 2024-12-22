const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const  {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const path = require("path");
const methodOverride = require("method-override");

const{isLoggedIn, isOwner,validateListing}=require("../middleware.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });



router.use(express.urlencoded({extended:true}));
router.use(methodOverride("_method"));

router.use(express.static(path.join(__dirname,"/public")));


const listingController=require("../controllers/listings.js");


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));

router.get("/new",isLoggedIn,listingController.renderNewform);
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));


module.exports=router;