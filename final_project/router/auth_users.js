const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [ 
  { username: "user1", password: "pass1" },
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
const user = users.find(user => user.username === username);
  if(user && user.password === password) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  
  const user = req.body.username;
  const pass = req.body.password;

  // Check if username and password are provided
  if(!user || !pass){
    return res.status(400).json({message: "Username and password are required"});
  }

  //Generate an  Jwt access token
  if(authenticatedUser(user,pass)){
    let accessToken = jwt.sign({
      data: user
    }, 'access',{expiresIn: 60 * 60});
    
    // Store the access token in the session
    req.session.authorization = {
      accessToken
    };
    
    return res.status(200).json({message: "User successfully logged in"});
  }else{
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization && req.session.authorization['accessToken'] ? jwt.verify(req.session.authorization['accessToken'], 'access').data : null;

  if(!isbn || !review || !username) {
    return res.status(400).json({message: "ISBN, review and username are required"});
  }else if(!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }else{
    if(!books[isbn].reviews){
      books[isbn].reviews = {};

    } else{
      books[isbn].reviews[username] = review;
      return res.status(200).json({message: "Review added successfully"});
    }
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization && req.session.authorization['accessToken'] ? jwt.verify(req.session.authorization['accessToken'], 'access').data : null;  
  if(!isbn || !username) {
    return res.status(400).json({message: "ISBN and username are required"});
  }else if(!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }else if(!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found"});
  }else{
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review deleted successfully"});
  }
  
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
