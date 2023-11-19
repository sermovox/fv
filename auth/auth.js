// from: moscow pdf pag 166
// we comment already done cfg from fv3. next we'll port them here 
const jwt = require('jsonwebtoken')
let passport ;//= require('passport')



const Strategy = require('passport-local').Strategy
const autoCatch = require('./lib/auto-catch')
const jwtSecret = process.env.JWT_SECRET || 'mark it zero'
const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus'
const jwtOpts = { algorithm: 'HS256', expiresIn: '30d' }




                            /*
                            Next, we configure passport to use our passport-local strategy:
                                    05-authentication/01/server.js
                                    passport.use(
                                    new Strategy(function (username, password, cb) {    // THE STRATEGY FUNC
                                    const isAdmin = (username === 'admin') && (password === adminPassword)
                                    if (isAdmin) cb(null, { username: 'admin' })// >>>>>  returns the user object
                                    cb(null, false)
                                    })
                                    )
                            We can think of a passport strategy like passport-local as middleware for passport . Similar
                            to how we can use many different middleware functions to operate on our request and response
                            objects as they come into express , we can use many different passport strategies to modify how
                            we authenticate users. Depending on the strategy, configuration will be a little different. Ultimately,
                            the purpose of a strategy is to take some input (e.g. a username and password) and if valid, return a
                            user object.

                            in fv3 :
                                - in  STRATEGY FUNC new  we just try to authenticate user using user registered 
                                - asking the login route handle we inform passport to redirect to / if the user is authenticated 


                            */
// passport.use(adminStrategy())


// const authenticate = passport.authenticate('local', { session: false })// in fv3 use sesson ! . 

                        // >>>>   passport middleware , the func is used in : app.post('/login', auth.authenticate, auth.login)
                        //          auth.authenticate , =authenticate, called as login route middleware  
                        //              authenticate is a passport provided func that passport uses to authenticate the user according with the set 'local' strategy
                        //              todo this passport  extract the password and user from req and calls the passport-local STRATEGY FUNC that we configured above:
                        //                  THE STRATEGY FUNC: function (username, password, cb)
                        //                  after that passport can fill or not  req.user to be used on next route handler (see AASSWW)

                        //          and if using token after called authenticate we run also a not void login handler auth.login:
                        //              ....... 

                        //          if session, uses session to ..........



module.exports = {
    authenticate,
    login: autoCatch(login),
    ensureAdmin: autoCatch(ensureAdmin),// used as  route middleware in admin route
    init:function(passport_){
        passport=passport_;// recover from fv3
    }
}
async function login(req, res, next) {// login handler : used in app.post('/login', auth.authenticate, auth.login)   (AASSWW)
                                        // in fv3 , as works with sessions, we just practically only use passport.authenticate as login handler :
                                        //      passport.authenticate("local", {successRedirect: "/",failureRedirect: "/"}));// login handler 
                                        //          if the login success inform  the browser that it must follow with a request of redirected url '/'
                                        //          if the login fails  goon to def route '/'   ???
                                        // will call jwt.sign() to return a token containing user info signed using secret 

                                        // in our ha case we would login giving credential recovered from user registration or email, so can :
                                        //      - call registration route url  
                                        //          in which check if user is in  authorized file (or session var filled before) for registering plant user from a file  
                                        //          and so after got the update info x std fv app/plant (shelly rele) call the webhook giving the yaml 
                                        //      - or put the info we need ,user + auth x url in token updated during registration process and use the token to authorize the 
                                        //          registration route url . 
                                        //  nb we can also use both : session x user auth and token x service auth 
                                        //          and also get the token back from admin route then use the token to curl the registration url !!!!!
                                        //              the admin process / url can be a url that require a admin auth 
                                        
                                        
                                        

    const token = await sign({ username: req.user.username }) 
    res.cookie('jwt', token, { httpOnly: true })// set token on session cookies , just because wont use also  token identification  apart session cookie set by session if set
                                                // question : cookie works also without session ??
                                                //           >>>>   if we set session we neednt set cookies manually ? !!!!!!
    res.json({ success: true, token: token })// returns token to user 
}

async function tokenGen(req, res, next) {// tokenGen handler : used in app.post('/tokenGen', auth.ensureAdmin, auth.tokenGen)   
                                        // segue la logica di questo login route ma dopo essere stato identificato come admin
                                        // qui lo scopo non è di identificare il user e quindi settare il session e i cookies x rendere disponibile il user ai route handler in req.user
                                        // ma semplicemente tornare un token che contiene sia il user che il auth per fare un successivo aiax da parte user dopo che  riceve il token via email
                                        // Poi quando lo user è pronto :
                                        //  - si mette a scaricare il yaml  invocando il url "/registerPlant/"  con un post (via una pagina pubblica con url /scaricayalm o con le credenziali del plant installer) o con curl o postman
                                        //                  parametri : token da mettere in header , update param per il template FV appena copiato dal admin 
                                        //  - verifica il tutto e poi integra con il main il yaml scaricato
                                        // nb si potrebbe anche chiamre qui direttamento il webhook del user ha ma magari il ha è spento !
                                        //      >>  si potrebbe farlo se questo url e' chiamato dallo user che dopo il registration fa login e esegue il url come user e non come admin di fv3   

                                        // qui il post e' chiamato da un form di una pagina coe il login ma si passano non user e password ma i dati per creare il plant cfg template
                                        // e le credenziali per il plant installer mng :
                                        //  user, pasword per permettere di fareil  mng di primo livello per il installer del plant 
                                        // poi quando si accede al 

const token = await sign({ username: req.user.username }) 
res.cookie('jwt', token, { httpOnly: true })// set token on session cookies , just because wont use also  token identification  apart session cookie set by session if set
            // question : cookie works also without session ??
            //           >>>>   if we set session we neednt set cookies manually ? !!!!!!
res.json({ success: true, token: token })// returns token to user 
}

async function ensureAdmin(req, res, next) {
    const jwtString = req.headers.authorization || req.cookies.jwt
    const payload = await verify(jwtString)
    if (payload.username === 'admin') return next()
    const err = new Error('Unauthorized')
    err.statusCode = 401
    next(err)
}
async function sign(payload) {// payload = { username: req.user.username }  will be set inside the signed token. will be recovered from token and jwtsecret
    const token = await jwt.sign(payload, jwtSecret, jwtOpts)
    return token
}
async function verify(jwtString = '') {
    jwtString = jwtString.replace(/^Bearer /i, '')
    try {
        const payload = await jwt.verify(jwtString, jwtSecret)
        return payload
    } catch (err) {
        err.statusCode = 401
        throw err
    }
}
function adminStrategy() {// will check the provided user password on registrated user, see fv3.LocalStrategy
    return new Strategy(function (username, password, cb) {
        const isAdmin = username === 'admin' && password === adminPassword
        if (isAdmin) return cb(null, { username: 'admin' })
        cb(null, false)
    })
}