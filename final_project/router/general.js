const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }else{
    if(users[username]){
      return res.status(400).json({message: "Username already exists"});
    }else{
      // Add the new user to the users object
      users[username] = {username:username, password:password};
      return res.status(201).json({message: "User registered successfully"});
    }
  }

});

const getBookAsync = () => {
  return new Promise((resolve, reject)=> {
    setTimeout(()=> {
      if(books){
        resolve(books);
      }else{
        reject(new Error("No books available"));
      }
    }, 1000);
  })
}

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/books'); // self-call
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books using axios" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  axios.get('http://localhost:5000/') // Self-request using Axios
    .then((response) => {
      const books = response.data;
      const book = books[isbn];

      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Failed to fetch books", error: error.message });
    });
});

  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  if (!author || author.trim() === "") {
    return res.status(400).json({ message: "Author name is required" });
  }

  // Simulate async fetch using Promise
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject({ message: "No books found for the given author" });
    }
  });

  getBooksByAuthor
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((error) => {
      return res.status(404).json(error);
    });
});


// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  // Simulate async search using Promise
  const getBookByTitle = new Promise((resolve, reject) => {
    const bookByTitle = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );

    if (bookByTitle.length > 0) {
      resolve(bookByTitle);
    } else {
      reject({ message: "No books found for the given title" });
    }
  });
  getBookByTitle
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    // Check if the book with the given ISBN exists
    if(books[isbn]){
        const bookDetails = books[isbn];
        if(Object.keys(bookDetails.reviews).length >0){
        return res.status(200).json(bookDetails.reviews);
      }else{
        return res.status(404).json({message: "Book not found"});
      }
   }else{
        return res.status(404).json({message: "Book not found"});
   }
  });

module.exports.general = public_users;
