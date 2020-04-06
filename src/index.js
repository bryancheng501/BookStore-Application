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

app.post('/createAccount', createAccount)
app.post('/logIn', logIn)

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


app.listen(port)
console.log("Server listening on port 3000")