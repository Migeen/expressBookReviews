const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization){// Check if the session has an authorization object
        token =req.session.authorization['accessToken']; // Get the access token from the session
        jwt.verify(token,"access",(err, user) => {  // use jwt to verify the token
            if(!err){
                req.user = user; // If verification is successful, attach the user to the request object
                next();
            }else{
                return res.status(403).json({message: "User not authenticated"}); 
            }
        });
    }else{
        return res.status(403).json({message: "User not logged in"}); // If no session, return 403  
    }
});
 
const PORT =5002;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log(`Server is running at PORT ${PORT}`));
