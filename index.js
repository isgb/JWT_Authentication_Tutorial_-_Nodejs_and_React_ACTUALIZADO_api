const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json())

const users = [
    {
        id:"1",
        username: "john",
        password: "John0908",
        isAdmin: true,
    },
    {
        id:"2",
        username: "jane",
        password: "Jane0908",
        isAdmin: false,
    },
    {
        id:"3",
        username: "luisa",
        password: "Luisa0908",
        isAdmin: false,
    },
];

let refreshTokens = []

app.post("/api/refresh", (req,res) =>{
    //take the refresh token from the user
    const refreshToken = req.body.token;

    //send error if there is no token or it´s invalid
    if(!refreshToken) return res.status(401).json("You are not authenticated")
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid!")
    }

    jwt.verify(refreshToken, "myRefreshSecretKey", (err,user) => {
        err & console.log(err);
    })

    //if everuthing is ok, create new access token, refresh token an send to user
})

const generateAccesToken = (user) => {
    return jwt.sign({id:user.id, isAdmin: user.isAdmin}, 
    "mySecretKey",
    {expiresIn: "5s"})
}

const generateRefreshToken = (user) => {
    return jwt.sign({id:user.id, isAdmin: user.isAdmin}, 
    "myRefreshSecretKey")
}

app.post("/api/login", (req,res) => {
    // res.json("hey it works!");
    const {username, password} = req.body;
    
    const user = users.find( (u) => {
        return u.username === username && u.password === password; 
    });
    
    console.log(username)
    if(user){
        // res.json(user);

        // Generate an acces token
        const accessToken = generateAccesToken(user);
        const refreshToken = generateRefreshToken(user);

        refreshTokens.push(refreshToken);

        // const accessToken = jwt.sign({
        //     id:user.id, isAdmin: user.isAdmin}, 
        //     "mySecretKey",
        //     {expiresIn: "5s"}
        // );

        // const refreshToken = jwt.sign({
        //     id:user.id, isAdmin: user.isAdmin}, 
        //     "myRefreshSecretKey",
        //     {expiresIn: "5s"}
        // );

        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken,
        })
    }else{ // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE2ODk3OTM3MTF9.j5M5DL07Gr9JrLq6WDC7upVf1Yk12imWIQRLRVHaL7w
        
        res.status(400).json("Username or password incorrect")
    }
});

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader){
        const token = authHeader.split(" ")[1]

        jwt.verify(token, "mySecretKey", (err,user) =>{
            if(err){
                return res.status(403).json("Token is not valid!")
            }

            req.user = user;
            next();
        });
    }else{
        res.status(401).json("You are not authenticated!")
    }
};

app.delete("/api/users/:userId", verify, (req,res) =>{
    if(req.user.id === req.params.userId || req.user.isAdmin){
        res.status(200).json("User has been deleted.")
    }else{
        res.status(403).json("You are not allowed to delete this user!")
    }
})

app.post("/api/logout", verify, (req,res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("You logged out successfully")
})

app.listen(5000, () => console.log("Backend server is running!",5000));