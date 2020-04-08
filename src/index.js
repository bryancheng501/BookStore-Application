const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const port = 3000

app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

//db stuff
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Library',
    password: 'postgres',
    port: 5433,
})

//endpoints:
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public/views/index.html'))
})

//Account endpoints
app.post('/createAccount', createAccount)
//app.post('/logIn', logIn)

//Book endpoints
app.get('/searchBooks/:searchQuery/:searchType/:genre?', searchBooks)
app.post('/checkoutBooks', validateUser, checkoutBooks)

//Index Functions
function createAccount(req, res){
    //check if username already exists
    const query = {
        name: 'check-username',
        text: 'select * from account where username = $1',
        values: [req.body.username]
    }

    pool.query(query, (err, result) =>{
        //console.log(result.rows);
        //check if username already exists
        if (!result.rows[0]){
            //make an account and add to pg database
            const query = {
                name: 'create-account',
                text: 'insert into account(username, password, type) values($1, $2, $3)',
                values: [req.body.username, req.body.username, 'customer']
            }
            pool.query(query, (err, result) =>{
                if (err) throw err;
                res.status(200).send('Account created!');
            })
        }   else{
            res.status(200).send('Invalid username!')
        }
    })
}

/*
login stuff -- not using for now

function logIn(req, res){
    //check if username already exists
    const query = {
        name: 'login',
        text: 'select * from account where username = $1 and password = $2',
        values: [req.body.username, req.body.password]
    }

    pool.query(query, (err, result) =>{
        //console.log(result.rows);
        if (err) throw err;
        if (result.rows[0]){
            res.status(200).send({loggedIn: true, type: result.rows[0].type})
        }  else{
            res.status(200).send({loggedIn: false})
        }
    })
}
*/

//Customer Page functions
function searchBooks(req, res){
    let query
    //if genre selected:
    if (req.params.genre){
        //search based on search type
        if (req.params.searchType == 'title'){
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where title ilike $1 and genre = $2',
                values: ['%' + req.params.searchQuery + '%', req.params.genre]
            }
        }   else if (req.params.searchType == 'publisher'){
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where publisher_name ilike $1 and genre = $2',
                values: ['%' + req.params.searchQuery + '%', req.params.genre]
            }      
        }   else if (req.params.searchType == 'author'){
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where author ilike $1 and genre = $2',
                values: ['%' + req.params.searchQuery + '%', req.params.genre]
            }
        }   else{
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where ISBN = $1 and genre = $2',
                values: [req.params.searchQuery, req.params.genre]
            }
        }
    }   else{
        if (req.params.searchType == 'title'){
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where title ilike $1',
                values: ['%' + req.params.searchQuery + '%']
            }
        }   else if (req.params.searchType == 'publisher'){
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where publisher_name ilike $1',
                values: ['%' + req.params.searchQuery + '%']
            }      
        }   else if (req.params.searchType == 'author'){
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where author ilike $1',
                values: ['%' + req.params.searchQuery + '%']
            }
        }   else{
            query = {
                name: 'search-books',
                text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                      'from book ' +
                      'where ISBN = $1',
                values: [req.params.searchQuery]
            }
        }
    }

    pool.query(query, (err, result)=>{
        if (err) throw err
        res.status(200).send(result.rows)
    })
}


function validateUser(req, res, next){
    const query = {
        name: 'login',
        text: 'select * from account where username = $1 and password = $2',
        values: [req.body.username, req.body.password]
    }

    pool.query(query, (err, result) =>{
        //console.log(result.rows);
        if (err) throw err;
        if (!result.rows[0]){
            res.status(200).send({loggedIn: false})
        }
    })

    next()
}

function checkoutBooks(req, res){
    let books = req.body.books 
    console.log(books)

    //insert all books into db
    for (let i = 0; i < books.length; i++){
        const query = {
            name: 'checkout-books',
            text: 'insert into checkout_basket(username, ISBN) ' +
                  'values($1, $2)',
            values: [req.body.username, books[i]]
        }
        pool.query(query, (err, result)=>{
            if (err) throw err
        })
        console.log(i);
    }

    res.status(200).send({success : true})
}


app.listen(port)
console.log("Server listening on port 3000")