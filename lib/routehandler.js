var fs = require('fs');
const fileUtil = require('./fileUtil');
const routeHandler = {};
const helper = require('./helper');

//this is the route for performing any type of CRUD operation on the books file
routeHandler.Books = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put", "delete"];
  console.log(data.query);
  if (acceptableHeaders.indexOf(data.method) > -1) {
    routeHandler._books[data.method](data, callback);
  } else {
    callback(405);
  }
};

//this is the route for performing any type of CRUD operation on the users file
routeHandler.users = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put", "delete"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    routeHandler._users[data.method](data, callback);
  } else {
    callback(405, { message: "could send" });
  }
};

//this is the route for borrowing books CRUD operations
routeHandler.borrow = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put", "delete"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    routeHandler._borrow[data.method](data, callback);
  } else {
    callback(405, { message: "could send" });
  }
};

//this is the route for returning books CRUD operations
routeHandler.returnBook = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put", "delete"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    console.log(data);
    routeHandler._returnBook[data.method](data, callback);
  } else {
    callback(405, { message: "could send" });
  }
};

//main book route object
routeHandler._books = {};

//main users route object
routeHandler._users = {};

//main borrow book route object
routeHandler._borrow = {};

//main return route object
routeHandler._returnBook = {};

//Post route -- for creating a book
routeHandler._books.post = (data, callback) => {
  //validate that all required fields are filled out
  var name = typeof (data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
  var price = typeof (data.payload.price) === 'string' && !isNaN(parseInt(data.payload.price)) ? data.payload.price : false;
  var author = typeof (data.payload.author) === 'string' && data.payload.author.trim().length > 0 ? data.payload.author : false;
  var publisher = typeof (data.payload.publisher) === 'string' && data.payload.publisher.trim().length > 0 ? data.payload.publisher : false;
  //HERE I ADDED ANOTHER FIELD THAT MAKES THE ADMIN ADD A TOTAL NUMBER OF BOOK STOCKED WHEN ADDING A PARTICULAR BOOK TO THE LIBRARY 
  var total_no_of_books_available = typeof (data.payload.total_no_of_books_available) === 'string' && data.payload.total_no_of_books_available.trim().length > 0 ? data.payload.total_no_of_books_available : false;
  
  if (name && price && author && publisher && total_no_of_books_available) {
    const fileName = helper.generateRandomString(30);
    fileUtil.create('books', fileName, data.payload, (err) => {
      if (!err) {
        callback(200, { message: "book added successfully", data: null });
      } else {
        callback(400);
      }
    });
  }else{
    callback(400, { message: "Some field are incorrect or not yet included" });
  }
};

//Post route -- for creating a user
routeHandler._users.post = (data, callback) => {
  //validate that all required fields are filled out
  var firstname = typeof (data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname : false;
  var lastname = typeof (data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname : false;
  var department = typeof (data.payload.department) === 'string' && data.payload.department.trim().length > 0 ? data.payload.department : false;
  var level = typeof (data.payload.level) === 'string' && data.payload.level.trim().length > 0 ? data.payload.level : false;
  var reg_no = typeof (data.payload.reg_no) === 'string' && data.payload.reg_no.trim().length > 0 ? data.payload.reg_no : false;

  
  if (firstname && lastname && department && level && reg_no) {
    const fileName = helper.generateRandomString(30);
    fileUtil.create('users', fileName, data.payload, (err) => {
      if (!err) {
        callback(200, { message: "user created successfully", data: null });
      } else {
        callback(400, { message: "could not create user" });
      }
    });
  }else{
    callback(400, { message: "Some field readity are incorrect or not yet included" });
  }
};

//Get route -- for geting a book
routeHandler._books.get = (data, callback) => {
  if (data.query.name) {
    fileUtil.read('books', data.query.name, (err, data) => {
      if (!err && data) {
        callback(200, { message: 'book retrieved', data: data });
      } else {
        callback(404, { err: err, data: data, message: 'could not retrieve book' });
      }
    });
  } else {
    callback(404, { message: 'book not found', data: null });
  }
};

// Get route -- for geting a user who wants to borrow a book
routeHandler._borrow.get = (data, callback) => {
  console.log(data.query);
  let book = data.query.book;
  let user = data.query.user
  if (user && book) {
    fileUtil.read('users', user, (err, data) => {
      if (!err && data) {        

        fileUtil.read('books', book , (err2, data2) =>{

          data2.total_no_of_books_available = 0 ? data2.total_no_of_books_available : data2.total_no_of_books_available - 1;
          fileUtil.update('books', book,data2, (err, data3) => {})
          callback(200, { message1: `${data.firstname} ${data.lastname} wants to borrow a book titled ${data2.name} ${data2.total_no_of_books_available > 0 ? ` and the books is available`: 'and the book you want to borrow is unavailable'}`,
          data: data2 });
        })
      } else {
        callback(404, { err: err, data: data, message: 'could not retrieve user' });
      }
    });
  } else {
    callback(404, { message: 'book not found', data: null });
  }
};

// Get route -- for geting a user who wants to return a borrowed a book
routeHandler._returnBook.get = (data, callback) => {
  let book = data.query.book;
  let user = data.query.user
  if (user && book) {
    fileUtil.read('users', user, (err, data) => {
      if (!err && data) {        

        fileUtil.read('books', book , (err2, data2) =>{
          
          data2.total_no_of_books_available = 0 ? data2.total_no_of_books_available : data2.total_no_of_books_available + 1;
          fileUtil.update('books', book,data2, (err, data3) => {})
          callback(200, { message1: `THe book titled ${data2.name} that was borrowed by ${data.firstname} ${data.lastname} and has been returned`,
          data: data2 });
        })
      }
    });
  } else {
    callback(404, { message: 'book not found', data: null });
  }
};


routeHandler.ping = (data, callback) => {
  callback(200, { response: "server is live" });
};

routeHandler.notfound = (data, callback) => {
  callback(404, { response: 'not found' });
};

module.exports = routeHandler;