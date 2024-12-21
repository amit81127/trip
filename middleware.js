const Listing=require('./models/listing');
const Review = require("./models/reviews.js");
const ExpressError=require("./utils/ExpressError.js");
const  {listingSchema,reviewSchema} = require("./schema.js");

module.exports.isLoggedIn =
  (req, res, next) => {
    
    if(!req.isAuthenticated()) {
      //redirect url
      req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create a listing");
        return res.redirect("/login");
    } 
        next();
 };

 module.exports.saveRedirectUrl=(req,res,next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
 };

 module.exports.isOwner=async(req,res,next) => {
  let{id}=req.params;
  let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not authorized to edit this listing!");
      return  res.redirect(`/listings/${id}`);
    }
    next();
 };


 module.exports. validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  console.log(error);  
  if(error){
      let errMsg =error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
      
  }else{
      next();
  }
};

module.exports. validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  
  if(error){
      let errMsg =error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
  }else{
      next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params; 
  const listing = await Review.findById(reviewId); 
  if (!listing) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }
  if (!listing.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next(); 
};

