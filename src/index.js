const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const port = 3000
const promise = require('bluebird')

const initOptions = {
    promiseLib: promise
}

const pgp = require('pg-promise')(initOptions);

app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

//db stuff
const Pool = require('pg').Pool

const connectionInfo = {
    user: 'postgres',
    host: 'localhost',
    database: 'Library',
    password: 'postgres',
    port: 5433,
}
const pool = new Pool(connectionInfo)

const db = pgp(connectionInfo)

//endpoints:
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public/views/index.html'))
})

//Account endpoints
app.post('/createAccount', createAccount)
//app.post('/logIn', logIn)

//Checking stuff out endpoints
app.get('/searchBooks/:searchQuery/:searchType/:genre?', searchBooks)
app.post('/checkoutBooks', validateUser, checkoutBooks)

//Placing/reviewing order endpoints
app.get('/reviewOrder/:username/:password', reviewOrder)
app.post('/placeOrder', validateUser, placeOrder)

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

//search books based on queries
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

//check if valid username/password
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

//checkout books selected
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
    }

    res.status(200).send({success : true})
}

function reviewOrder(req, res, next){
    let username = req.params.username 
    let password = req.params.password 

    const query = {
        name: 'login',
        text: 'select * from account where username = $1 and password = $2',
        values: [username, password]
    }

    req.body.books = []

    pool.query(query, (err, result) =>{
        if (err) throw err;
        console.log('valid acc')
        if (!result.rows[0]){
            res.status(200).send({loggedIn: false})
        }

        const query = {
            name: 'review-order',
            text: 'select ISBN from checkout_basket where username = $1',
            values: [username]
        }

        pool.query(query, (err, result) =>{
            if (err) throw err;
            console.log('some books found')
            if (!result.rows[0]){
                res.status(200).send({emptyOrder: true})
            }

            let isbnVals = []
            for (let i = 0; i < result.rows.length; i++){
                isbnVals.push(result.rows[i].isbn)
            }

            

            for (let i = 0; i < isbnVals.length; i++){
                const query = {
                    name: 'get-basket',
                    text: 'select ISBN, publisher_name, title, author, genre, num_pages, price ' +
                          'from book ' +
                          'where ISBN = $1',
                    values: [isbnVals[i]]
                }
    
                pool.query(query, (err, result) =>{
                    if (err) throw err;
                    req.body.books.push(result.rows[0])
                    console.log(req.body.books)
                })
            }
            //this is awful but idk how to use pg-promise
            setTimeout(()=>{
                res.status(200).send({loggedIn: true, 'books': req.body.books})
            }, 2000)
            
            
        })
    })
}

//placing the order
function placeOrder(req, res){
    let id = Math.floor(Math.random() * 1000000000)
    const date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth

    const query = {
        name: 'place-order',
        text: 'insert into placed_order(order_number, )'
    }

}

app.listen(port)
console.log("Server listening on port 3000")