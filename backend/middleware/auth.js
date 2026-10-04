const jwt = require("jsonwebtoken");
function auth(req,res,next){
  try{
  const t=req.headers.authorization;
  if(!t){
    return res.status(401).json({error:"nah wrong person bruh"});
  }
  const token=t.split(' ')[1];
  const payload = jwt.verify(token,process.env.JWT_SECRET);
  req.user ={id:payload.userId};
  next();
  }
  catch(err){
    return res.status(401).json({error:"too late bruh try again"});
  }
}
function sameuser(req,res,next){
  if(req.user.id!=req.params.userId){
    return res.status(403).json({error:"nah wrong person bruh"});
  }
  next();
}
module.exports = { auth, sameuser };