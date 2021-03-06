var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;
var crypto=require('crypto');
var bodypareser=require('body-parser');
var session=require('express-session');

var config={
    user:'jeffersonsam93',
    database:'jeffersonsam93',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:process.env.DB_PASSWORD
};
var pool=new Pool(config);
var app = express();
app.use(morgan('combined'));
app.use(bodypareser.json())
app.use(session({
    secret:'somerandomvalue',
    cookie:{maxAge:1000*60*60*24*30}
}));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/article1',function(req,res){
    res.sendFile(path.join(__dirname, 'ui', 'article1.html'));
});

app.get('/article2',function(req,res){
    res.sendFile(path.join(__dirname, 'ui', 'artcle2.html'));
});
function hash(input,salt){
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return  ['pbkdf2Sync','10000',salt,hashed.toString('hex')].join("$");
}
app.get('/hash/:input',function(req,res){
    var hashedString=hash(req.params.input,'randomstring');
    res.send(hashedString)
});
app.post('/create-user',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    var salt=crypto.randomBytes(128).toString('hex');
    var dbString=hash(password,salt)
    pool.query("INSERT INTO USERINFO (username,password) VALUES($1,$2)",[username,dbString],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send("User Successfully created:"+username);
        }
    });
});

app.post('/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    pool.query("SELECT * FROM userinfo where username=$1",[username],function(err,result){
        if(err){
            result.status(500).send(err.toString());
        }
        else{
            if(result.rows.length===0){
            res.status(403).send("User/password Invalid");
            }
            else{
                var dbString=result.rows[0].password;
                var salt=dbString.split('$')[2];
                var hashedpassword=hash(password,salt);
                if(hashedpassword===dbString){
                    req.session.auth={userid:result.rows[0].id}
                    res.send({message:"Credentials correct"});
                }
                else{
                     res.status(403).send("User/password Invalid");
                }
            }
        }
    });
});

app.get('/check-login',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userid){
        res.send("You are Logged in:"+req.session.auth.userid.toString());
    }
    else{
        res.send("You are not Logged");
    }
});

app.get('/logout',function(req,res){
    delete req.session.auth;
    res.send("You are Logged out");
});

app.get('/article3',function(req,res){
    res.sendFile(path.join(__dirname, 'ui', 'article3.html'));
});
app.get('/test-db',function(req,res){
    pool.query('SELECT * FROM user',function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send(JSON.stringify(result));
        }
    });
});
var counter=0;
app.get('/counter',function(req,res){
    counter=counter+1;
    res.send(counter.toString());
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
