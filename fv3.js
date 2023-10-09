// **
//  this is a server end points: 
// - attende (esporto CXD)che il main app chiami (la export function)  fornendo un factory che per impianti tipo fusionsolar qui si puo' istanziare per avere un eventmanager di un impianto , cioe un fsm di un impiantochiami 
// - chiama  (xxx) la app chiedendo  
// IL fsm (locale o remoto (cms script o server remoto)) che torna una classe di fsm compatibile (fusionsolar)
// 
//  quando ho una connessione web istanzio/recupero un fsm singlethon che gestisce l'impianto user/plant luigi : > INSTANZ

// load page cfg 
require('dotenv').config();// load .env
const INVERTONOFF_RELAY=process.env.INVERTONOFF_RELAY||(process.env.INVERTONOFF_RELAY=='true');

const model=require("./nat/models.js");
const dOraLegale=parseInt(process.env.dOraLegale)||0;
const  pdate=function (){let d=new Date();d.setHours(d.getHours()+dOraLegale);return d;}

// debug staff normally is false
const DEBUG_probe=true;// assign a std 20 degrees if no read on device  
const PRTLEV=6;// print log level, >5 many prints! 


// let getcfg=model.getcfg;//can  be used for plant cfg
// app custom config staff:
// let devid_shellyname,gpionumb,mqttnumb,relaisEv;// will be loaded in emit('view',,). when browser select the user plant. pay attention not to be used before
                                  // gpionumb=[12,16,20,21,26,19,13,6]; mqttnumb=[11,null,null,null,null,null,null,null];
                                  // relaisEv_||['heat','pdc','g','n','s','split'];
                                  // .....
/* used in emit('view',,):

getconfig= model.getconfig(plant)=// general obj to customize the  app functions , 
                                  //  = {gpionumb:users[user].cfg.gpionumb,
                                  //    mqttnumb:users[user].cfg.mqttnumb,
                                  //    relaisEv:users[user].cfg.relaisEv,
                                  //    devid_shellyname:users[user].cfg.devid_shellyname
                                  //  }

// to build pumps config here:
relaisEv=getconfig.relaisEv;
gpionumb=getconfig.gpionumb;
mqttnumb=getconfig.mqttnumb;
devid_shellyname=getconfig.devid_shellyname;


scope={relaisEv:relaisEv_}// to config pumps in html js  after  emit('view',,)
ejscont=model.ejscontext('luigi')// to generate pumps list in html after  emit('view',,)
*/

                        //    >>>  model.getconfig('luigi');// user luigi 
                        //  custom context to generate html (in past with ejs, now with html generation( see socket.on('view'))
                        //  let ejscont=model.ejscontext('luigi'),
                        //  scope={  relaisEv}// to customize spa build  


//require('dotenv').config();
const PersFold=process.env.PersFold,// persistence folder .data
test1=require("cors"),
IsRaspberry=process.env.IsRaspberry != 'false',
forceWrite=true,// in setPump, write to dev , also if present state is the same as new val , infact dev can change val in different way 
Serv_='Srv';// debug only, to be sure not to forghet some changes in code
let rs485;if(IsRaspberry==false)rs485='rs485_simul.py';else rs485='rs485.py'
console.log(' is raspberry: ',IsRaspberry,PersFold);

let browUsers = process.env.USERS.split(","),
browPass = process.env.PASS.split(",");

// openapi huawei 
const opAPIUser=process.env.opAPIUser,opAPIPass=process.env.opAPIPass;


var https_ = require('https'); //require http server, and create server with function handler()
var http_ = require('http'); //require http server, and create server with function handler()
//console.log('http_.request:',http_.request);

const YAML = require('yaml');// npm install yaml
const console_ = require('console');
const Stream = require('stream');

// following the expresss set up  to manage user auth using session , see ..................
const EXPRESS=true;
const express = require("express");
const app = express();

// serving static file using express :
// ..... see https://www.tutorialsteacher.com/nodejs/serving-static-files-in-nodejs
// dont work
//no : app.use(express.static(__dirname + 'public')); //Serves resources from public folder

// ok:
// app.use(express.static('public')); //Serves resources from public folder
app.use('/js',express.static('public/js')); //Serves resources from public folder


//  no : app.use('/js',express.static(path.join(__dirname, 'public/js')));

let server;  
if(EXPRESS) server= http_.createServer(app);else server = http_.createServer(handler); //require http server, and create server with function handler()
const http=server;// duplicate name

let passport,sessionMiddleware;



 expresscfg();
function expresscfg(){

const session = require("express-session");
/*
  Warning The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions,
  does not scale past a single process, and is meant for debugging and developing.For a list of stores, see compatible session stores.
*/
const bodyParser = require("body-parser");
passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
//app.use(bodyParser.urlencoded({ extended: false }));
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// from https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application
// set the view engine to ejs
app.set('view engine', 'ejs');


/*
// serving static file using express :
// ..... see https://www.tutorialsteacher.com/nodejs/serving-static-files-in-nodejs

// dont work
app.use(express.static(__dirname + 'public')); //Serves resources from public folder
*/

const DUMMY_USER = {
  id: 1,
  username: "john",
};

passport.use(
  new LocalStrategy((username, password, done) => {
    // do with ....
    // if (username === "john" && password === "doe") 
    if(browUsers.indexOf(username)>=0&&browPass[browUsers.indexOf(username)]==password)
    {// add all user 
      console.log("authentication OK");
      // return done(null, DUMMY_USER);
      return done(null, {id:0,username});
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  })
);

app.get("/", (req, res) => {
  const isAuthenticated = !!req.user;
  if (isAuthenticated) {
    console.log('user ',req.user,', is authenticated, session is ',req.session.id);
  } else {
    console.log("unknown user");
  }

  if(isAuthenticated)
  //spa(res);// old
  
 //  index(res);// ejs debug
 spapage(req.user,res);// ejs normale
  
  else
  // res.sendFile(isAuthenticated ? "public/index.html" : "public/login.html", { root: __dirname });
  res.sendFile( "public/login.html", { root: __dirname });

 

});

app.post("/registerPlant/", (req, res) => {// 11092023, this is called when ha register for a plant configuration passing json cfgdata or a sintesis of it

                            // new :
                            // user after registration pay and get a token in response to auth aiax request, then he can register the plant sending info about is shelly relays :
                            // call this url with a aiax form  with  the shelly cfg  with a autorization token in header
                            // so , see moscow-city_guide_fullstackNodejs.pdf pag 164:
                            // - the user with browser  got the token when after registration (user password added to authenticate user on next login )
                            //    , he login and then will pay for the service the  token is created and returned to user browser 
                            // -  save in browser var  the token that should contain the user and the url can call
                            // -  after when wants to access to restricted url from browser, as this url,
                            //         he will need to add token to auth header to access to url handler 
                            //  - OR he can do the same using a http request from a different connection, but after a login if connects with browser to this 
                            // - infact at next post call (browser or after from different http client (curl,,,)  the middleware try to get the token from sssion if exists  or from  header  
                            //    then the middleware can :
                            //    1: can check , depending from the url serving (unknowes user),  if token missing or invalid or expired to return a login  page to set the token
                            //    2: if is a non unknowed user url  will recover the user from the token or cookies to see if can serve this url
                            
                            
                            //    nb the token can also retrived from email instead of returned immediately after we generate it 
                            //     instead of generate in service payed page  (.....) we can generate in different proces ( but using the same protocol and secret)
                            //      and given to user with email so the user can add the token with its http call in any other http tool (curl,,) 



                            //  after login only if in middleware  we check for auth user got from passport user retrival  from session cookies or token 
                            //    , need to call this route need to add the token in authorization header 
                            // old :
                            // a button trigger a automation that call rest_command service whose payload is a text entity filled with cfg data
                            // but first we must check the user is registered 
                            // returns a yaml cfg , the mqtt credentials and will register the user to join a role 
                            // the 
  const isAuthenticated = !!req.user;// the auth middleware try to idetify the user fron cookies or header token
  if (isAuthenticated) {
    console.log('user ',req.user,', is authenticated, session is ',req.session.id);
  } else {
    console.log("unknown user");
  }

  // now following the handler 

  // if user in () :
const cfgdata={version:'stdFV',virtualdev: [{addr:'shelly1-34945475FE06',devType:'shelly1',},,,,,,{subtopic:'var_gas-pdc_',varx:4,devType:'mqttstate'},]};

// 
let plant,plantModel=  model.getplant(plant='DefFVMng_API'),
yaml=genYaml( plantModel,cfgdata,plant); //  todo : create a new plant model updating the plantModel
                              //  the user in ha will  download the blueprint with:
                              //      - a webhook automation that calls a action :
                              //            - a shellscript that will add to configure.yalm all the config to manage the fv3 service 

                              // the user itself 
                              //  - register a login es carlo in the fv3 with a verified mail and fill the cfgdata template (just a func updating the  the shelly address in template ! )
                              //  - pay the fee 
                              // then the haAdmin :
                              //  - add a user carlo (to manage the associated plant carlo_API) and its connected plant copyng the std fv model from the template Casina_API  
                              //  - after updated the shelly device given by user registration, cfg the std model  calling genYaml( plantModel,cfgdata)
                              //  - and generate a token x the user aiax
                              //        for future use in case the mqtt need a token to perform an action on devices 
                              //  - try to aiax the ha webhook if available passing the yaml cfg
                              //    if not available the  user itself connects and aiax the webhook
                              // then the user will verify the yalm adds to add and restart the ha to load the updated yaml with the iterface to fv3


                              // no more :
                                            // then the ha user will download the blueprint fv3 made of just :
                                            //    - a text tepmate that the user fills with cfgdata and the token 
                                            //    -  button that trigger an automation that fire the action consisted by a rest_command sending the text template 
                                            // so the /register or /hacfg route will be called and after verified the token x the user and got the associated plant template  plantModel
                                            // calls genYaml( plantModel,cfgdata) that generate the yaml file  ad will call a webhook on the blueuprint that calls a action :
                                            //  - a shellscript that will add to configure.yalm all the config to manage the fv3 service 


                              // nb when the haAdmin  will finally start the ha user plant  all mqtt dev will be generated with specific role/user dinamically generated so 
                              // no one cam emit pub on other mqtt devices , see : Understanding and Using the Mosquitto Dynamic Security Plugin




                              //  old  : call when a identified user ask for a plant cfg, then the user/installer can manage the plant from browser or from ha
                              //          the user can call the plant cfg by post rest sensor passing the config data (request) put in a json text entity or calc with a shell script from the 
                              //          yalm cfg after the blueprint input resolution 
                              //          the rest will fill another text entity with the yaml  to set with another shell script   

                             // yaml=yaml.replace(/'/g, `yyy`);
                              let myjsonstr=JSON.stringify(yaml);

  // see https://www.geeksforgeeks.org/node-js-new-console-method/    https://nodesource.com/blog/understanding-streams-in-nodejs/ https://www.npmjs.com/package/stream-to-string

// Node.js program to demonstrate the
// new Console() method
 
// Using require to access console module
let stream2string;

/*
const writableStream = new Stream.Writable();

writableStream._write = (chunk, encoding, next) => {// better use promise  see https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable?rq=3
stream2string=chunk.toString();
  console.log('stream is writed with a chunk : ',stream2string);

  next()
}
const outt = writableStream ;//fs.createWriteStream('./output.log');
const err =  writableStream ;//fs.createWriteStream('./error.log');
  
// Another way to create console
// (default values are passed to options)
const logObject = new console_.Console(outt, err);                      

logObject.log(yaml);// print yaml (formatting )in write stream  writableStream 
 writableStream.end();
 let myyaml=writableStream.toString();// dont work, use stream2string !
*/

    
  //  let yaml1=JSON.parse(myjsonstr);let myjsonstr1=JSON.stringify(yaml1); if(myjsonstr==myjsonstr1) console.log(' thejson are the same ');
  console.log('yaml file : \n',yaml)
  // res.json({ yaml,data: stream2string});

  

  const repDQuote='£',repQuote=' ££ ',repLF=' £££ ';
  yaml=yaml.replace(/'/g, repQuote);
  stream2string=yaml;// stream2string  are useless
if(stream2string){
 
  stream2string=stream2string.replaceAll('\n', repLF);
  stream2string=stream2string.replaceAll('"', repDQuote);
   let body={
      //"yaml":JSON.stringify(yaml) reeror using "yaml"
  //  yaml:JSON.stringify(yaml)};
      //yaml:myjsonstr};
      //yaml:{pippo:'ciao'}};// ok 
      //data:{pippo:'ciao'}// ok ma risolto
      //data:'{"pippo":"ciaup"}'//
       //data:'che cazzo  vuoi ç£^'//
      data:stream2string//,filename:'pippo.txt'
      ,shell:'/bin/sh\necho povero > generated.txt'//'#!/bin/sh\n cd /config \n git add .'
      ,shellname:'fvshell.sh'
    };

   let   url='http://192.168.1.212:8123/api/webhook/genyaml',
  head={"Content-Type": "application/json"};
  
  let ret=aiax(url,'POST',body,head);// a promise
  ret.then((code)=>{
    console.log('returning a promise from yaml resolving as : ',code.data)});
 // /* just to debug :
   // body={ yaml: "value" };
    url='http://postman-echo.com/post';
  // head={"Content-Type": "application/json"};
  ret=aiax(url,'POST',body,head);// a promise
  ret.then((code)=>{
    console.log('returning a promise from echo resolving as : ',code.data)});
  //*/

 
  }else   console.log('returning a promise from yaml rejected');
  res.json({ yaml,data: stream2string});

});

function index(res){// ejs debug

  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('pages/index', {
    mascots: mascots,
    tagline: tagline
  });

}

function spapage(user,res){// ejs normale. problem : just the user is auth. he can then apply for different plants !
                      // see https://progressivecoder.com/nodejs-templating-using-express-ejs-with-partials/
                      //   + https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application

 console.log('spapages, now no context here ! see plant selection : socket.on(view,,,)');// , context  is: ',JSON.stringify(ejscont,null,2),'\n',JSON.stringify(scope,null,2));// 1703 : now null will be provided after 

 /*
  res.render('pages/spapage', {// page updated from index using partial as model
    scope,// obj used to extract obj used to custom the generted spa page ex data.scope (config staff)

    // obj ued to generate dyn html content 
    ejscont
  });
  
  */
  res.render('pages/exindexhtml', // the client will open a ws connection to manage user staff !!!
  // news: as this page is launched after user auth here the context is a user cfg staff (user algo customization) usually very small.
  //  major customization will be injected when the user select one of its plant, and will be injected as ws event param 
  //    nb (if no ws will be used to get a  plant cfg with a aiax or a specific route page)
  /* a plant context : we use when we call the plant event
  {// page updated from index with minimum changs , just build the pump lists !, changes marked as KK
    scope,// obj used to extract obj used to custom the generted spa page ex data.scope (config staff)

    // obj ued to generate dyn html content 
    ejscont
  }
  */
 {user}// no user cust here !
  );

}


// about page
app.get('/about', function(req, res) {
  res.render('pages/about');// ejs , still to do 
});


app.post("/login",passport.authenticate("local", {successRedirect: "/",failureRedirect: "/"}));// login handler 

app.post("/logout", (req, res) => {
  console.log(`logout ${req.session.id}`);
  const socketId = req.session.socketId;
  if (socketId && io.of("/").sockets.get(socketId)) {
    console.log(`forcefully closing socket ${socketId}`);
    io.of("/").sockets.get(socketId).disconnect(true);
  }
  req.logout();
  res.cookie("connect.sid", "", { expires: new Date() });
  res.redirect("/");
});

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  //cb(null, user.id);
  cb(null, user);
});

passport.deserializeUser((id, cb) => {
  console.log(`deserializeUser ${id}`);
  //cb(null, DUMMY_USER);
  cb(null, id);
});

}
// end express set up

// var io = require('socket.io')(http) //require socket.io module and pass the http object (server on wich socket will be built)
// cors enabled :
const { Server } =require("socket.io");//import { Server } from "socket.io";

// see example : https://dev.to/admirnisic/real-time-communication-with-socketio-and-nodejs-3ok2

const io = new Server(http, {
  cors: {
    origin:  '*',//"https://example.com",//
   //  allowedHeaders: ["my-custom-header"],
   //  credentials: true
  }});

/* to do here in server side and also in client (node red ) side :  from : https://socket.io/docs/v4/handling-cors/



        Example with cookies (withCredentials) and additional headers:

        // server-side
        const io = new Server(httpServer, {
          cors: {
            origin: "https://example.com",//  origin: '*',
           //  allowedHeaders: ["my-custom-header"],
           //  credentials: true
          }
        });

  // client-side
        import { io } from "socket.io-client";
        const socket = io("https://api.example.com", {
          // withCredentials: true,
          // extraHeaders: {"my-custom-header": "abcd" }

        // + see comment in adminNamespace.use()
        auth: {token: "abc" }

      })

      // from https://dev.to/admirnisic/real-time-communication-with-socketio-and-nodejs-3ok2 :

                        socketIo.on('connect', function () {
                    console.log('Made socket connection', socketIo.id);
                  });

                  socketIo.on('message_from_server', function (data) {
                    console.log('message_from_server data: ', data);
                  });

                  socketIo.on('disconnect', function () {
                    console.log('disconnect');
                  });

                  // Send a message to the server 3 seconds after initial connection.
                  setTimeout(function () {
                    socketIo.emit('message_from_node-red', 'Sent an event from the client!');
                  }, 3000);

                    socketIo.on('connect_error', function (err) {
                    console.log('connection errror', err);
                  });






      ....  nb in https://socket.io/get-started/private-messaging-part-1/, sembra auth si possa settare dopo con 
        const socket = io("https://api.example.com"); soket.auth='pincopalla';




*/




// session setup :
// convert a connect middleware to a Socket.IO middleware , https://socket.io/docs/v3/middlewares/ , 
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

if(sessionMiddleware)io.use(wrap(sessionMiddleware));// wrap sessionmiddleware (param:(req,res,nexy) to io middleaware (param:(socket,next)))
if(passport)io.use(wrap(passport.initialize()));
if(passport)io.use(wrap(passport.session()));

io.use((socket, next) => {// 092023 : probabilmente qui si verifica che :
                          //  - il request,  da cui proviene la richiesta di apertura del socket,
                          //    abbia  ,(il session add alcuni campi al request tra cui lo .user !)  
                          // il .user , il che siglifica che il sw di auth ha aggiunto nel sesio  il user authorized

  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'));// will stop processing socket
  }
});



//console.log('after createserver , http_.request:',http.request);
let mqtt=require('./nat/mqtt');
var fs = require('fs'); //require filesystem module


// node-red ws/mqtt channel
let nRsocket=require('./nat/nRsocket');


var Gpio ;
if(IsRaspberry)Gpio= require('onoff').Gpio; //include onoff to interact with the GPIO
else Gpio=false;//null;
var LED;if(Gpio) LED= new Gpio(5, 'out'); //use GPIO pin 4 as output
var prettyJSONStringify = require('pretty-json-stringify');// useless , used in ioreadwritestatus

// a relays group ( the name are in : relaisEv ex: ['heat','pdc','g','n','s','split'];):
/*let relais_=[new Gpio(12, 'out'),// gpio phisical relays, see :YUIO
                                // from pump name the gpio is relais_[relaisEv.lastIndexOf(pump)];
                                // so in relaisEv there re the names !
new Gpio(16, 'out'),
new Gpio(20, 'out'),
new Gpio(21, 'out'),

// b relays group:
new Gpio(26, 'out'),
new Gpio(19, 'out'),
new Gpio(13, 'out'),
new Gpio(6, 'out')
];*/

function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 2000);
  });
}

async function asyncCall() {
  console.log('calling');
  const result = await resolveAfter2Seconds();
  console.log(result);
  // Expected output: "resolved"
}

asyncCall();





// ---------------------  here was def getctls
//                        but we moved after browse ask x a plant 









/* move after set plant :
let relais_=[];// the io dev ctl list , their name are in relaisEv array. if null the ctls func (readSync and writeSync ) wont be called 
gpionumb=gpionumb||[12,16,20,21,26,19,13,6];mqttnumb=mqttnumb||[11,null,null,null,null,null,null,null];

const getctls=require(/nat/io/getio);

getctls(gpionumb,mqttnumb).then((cts)=>{
  console.log(' getctls() all ctl promised resolved in def time :',JSON.stringify(cts,null,2));
  relais_=cts;run();});
*/

  // async function getio(num, iotype, ind, ismqtt = false) {}
const getio=require('./nat/io/getio.js').init(Gpio,rs485);// *****************************
                                          //  getctls(gpionumb,mqttnumb) will call old getctls(gpionumb,mqttnumb) !! so in .on('',  ... call it !)
                                          // NNBB getctls+getio are now moved to  module getio. seems called only by getctls that now is moved . so why mantain getio here ?
                                          // getio will be called when browser select the plant to manage
                                          // we used goon server handler definition waiting the device built (promise resolution) before to goon the run() section that started the server
                                          // NOW goon with handler definition then run the run() section ( start the server !)


let pumpsHandler_=[];//  relais handler , also used by anticipating algo too (actuators)
                    // both button and algo actuacor can call this bank of handler(err,newvalue) 
                    // state.relays names are mapped to pumpsheader index in attuators() : pdc>0, g>1,n>2,s>3


// TODO  here the input def used before we write the getctls() io config. in future getctls will def following input too !

var pushButton ;
if(Gpio)pushButton= new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
let relais;
if(Gpio)relais= // arrays of io ctl button
[new Gpio(18, 'in', 'both'),// gpio relay button to set gpio phisical relays : see :YUIO
new Gpio(23, 'in', 'both'),
new Gpio(24, 'in', 'both'),
new Gpio(25, 'in', 'both'),
new Gpio(4, 'in', 'both'),
new Gpio(17, 'in', 'both')
];









// relaisEv=relaisEv||['heat','pdc','g','n','s','split'];// socket event to sync raspberry buttons and web button, the 'name' of relais_ !


jrest_=require('./nat/rest.js');jrest_.init(http_,https_);
 const aiax=jrest_.jrest;//  che fa ? probabilmente meglio cancellarla
function aiax__(url,body,head){// relay to rest  .rest(uri, method,formObj,head) 
  // remember :  response = {data, token}=await  this.rest(uri, method,formObj,head) 
  //                                              .catch((err) => { console.error(' REST got ERROR : ',err); }); 

 return jrest_.jrest(url,'POST',body,head);
}

// cfg 
const Proto = true;// a tecnique to use (2 alternative)
const DEBUG=false,DEBUG1=true,MIN=35;


function handler(req, res) { //create server html def page : user cfg and monitoring
                              // user on behalf of express if is not present 
// from https://www.vanmeegern.de/fileadmin/user_upload/PDF/Web_Development_with_Node_Express.pdf
 
    // normalize url by removing querystring, optional
    // trailing slash, and making lowercase
    var path = req.url.replace(/\/?(?:\?.*)?$/, '')
    .toLowerCase();
    switch(path) {
    case '':
    spa(res);
    break;
    case '/about':
   // serveStaticFile(res, '/public/about.html', 'text/html');
    break;
    case '/login': login_(req,res)// auth the client and give back client the token . 
                                  // the token represent (can be validated to get the user id ) the user in future http call and can be checked before :
                                  // - to run  some route handler
                                  // - to start (in route handler or in http handler) a ws connection that onnect x all transactio user ( userid) to server
    break;
    default:
    //serveStaticFile(res, '/public/404.html', 'text/html',    404);
    break;
    }
    }





 function spa(res){// the old handler before we add the auth login page (manual http and/or express ) !!!


  fs.readFile(__dirname + '/public/index.html', function (err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, { 'Content-Type': 'text/html' }); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
 }

function login_(req,res){
  // https://www.pabbly.com/tutorials/node-js-http-server-handling-get-and-post-request/
  // https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module
  // https://gist.github.com/JAreina/8f8ff4731ae3a522dced5f49e4f77061         >  http post
  //  token : https://cloudnweb.dev/2021/05/express-typescript-basic-auth/  see async login()
  //          https://moscow-city.guide/upload/iblock/8ce/8ceee361e68ff14b4e2aa66575be659d.pdf pag 165
  //          https://websockets.readthedocs.io/en/stable/topics/authentication.html

  if (req.method === "GET") {
   //  res.writeHead(200, { "Content-Type": "text/html" });    fs.createReadStream("./public/form.html", "UTF-8").pipe(res);
   res.end('noaction');

} else if (req.method === "POST") {

    var body = "";
    req.on("data", function (chunk) {
        body += chunk;
    });

    req.on("end", function(){
      var post = JSON.parse(body);// the js map 
      console.log(post);

      // now returns the token if authenticated 
      //        nb in express we use a /login route as explained in : https://moscow-city.guide/upload/iblock/8ce/8ceee361e68ff14b4e2aa66575be659d.pdf
      //        using app.post('/login', auth.authenticate, auth.login)

      let token=body;// call login !!
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(token);
    });
}
}

async function login(req, res, next) {

  try {
    const email = req.body.email

/* as https://moscow-city.guide/upload/iblock/8ce/8ceee361e68ff14b4e2aa66575be659d.pdf
we should store ashes not password ! see pag. 169



*/
    const password = req.body.password;
    const user = await AuthService.findUserByEmail(email)
    log("user", user)
    if (user) {
      const isPasswordMatch = await Password.compare(user.password, password)
      if (!isPasswordMatch) {
        throw new Error("Invalid Password")
      } else {
        log("jwt Secret", jwtSecret)
        const token = jwt.sign(req.body, jwtSecret, {
          expiresIn: tokenExpirationInSeconds,
        })
        return res.status(200).json({
          success: true,
          data: user,
          token,
        })
      }
    } else {
      log("User Not Found")
      throw new Error("User Not Found")
    }

  } catch (e) {

    next(e)

  }

}

function loginhand (){// https://gist.github.com/JAreina/8f8ff4731ae3a522dced5f49e4f77061

 // let querystring = require('querystring');

var postData = JSON.stringify({
    msg: 'hello world'
});

var options = {
    hostname: 'localhost',
    port: 3000,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    }
};

var req = http.request(options, function (res) {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', JSON.stringify(res.headers));

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
        console.log('BODY:', chunk);
    });

    res.on('end', function () {
        console.log('No more data in response.');
    });
});

req.on('error', function (e) {
    console.log('Problem with request:', e.message);
});

req.write(postData);
req.end();
}


//const api={}// see https://javascript.info/promise-chaining 
const api=require('./nat/io/ioreadwritestatus');


let ccbbRef;// the app2 instantiator. it is in closure run() !  xxxxx
const started ={};nRWaiting={}// {luigimarson:{  inst,,,}};// inst bank , available also to node-red connections !
run();// start server

function run(){// build the app2 ctl. pay attention 


let eMClass,// filled by fsmmanager from app2.js : the master ctl
eMCustomClass,// now never called.   the fv ctl build as a eventemitter subclass singleton instance 
  appstat;


// new : xxx

let fsmmanager = require('./app2.js');
//const { LOADIPHLPAPI } = require('dns');
const opt=null;
console.log('ciao1');


fsmmanager(opt, function (app, opt, no_ccbb) {// ask fsm factory app to give the event factory eMClass, or connect as login to the app server
  //  fsm factory app will cb here giving the factory that will be instatiated when we know the plant/user
  // opt={name:'fusionsolar'}?    or  opt1 = {aiax}; but here we reference directly to rest.js , not used ! 
  // no_ccbb   needed ??

  eMClass = app.getEventMng();// the fv ctl build as a eventemitter subclass singleton instance ( generated by app2 on opt param)

  // console.log('  the factory instance is :\n',JSON.stringify(new eMClass(),null,2));
  //console.log('  the factory log is :\n',eMClass.toString());
  appstat = app.state;// use x ?

})

if (Proto) eMClass.prototype.cfg = function (plantname) {// add a cfg static func that add custom .on on all instance 
                                                // similar to subclass that just add cfg func to all instances !!!
                                                //    and in constructor of subclass call cfg !!
                                                // 012023 ...

                                                console.log('  cfg , this is :\n',JSON.stringify(this,null,2));
                                            //customOn.call(this);}
                                            customOn(this);
                                            // this.state.app.plantname=name;
                                            // in other place : recoverstatus.call(this,plantname);
                                          return this;}

  // or add a automatic call of cfg , manually :
  eMCustomClass=function (){// if (Proto) eMClass.prototype.cfg = function () {// add a cfg static func that add custom .on on all instance 
                                                // similar to subclass that just add cfg func to all instances !!!
                                                //    and in constructor of subclass call cfg !!
                                                // https://fromanegg.com/post/2013/01/03/constructor-chaining-inheritance-in-javascript/
     if(PRTLEV>5) console.log(' eMCustomClass : this is :\n',JSON.stringify(this,null,2));
    //eMClass.apply(this,arguments);// calls instatiators
    // this=new eMClass(arguments);
    Object.assign(this, new eMClass(arguments));
    if(PRTLEV>5)console.log(' eMCustomClass : this now is :\n',JSON.stringify(this,null,2));
    this.cfg();// defined in this module, calls customOn(())

  }





// ccbb : the instanziator INSTANZ

// moved to server glogal context : let started ={};// {luigimarson:{  inst,,,}};// inst bank
ccbbRef=function ccbb(plantname) {// when client/plant got a request (a button) for a plant on a webpage , we fire : socket.on('startuserplant' ,that to operate/ register the fv ctl inst
  // so we instatiate or recover  the fsm: that is a eventmanager or connect to the server with a socket that has the same event managed (so the socket is the session/instance of the event manager for the plant)!
  let inst,repeat,repeat1;
  if (plantname) {
    let name = plantname;
    console.log('ccbb  name:',plantname,' instance alredy started? : ',started[name]);
    //console.log('ccbb  factory:',eMCustomClass.toString());

    if (started[name]&&started[name].inst)// its alredy requested and a instance is alredy set, so continue on a fv instance 
    {console.log('ccbb   find an alredy running plant with name ',name,' with cur state: ',started[name].inst.state);
    started[name].inst.reBuildFromState=false;
    if(!started[name].inst)console.error(' ccbb() found a instance on started[',name,'] that was not ready to run !!!!')
      inst=started[name].inst;//  just goon using the alredy running inst x plant name ( and its stored state inst.state )
            /*  **************
            would be better like in web post handler recover the session/state x a plant and run a stateless handler
            see where we talk about implement the ctl using a http post handler , instead of a app.ctl implementation

            */
    repeat=started[name].repeat;
    repeat1=started[name].repeat1;
    



  }else {// start a fv instance
      started[name] = {};
      //if (!started.name.inst) 
      {
        // let inst=started[name].inst = new eMClass(client.cfg_);// create the fv ctl
        // if(Proto)inst.cfg();
        // OR:
        console.log('ccbb  , newing eMclass');
       // let inst=started[name].inst = new eMCustomClass();// create the fv ctl
      inst=started[name].inst = (new eMClass()).cfg(name);// create the fv ctl, customize its .on . nb function cfg() is created in this module !

      inst.reBuildFromState=true;// that wll be overwritten by loadstate !!!
                                  //  reBuildFromState=true; means we couldnt recover instance previously build in a previous socket connection , so first time managing a plant  or server crashed

      inst.init=false;// not redy to be used without recover state and connectto to device
        // inst.state.app.plantname=name;// todo in .cfg()

        //??
        // started.name.inst.start();// start the new instance

        repeat=started[name].repeat=checkFactory(inst); // here instead of in DDHH
        repeat1=started[name].repeat1=checkFactory(inst); // here instead of in DDHH

      }
      

    }

    return {inst,repeat,repeat1};
  }

  // https://api.open-meteo.com/v1/forecast?latitude=45.6055&longitude=12.6723&hourly=temperature_2m,weathercode,cloudcover&timezone=Europe%2FBerlin
  //https://open-meteo.com/en/docs#latitude=45.65&longitude=13.77&hourly=temperature_2m,weathercode,cloudcover&timezone=Europe%2FBerlin

}// end ccbb()

// end new : xxx



/*
CXD
// old : CXD 

module.exports = function(ap,opt,ccbb){// CXD :the client(opt.name=fusionsolar) ctl. 
        // ap:app  controller app ref instance , ap will call: require('thismodule')(ap,opt)
      	
        // il fv ctl chiede di init il fv ctl x fusionsolar
        // poi gli user fanno get alla pagina dopo un login (name got !) cosi si sa che impianto connettere
        // returns the controller 
        
	

 // logica : la app chima il client ctl e gli chiede di settarlo 
 
      	
      	
app=ap;// ctl mng
let eMClass=app.getEventMng();// the fv ctl build as a eventemitter subclass singleton instance 


let appstat=app.state;
let buttoncaused=false;
// from opt ?
let hin=10,hout=16;



if(opt.name=='fusionsolar'){// this is the fusionsolar client, the only accepted/compatible !
return startweb();// 1; ok

}
}// ends old 
*/



 function startweb (options) {// start fv web server, every time a user do  get will start . ?????????????????????

  // console.log('start listen web request, http: ',http);

  http.listen(8080); //listen to port 8080, wait a user to connect and login to get the user name

  // console.log('started listen web request, http: ',http);

  // other client init stall 


  return conf();// before first user web conn ( that will start the plant fv ctl) , must return 1

}// ends startweb
startweb();

//let token = null,// cur token  errore concettuale . metterlo in state !
  openapi = { baseurl: '', user: '', pass: '' },// data to connect openapi
  cfg = {},
  tokens={};// non usato

  function tokenaiax(method,procedure,cb){// will get token or create a new one if expired

let body=
    {
      "userName":"MarsonLuigi_API",
      "systemCode":"Huawei@123"
      }
      
// ...................

    cb();

  }


}// ends run()




  function program(state,inp__,probes){// /  probes={giorno:19.2,notte:,,,,}   // will set real relays from program and anticipate virtual devices set!!
                                     
                                    /*
                                    inp__:  {
                                            programs: { giorno: { sched: [{"8:30": 15,"17:00": 19,}],    set in HHDD  
                                                                    toll: [{"8:30": 0.5,"17:00": 0,6}] // molto fine basterebbe unico valore di toll =1.3
                                                        notte:   {}
                                                      } },
                                            probMapping: [ 2, 4, 0, 3, 1, 5 ],
                                            mapping: [ 0, 1, 2, 3, -1, 5 ],
                                            ei: 'S'
                                          }

                                    */

let inp=inp__.programs,// {giorno,notte}
isSummer=inp__.ei=='S';
console.log('program() called with programming/scheduling data inp: ',JSON.stringify(inp__,null,2),' and current probs: ',probes);
console.log('program() NB before call consolidate ret=optimize(ret) can have any null value!');

let ret=null,// pumps if t<desidered , no anticipating
    antret,// pumps if t<desidered + toll,  anticipating
    desTemp=[21,21],// std desidered temp
    h,m,optimRet=null;
let  date=pdate();//new Date();date.setHours(date.getHours()+dOraLegale);

// register into the last read probes
state.program.triggers2.lastT=[date.toLocaleString(),probes];//JSON.stringify(probes)]; anomalus array with different types
// find zone to activate
    if(probes&&inp){// inp=sched={giorno:{'16:10':-3,,,,},notte:{},probMapping:[],mapping:[],ei} 

      toactivate=[],// [actiongiorno,actionnotte]
      activation=false,// true if at least one is in toactivate
      activationantic=false;// true if at least one is in toactivate
     
      h=date.getHours();m=date.getMinutes();
        // Do stuff
      let action;//[true/false start if no anticipate ,true/false start if anticipate]  
      // for(let i=0;i<zLlen;i++){// scan inp keys : the zones to find the current index in inp 
        // todo improvement: if probes[i]= null allora non modificare il relativo pump !!!!  ( set null ! )

        let mres;
        // 0 giorno
        let desT, desTgiorno=[21],desTnotte=[21];
        if(inp.giorno){mres=toact('giorno',probes.giorno,inp.giorno,isSummer,desTgiorno);
        if(mres[0])activation=true;
        if(mres[1])activationantic=true;
        toactivate.push(mres);
        }else toactivate.push([false,false]);
        desTemp[0]=desTgiorno[0];
        // notte
        if(inp.notte){mres=toact('notte',probes.notte,inp.notte,isSummer,desTnotte);
          if(mres[0])activation=true;
          if(mres[1])activationantic=true;
          toactivate.push(mres);
          }else toactivate.push([false,false]);
          desTemp[1]=desTnotte[0];


      /*
      >>>>>>>>>>>>>><
      to increse performance   solo se lastProgramAlgo cambia allora esco con un res, atrimenti aggiorno le date in lastProgramAlgo 
      ma esco con null cosi non si cambiano i rele/pumps !

      */

     // 



     // TODO TODO only 2 zones giorno notte !

     state.lastProgramAlgo=state.lastProgramAlgo||{model:'programbase'};

      let changing=false;
    if (activation)  {// some section is cooler than programmed in winter or warmer in summer
      ret = [true, null, false,false, false,null];// [heat,pdc,g,n,s,split]. program algo (specific) suggestion 
      antret = [true, null, false,false, false,null];

    if (toactivate[0][0])  {// giorno
      ret[2]=true;
      antret[2]=true;
    }  else{
      ret[2]=false;
      antret[2]=toactivate[0][1];
    }  
    
    if (toactivate[1][0])  {// notte
      ret[3]=true;
      antret[3]=true;
    }   else{
      ret[3]=false;
      antret[3]=toactivate[1][1];
    } 

/*
        if(!(ret&&state.lastProgramAlgo&&ch(ret,state.lastProgramAlgo.pumps))){// the algo produces a different ret from  previous algo
          state.lastProgramAlgo={updatedate:date.toLocaleString(),time:date.getTime(),probes,pumps:ret,model:'programbase'};//  set this last program algo  virtual values in state, rewrite , just to set update date
          optimRet=null;
          console.log('programming() found no changes in [heat,pdc,g,n,s,split], so consolidation of program algo suggestion: ',ret,' is : null, infact is: ',optimRet);
        }else{
          state.lastProgramAlgo={updatedate:date.toLocaleString(),time:date.getTime(),probes,pumps:ret,model:'programbase'};//  set this last program algo  virtual values in state
          ret=optimize(ret,state.lastAnticAlgo,state.lastProgramAlgo);// consolidation taking care of anticipating algo and user manual set
          console.log('programming() found low temp in house, so after optimize() set controlled relays (heat(index=0),g(zona giorno,index=2),n(zona notte, index=3)).');
          console.log('so consolidation/optimizing of program algo virtual suggestion: ',ret,' is ([heat,pdc,g,n,s,split]) :  ',optimRet);

        }

*/





      //,curBattSavings:0,curEnSavings:0
        // al last reset battSav aumenta ogni check di dT*inverter e cosi enSavings che pero viene diminuto del lastbatreset
       
        state.lastProgramAlgo.setby='(last) event handler called by some execute/algo step, procname unknown';//,', \n so consolidation/optimizing with anticipating and manual set we got : ',optimRet);
      console.log('programming() found desidered  not satisfied temp so suggests this virtual ([heat,pdc,g,n,s,split]) actions: ',ret);
      if(state.lastAnticAlgo)console.log(' \n nb later in attuators, we do consolidation/optimizing with last manual  and anticipating action : ', state.lastAnticAlgo.pumps);
 
      optimRet=ret;
      //console.log('\n at last got: : ',optimRet);



    } else {//  no one of programs has temperature out of  target on current time slot 
    
    ret =[false, null,false,false, false,null];// [false, null,null,null,null,null];// desidered program algo virtual actions : heat e i rele zonali: off, e nessuna modifica x gli altri rele 
    antret = [false, null, false,false, false,null];

    {
    if (toactivate[0][1])  {// giorno antic
      antret[2]=true;
    }    
    if (toactivate[1][1])  {// notte antic
      antret[3]=true;
    }  
  }



  //  state.lastProgramAlgo={updatedate:date.toLocaleString(),time:date.getTime(),probes,pumps:ret,model:'programbase'};//  set this last program algo  virtual values in state, rewrite , just to set update date

    // optimRet=optimize(ret,state);// consolidation taking care of anticipating algo and user manual set
    // now call in attuators optimRet=consolidate(state,'program');// consolidation taking care of anticipating algo and user manual set
    optimRet=ret;// here optimate is just ret , effective consolidation will be called after

    console.log('programming() found no unsatisfacted programmed temp in house, so suggests virtual  ([heat,pdc,g,n,s,split]) program actions: ',ret);
   // if(state.lastAnticAlgo)console.log(' \n so next consolidation/optimizing with last anticipating action : ', state.lastAnticAlgo.pumps);
    //console.log('\n at last got: : ',optimRet);
  }

  state.lastProgramAlgo.updatedate=date.toLocaleString();
  state.lastProgramAlgo.time=date.getTime();
  state.lastProgramAlgo.probes=probes;
  state.lastProgramAlgo.program=inp;
  state.lastProgramAlgo.pumps=ret;// action if not anticipating 
  state.lastProgramAlgo.anticGap=antret;// action if  anticipating 
  state.lastProgramAlgo.desT=desTemp;// current desidered t , def> 21

    }  else { state.lastProgramAlgo=false;optimRet = null;

      console.log( 'programming() could not find any results , returns null');
    }
/*
    if(state.lastAnticAlgo)console.log('programming  algo calc its new BASIC virtual relays values proposal,present  lastAnticAlgo [pdc, g, n, s, heat,split] are : ',state.lastAnticAlgo.pumps);
    console.log('   >>> basic values(not null) are relays comandable by program algo (thermostat programs Tx and PGMx ) : , the others are set by other algo or by user via browser');
    console.log('   >>> basic values can control also relays specifically calc to optimize pdc/gas production (pdc and split and )');
    console.log('   >>> ex : programming basic values set heat and g/n and gas, then anticipate algo force heat g/n/s + split and pdc. when anticipate ends basic will be recovered . if user off n manually at next running progran can or not change n ');
    console.log('       (use some flag for temp user action (next run program will force its values ) or modify the sched temp PDCx and rerun program or manually set pumps blocking or not the algos x some time (day))');
   
    console.log(' tentative optimize algo :\n program algo BASIC virtual values are and-ed with last assigned ANTICIPATE virtual  values recovered from state: : ',ret);
    console.log('   >>> anticipte relays force some relays as in some zones would be found a low temp. also set relays to set values comptible with pdc production , whatever best cfg set by user or program algo ');
    console.log('   >>> when anticipate ends the stored relays state are recovered  ');
/*

    /* old
    if(state.lastAnticAlgo&&(state.anticipate||state.user)) // modify the program res if there are also user and anticipate proposal
      return consolidate(state,'program');
    else return ret;// the program algo res , con be null
    */

/*
// now neednt to call consolidate     because consolidato is put into attuators, that is called after 
if(ret){// program wants to set some relays, ret can have nul val that must be resolved  also looking at other proposal user+ anticipate 
  return consolidate(state,'program',date);// todo   optimize e abbastanza , inutile ?
}return null;
*/
return optimRet;


    function toact(zona, sonda, sc_,isSummer,desT=[21]) {// zona,valore sonda, sc=programma orario x la zona. verifica se una zone ha temperatora sonda <  alla programmata nello slot dove cade l'ora corrente
                                      // se  torna true

                                    /* sc_= 				      {sched: {"8:30": 27,"17:00": 30,},
                                              				      toll: {"8:30": 0,"17:00": 0,},
                                              				      TgiornoTollerance: 0,
				                                                    },    */

      // sc_={sc=sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1=0.7,"17:00":dt2}// tolleranze delle temperature desiderate
      if (!sonda) return;
      let sc = sc_.sched,scantic=sc_.toll;
      // nb toll future use : query lastAnticAlgo to see if a fv production is expected in short time
      // if(lastAnticAlgo.short)dt=true;
      let keylist = Object.keys(sc);// orari del programma =["8:30","17:00"]
      // cerca dove cade la cur temp : slot

      console.log(' toact() analizing  zona: ', zona, ' programma : ', sc, ',  at present hour:min  ', h,':', m,);

      let slot = -1, // time interval dove l'ora corrente cade, quindi   temp = sc[keylist[slot]] è la temperatura programmata !
      last = keylist.length - 1, temp = sc[keylist[last]], resu = 'none', tempx = '';
      // resu='slot x : '+ last +' temp ' + sc[keylist[keylist.length-1]; 

      for (let i = 0; i < keylist.length; i++) {//
        //  Object.keys(bodies).forEach(function(key,index) {// for each bodies items post 
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        //tempx =tempx + '-'+i; 
        let ma = keylist[i].split(":");// ['8','30']

        console.log(' toact() analizing  zona: ', zona, ' orario: ', keylist[i], ',  with present hour min : ', h, m,);

        if (h < ma[0]) {// 10 < '8'
          // got! ends scan the index in sc is slot
          slot = i - 1; i = 1000;// got slot
          //tempx =tempx + ' - got slot '+ slot ;// ma[0]; 
          console.log(' got slot ',slot,', because present hour is less then slot+1 hour');
        }

        else {
          if (!(h > ma[0]) && m < ma[1]) {
            slot = i - 1; i = 1000;// got slot
            // tempx =tempx + ' - got slot '+ slot +' minute '+m;// ma[0]; 
            console.log(' got slot  ',slot,' because present hour is = but current min is < !');
          }
        }

      }
      if (slot < 0) slot = last;

      temp = sc[keylist[slot]];//programmed desidered temp x the current slot
      desT[0]=temp;// trace back the desidered temp
      let delta=scantic[keylist[slot]];if(isSummer)delta=-delta;
      tempantic = temp+delta;//tolerance temp to start anticipate  x the current slot
      // if(lastAnticAlgo.short)// last anticipate expect to produce fv energy (> 2kWh) in short time (less 1 hour)
      
      /*if (sc_.sched && sc_.toll[keylist[slot]] > 0 && sc_.toll[keylist[slot]] < 2)// tolleranza temperatura desiderata ta 0 e 1  ?????????????
       { temp += sc_.toll[keylist[slot]];// es se ho un desidered temp=20   cambio in 20.5 cioe aumento la temperatura desiderata ????
        console.error(' toact() detect speculating condition , so change temp that now is ',temp)
       }*/




      //resu=tempx+' - slot '+ slot +'/'+(slot+1)+', temp ' + sc[keylist[slot]]; 
 // 
      let act=temp > sonda;if(isSummer)act=!act;// es 19 > 20   dont start normal warming probe is sonda = 20, desidered t is temp=19
      let actantic=tempantic > sonda;if(isSummer)actantic=!actantic;// es 19 > 20   dont start normal warming probe is sonda = 20, desidered t is temp=19

     //  if (act) {        console.log(' toact() activate generator . infact in zone ',zona,', found current time slot: ', slot, ' with desidered temp: ', temp,' and probe temp ',sonda,' . modalità condizionatore/riscaldamento ',isSummer);
     //  }      else  console.log(' toact() do not activate generator . infact found current time slot: ', slot, ' with desidered temp: ', temp,' and probe temp ',sonda,' . modalità condizionatore/riscaldamento: issummer: ',isSummer);
     console.log(' toact() activate generator: ',act,' . infact found current time slot: ', slot, ' with desidered temp: ', temp,' and probe temp ',sonda,' . modalità condizionatore/riscaldamento: issummer: ',isSummer);
     console.log(' toactantic() activate generator: ',actantic,'  . infact found current time slot: ', slot, ' with desidered antic temp: ', tempantic,' and probe temp ',sonda,' . modalità condizionatore/riscaldamento: issummer: ',isSummer);
     
 
      return [act,actantic];//[false,true]
    }

   

      function ch(ret,oldret){// check for different values
        if(ret.join()==oldret.join())return false;// ret == oldret so pumps are the same 
        return true;
        }
}


function optimize(res_,state){// old not used , now we call consolidate, see  result=await attuators(these).
                              //     was : now imagine optimize run only on program algo 
  
  let lastAnticAlgo=state.lastAnticAlgo,lastProgramAlgo=state.lastProgramAlgo;
  //res=[heat,pdc,g,n,s,split] . here we see last anticipated algo proposal relays values and merge them into a summary 
  // set pdc + split according to text + hour + fv power  .>>    what is text ???
// here calc pdc + split according to text and hour , 
// can also call anticipate algo on behalf (al posto di usare) of anticipate exec job that just fill state.aiax and state.anticipate but we must be shure program algo should be active !
// anyway user can reset the value
// todo : define rules to merge last proposed program and anticipate (if active)  virtual values into a summary
// ... if antic is active (check lastanticalgo.updatedate) and it proposed pdc (lastanticalgo.pumps[1]==true) set true  also pdc and split (dont care the lastanticalgo.pumps[g/n/s] !  )

// >>>>  return the same ret , modified!!!!!!

let debcase=0;
// let ret=[];for (i = 0; i < res.length; i++) {  ret[i] = res[i];}     or:
let res=[...res_];
if(lastAnticAlgo)
if (lastProgramAlgo.time > lastAnticAlgo.time) {// program is last
    if (lastProgramAlgo.time - lastAnticAlgo.time < 1000000) {// 18 min  so set pdc as antic algo did , both working

      console.log(' optimize(), found anticipate algo older then program algo less then 100/6 min with virtual pumps suggestion: ', lastAnticAlgo.pumps);

      if (lastAnticAlgo.pumps[1]) {//     is pdc anticipate virtual relay on
        console.log(' optimize(), found anticipate algo pdc on, so set pdc and gaspdcPref');
        res[1] = true; res[5] = true; // confirm pdc , + split 
        debcase=1;
      } else {// if(// to write manual algo with time expiration for each pump: lastManualAlgo.pumps[1]){}// dont set (we could have been set it manually )
        res[1] = false;
        res[5] = false;
        debcase=2;
      }
    } else {// anticipate last values are not valid, confirm just program values
      res[1] = null;// dont set , someone else could have set it
      res[5] = null;
      debcase=3;
    }
  } else {// anticipate is last
    if (lastAnticAlgo.time - lastProgramAlgo.time < 1000000) {// 18 min  so set zones as program  algo did , so both working
      // lastProgramAlgo.pumps[2]) // g ever true !
      if (lastProgramAlgo.pumps[3]) {//     is n program virtual relay on
        res[3] = true;// confirm n active 
        debcase=4;
      } else {
        res[3] = false;
        debcase=5;
      }
    } else {// program last values are not valid, confirm just anticipate values
      res[3] = null;// dont set 
      debcase=6;
    }
  }else{// not valid anticipate 
    ;// just take res

  }



let user;// browser user algo manual set update required 

if(state.lastUserAlgo&&checkval(state.lastUserAlgo)){
user=state.lastUserAlgo.pumps;
 console.log(' optimize() found manualuser  relays set: ',user);
 


  }else state.lastUserAlgo=false;// expired 

//res[1]=false;// pdc
// res[5]=false; //split
console.log(' optimize() used case: ', debcase);


    // b: apply user wants , initially user will have day validity res will bet set by antic and/or program if active or can be null
    // apply default if no assign and program :
    res=res||(new Array(state.app.plantconfig.relaisEv.length)).fill(null);

   
  res.forEach((val, ind) => {
    if (user) {
      if (user[ind] == null) {
        ;//if(res[ind]==null)res[ind]=false;// should not be any null val in res !!!
      } else {
        res[ind] = user[ind];
        console.log(' consolidate() merging  found a valid manual set for pump index ', ind, ', that overwrite anticipate and program indication in ', res[ind]);
      }

    }
    if (res[ind] == null) res[ind] = false;// final check :should not be any null val in res !!!
    /*
    // only for lastalgo=='user'
    state.user=true;
    */
  });






  return res;//ret;//res;// better clone
}

function anticipate(state,algo){// the algo :  store algo result on state.lastAnticAlgo, eventually consolidate with program algo ?
/*
    "battLevel": 0,
    "inverter": 3,
    "cloudly": 55.5
     "anticipate": {
    "running": true,
    "starthour": "9",
    "stophour": "15",
    "hourinterval": "1"
*/

// ******** input data is just set in state.aiax !!!!!!!!!!!!!!!!!!!!!
 let {battery,inverter,cloudly,consumo}=state.aiax,// filled with aiax in  getstat/bodies
 
 
 
 temp=20,
 {running,starthour,stophour,dminutes}=state.anticipate,
 triggers;
 consumo=consumo||0;// add that !!!!
 if(state.anticipate)triggers=state.anticipate.triggers;

  let a=2,//// basic model save battery
  ret,model_;
if(triggers){
if(triggers.PdCTrig1){a=2; console.log(' anticipate algo find required policy : PdCTrig1');
     model_="PdCTrig1";// add .policy=.....
     }

  if (a == 1)
    ret = [false, false, false, false,false,false];// [heat,pdc,g,n,s,split] 
  else if (a == 2) {// basic model save battery
    if (triggers)
    {let plant=state.app.plant,plantconfig=model.getconfig(plant),
      fVP=parseInt(triggers.FVPower),// if positive the % of battery charging power, if negative the !cloudly  required condition
      doAntic;
      if(fVP!=NaN&&plantconfig.invNomPow!=null&&plantconfig.invNomPow!=NaN){
      let pococloudly;//=cloudly <= (100 + fVP);// es 100 +  -80 = 20
      if (fVP<0&& (pococloudly=cloudly) <= (100 + fVP+1)// negative value means confront - cloudly  , ok per  100<=100-1+1
        ||(fVP>=0&&(100*(inverter-consumo)/plantconfig.invNomPow >= fVP))// positive means confront with inverter power , potenze in %
      
      ) {doAntic=true;}
      } else doAntic=false;
      
      
      if(doAntic){
      // ret = [true, true, true,null, null,true];// [heat,pdc,g,n,s,split] 
  //     ret = [true, true, true,null, null,true,true];// added gaspdcPref : [heat,pdc,g,n,s,split,gaspdcPref] : according to todo now will be necessary set only  the intermediate var gaspdcPref  if use optimize loop :
                                                    // ret = [null, null, null,null, null,null,true];
    ret = [null, null, null,null, null,null,true];// just set virtual intermediate 
    console.log('anticipate() find cloudily low so start pdc');
    }else{// no anticipating, so no requirements
      ret = [null, null, null,null, null,null,false];// [heat,pdc,g,n,s,split] 
    }
  }
  }
  else ret = null;// algo not producing any advise requirements
  console.log('anticipate algo calculated new relays values : ',ret);
   
}else {
  console.log('anticipate algo cant find triggers, so retuns null ');
  console.error('anticipate algo cant find triggers ');
ret= null;//[false, false, false, false,false,false];  
}


if(ret){// store suggestion lastAnticAlgo, consolidate with program algo  and user manual
// let  pdate=new Date();pdate.setHours(pdate.getHours()+dOraLegale);
let ddd=pdate();//state.lastAnticAlgo={updatedate:new Date().toLocaleString(),level:1,policy:0,algo,pumps:aTT,model};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand relays to perform a objective; eco,lt,ht,timetable
// state.lastAnticAlgo={updatedate:ddd.toLocaleString(),time:ddd.getTime(),level:1,policy:0,algo,pumps:ret,model};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand relays to perform a objective; eco,lt,ht,timetable


//const dayOfYear = date => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));// days of cur year
const dayOfYear = date => Math.floor((date ) / (1000 * 60 * 60 * 24));// days from 1970
let saving=state.saving= state.saving||
// {day:[-1],date:['00/00/1970'],battSavings:[0],enSavings:[0],minLevBattery:[0],checkedHour:[0]}// array of daily saving obtained wih application of anticipate algo periods
[{day:-1,// day from 1970
  date:'00/00/1970',battSavings:0,enSavings:0,minLevBattery:0,checkedHour:0}]// array of daily saving obtained wih application of anticipate algo periods

,checkday;
function calcsavings(){// calcola alle ore 8 i savings del giorno precedente
                        // to do put in obj , not in many arrays !, done
  if(state.lastAnticAlgo){// must exists



/* news: supponendo che le batterie senza l'anticipo consumi  abbia raggiunto il max nel giorno precedente ( che altrimenti non servirebbe strettamente anticipare)
    e quindi a maggior ragione se le batt hanno ragiunto il max con anticipo consumi
    a fine giornata () uando l'anticipo consumi sarebbe in ogni caso richiesto dal program , la batteria sara allo stesso valore sia che anticipi che no
    la differenza sta nel fatto che  nel caso non antic dovrei fornire l'anticipo e quindi la batt sarebbe minbattSA=minBatt-antic se >0
        ma se e' <0 alloravuol dire che ho rispamiato dalle rete l'energia antic- minBatt 

        ??? quindi risparmio energia par circa a quanto  ho anticipato che invece sarebbe andata in rete visto che le batt sarebbero al 100%

    ora se il giorno successvo il fv manda ancora al max le batt, non avro ulteriori risparmi , ma nel caso in cui (50%) c'e nuvolo allora posso anche avere l'energia in piu = al deltabatt = minbattSA!!!

    se invece voglio un calcolo esatto a lungo termine calcolo l'eneriga fornita alla rete dal fotovoltaico ( inv-consumi) quando la batt e' piena e la diff dei due casi e' l'energia che non ho mandato in rete ma consumata o carcato le batt !!!
*/

  state.lastAnticAlgo.daysavings=state.lastAnticAlgo.daysavings||{battery:0};// current battery  savings energy anticipated by algo
 // let es=state.lastAnticAlgo.daysavings.battery*0.8 - state.aiax.battery; 

 // not current min battery but yesterday min batt ! but if minor then current . perhaps limit to 50 anyway ?
 // let minBat;if(saving.minLevBattery[saving.minLevBattery.length-1]<battery)minBat=saving.minLevBattery[saving.minLevBattery.length-1];else minBat=battery;
 let minBat;if(saving[saving.length-1].minLevBattery<battery)minBat=saving[saving.length-1].minLevBattery;else minBat=battery;

  let es=state.lastAnticAlgo.daysavings.battery*0.8 - minBat; //(state.aiax.battery+state.saving.minLevBattery[state.saving.minLevBattery.length-1])/2;
  // manca il criterio che quando raggiungo il max battery se anticipo e come se aumentassi la capacita. in effetti se anticipo poi dovrei trovare nel calcolo di sopra un valore maggiore
 //  es parto con batteria a 100 poi anticipo e alla fine ho max  batt . se non avessi anticipato avre immesso in rete e poi alla fine avrei mangiato batteria (meno scorta x il futuro)! 
 //     quindi il vantaggio e in anticipate energy prima del max !!. questo e' da aggiungere !!! in pratica se non anticipo il consumo il max viene raggiunto e poi l'anticipo 
 //       consumato dopo mangia la batteria se il fotovoltaico non produce piu  quindi il vantaggio e' tutto l'anticipo fino quando la batteria non inizia a scendere
 //       oppure il antaggio e' in tutta il anticipo fino a che la batteria inizia a scendere perche da qui in poi se non avessi anticipato avrei una batteria piu scarica del anticipo ! 
 //         il che si traduce iln perdita se la batteria raggiunge lo 0 . quindi anche qui vale il anticipo -
  if(es<0)es=0;
  
/*
  saving.enSavings.push(es);// savings = 80% del anticipo che invece consumo alla fine - media livello batteria ((batt in + finale)/2) 
  saving.battSavings.push(state.lastAnticAlgo.daysavings.battery);// risparmio carica ottenuto con anticipate= current anticipated energy
  if(!saving.date){saving.date=[];for(let i=0;i<saving.day.length;i++)saving.date.push('na');// debug only allineate date array 
  saving.day.push(checkday); 
  saving.date.push(ddd.toLocaleString()); // added to correct
  saving.checkedHour.push(ddd.getHours());// day and hour of daily calc
  saving.minLevBattery.push(battery);// initial battery val for next days
  */

  saving.push({enSavings:es,battSavings:state.lastAnticAlgo.daysavings.battery,day:checkday,date:ddd.toLocaleString(),checkedHour:ddd.getHours(),minLevBattery:battery});





  
return true;
}else return false;
}

// update/create lastAnticAlgo
state.lastAnticAlgo=state.lastAnticAlgo||
{level:1,policy:0,model:model_,
  daysavings:{battery:0},// energia anticipata giornaliera cumulata a partire dalle ore 8 , dal algo anticipate
  setby:'(last) event handler called by some execute/algo step, procname unknown'};

if(!state.lastAnticAlgo.daysavings)state.lastAnticAlgo.daysavings={battery:0};// debug only

checkday=dayOfYear(ddd);
// if(saving.day[saving.day.length-1]<checkday&&ddd.getHours()>=8){// once a day calc savings // at a hour on which battery is minimum  8
if(saving[saving.length-1].day<checkday&&ddd.getHours()>=8){// once a day calc savings // at a hour on which battery is minimum  8

  if(calcsavings()){
    //   console.log('anticipate algo calculated previous day n ',checkday,'  energy savings ',saving.enSavings[saving.enSavings.length-1],' and battery savings ',saving.battSavings[saving.enSavings.length-1]);
  //   console.log('anticipate algo calculated previous day n ',checkday,'  energy savings ',saving.enSavings[saving.enSavings.length-1],' and battery savings ',saving.battSavings[saving.enSavings.length-1]);
    console.log('anticipate algo calculated previous day n ',checkday,'  energy savings ',saving[saving.length-1].enSavings,' and battery savings ',saving[saving.length-1].battSavings);
 
 
  state.lastAnticAlgo.daysavings.battery=0;// reset for cur day
  }

}else{ // calc interval increse of savings upto current hour

  //  if(saving.day[checkday]&&ddd.getHours()>=8){// only if the daily calcsavings are alredy calc
  if(saving[saving.length-1].day==checkday&&ddd.getHours()>=8){// only if the daily calcsavings are alredy calc


  let ibs;
  if((ibs=parseInt(state.anticipate.dminutes))!=NaN)ibs=(inverter-consumo)*ibs/60;// kWh, is the batt charge energy from the hour we evaluated min minBatt
  else ibs=0;
  state.lastAnticAlgo.daysavings.battery+=ibs;
  // state.lastAnticAlgo.daysavings.battLevIfNoAntic=saving.minLevBattery[checkday]+state.lastAnticAlgo.daysavings.battery;
  state.lastAnticAlgo.daysavings.battLevIfNoAntic=saving[saving.length-1].minLevBattery+state.lastAnticAlgo.daysavings.battery;


console.log('anticipate algo increments for current day n ',checkday,'  day upto hour consolidated battery savings ',state.lastAnticAlgo.daysavings.battery);
}}

        // if state.day[last]< curday   and hour>savecheck calc  and push state.battSavings and enSavings
     
      state.lastAnticAlgo.updatedate=ddd.toLocaleString();
      state.lastAnticAlgo.time=ddd.getTime();

      state.lastAnticAlgo.algo=algo
      state.lastAnticAlgo.pumps=ret;
      state.lastAnticAlgo.aiax=state.aiax;

     
      //,curBattSavings:0,curEnSavings:0
        // al last reset battSav aumenta ogni check di dT*inverter e cosi enSavings che pero viene diminuto del lastbatreset
       






// pumps relay set after
}else {// do nothing , reset last antic results
  state.lastAnticAlgo=false;
}
// consolidate with program algo  and user manual, also if lastAnticAlgo=false : program <> anticipate
// if(state.lastProgramAlgo&&ret) return consolidate(state,'anticipate');//,pdate);
// else 
return ret;

}

function login(opAPIUser,opAPIPass) {// to call to set login on inverter openapi, got the token

  /* A:
  return // a promise
  // await // needs ?
  new Promise((resolve) => {
    // setTimeout//




    tokenaiax(post, plant,
      (token) => {
        console.log('tick')

        resolve(token);
      })
  })
*/
  // B:

/* curl --location --request POST 'https://eu5.fusionsolar.huawei.com/thirdData/login' \
--header 'Content-Type: application/json' \
--data-raw '{
"userName":"MarsonLuigi_API",
"systemCode":"Huawei@123"
}'
*/
console.log(' login() started x sername: ',opAPIUser);

  let body=
    {
      //"userName":"MarsonLuigi_API",
      userName:opAPIUser,
      "systemCode":opAPIPass // put in .env
      }
  ,url='https://eu5.fusionsolar.huawei.com/thirdData/login',
  head={"Content-Type": "application/json"};
  let ret=aiax(url,'POST',body,head)// a promise
  console.log('returning a promise from login: ',ret);
  return ret;

}
 async function getstat(state) {// get state from inverter openapi
/*
  return
  // await // needs ?
  new Promise((resolve) => {
    // setTimeout//
    stateaiax(post, openapi, fs_state,
      (state) => {
        console.log('tick')

        resolve(state);
      })
  })
  */
  if(PRTLEV>5)console.log(' getstat called with state: ',JSON.stringify(state,null,2));
  let bodies=// {body,devTypeId,extract}. extract: extrat usefull info (put in state.aiax,xxx) from resu.data, result=resu={data,token} 
  { inverter:  {body: {devIds:state.app.plantconfig.huawei.inv,// body: the post request 
                devTypeId:"38"},
                extract:(data)=> {
                  console.log(' aiax extracting inverter info from aiax data got: ',JSON.stringify(data,null,2));
/* 012023 to do : check id the query has resolved ok , testing data.data[0].dataItemMap
// if not try to detect the reason 
(ex in FRTF we got :
   rest end :  {
  data: '{"failCode":305,"immediately":true,"message":"USER_MUST_RELOGIN"}',
  token: undefined
}
so check if data.failCode==305 :

reject the promise or just do the same nulling token and 

but the problem is that alredy we got error :

openapi getstat() catched so results is null .........

>>> so the catch should alredy worked !!!!
 ... infact it works !, so .....

*/
                let ret;// undefined
                  if(data&&data.data&&data.data[0]) ret= state.aiax.inverter= data.data[0].dataItemMap.mppt_power;
                  else if(data.failCode==305){ ret=null;// to
                  console.log(' aiax x inverted got unvalid token');}
                  console.log(' aiax x inverted got: ',ret);
                  return ret;
                 }},
    battery :  {body:{devIds:state.app.plantconfig.huawei.bat,// 1000000035350466
                devTypeId:"39"},
                extract:(data)=> {
                  
                  console.log(' aiax extracting battery info from aiax data got: ',JSON.stringify(data,null,2));

                  // todo : change state.aiax.inverter to state.aiax.battery 
                  let ret= state.aiax.battery= data.data[0].dataItemMap.battery_soc,
                    ret1=state.aiax.battCharge= data.data[0].dataItemMap.ch_discharge_power;
                      
                  console.log(' aiax x battery got: ',ret);
                  return {battery:ret,battCharge:ret1};


                 }}

    // add consumi , so inverter - consumi = delta battery 

      
    } ,

    url='https://eu5.fusionsolar.huawei.com/thirdData/getDevRealKpi';

let results={},// the aiax results to get from all devices
resu;
 let keylist=  Object.keys(bodies);
  for(let i=0;i<keylist.length;i++){// ['inverter','battery']
   //  Object.keys(bodies).forEach(function(key,index) {// for each bodies items post 
      // key: the name of the object key
      // index: the ordinal position of the key within the object 
   
    let key=keylist[i],el=bodies[key];
    console.log(' getstat, looping  devices, now rest device: ',key,', Type id: ',el.devTypeId);


      resu= //{data,token}
      await aiax(url,'POST',
        el.body,
      head={"Content-Type": "application/json","XSRF-TOKEN":state.token})//;// a promise
    // to do 
    .catch(error => { console.error('aiax got error : ',error,' so goon with null result')});// in case aiax fire error and be rejected 

      console.log(' getstat recover from device: ',key,'aiax call: ',resu);// resu is string
     // console.log(' getstat recover from device: ',key,'aiax call: ',JSON.stringify(resu,null,2));
  
 if(resu&&resu.data){
  let res;
  try{
  res=el.extract(JSON.parse(resu.data))// set info into state.aiax .  ex x inverter      =body.data.data[1].dataItemMap.mppt_power;
  // only promise or try group can be catched !! 
  // .catch(console.error('aiax got bed result, exit execute procedure with undefined val'))
    ;
    // so :
  }
  catch(error){
    console.error('aiax got bad result, exit execute procedure with undefined val, error: ',error);
  }

  console.log(' getstat recover from device: ',key,', the value : ',res); 

    // in case aiax fire error and be rejected , res=undefined
  if (res === null) {// token expired or 
    console.log(' getstat recover from device: ',key,' a null value, can be an expirered token');
    i=100;results=null;
  } else if (res === undefined) { // true
    console.log(' getstat recover from device: ',key,'aiax result cant be calc, so exit execute procedure ');
    i=100;results=undefined;
  }else  { 
    
    if (
      typeof res === 'object' &&
      !Array.isArray(res) &&
      res !== null
  ) {// ex : res={battery,battCharge}
    Object.assign(results, res);
  }else  results[key]=res;// is string or number goon next dev
  console.log(' getstat recover from device: ',key,' the required info : ',results[key]);
  }
  } else{ 
    console.log(' getstat recover from device: ',key,'aiax result missing, so exit execute procedure ');
    i=100;results=undefined;
  }

      
      };
  /*

  122022
  // 122022 se aiax non va a buon fine perche il token e espirato il aiax come promise rejected e cosi il await aiax se non catchato fara rejectare l'intera async function
// cioe rejecta la async function getstat() e non serve il catchare : 


} catch(err) {// if any of the await reject:
    console.error('  ???? getstat catched , probably the token expired for plant:', plant, ',error: ', err);
     state.token=null;// will reset
     this.state.stepInd=0;// restart ev2run loop
 }*/
 console.log(' getstat, returning aiax x all devices :  ',results);//  { inverter: 4.63, battery: 63 }
  return results;//  a promise if async (uso await !)  results={inverter:1.2,battery:2.5}, null if expired token , undefined if error
  }

 
  async function getWeath(state,url,param) {// get general url data , optional param is plain obj to transform in urlenc and add to url
    /*
      return
      // await // needs ?
      new Promise((resolve) => {
        // setTimeout//
        stateaiax(post, openapi, fs_state,
          (state) => {
            console.log('tick')
    
            resolve(state);
          })
      })
      */
      if(PRTLEV>5)console.log(' getWeath called with state: ',JSON.stringify(state,null,2));
      let bodies=// {body,devTypeId,extract}. extract: extrat usefull info (put in state.aiax,xxx) from resu.data, result=resu={data,token} 
      { cloudly:  {body: null,// to be transf into url enc
                    extract:(data)=> {
                      console.log(' getWeath aiax extracting weather info from aiax data got: ',JSON.stringify(data,null,2));
                      let  d=pdate();//new Date();d.setHours(d.getHours()+dOraLegale);
                      let hour = d.getHours();// rome time , <24
                      console.log(' getWeath , date: ',d,' hour: ',hour);
                      let ret1= data.hourly.cloudcover[hour],// better do a mean of next 2 hour
                      ret2=  data.hourly.cloudcover[hour+1];
                      let ret= state.aiax.cloudly=(ret1+ret2)/2; 
                      console.log(' aiax cloudly got: ',ret,' media di ',ret1,ret2);
                      return ret;
                     }}
        } ;
    
       // url='https://eu5.fusionsolar.huawei.com/thirdData/getDevRealKpi';
    
    let results={},resu;
     let keylist=  Object.keys(bodies);
      for(let i=0;i<keylist.length;i++){
       //  Object.keys(bodies).forEach(function(key,index) {// for each bodies items post 
          // key: the name of the object key
          // index: the ordinal position of the key within the object 
       
        let key=keylist[i],el=bodies[key];
        console.log(' getWeath, looping x device: ',el);
          resu= //{data,token}
          await aiax(url,'GET',
            el.body,
          head=null);//{"Content-Type": "application/json","XSRF-TOKEN":state.token});// a promise
         // console.log(' getstat recover from device: ',key,'aiax call: ',JSON.stringify(resu,null,2));
      
     if(resu&&resu.data)results[key]=el.extract(JSON.parse(resu.data));// set info into state.aiax .  ex x inverter      =body.data.data[1].dataItemMap.mppt_power;
     else results[key]=null;
     console.log(' getWeath recover from device: ',key,' info is : ',results);
          
          };
      /*} catch(err) {// 
     }*/
     console.log(' getWeath, returning :  ',results);
      return results;//  a promise if async (uso await !)  results={inverter:1.2,battery:2.5}
      }




// https://www.npmjs.com/package/await-event-emitter
function conf() {// config and start fv server instance(the controller)

}


// function startfv(eM,session) {// ** start/update singlethon : update pumps as state.relays , 
// now session is got recovering eM.SockClosur
  function startfv(eM) {// ** start/update singlethon : update pumps as state.relays , 
  // console.log(' startfv : the ctl instance is :\n',JSON.stringify(eM,null,2));
  let plant=eM.state.app.plantname;
  console.log(' startfv plant: ',plant,' , following  we allign relay value according with current recovered state. so running setPump()');

  /*
        // customize the events in plant/client emitter ctl instance for a user , after a connection to a plant is got 
        // QUESTION : why add method after create the instance? is better to add some function to prototipe !!
  
    eM.on('start',async function(that,cb){// only  event type 1, so events that after lauch startcheck, can fire start event to login to openapi. so anyway get token/login
        	
        // use same param like : execute(asyncFunc,that,asyMajorEv,asyProcess, ...args) ?
        // asyMajorEv= login , do login to get token
        // start == login !
        // question what is context ?
  
     cb(await login());	// login to server if token expired
     return 1;
    });
  
    eM.on('openapi',async function(that,state,cb){// the fsm ask state updates (we use openapi)
    // question what is context ?
  
     cb(await getstat(state) );
    });
  
  */




  if (!Proto) customOn(eM);

  eM.emit('reset', cfg);// reset fsm   todo 
  // let{gpionumb,mqttnumb,relaisEv,devid_shellyname}=eM.state.app.plantconfig;// plantconfig
  let relaisEv=eM.state.app.plantconfig.relaisEv;// plantconfig

  // allign relays current status to state.relays :
  relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
    // 'g','n','s']
   // setPump(ind,eM.state.relays[pump],eM,session);// setPump(ind,eM.state.relays[pump]); // todo xxx : is error ?
    setPump(ind,eM.state.relays[pump],eM);// setPump(ind,eM.state.relays[pump]); // todo xxx : is error ?
});

// console.log(' old : startfv  following  we start execute procedure startcheck  periodically');
//  repdayly(plant,10, 12, eM);// (10,16) start a interval check for start energy consumption/accumulating

}// ends startfv()




function customOn(these) {// set .on custom handler (event called by execute())
  /* question :
  1 why add custom listener on instance ??? and not on class ?
  2 who will call this ?  eM.cfg()  ??
  
  
  */
  // according with FFGG
  // customize the events listener in plant/client emitter ctl instance for a user , after a connection to a plant is got 
  // QUESTION : why add method after create the instance? is better to add some function to prototipe !!
  // NBNB template for .on is SEDR in app2.js !, :
  //      .on(,evname,inputdata,cb)
  //      cb(err,result)  is used on app2 to concatenate event output to other events !!!!!

 // these.on('connect', async function (that, cb) {// only  event type 1, so events that after lauch startcheck, can fire start event to login to openapi. so anyway get token/login
    
 
 
 // WARNING  : this connect event will run in step 0 event , if token is expired the step 0 will be redone (we reset this.state.stepInd=0)
 // will be  better put this async in processAsync function to run in event openapi
 
// event to process anticipate algo :

 these.on('connect',
    // se tolgo async non posso usare await f ma devo usare f().then() 
    // >>>>>>>>>>>>>>>>>>><  probabilmente ,on non puo tornare un async func !!!!!!!!!!!!!!!!!!!!!!!!!!
    //    or yes but .on returns immediately after got the promise. so goon must proceed with cb    
        async function (dummyinput, cb) {// ?? only  event type 1, so events that after lauch startcheck, can fire start event to login to openapi. so anyway get token/login


                  /* ******    nb  plant is input data , framework say it can be :
                                -a other event output (def in ev2run )
                                - data set in   dataArr.connect
                                 nb  dataArr and ev2run are  execute() parameters
                                 here we do not need any input, we want to test plant token that is in state :


                  */

    // use same param like : execute(asyncFunc,that,asyMajorEv,asyProcess, ...args) ? NO

    // start == login !
    // question what is context , the event manager instance itself ???

    console.log(' handler fired by event connect ');

    let state= this.state, // IS OK ???????, must be not null , defined in  app2 constructor()/clearState()
      plant=state.app.plantname;// the real input , no dummy !

      // 12/2022 meglio def qui :
    let token;token=state.token;
    let catched=false;
    console.log(' handler fired by event connect, with input data: ',dummyinput,', token is : ',token);
    if(!token)  {// update status

      let resu=await login(opAPIUser,opAPIPass)// or login(plant).then(cb)
      .catch(error => { 
        console.error('  login catched , probably the token expired for plant:', plant, ',error: ', error);
        state.token=null;// will reset
        this.state.stepInd=1001;// restart ev2run loop if <1000   e >=0 , se no exit 
        catched=true;
        // now goon after this catch 
        // 122022 1001
    });
   // console.log('connect() token not available, so fired login rest await that returned with token result ',JSON.stringify(resu,null,2));
  
    if(resu&&resu.token){
      console.log('connect(): token was not available, so fired login rest await that returned with token:', resu.token);
      if(catched)state.token=null;// impossible alredy done
      else state.token=resu.token;
    }else // anyway catch was got
     { state.stepInd=1001;state.token=null;}// exit this execute: error on token recover
//    cb(0,state.token);	// goon with framework event chaining

      // nbnb il chaining si poteva fare anche chiamando il prossimo event con un .emit !!! 
      //      see https://medium.com/finnovate-io/using-event-emitter-to-create-complex-asynchronous-workflows-in-node-js-94a31327d428
      //      questo lo facciamo se esco dallo std che e' seguire la  sequenza ev2

      // nbnb   se ho il token e poi al secondo step openapi fallisce perche scaduto allora annullo il token e resett rilanciando il event connect kkk 
 
  }else console.log('connect(): dont need a rest, token  alredy available: ',token); 
  cb(0,state.token);	// goon with framework event chaining, result is token but just x reporting
  return 1;// what .on returns ?,  anyway if  this.state.stepInd=0 app will restart ev2run loop 
})
  ;

  these.on('openapi', async function (dummy, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
    // await getstat(state.aiax);// the conn cfg data
    console.log(' event openapi fired handler , with input data: ',dummy);
    let state= these.state; // IS OK ???????
    let resu=await getstat(state)//  ={inverter:1.2,battery:2.5};  >>>  do aiax and store results on state.aiax to be used by startcheck
    .catch(error => { // se rejecta questa routine gira :e si torna un resu null !
      console.error('  openapi getstat() catched so results is null ,plant:', state.app.plantname, ',error: ',error);
      // 122022
      //if(error=tokenexpire)do 
      console.error(error);
      process.exit(1);
      //state.stepInd=0;// do restart proc and  login  with a null state.token, so must rest to get it 
  });

  if (resu === null) {// token expired
    console.log(' getstat recover from getstat() an expiered token, so retry execute from null token');


     state.token=null;// will reset
     this.state.stepInd=0;// restart ev2run loop, login will require a aiax token



  } else if (resu === undefined) { // true
    console.error(' getstat aiax result cant be calc ');
    this.state.stepInd=100;// exit from execute procedure
  }else  

  // LOG
  console.log(' event openapi got devices aiax and store results on state.aiax , then  finally returning the global results on cb: ',resu);
    cb(0,resu);// pass data on ev2run input if specified in it, if undefined exit execute (stepInd=100), if null start again (stepInd=0) 
  });

  these.on('weather', async function (dummy, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
    // await getstat(state.aiax);// the conn cfg data
    console.log(' event weather fired handler , with dummy input data: ',dummy);
    let state= these.state; // IS OK ???????
    let resu=await getWeath(state,'https://api.open-meteo.com/v1/forecast?latitude=45.9655&longitude=12.6623&hourly=cloudcover&timezone=Europe%2FBerlin')//  ={inverter:1.2,battery:2.5};
    .catch(error => { 
      console.error('  openapi getstat() catched , probably the token expired for plant:', state.app.plantname, ',error: ',error);
      // .............
  });

  console.log(' event weather store results on state.aiax , then finally returning a global results on cb: ',resu);
    cb(0,resu);// pass data on ev2run input
  });

  these.on('startcheck', async function ( inp_, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
// i should got async data both in state.aiax.inverter....   and in inp={inverter:3.2,battery:0,,}
    let proc,inp;
   
    if(inp_&&inp_.dataArr){// false
      inp=inp_.dataArr;proc=inp_.algo}// ??


    let state=these.state;//this.state;
    if(PRTLEV>5)console.log(' handler fired by event startcheck, with input data: ',inp,' state: ',state);
 
    /* old
    let calc=(st) =>{// returns false if anticipating
      // ............
      return true;
    };*/
    let aTT,res={};// aTT the algo proposal for virtual dev

    if((aTT=anticipate(state,'anticipate0'))&&aTT.length>0){// can be [true, true, true,null, null,true];// [heat,pdc,g,n,s,split] 
                                                            // HHGG so virtual devices of anticipate algo are heat,pdc,g,split
                                                            // algo : null if not anticipating, [pdc,...] if anticipating with its pump setting

      // await   // dont need to wait !
      // attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5])//[heat,pdc,g,n,s,split] val=true/false/null   set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
                                                                  // ?? (pdc,g,n,s)  set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)



      // tuti i real dev non mappati andranno settati null, il che vuoldire che non vengono modificati !!! 
      let map,prel='';


      const consolidateInAttuatorsOnProgramAlgo = true;// must be in this implementation
      if (!consolidateInAttuatorsOnProgramAlgo)
        if (!state.lastProgramAlgo) {// program algo is active !, degegate to progrm the optimized attuators // temporarely !!!
          if (inp.mapping) map = inp.mapping;// sched.mapping
          else map = [0, 1, 2, 3, -1, 5];// // HHGG so virtual devices of anticipate algo are heat,pdc,g,split. stessa cosa che settare identity=[0,1,2,3,4,5]
          // better : attuators works on virtual device 0,1,2,3,4,5 ,  

          //attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5])// [heat,pdc,g,n,s,split] val=true/false/null   set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
          attuators(these)//,map,aTT)
            .then((results) => { // could also await in this async func !

              console.log("attuators() , All setPump resolved");

              // do nothing with results array
              //  resolve(results);  // WARNING :  hopily all it has called :
            })
            .catch((e) => {
              // Handle errors here
              console.error("attuators error: ", e);
            });
        }



      res.execute=prel+aTT.toString();// pass aTT come result of the event  ( ev2run input ?, seems useless)

      // 13062023 : add also some algo var :
      let powerReq=null;
      if(state.anticipate&&state.anticipate.triggers)powerReq=state.anticipate.triggers.FVPower;
      res.data={fv_aiax:state.aiax,potenzaFV:powerReq,daysaving:state.lastAnticAlgo.daysavings}// explains results 

    // register result of the exec procedure!
    //state.lastAnticipating={updatedate:new Date().toLocaleString(),level:1,policy:0,procedure:proc,pumps:aTT};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
                                                // pumps relay set after
//     state.anticipating={date,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
      }else{// aTT returned undefined or null : 
      //  state.lastAnticipating=false;
        res.noexec='noanticipating';// just exit  executing ev2run
        // trim some valves, ex base timetable
      }

      //sendstatus(state);//
      // or directly:
      // io.sockets.emit('status',JSON.stringify(state,null,2));
    
    // cb(0, {execute:endexec});// false : nothing to do 
    cb(0, res);// false : nothing to do 
  });


// end event to process anticipate algo 


// event to process programming algo :

these.on("initProg",// fill tSonda x next event


// todo  from 'connect' schelethon 


// se tolgo async non posso usare await f ma devo usare f().then() 
// >>>>>>>>>>>>>>>>>>><  probabilmente ,on non puo tornare un async func !!!!!!!!!!!!!!!!!!!!!!!!!!
//    or yes but .on returns immediately after got the promise. so goon must proceed with cb    
    async function (inp_, cb) {// ?? only  event type 1, so events that after lauch startcheck, can fire start event to login to openapi. so anyway get token/login


              /* ******    nb  plant is input data , framework say it can be :
                            -a other event output (def in ev2run )
                            - data set in   dataArr.connect
                             nb  dataArr and ev2run are  execute() parameters
                             here we do not need any input, we want to test plant token that is in state :


              */

// use same param like : execute(asyncFunc,that,asyMajorEv,asyProcess, ...args) ? NO

// start == login !
// question what is context , the event manager instance itself ???



let state= 
these.state,
// or : 
// this.state, // IS OK ???????, must be not null , defined in  app2 constructor()/clearState()


  plant=state.app.plantname;// the real input , no dummy !

  console.log(' handler fired by event initProg for plant : ',plant);

// just update status to the  ....? if needed 

let probes , // reads=2,retry=false,
inp;
if(inp_&&inp_.dataArr){inp=inp_.dataArr;//  inp=sched di  prog_parmFact(sched) !
}

    probes={giorno:null,notte:null};// algo works with virtual probs index=0,1,2...  
              // then we map this index i to:
              //    - prob dev iodev.probes_[map[i]]if real=map[i] is >=0 
              //    - a python device of address= (- real )  if is <0
          // probe mappings:
          let map;
          // old : if(inp&&inp.probMapping) old map=inp.probMapping;// [2,4]
          if(state.app.plantconfig.virt2realProbMap)map=state.app.plantconfig.virt2realProbMap;
          else {map=[0,1,2,3,4,5];// identity x modbus probe  map
          console.error('initProg error , probe mapping missing ')
          return null;// stop, exit form execute
        }

// to do   invece di mappare giorno e notte rinominare i programmi 0 e 1 e poi mappare con map[0/1] che sara o l'indirizzo modbus 
//  o il mqtt dev registrato in these/eM/fn.iodev.probes_[map[0]]

let pyInd;

// mappings of probe  :
// algo works on virtual index refearring to gpionumb/mqttnumb pump/var e mqttprob/pythonprob probs/var
// some of pump/var are diplayed on browser as pump list with real index refearring to map[i] virtual index , map filled as 
// real index 0 is associated to giorno probe that is managed by g mqttnumb virtual dev/pump ( index 3)


// ***** remember : (updated on 28092023: index 0 is the state var)
//virt2realProbMap:[x,0,1,-1,-1,-1,-1],  // [some state var,g temp,g humid,n temp,n humidg, s temp,s humid]
// algo works on index virt2realProbMap[1] of :
//  mqttprob
//  or ( if>1000) pythonprob   
//  to find temp probs relating to g, virtual index 2 of gpionumb/mqttnumb pump dev
//  index 3 is the same but relating to n , virtual index 3 of gpionumb/mqttnumb pump dev
// better:
// virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
// algo wants to find mqttprob index of :[state,g temp,g humid,n temp,n humidg, s temp,s humid]
// -1 for undefined


// t night
let vInd=3;
if(map[vInd]<0);// remain null
else if(map[vInd]>=1000){// virtual index 1 refears to probe associated to  virtual pump/dev of index 3 ('n') cioe zona giorno .  usually map is a identity
  // if map[1] <0 mapped to a python dev at index - map[1]
pyInd= map[vInd]-1000;// real i index is mappen on python virtual address these.iodev.pythonprobes_[pyInd])

probes.notte=await getPyProb(pyInd);// 1000 > 0

  }else {// is mqtt registered device
    // todo : read the mqtt input devices (cant write ) stored in fn.iodev.probes_
    // ...
    // probes.giorno=these.iodev.probes_[map[0]]
    // ....
    // NBNBNB     above we got the modbus probe devices just calling a python func , they do not need to be configured/generated in fn.iodev


   probes.notte=await getMqttProb(map[vInd]) ; //  pyInd=map[1]:  real i index is mappen on python virtual address these.iodev.pythonprobes_[pyInd])


}

// t giorno
vInd=1;
if(map[vInd]<0);// remain null
else if(map[vInd]>=1000){// virtual index 0 refears to probe associated to  virtual pump/dev of index 2 ('g') cioe zona giorno
              // if map[0] <0 mapped to a python dev at index - map[0]
    const pyInd=map[vInd]-1000;
    probes.giorno=await getPyProb(pyInd);
  }else {// is mqtt
    // todo : read the mqtt input devices (cant write ) stored in fn.iodev.probes_
    // ...
    // probes.giorno=these.iodev.probes_[map[0]]
    // ....
    // NBNBNB     above we got the modbus probe devices just calling a python func , they do not need to be configured/generated in fn.iodev
    probes.giorno=await getMqttProb(map[vInd])  //  pyInd=map[1]:  real i index is mappen on python virtual address these.iodev.pythonprobes_[pyInd])
  }


async function getPyProb(pyInd){// get python probs device ref
  let addr,ret=null,retry;
if((addr= these.iodev.pythonprobs_[pyInd])!=null){//!== undefined) {
  ret=// 1
  parseFloat(await shellcmd('modbusRead',{addr,register:'temp',val:0}).catch(error => { // val useless
    console.error(' getPyProb() :  addr:',addr,' shellcmd catched ,error: ', error);
    retry=true;
  }));
  if(retry){// 2nd chance
    retry=false;
    ret=parseFloat(await shellcmd('modbusRead',{addr,register:'temp',val:0}).catch(error => { // val useless
      console.error('  shellcmd catched ,error: ', error);
      retry=true;
    }));
  }
}
return ret;
}
async function getMqttProb(ind){
  let dev,curval=null;
  if((dev= these.iodev.probs_[ind])!=null){//!== undefined) {
    console.log('getMqttProb() reading probe val in dev pythonprob index: ',ind);
    curval=await dev.readSync();// 0/1
  }
  return curval;
}
    console.log('  initProg event ,for plant: ',plant,' reading temp , sonda gave:  ',probes);


// probe can read ''  if queue is void !!
if(probes.notte==null||typeof probs.notte=='string'){console.error('  initProg event ,plant: ',plant,' found notte null temp reading probs . should exit , to do some correction(set std 21). probes: ',
probes);probes.notte=21;
}if(probes.giorno==null||typeof probs.giorno=='string'){console.error('  initProg event ,plant: ',plant,' found giorno null temp reading probs . should exit, to do some correction(set std 21). probes: ',probes);
probes.notte=21;
}

cb(0,probes);	// goon with framework event chaining probes={giorno:'19.2',notte:,,,,}
return 1;// what .on returns ?,  anyway if  this.state.stepInd=0 app will restart ev2run loop 
});

these.on('genZoneRele', 

// todo  from openapi and startcheck schelethon 

// openapi :
// .....


// from startcheck :
async function ( inp_, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
                            // inp_= {'initProg':{giorno:19.2,notte:,,,,},
                            //  dataArr(=sched)}         nb sched from  prog_parmFact(sched)
  
  console.log(' handler fired by event genZoneRele , with input data: ',JSON.stringify(inp_,null,2));

                                        /*
                                           inp_={
                                              dataArr: {
                                                programs: { giorno: [Object], ei: 'W' },
                                                probMapping: [ 2, 4, 0, 3, 1, 5 ],
                                                mapping: [ 0, 1, 2, 3, -1, 5 ]
                                              },
                                              initProg: { notte: 20, giorno: 20 }
                                            } 


                                        */
  
  let inp,probes=null;
  if(inp_&&inp_.dataArr){inp=inp_.dataArr;//  inp=sched={programs:{giorno:{'16:10':-3,,,,},notte:{}},probMapping:[],mapping:[],ei:'W'/'S'} 
                                          // giorno'/1:{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}, 

                                          // updateed : 


  }

  let res={},resex=null;
  let  aTT;// virtual devices. each algo will set virtual device. after , in attuators(these,map,aTT), we set real devices mapping virtual into real dev
  

  if(inp_&&inp_.initProg){probes=inp_.initProg;// probes={giorno/119.2,notte/2:,,,,}

  let state=these.state;//this.state;
  if(PRTLEV>5)console.log(' handler fired by event genZoneRele , with input data: ',inp_,' state: ',state);

  /* old
  let calc=(st) =>{// returns false if anticipating
    // ............
    return true;
  };*/
 
  let  aTT;// virtual devices. each algo will set virtual device. after , in attuators(these,map,aTT), we set real devices mapping virtual into real dev
  

    if((aTT=program(state,inp,probes))&&aTT&&aTT.length>0){// set program algo results in lastProgramAlgo
                                          // virtual devices to map are index: 0,2,3,( in future 4)
                                          //  probes={giorno:19.2,notte:,,,,}  
                                          // inp={program:{'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}, 
                                          //  'notte':....},
                                          //  ei;// W/S
                                        //    'mapping':[]}// opzionale
 
 
 
      // old : mappings:
      // algo program has virtual relais [heat,pdc,g,n,s,split]  di cui si agisce solo su heat,g,n e poi s .
      // cha vanno mappati nei real device  del plant .
      // es map[7,-1,5,6,8,-1] significa :
      //  setta il real dev con index 7 come il virtual device di index 0, 
      //  setta il real dev con index 5 come il virtual device di index 2,
      //  ......
      // tuti i real dev non mappati andranno settati null, il che vuoldire che non vengono modificati !!! 
      let map;// OLD not used now , !!!!!!!!!!!!!!!!!!
      if(inp.mapping)map=inp.mapping;// sched.mapping from browser cfg 
      else map=[0,1,2,3,-1,5];// only s is not affected by progrm/anticipate algo 
      


    // callattuators();
    /* moved in callattuators and updated code:
    //attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5])// [heat,pdc,g,n,s,split] val=true/false/null   set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
    attuators(these,map,aTT)


    .then((results) => { // could also await in this async func !, results are  not used
         
      console.log("All setPump resolved");

      // do nothing with results array
    //  resolve(results);  // WARNING :  hopily all it has called :
    // endexec= aTT.toString();// pass aTT on ev2run input, seems useless
    resex=aTT.toString();// in case of void array can be ""
      

    //better add :
    concludi();
  })
  .catch((e) => {
      // Handle errors here
      console.error("attuators error: ",e);
  });
  */
  // just leave:
  resex=aTT.toString();// in case of void array can be ""
  //concludi();


  // old staff:
  // register result of the exec procedure!
  //state.lastAnticipating={updatedate:new Date().toLocaleString(),level:1,policy:0,procedure:proc,pumps:aTT};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
                                              // pumps relay set after
//     state.anticipating={date,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
    

}else{// aTT returned undefined or null : 
    //  state.lastAnticipating=false;
     // endexec='genZoneRele: no action';// just exit  executing ev2run

     resex='noprogramming';
     //concludi();// 21052023
      // trim some valves, ex base timetable
    }

/* concludi();
function concludi(){
  res.execute=resex;// the program algo suggestion : aTT.tostring()
  cb(0, res);// false : nothing to do .  res={execute: aTT.tostring()} // the program algo suggestion : aTT.tostring()}
  }*/

}else {console.log(' handler fired by event genZoneRele , cant process actions because probs are not available!');
resex='probs are not available';
// concludi();
}
await concludi();
async function concludi(){

  // 04062023 now  call attuators also if program algo dont set anything (aTT=null) but anticipate/user algo does:
 await callattuators();
  res.execute=resex;// the program algo suggestion : aTT.tostring()
  cb(0, res);// false : nothing to do .  res={execute: aTT.tostring()} // the program algo suggestion : aTT.tostring()}

  }


  async function callattuators(){// this is the master attuators: put in a algo ends or in a loop algo will consolidate virtual pumps , maps intermediate dev and map into real pumps ,
                            // then if some real dev is not null will call setPump() (so write to state and to device
             
                            
  /* old 
  //attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5])// [heat,pdc,g,n,s,split] val=true/false/null   set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
  attuators(these)// ,null,null)
                  // now attuators will read the map and call consolidate, attuators will write pumps state if some algo are active


  .then((results) => { // could also await in this async func !, results are  not used
       
    console.log("All setPump resolved");

    // do nothing with results array
  //  resolve(results);  // WARNING :  hopily all it has called :
  // endexec= aTT.toString();// pass aTT on ev2run input, seems useless
  
  
  // already called:
  // resex=aTT.toString();// in case of void array can be ""
  // concludi();


})
.catch((e) => {
    // Handle errors here
    console.error("attuators error: ",e);
});
*/

// let result=await attuators(these,session,clientDiscon);// .catch((e) => {
let result=await attuators(these);// .catch((e) => {
  console.log("attuators(): returns consolidate result (program+anticipate+manual algos) :",result);
  res.data={consolidate:result.toString()};
}
// end event to process programming algo 


});
}// ends custom


function repdayly(plant,hin, hout, fn) {// old : prefer checkFactory()
                                        // program timetable of  generic test event firing: fire procedure execute(,'startcheck',,,) with specific event list (ev2run ......) , connect + startcheck,   to perform check to start anticipating
                                        // note that these events must be defined on customOn()
                                        // to do  to start at a time in a day . it will call ececute .. and at every hour 
const d = new Date();
let procName='startcheck'+ d.toString();//d.toLocaleString();


if(PRTLEV>5)console.log(' old (prefer .....) repdayly()  start  procedure ',procName,' fn: ',fn);
  // pprogram the process to call 

 // let evAsyn = {asyncFunc:'',evname1:1,startcheck:0};// {asyncfunc to run in some poins:avalue?,the eventasynctorunin sequence:avalue?}startcheck=1 after updated the status will fire startcheck
let ev2run = {connect:null,openapi:null,weather:null,startcheck:null};// {the eventasynctorun in sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means dataArr data
                                            // here startcheck will fire openapi inside its listener !!!
                                            // OR :
                                            // let ev2run = {connect:null,openapi:null/startcheck;startcheck:null};       openapi will also fill  state var                                   

            /* that means to declare a template listener as FFGG :

              function afunc(inpu,cb){// the .on func ;    evMng.on(evname,func)
                  console.log('ciaoppi',inpu);
                  let result=inpu*100;
                  cb( 0,result);// the return 0 is 
                }

                NBNB   cb will call , as standard, updateData(err,dataresult)


            */


let dataArr=//{begin:0,startcheck:0}; 
//{begin:null,openapi:null,startcheck:null}; 
{begin:null,openapi:null,weather:null,startcheck:null}; 

                                   // ?? // event or processasync key
let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
let processAsync={},asyncPoint={};
/*
alternative way :



to start gfg_Run use :
window.setInterval(function(){ // Set interval for checking
    var date = new Date(); // Create a Date object to find out what time it is
    if(date.getHours() === 8 && date.getMinutes() === 0){ // Check the time
        // Do stuff
    }
}, 60000); // Repeat every 60000 milliseconds (1 minute)


------------------
so :
function gfg_Run() {
  timer = setInterval(callFn_, 2000);
  }
  function gfg_Stop() {
  clearInterval(timer);
  
  }


*/

//let n=5;
  // getstartcheckdata();
  // debug : run now, todo run at hin hur of the day x,y,z,,,      
  
  // was :
 // callNTimes(plant,hout - hin, 20000, fn);// better move : :here  . schedula fn.execute tra un ora e ulteriori hout-hin volte




// :here

  function callNTimes(plant,n, time, fn) {// old staff. start the fv server main event (check periodically the status of fv ctl) : evname=startcheck, asyMajorEv=''
                                          // every time (1 ora) fire a fn.execute()

                                          // to review see: https://www.w3schools.com/jsref/met_win_settimeout.asp
                                          // here n is a closure var , could be passed iteratetivily as param !

    function callFn() {// n-- , se positivo lancia fn.execute e dopo ulteriore ora itera callFn
      if (n--<=0) {
        console.log(' callFn start priodically ',procName, ' procedure is ending, cur time:',pdate().toLocaleString(),' n is: ',n);  
        return;}

      console.log(' callFn start priodically exec procedure ',procName, '.  cur time:',pdate().toLocaleString(),' n is: ',n);
//      n--;
//      console.log(' callFn start priodically procname procedure now, time:',new Date(),' n is: ',n);
      // fn(asyncFunc,asyMajorEv,asyProcess, evname=startchec)k,evtype,evcontingencyparam,evfunc,evdata);
      // better : // fn(asyncFunc,asyMajorEv,asyProcess, evcontingencyparam,evfunc,evdata);
      
      // fn.execute(asyncFunc, asyMajorEv, asyProcess, evname = startcheck, evtype, evcontingencyparam, evfunc, evdata);// check periodically the status of fv ctl)
      //fn.execute(procName, evcontingencyparam, evAsyn,ev2run, evAsync,    processAsync, dataArr)
        fn.execute(procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr,
          () =>{
        console.log(' after execute() we updates state running writeScriptsToFile()')
        //api.writeScriptsToFile(fn.state,fn.state.app.plantname)
        api.writeScriptsToFile(fn)
        .catch(function(err) {// pdate the state file
          console.error(err);
          process.exit(1);
         });



      // asyncFunc,asyMajorEv,asyProcess sono funzioni passate qui per personalizzare eM o usare dati eM per eseguire local process , es leggere un file chiamare un aiax
      // o mandare avanti un process locale come gli stati interfaccia web usando dati parziali o finali (cb) di eM
    //  console.log(' callFn start priodically after execute , time:',new Date());
        setTimeout(callFn, time);
        });
    }




    console.log(' callFn start priodically , time:',pdate().toLocaleString());

    
    //fn.execute(procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr);

     callFn();// can run sync the first  execute because we must end the  event handler startuserplant
    //setTimeout(callFn, time);// schedule tra 1 ora callFn 
  


  }


}

function checkFactory(fn){// fn=ctl, sostituisce repdayly()
                          // closure (private data) and its returning object functions  
                                       

  let timer;
  let execParm;
   
  //const d = new Date();
/*
  //  let{procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
  let procName='startcheck_'+ d.toLocaleString(),algo='base';
  console.log(' checkFactory()  define  procedure ',procName);
  if(fn);else {console.error(' checkfactory() cant find the ctl . stop ');console.log(' checkfactory() cant find the ctl . stop ');}
  
  let ev2run = {connect:null,openapi:null,weather:null,startcheck:null};// {the eventasynctorun in sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means dataArr data
  let dataArr=//{begin:0,startcheck:0}; 
  //{begin:null,openapi:null,startcheck:null}; 
  {begin:null,openapi:null,weather:null,startcheck:{algo}}; 
  let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
  let processAsync={},asyncPoint={};
*/
  
  
    function callFn_(execParm) {// n-- , se positivo lancia fn.execute e dopo ulteriore ora itera callFn

      // {procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr}=execParm
        let{procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
       // let  pdate=new Date();pdate.setHours(pdate.getHours()+dOraLegale);
      console.log(' callFn start priodically exec procedure ',procName, ' for plant: ',fn.state.app.plantname,'.  cur time:',pdate().toLocaleString());//,' this day, after this exec, we run other ',n,' times');
  //      n--;
  //      console.log(' callFn start priodically procname procedure now, time:',new Date(),' n is: ',n);
      // fn(asyncFunc,asyMajorEv,asyProcess, evname=startchec)k,evtype,evcontingencyparam,evfunc,evdata);
      // better : // fn(asyncFunc,asyMajorEv,asyProcess, evcontingencyparam,evfunc,evdata);
      
      // fn.execute(asyncFunc, asyMajorEv, asyProcess, evname = startcheck, evtype, evcontingencyparam, evfunc, evdata);// check periodically the status of fv ctl)
      //fn.execute(procName, evcontingencyparam, evAsyn,ev2run, evAsync,    processAsync, dataArr)
        fn.execute(procName,a,b,  ev2run, asyncPoint, processAsync, dataArr,
          () =>{
        console.log(' after execute we updates state running writeScriptsToFile()')
        //api.writeScriptsToFile(fn.state,fn.state.app.plantname)
        api.writeScriptsToFile(fn)
        .catch(function(err) {// pdate the state file
          console.error(err);
          process.exit(1);
         });
        });
    }
    
    // state of repetition inclosure that is called at
    // let cilesxday,n;

    //function gfg_Run_(dminutes) {// daily job
    //function gfg_Run_(dminutes,period,execParm_) {// nbnb daily job for dminutes in hours , every period in minutes
      function gfg_Run_(cicles,period,execParm_){
      //n=cilesxday;
      execParm=execParm_; // to be used by stopRepeat()
      let n=cicles;//dminutes*60/period;// cicles to do , period in minutes 
      console.log(' repeatcheckxSun :gfg_Run_() called , start day checks,  period in min: ',period,' cicles: ',n+1); //  
    
      // callFn_();
      //n++;
      callF();// 

      if(n>0){// example run from 9 to 12 n=3  so run on 9 19 11 12  , so we run 9 (calling callFn_)ando then more n=12-9=3 time (calling callF)
      let delta=60*1000*period;// convert ms
      if(DEBUG1){delta=delta;n=n}// periodo in  minuti non ore  ??   to correct
      else {delta=delta*60;n=n/60}//if(dminutes&&dminutes>0&&dminutes<24)delta=dminutes*3600000;
      timer = setInterval(callF, delta);//36000000 . run n times every delta millisecond
      }
      function callF(){
        if(n--<0) {clearInterval(timer);// condition before lowering n 
                  // clear algo last res state
                  if(execParm.algo=='program')fn.state.lastProgramAlgo=false;
                  if(execParm.algo=='anticipate')fn.state.lastAnticAlgo=false;
        }else {

          if(true){// debug only
            let {procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
            console.log(' repeatcheckxSun :callF repetition job (n: ',n,') will lauch execute with execParm : {procName, a,b,ev2run, asyncPoint, processAsync, dataArr}, ',execParm,'. procName: ',procName,' dataArr: ',dataArr); 
          }
          callFn_(execParm);
          
        }
      }
    }
         

  
      function gfg_Stop() {// call from .......
      clearInterval(timer);
      }
    let interv;
    return {// object functions 
      repeatcheckxSun: function (hourin, hourout, period, execParm, cb2) {// register the procedure to repeat, period in minutes
        if (interv) clearInterval(interv);
        if (timer) clearInterval(timer);
        //const pdate = new Date();  pdate.setHours(pdate.getHours()+dOraLegale);  //closure with inner callF, the closure state n will be updated till hourout is got !
       
        // console.log(' repeatcheckxSun : start hour ',hourin,' stop hour: ',hourout);                                                 
        let hourinterval = hourout - hourin;// ex  9-8=1  , the testing to do will be 2, one at 8 , one at 9
        let goon, onceaday = true;
        if (DEBUG) goon = true; else goon = false;// debug is true, production = false   , now false !
        if (goon);//;// one day start immediately
        else {

          let min,dd=pdate(); if (DEBUG1) { min = dd.getMinutes() + 2; }//if(min>59)min=min-60;}// start 2 min later
          else min = 0;
          //if(hourin==0)hourin=1;
          console.log(' repeatcheckxSun : at ', dd.toLocaleString(), ' setinterval  handler registering;  minutes to match: ', min, '; hour to match: >=', hourin, '; hourout: ', hourout, ', period: ', period, ', procname: ', execParm.procName);

          let minIn = hourin * 60 / period,// in in minuti normalizzati
            minOut = hourout * 60 / period,// in in minuti normalizzati
            minN = min / period;// additional condition iniziale todo

          interv = setInterval(function () { // Set interval for checking, never stop till the repetion ends 
            let date =pdate() // new Date(); // Create a Date object to find out what time it is   gtm ?
            //date.setHours(date.getHours()+dOraLegale);//dOraLegale);
            let dm = date.getMinutes(), dh = date.getHours();
            if (dh == 0&&dm==0) onceaday = true;

            let
              dateN = (dh * 60 + dm) / period,// present time normlized
              cicles = minOut - dateN;// cicles of period minutes to run execute
              if(cicles<1)cicles=1;// min 

            console.log(' repeatcheckxSun : setinterval  handler called x procName: ', execParm.procName, ',  at hour: ', dh, '(dOraLegale:',dOraLegale,') and minutes: ', dm, '. present time norm: ', dateN, 'must be in: ', minIn, '-', minOut);
            console.log(' normalization in minutes is: period: ', period, ' hourin: ', hourin, ' hourout: ', hourout);

            // if(onceaday&&dh >= hourin && dm == min){ // Check the time to start repetitive task, start from 1:00 to 23:00
            if (onceaday && dateN > minIn && dateN < minOut) { // Check the time to start repetitive task, start from 1:00 to 23:00
              console.log(' repeatcheckxSun : interval match so fire gfg_Run_ repetion job for cicles: ',cicles);
              onceaday = false;
              // run the repetitive procedure
              // hourinterval=hourout-dh;// better then hourinterval=hourout-hourin
              //gfg_Run_(hourinterval,period,execParm);// ex  from 9 to 10, hourinterval=10-9=1 , cicles= 1 hour; so start 1 at 9:00 the other 1 after a hour 
              gfg_Run_(cicles, period, execParm);// ex  from 9 to 10, hourinterval=10-9=1 , cicles= 1 hour; so start 1 at 9:00 the other 1 after a hour 
              // if h_m=true  the span
              // no , next will goon ! :   clearInterval(interv);
            } else console.log(' repeatcheckxSun ************** procedure ', execParm.procName, 'setinterval hndler didnt match the firing condition, it is still to fire: ', onceaday);

          }, 60000); // Repeat every 60000 milliseconds (1 minute)
        }
        return 0;//ok, ??
      },
        stopRepeat:function (){// stop requiredd by client browser
              console.log(' stopRepeat() called . we must reset the runing intervals' );              
              if(interv) clearInterval(interv); 
              if(timer) clearInterval(timer);
              if(execParm){
              //.......correct ???  
              if(execParm.algo=='program')fn.state.lastProgramAlgo=false;
              if(execParm.algo=='anticipate')fn.state.lastAnticAlgo=false;
              }
              /* we call later in ......
              fn.state.anticipate=false;
              api.writeScriptsToFile(fn)
              .catch(function(err) {// pdate the state file
                console.error(err);
                process.exit(1);
               });*/
        }   
  }
}// ends checkFactory

function sendstatus(state){// error: we need the socket that connect to browser !!!!!
  //io.sockets.emit('status',JSON.stringify(state,null,2));// no   , socket.emit...
  let prettyjson=prettyJSONStringify(state, {
    shouldExpand : function(object, level, key) {
        if (key == 'lastT'||key=='TgiornoToll'||key=='probes'||key=='execute'||key=='PMCgiorno') return false;
        if (key == 'doExpand') return true;
        if (Array.isArray(object) && object.length < 8) return false;
        if (level >= 2) return false;
        return true;
    }
});
console.log('sendstatus() pretty is: ',prettyjson);
  io.sockets.emit('status',state,prettyjson);// no good!!!!!!  , use : socket.emit...
}


// async function attuators(fn,session,clientDiscon){//},map_,aTT_){// 04062023  now aTT_ and map are null, so calc aTT using consolidate !!!!
  async function attuators(fn){//},map_,aTT_){// 04062023  now aTT_ and map are null, so we'll calc aTT using consolidate !!!!
  
  
                                  // aTT: the program() algo resuts (after consolidating with anticipate algo and manual set)
                                  //  in attuators(these,map,aTT), we set (calling setPump(i,relaisEv[i],fn)) real devices (i) mapping virtual (if its map>=0) into real dev (of index i=map) 
                                  //                              nb only if the new not null set/value aTT(realindex)  of  real device is changed from its status  state.relays[pump=])
                                  // setPump will then call (eventually ) browser then call:
                                  //                          >>  onRelais   (setta i singoli real device/rele ( index= pump_ e nome pump) e registra in state lo status per nome in state.relays[pump])
                                  //                                 only if the new set/value  of real hw device is changed ! 
                                  // when all setpump promises resolves we cb for event termination setting the execute program algo results : aTT.toString() , see Outerfunction. updateData_ .....
                                  //                          >> the execute result was then stored in "relHistory" state as string!
                                  //                          nb program() algo specific result (before consolidating ) was  stored in lastProgramAlgo obj  as pumps array ! as lastProgramAlgo array 
                                  //					because they need to consolidate all related algo results  when  next algo result is coming


                                // or function attuators(fn,map,aTT){// heat=aTT[0],pdc=aTT[1],,,,,,,,,
  // 
  // ctl,true/false,,,   (heat,pdc,g,n,s,split) si riferiscono ai nomi dei rele nel virtual algo
  // >> in un customized plant avremo dei cust device con indici 0,1,,max 
  // e noi mapperemo ordinatamente i virtual device sui customized index !!!
// we action simulating to push gpio button events
let state=fn.state,relays=state.relays,// the state (null/ true/false) of device displayed on browser (gpionumb/mqttnumb dev in models.js) (true/false)
relaisEv=state.app.plantconfig.relaisEv;// name <> index  for gpionumb/mqttnumb dev


let aTT=consolidate(state,'program'),// this is virtual dev. now all algo works on a single def appDevSpaceGroup and produce the def virtual dev set
                                      // in future can be many groups with some algo working on its group , so aTT will be a array , on wich apply a array of map 

// mapping , use already set in plantconfig/plantcfg, for ex plantconfig :

map=state.app.plantconfig.virt2realMap;// //  iesimo virtual dev is mapped to index= map[i] of name: relaisEv[i], con state:relays[relaisEv[i]])  


console.log(' attuators() : current real custom relays pump state is : ',relays,' VIRTUAL target values : ',aTT,' to map into (if>=0) real: ',map);
if(!map||!aTT)return Promise.reject('cant compute because att and map arent set');
// todo use relaisEv.forEach( ...  and pump_=relaisEv.lastIndexOf(pump);// the index in relais_

// debug:
console.warn('  ?? attention that order in state.relays ',state.relays,' same as fn.state.relays ',fn.state.relays,' can be different from fn.relaisEv ',relaisEv);
// so correct mapping state.relays > fn.relaisEv are done here !
let promises=[];
let i,mmax=aTT.length,mapmax=map.length;
// if(mapmax<mmax)mmax=mapmax;

// LLGGYY  :  write/attuate consolidated aTT to relaisEv dev
  for (i = 0; i < mmax; i++) {// scan virtual rele i-esimo  and apply changes to real rele if index map[i] named  relaisEv[map[i]],  with current state relays[relaisEv[map[i]]]
    let realind;
    if (i < mapmax) realind = map[i];// apply map only if are >=0
    else realind = i;// identity 

    // error on managing mapping virtual> real , so waiting debug :
    realind=i;//anyway till we resolve the bag
                
      if (aTT[i] != null &&// not both null or undefined, the iesimo virtual dev to set on real dev of index map[i]
                             // at present usually consolidate assign true or false to any dev , so we rewrite each time consolidate runs (on a loop ago or program algo )
           realind >= 0 && realind < relaisEv.length &&//  iesimo virtual is mapped to index= map[i] of name: relaisEv[relaisEv[i]], con state:relays[relaisEv[i]])  ,i=-1 means do not map, virtual not used here 
           (forceWrite||aTT[i] != relays[relaisEv[i]])) {// write to dev , also if present state is the same , infact dev can change val in different way 
                      const db = false; if (db) {// debug only , old unused now
                      incong(relaisEv[i], state);// segnala solo se c'e' differenza tra il current state relay value e il reale hw relay value ( cioè letto/read), se c'e quando lo sistemo ??????
                      console.log(' attuators() : just to info that at real index ',i,' current  pump state : ', relays[relaisEv[i]], ' is different from newval to set with  setPump(i,newval,)');
                  }
             
     // promises.push(setPump(realind,aTT[i], fn,session,clientDiscon));// was : promises.push(setPump(i, relaisEv[realind], fn));
      promises.push(setPump(realind,aTT[i], fn));// error realind is really i . was : promises.push(setPump(i, relaisEv[realind], fn));
    }
    else;// anyway se richiedo un set diverso dal corrente cambio il suo valore 

  }



// or wait x all
// return Promise.all(promises);/// returns also when promises=[]
// 12062023  question : must await ?? perhaps just :
// Promise.all(promises).then(()=>  console.log("attuators(): All setPump resolved"););

await Promise.all(promises);  console.log("attuators(): All setPump resolved");/// returns also when promises=[]
return aTT;// the consolidate result



async function incong(pump,state){// segnala solo se il current state (real) pump value is different from the hw relais value !
                                  // attenzione he fa una lettura ulteriore (perdita di performance !)
let value=state.relays[pump];// true/false, pump as recorded on status
let   pump_=state.app.plantcfg.relaisEv.lastIndexOf(pump);// the index in relais_ of real pump
if(pump_>=0){// found
if(fn.iodev.relais_[pump_])// curval=await this.relais_[pump_].readSync();// 0/1
curval=valCorrection(await fn.iodev.relais_[pump_].readSync());// 0/anynumber
else curval=null;//curval=0;
if(!curval||(value&&curval==0)
// ||((!value&&curval==1))
  ){// state value != cur rele value 
console.warn(' bug to fix : attuators(), find pump name ',pump,' state different from current pump position thats: ',curval); 
console.log(' bug to fix : attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
}
}}
}

/*
function attuators_old(fn,map,heat,pdc,g,n,s,split){// or function attuators(fn,map,aTT){// heat=aTT[0],pdc=aTT[1],,,,,,,,,
                                            // 
                                            // ctl,true/false,,,   (heat,pdc,g,n,s,split) si riferiscono ai nomi dei rele nel virtual algo
                                            // >> in un customized plant avremo dei cust device con indici 0,1,,max 
                                            // e noi mapperemo ordinatamente i virtual device sui customized index !!!
// we action simulating to push gpio button events
let state=fn.state,relays=state.relays;
console.log(' attuators() : current relays pump state is : ',relays,' target values (heat,pdc,g,n,s,split): ',heat,pdc,g,n,s,split);

// todo use relaisEv.forEach( ...  and pump_=relaisEv.lastIndexOf(pump);// the index in relais_

// debug:
console.warn('  attention that order in state.relays ',state.relays,' same as fn.state.relays ',fn.state.relays,' can be different from fn.relaisEv ',fn.relaisEv);
// so correct mapping state.relays > fn.relaisEv are done here !
let promises=[];
if(heat!= null &&// both null or undefined
  
  heat!=relays.heat){
  incong('heat',state);// segnala se c'e' differenza tra il current state relay value e il reale hw relay value , se c'e quando lo sistemo ??????
  console.log(' attuators() : as current heat pump state : ',relays.heat,' is different from newval call setPump(0,',heat,')');
  //relays.pdc=
  promises.push(setPump(0,heat,fn));}else;// anyway se richiedo un set diverso dal corrente cambio il suo valore 
if(pdc!= null &&
  pdc!=relays.pdc){
  incong('pdc',state);
  console.log(' attuators() : as current pdc pump state : ',relays.pdc,' is different from newval call setPump(1,',pdc,')');
  //relays.pdc=
  promises.push(setPump(1,pdc,fn));}else;
if(g!= null &&
  g!=relays.g){
  incong('g',state);
  console.log(' attuators() : as current g pump state : ',relays.g,' is different from newval call setPump(2,',g,')');
  //relays.g=
  promises.push(setPump(2,g,fn));}else;
if(n != null &&
  n!=relays.n){
  incong('n',state);
  console.log(' attuators() : as current n pump state : ',relays.n,' is different from newval call setPump(3,',n,')');
  //relays.n=
  promises.push(setPump(3,n,fn));}else;
if(s != null && s!=relays.s){
  incong('s',state);
  console.log(' attuators() : as current s pump state : ',relays.s,' is different from newval call setPump(4,',s,')');
  //relays.s=
  promises.push(setPump(4,s,fn));}else;
  if(split != null &&
    split!=relays.split){
    incong('split',state);
    console.log(' attuators() : as current split pump state : ',relays.split,' is different from newval call setPump(5,',split,')');
    //relays.s=
    promises.push(setPump(5,split,fn));}else;


    // or wait x all
    return Promise.all(promises);



async function incong(pump,state){// segnala solo se il current state pump value is different from the hw relais value !
  let value=state.relays[pump];// true/false, pump as recorded on status
  let   pump_=state.app.plantcfg.relaisEv.lastIndexOf(pump);// the index in relais_
  if(pump_>=0){// found
  if(fn.iodev.relais_[pump_])// curval=await this.relais_[pump_].readSync();// 0/1
    curval=await fn.iodev.relais_[pump_].readSync();// 0/1
  else curval=0;
  if(value&&curval==0||((!value&&curval==1))){// state value != cur rele value 
    console.warn(' bug to fix : attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
    console.log(' bug to fix : attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
  }
}}
}
*/

//function setPump(pumpnumber,on,fn,session,clientDiscon=false){// 0,1,2,3    on : changing value (true/1 or false/0)
function setPump(pumpnumber,on,fn){// 0,1,2,3    on : changing value (true/1 or false/0)



  console.log(' setpump() will emit socket pump event (+ direct onrelays()) to change browser relay value x pump number',pumpnumber);

  let on_,state=fn.state;
  let relaisEv=state.app.plantconfig.relaisEv,
  clientDiscon=fn.getcontext.getCliDiscon();;

  if(!clientDiscon){
  // fn.state.discFromBrow=true;//old to delete.  better : set true only if the sockeck connection is connected !
  // better >>>  warn in contxt that we launch  a server request that is followed by a double req from browser if the client is connected  :
  //            a expiration time out will mantain fn.state.discFromBrow=true; for 2 s. 
  fn.getcontext.discFromBrow=true;// so in eM.getcontext.processBrow return false if fn.state.discFromBrow=true

  if(fn.getcontext.blocking)clearTimeout(fn.getcontext.blocking);// fn.state.discFromBrow : the server req  (onRelais ) is followed by a browswer req : 
  //    so if a previous browser timeout was set , reset it and  reset the interval of browser  blocking 
  fn.getcontext.blocking=setTimeout(()=>{ fn.getcontext.discFromBrow=false ;fn.getcontext.blocking=null},2000);
  }

  console.log(' setpump() just emitted socket  event x pumpnumber',pumpnumber,' asking to set: ',on,' blocking browser confirm ',fn.state.discFromBrow);
  //onRelais(pumpnumber,on_,'server',state);// anyway set directly the gpio relay, in case the browser is not connecte ! 
  if(on)on_=1;else on_=0;// convert true > 1                                         // ERROR : pump not pumpnumber !
  onRelais(relaisEv[pumpnumber],on_,Serv_,fn);// dont wait, WARNING usually called before the duplicate call coming from browser as feedback of previous  pumpsHandler[pumpnumber] call !
  
 if(!clientDiscon)// when client disconnect it useless run function that will emit browser .emit , because no connection is available
  fn.pumpsHandler[pumpnumber](0,on_);// 
                                // its a copy of gpio button relays handler (so we are simulating a gpio button press) that launch socket events
                                 // after set the browser pump flag will return with a socket handler that will call
                                 // onRelais(pumpnumber,on,'browser...',) : the gpio phisicalrelay
                                 // so the gpio relays can be called 2 times !
                                 // see :YUIO
                                          
  
  return Promise.resolve(true);// why return promises ?
}

function setManual (pump_, val, coming,checked,eM)  {// this will be like the final part of a manual algo: propose a single pump value to be evaluater with all other active algo by optimize
                                                    // the proposal evaluated in consolidate() is put in state.lastUserAlgo.pumps
                                                    // val =0/1
                                                    // checked : change scadenza if checked!=0, otherwise reset : val = null
  if (!eM) console.log('error: pump socket event called ,param: ', pump_, val, coming,checked);// to log too
  if (!eM) console.error('pump socket event, eM is null ', pump_, val, coming);


  // console.log(' manualAlgoProposal() called x pump: ',pump_,' set value: ',val,' coming from: ',coming,' ctl is null: ',!eM);
  if (!eM) console.error('manualAlgoProposal(), eM is null , cant process browser old event call');
  if (!eM) console.log('manualAlgoProposal(), eM is null '); else console.log(' manualAlgoProposal(), eM is found ');
  if (eM) {
    let pumps, defTO,// pumps:proposal of user for pumps, not expired if not null
      // defTO[i] default time out  for pumps[i] ??
      state = eM.state; lastUserAlgo = eM.state.lastUserAlgo;

    // recover pumps proposal
    // lastUserAlgo={defTo=[],pumps:[true,false,null,,,],updatedate,policy,algo}
    if (lastUserAlgo && checkval(lastUserAlgo)) {// the current request array is valid , so update the current pump_ request item
      pumps = eM.state.lastUserAlgo.pumps;
      defTO = eM.state.lastUserAlgo.defTO;
    } else {
      pumps = new Array(state.app.plantconfig.relaisEv.length).fill(null);// todo  same length as  relaisEv
      defTO = new Array(state.app.plantconfig.relaisEv.length).fill(null);
      // ?? eM.state.lastUserAlgo=false;// expired !
      eM.state.lastUserAlgo = { policy: 0, algo: "usermanual0" };
    }
    let updatedate = pdate(),debug11=false;
    if (!debug11) state.app.plantconfig.relaisEv.forEach((name, ind) => {// debug11=false : insert new proposal on ind pump
      if (name == pump_) {// update the pump_ item manual value the user want , expiring after a day  
        if (checked != 0) {// if set not change scadenza
          if (pumps[ind] != null) {// there is previous user request for this pump : update it 
            if (val == 0) pumps[ind] = false; else pumps[ind] = true;
            defTO[ind] = updatedate.getTime() + 3600 * 24 * 1000;// scade dopo 24 ore 
          }else{// there was no previuos request so do now . same as above ???
            if (val == 0) pumps[ind] = false; else pumps[ind] = true;
            defTO[ind] = updatedate.getTime() + 3600 * 24 * 1000;// scade dopo 24 ore 
          }
        } else {// if reset cancel previous user request
          pumps[ind] = null;// no requirement from user for this rele
        }
      }
    })
    // similar to:  state.lastAnticAlgo={updatedate:new Date().toLocaleString(),level:1,policy:0,algo,pumps:aTT,model};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand relays to perform a objective; eco,lt,ht,timetable
    eM.state.lastUserAlgo.updatedate = updatedate.toLocaleString();
    eM.state.lastUserAlgo.pumps = pumps;// 
    eM.state.lastUserAlgo.defTO = defTO;

    console.log('manualAlgoProposal(), set the manual proposal on state.lastUserAlgo ', eM.state.lastUserAlgo);

    // instead to call setanticipateFlag(set_,eM,algo,activeAlgoRes);
    // we call directly  anticipateFlag(set_,fn,algo,activeAlgoRes)
    //  anticipateFlag(true,fn,'manual');   or : 
    anticipateFlag(true,eM,'manual','lastUserAlgo');// todo  : manca il call al reset del algo manual : anticipateFlag(false,fn,'manual','lastUserAlgo')

  }


};// 



/*
  from :  https://socket.io/docs/v4/namespaces/

                    Possible use cases:

                        you want to create a special namespace that only authorized users have access to, so the logic related to those users is separated from the rest of the application

                    const adminNamespace = io.of("/admin");

                    adminNamespace.use((socket, next) => {
                      // ensure the user has sufficient rights
                      next();
                    });

                    adminNamespace.on("connection", socket => {
                      socket.on("delete user", () => {
                        // ...
                      });
                    });





                    Client initialization

                    Same-origin version:

                    const socket = io(); // or io("/"), the main namespace
                    const orderSocket = io("/orders"); // the "orders" namespace
                    const userSocket = io("/users"); // the "users" namespace

                    Cross-origin/Node.js version:

  

                    const socket = io("https://example.com"); // or io("https://example.com/"), the main namespace
                    const orderSocket = io("https://example.com/orders"); // the "orders" namespace
                    const userSocket = io("https://example.com/users"); // the "users" namespace







- use of session : https://socket.io/how-to/use-with-express-session

*/





// the node-red namespace :
const adminNamespace = io.of("/admin"),
emittedTokenOnRuotingEntryAvailableOnlyToRecognizedUser={abc:true};//AAZZ

adminNamespace.use((socket, next) => {// https://socket.io/docs/v4/server-socket-instance/#sockethandshake
  // ensure the user has sufficient rights
  const token = socket.handshake.auth.token;// qui non si va a cercare in req session il .user settato da passport ma 
                                            //  si estrae il il auth header del aiax request e poi si valida il token !

let userAutorized=false;

// ggg use models.getPlants();

 if(emittedTokenOnRuotingEntryAvailableOnlyToRecognizedUser[token])userAutorized=true;// il token c'e' perche registrato in AAZZ


if(userAutorized)
  next();else   next(new Error("thou shall not pass"));
});


/* fonti x fare auth :

- handshake can be set in connection stage, the recovered  :  see https://stackoverflow.com/questions/19106861/authorizing-and-handshaking-with-socket-io



      example using query :



            Since Socket.io 1.0 , Although there is backwards compatibility it is recommended to use "io.use()" in order to add your ad-hoc middleware, so in the Node Server side:

            io.use(function(socket, next){
              var joinServerParameters = JSON.parse(socket.handshake.query.joinServerParameters);
              if (joinServerParameters.token == "xxx" ){
                next();          
              } else {
                //next(new Error('Authentication error'));                  
              }
              return;       
            });

            And on the client side, to add your own attribute to the handshake, it would look like this:

            var joinServerParameters = { token: "xxx"   };    
            var socket = io.connect('url' , {query: 'joinServerParameters=' + JSON.stringify(joinServerParameters)  });




        NBNB   io.set is no more used to set socket.auth !!!  , anyway this is old way : 





          io.set('authorization', function (handshake, callback) {
          handshake.foo = 'bar';
          callback(null, true);
        });

        io.sockets.on('connection', function(socket) {
          console.log(socket.handshake.foo); // bar
        });

        nb in user , can recover handshake like that :

            io.use(function(socket, next) {
            var handshake = socket.request;   //// ??????????????????   forse socket.handshake 
            next();});



- https://runebook.dev/it/docs/socketio/middlewares :

                Main namespace

                Until now, you interacted with the main namespace, called /. The io instance inherits all of its methods:

                io.on("connection", (socket) => {});
                io.use((socket, next) => { next() });
                io.emit("hello");
                // are actually equivalent to
                io.of("/").on("connection", (socket) => {});
                io.of("/").use((socket, next) => { next() });
                io.of("/").emit("hello");

                Some tutorials may also mention io.sockets, it's simply an alias for io.of("/").

                io.sockets === io.of("/")

                        >>>>>>>>>>>>>  quindi : io.on = io.of("/").on  =  io.sockets.on

                Custom namespaces

                To set up a custom namespace, you can call the of function on the server-side:

                const nsp = io.of("/my-namespace");

                nsp.on("connection", socket => {
                  console.log("someone connected");
                });

                nsp.emit("hi", "everyone!");

                Client initialization

                Same-origin version:

                const socket = io(); // or io("/"), the main namespace
                const orderSocket = io("/orders"); // the "orders" namespace
                const userSocket = io("/users"); // the "users" namespace

                Cross-origin/Node.js version:

                const socket = io("https://example.com"); // or io("https://example.com/"), the main namespace
                const orderSocket = io("https://example.com/orders"); // the "orders" namespace
                const userSocket = io("https://example.com/users"); // the "users" namespace

                In the example above, only one WebSocket connection will be established, and the packets will automatically be routed to the right namespace.



- https://socket.io/docs/v4/server-socket-instance/#sockethandshake




                      Socket#handshake

                      This object contains some details about the handshake that happens at the beginning of the Socket.IO session.

                      {
                        headers: // the headers of the initial request //
                        query: // the query params of the initial request //
                        auth: // the authentication payload //
                        time: // the date of creation (as string) //
                        issued: // the date of creation (unix timestamp) //
                        url: // the request URL string //
                        address: // the ip of the client //
                        xdomain: // whether the connection is cross-domain //
                        secure:  whether the connection is secure 
                      }

                      Example:

                      {
                        "headers": {
                          "user-agent": "xxxx",
                          "accept": ...,
                          "host": "example.com",
                          "connection": "close"
                        },
                        "query": {
                          "EIO": "4",
                          "transport": "polling",
                          "t": "NNjNltH"
                        },
                        "auth": {
                          "token": "123"
                        },
                        "time": "Sun Nov 22 2020 01:33:46 GMT+0100 (Central European Standard Time)",
                        "issued": 1606005226969,
                        "url": "/socket.io/?EIO=4&transport=polling&t=NNjNltH",
                        "address": "::ffff:1.2.3.4",
                        "xdomain": false,
                        "secure": true
                      }



              nb Socket middlewares
              Those middlewares looks a lot like the usual middlewares, except that they are called for each incoming packet:



                          socket.use(([event, ...args], next) => {
                            // do something with the packet (logging, authorization, rate limiting...)
                            // do not forget to call next() at the end
                            next();
                          });
                          
                          The next method can also be called with an error object. In that case, the event will not reach the registered event handlers and an error event will be emitted instead:
                          
                          io.on("connection", (socket) => {
                            socket.use(([event, ...args], next) => {
                              if (isUnauthorized(event)) {
                                return next(new Error("unauthorized event"));
                              }
                              next();
                            });
                          
                            socket.on("error", (err) => {
                              if (err && err.message === "unauthorized event") {
                                socket.disconnect();
                              }
                            });




              Additional attributes
              As long as you do not overwrite any existing attribute, you can attach any attribute to the Socket instance and use it later:
                            io.use(async (socket, next) => {
                              try {
                                const user = await fetchUser(socket);
                                socket.user = user;
                              } catch (e) {
                                next(new Error("unknown user"));
                              }
                            });

                            // then recover :

                            io.on("connection", (socket) => {
                              console.log(socket.user);

                              // in a listener
                              socket.on("set username", (username) => {
                                socket.username = username;
                              });
                            });



- https://runebook.dev/it/docs/socketio/middlewares

                                      Sending credentials

                                      Il client può inviare le credenziali con l' opzione di auth :

                                      // oggetto semplice
                                      const socket = io({
                                        auth: {
                                          token: "abc"
                                        }
                                      });

                                      // o con una funzione
                                      const socket = io({
                                        auth: (cb) => {
                                          cb({
                                            token: "abc"
                                          });
                                        }
                                      });





                                      È possibile accedere a tali credenziali nell'oggetto handshake sul lato server:

                                      io.use((socket, next) => {
                                        const token = socket.handshake.auth.token;
                                        // ...
                                      });









                              Compatibilità con il middleware Express

                                      La maggior parte dei moduli middleware Express esistenti dovrebbe essere compatibile con Socket.IO, è sufficiente una piccola funzione wrapper per far corrispondere le firme del metodo:

                                      const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

                                      Tuttavia, le funzioni middleware che terminano il ciclo richiesta-risposta e non chiamano next() non funzioneranno.

                                      Esempio con express-session :

                                      const session = require("express-session");

                                      io.use(wrap(session({ secret: "cats" })));

                                      io.on("connection", (socket) => {
                                        const session = socket.request.session;
                                      });

                                      Esempio con passaporto :

                                      const session = require("express-session");
                                      const passport = require("passport");

                                      io.use(wrap(session({ secret: "cats" })));
                                      io.use(wrap(passport.initialize()));
                                      io.use(wrap(passport.session()));

                                      io.use((socket, next) => {
                                        if (socket.request.user) {
                                          next();
                                        } else {
                                          next(new Error("unauthorized"))
                                        }
                                      });

                                      Un esempio completo con Passport può essere trovato qui .





- from https://stackoverflow.com/questions/70931636/how-to-pass-auth-token-while-connecting-to-socket-io-using-postman                              

                                    If want to use socketIO postman. instead of saving token in auth, you can send with header.

                                    const token = socket.handshake.headers.access_token;

*/





adminNamespace.on("connection", socket => {// register emit handlers on 
  console.log(' from node-red  a socket started ***************    todo complete event to manage () stop repeat algo,.....');


let plant=model.getPlant(socket.handshake.auth.token),// token > plant,client 
eM,repeat,// active rep func x anticipate
repeat1;
const listenxeM=function(){// eM is got  by some browser, after node-red client connected

  eM=checkeM();

}

  eM=checkeM();// if the plant is not launched by some browser it is null 




  socket.on("somesubeventodmainspace", () => {
    // ...
  });


  socket.on("message_from_node-red", (payload) => {
    console.log(' from node-red ',payload);
  });



  adminNamespace.emit("message_from_server", "everyone!");

  // adminNamespace.emit()




/*   instead of : 
socket.on('repeatcheckxSun',repeatHandler);// start anticipating algo with setting and run an execute()
function repeatHandler(starthour,stophour,dminutes,triggers) {// called also by ....
  if(!eM)console.error(' repeatHandler(), eM is null ');
  if(!eM)console.log(' repeatHandler(), eM is null ');else console.log(' repeatHandler(), eM is found '); 
    repeat=repeat||checkFactory(eM);// could be find null ???
    if(repeat.repeatcheckxSun(starthour,stophour,dminutes,antic_parmFact())==0)// exit ok 
    setanticipateflag({running:true,starthour,stophour,dminutes,triggers},'anticipate');// store in state the algo launch params (ex: triggers), update state store
    else {repeat=null;
   console.log(' setanticipateflag() not called ');
    }
  }

  :
  */
  socket.on("repeatcheckxSun", (payload) => {

    console.log(' from node-red repeatcheckxSun  event fired with payload ',payload);

    let {starthour,stophour,dminutes,triggers}=payload;

    if(!eM)eM=checkeM();
    if (eM){
    // check if alredy started and wants stop then restart :
    if(eM.state.anticipate)return;// alredy started , so stop before 


    // done before           repeat=repeat||checkFactory(eM);// could be find null ???  DDHH
    if(repeat.repeatcheckxSun(starthour,stophour,dminutes,antic_parmFact())==0)// exit ok 
    setanticipateflag({running:true,starthour,stophour,dminutes,triggers},'anticipate');// store in state the algo launch params (ex: triggers), update state store
    else {repeat=null;
   console.log(' setanticipateflag() not called ');
    }
  }
  });
  



  // helper of onconnection closure :

function setanticipateflag(set_,algo,activeAlgoRes=null){ // store in state the algo launch params (ex: triggers), update state store :
  // state[algo]=.... ex state.anticipate={....}  .
  // if set_=null :  state.anticipate=false
  //    state[algo]=false     the algo init parm are false because the algo is not active
  //    and
  //    state[activeAlgoRes]=false    the last algo result are nullified so dont influence relay set 
  
  // nbnb is a duplicated copy of  other namespace.on() : see AAQQOO  .    !!!! todo do 1 function only 


if(!eM)console.error('.. setanticipateflag() eM is null ');
if(!eM)console.log('.. setanticipateflag() eM is null ');else console.log(' . setanticipateflag(), eM is found '); 
console.log(' setanticipateflag() called to set running algo: ',algo,' init param: ',set_,' , in state.',algo,' ,(if null init parm will also  reset state.',activeAlgoRes);
//if(set_)
anticipateFlag(set_,eM,algo,activeAlgoRes);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)

function checkeM(){// check if eM x plant 
if(started[plant]&&started[plant].inst&&started[plant].inst.init){// eM instance for the plant associated to client , already ready to be used 
  let eM=started[plant].inst;
  if(eM){eM.socketNR=socket;// make available in eM the client socket
  nRWaiting[plant]=null;// no listener is needed
}
  return eM;
}else {// waiting to be activated by some browser

nRWaiting[plant]=listenxeM; // the listener will be call to make available the plant to the nr client 

}
}



});// onconnection ends 



adminNamespace.emit("", "everyone!");// see from .......


// here the body :it wait for a get call connection , then add a gpio button listener to emit event on fv controlle eM   :
// when connected (can be many user browser session ?) add a button and a socket listener
// nb  io.sockets, it's simply an alias for io.of("/")
io.sockets.on('connection', function (socket) {// WebSocket Connection :server is listening a client browser so now we built the socket connection, transmit to server if there are status updates 
                                              // mainspace

let user=socket.request.user ? socket.request.user.username : '';// set user in closure

// here the init x session auth :

console.log('on connection got from a browser with user session set in login, user: ',user,`new connection ${socket.id}`);


socket.on('whoami', (cb) => {// used ?, respond indicating current user to client socket. is needed ? , we can pass user info in specific event emits
  cb(user);// set by passport , send user also at event level , not used
});

const session = socket.request.session;// session used in other tcp request ??, if only socket are used the user is avaible here for all socket connection closure !
console.log(`saving user and sid ${socket.id} in session ${session.id}`);
session.socketId = socket.id;
session.user = user;
session.save();// save socketid



  let eM,//  >>> e' settato da socket.on('startuserplant',...  ed e' legata/propieta del connection handler dove sono def gli socket events es socket.on()
        // poi inserito in socket.eM  , quindi deve essere non usato piu !!!!!!!!!!!!
        
   repeat,// active rep func x anticipate
  repeat1,// active rep func x temperature programmer
  clientDiscon=false;

  // define the listener :
  socket.on('startuserplant', function (plant_,feat) { // user press button to connect to some plant, so this event is fired , feat url enc
                                                      // inst/fn/ctl/eM :  here we create the ctl of the plant that will be passed to all the service functions 
                                                      // todo : emit login screen x user=data
    const feature = feat.split(",");// ex:'feature1,feature2'
    console.log('event startuserplant listening handler for plant ',plant_,' feature: ',feat,', user ',user,', socket id ',socket.id);

    if(plant_){
      // accept plant x user 
      let plantD=model.getplant(plant_);// better then using state that could not still defined 
      if(plantD&&plantD.users.indexOf(user)>=0)
      console.log(' startuserplant , plant ',plant_,' authorized user ',user,', socket id ',socket.id);
      else{ console.log(' startuserplant , user ',user,', not authorized x plant ',plant_ ); 
        return
      }
    }else return;


    // user login or just the plant name in some html field + button start that will fire event startuserplant
    let user_ = user,// the user is the passport user set in session/req.user when (in closure) the client ask a ws connection to server
   plantcnt=model.ejscontext(plant_),// ejs context=plantcnt={pumps:[{id,title},,,,]}
    plantconfig=model.getconfig(plant_),// 
    plantcfg=model.getcfg(plant_);// get plant cfg from available pool. : return plants[plant].cfg;
    // todo if(plantcfg&&...)

    // changed on 03062023 eM = ccbbRef(plantcfg.name);
   //  socket.eM = ccbbRef(plantcfg.name);// ** il fsm recupera/crea un siglethon x plant , state to be updated with recoverstatus()
    let recInsts = ccbbRef(plantcfg.name);
    eM = recInsts.inst;
    repeat=recInsts.repeat;
    repeat1=recInsts.repeat1;

    // reset the context = this closure (socket.on('startuserplant',closure)) 
    // must be nullified when socket disconnect so closure can be garbagecollected 

    eM.getcontext={// to make available this closure var to setPump,.....
                  // probably must nulllified when socket disconnect clientDiscon=null, instead to pass clientDiscon !
      getSession:function(){return session;},
      getCliDiscon:function(){return clientDiscon;},
      processBrow:function(){
        if(this.discFromBrow)return false;// discard processing the browser req
        else return true;},
      discFromBrow:false

    }


    // error here eM is the closure so it il like a object static property available at every func call 
    // but eM was now in the closure set by last   socket.on('startuserplant' and 
    // could be from a different socket ( so different connection) and the set was according with user connected and the plant it requested
    // > do we must be sure that we are working on same connection ( or same user (+ same plant))
    //  so according from .... we are better set eM on the socket itself !!!
    //    but really the eM instance ,
    //    when a handle of same kind like socket.on('repeatcheckxSun',handler)) require eM,
    //     can recovered because is already registered (and still run) using its plant name by this 
    //    socket.on('startuserplant',    from a socket that required the plant 
    //    but socket like that can be from any conncetion with a user abilitated on the plant
    //      so 2 different user abilitated on same plant can connect and on its socket load/recover the same eM on its socket but the socket can be different !!!
    //      quindi ci pou essere un socket che registra l'istanza eM, sotto il plant name, in started of 'onconnection' handler/closure
    //      poi un altro user vuole recover il plant e vede se è stato registrato sotto started e se lo trova setta eM sul suo socket !!!
    //        ora i due client chiameranno event handler che potrebbere essere in competizione quindi dopo un recover non permettere ad atri di recoverare 
    //        >>>> usare flag 'plant alredy managing by a auth user', in un field started.alredymanaging=true ma così il  problema diventa ......  
    //                quindi per ora immaginare un solo user abiliato a maneggiare un plant !! e se mi logono su 2 diversi socket allora il secondo trova il started.alredymanaging=true
    //                e quindi rejecta il secondo socket !!! o direttamente al login vedo che e' gia logonato !
    
    if(eM)console.error('startuserplant , eM is built/recovered from pool ');
    if(eM)console.log('startuserplant , eM is built/recovered from pool ');
    eM.socket=socket;// update/embed the socket to connect the last browser client: todo check only 1 browser pointing to  a eM

    // UUYY add here (or in instance constructor ???)

    

    if (eM) {
     // startfv_(eM,user);// ** start/update singlethon 
     recoverstatus.call(eM,plantcfg,plantcnt,plantconfig,feature).then((em_) => startfv_(em_,oncomplete_)); // >>>>   recoverstatus() returns a promise resolved. we finished to write status back with promise .writeScriptsToFile
                                                                    // ctl event status: in eM.state 
                                                                    // socket in eM.socket
                                                                    // plant cfg in eM.status.plantcfg, 
                                                                    // dev i/o still to build 
                                                                    // will cb startfv_   // TTGG  // why do not use eM invece di passarlo come em_ ?
                                                                    //recoverstatus_.call(eM,user.name).then((em_) => startfv_(em_));// will cb startfv_
// load also ejs context x future use :


     const oncomplete_= function oncomplete(){

     // DANGER  :::   here state could not jet be recovered by previous promise !!!!
     //     so , it is really dangerous ? we just add properties to state 
     let state=eM.state;


     displayView(eM.state.app.plantconfig.relaisEv,state);// return emitting event 'view'  to browser
                                  // was in abilita2() 


     if(eM.reBuildFromState){// we got status in persistance, so start the active algo that was running 
     
      // restart the active algo as state.anticipate  tells
     // same handler that : on('repeatcheckxSun',(starthour,stophour,hourinterval) );
     
     
     if(state.anticipate){
      let {dminutes,starthour,stophour,triggers}=state.anticipate;
      console.log('event startuserplant loading the repeating procedure from state.anticipate:  ',state.anticipate);

      // same handler that : socket.on('repeatcheckxSun', );
     repeatHandler(starthour,stophour,dminutes,triggers);// restart anticipate algo according to last launch data, and rewite the state alredy wrote by TTGG  

     }
     // 
     if(state.program){
      let {dminutes,starthour,stophour,triggers2}=state.program;
      console.log('event startuserplant loading the repeating procedure from state.program:  ',state.program);

      // same handler that : socket.on('repeatcheckxSun', );
     repeatHandler1(starthour,stophour,dminutes,triggers2);// restart program algo according to last launch data, and rewite the state alredy wrote by TTGG  

     }
     eM.reBuildFromState=false;// reset now the ctl has the procurure loaded on closure checkFactory()
     }
    }
    }
    return;// thread ends
  });// ends on('startuserplant'
// });

  function startfv_(eM,cb){// entry point when status is recovered from file   // // why do not use eM invece di passarlo come em_ ?
                        // and applied to update eM.state
  
    let plant=eM.state.app.plantname;// or app.plantcfg.name

    // user=plant;todo recuperare da status ?? no gia sistemato col event 'whoami' see DDWW
    let plantconfig=eM.state.app.plantconfig;
    // todo
        // inserire qui la config del plant model che riguarde i pumps/devices in questa app, che nella precedente implementazione veniva fatta a priori nella app al init.
        // infatti ora tale build (la config dei devices/pumps viene fatta dopo che e' individuato il plant)
        // per quanto riguarda invece i execute che agiscono sul plant , se si vogliono personalizzare :
        //  - ci sara da aggiungere una parte che configura tali execute in base al plant 
        //    scegliendoli da un pool generale !
    
      // let getconfig= model.getconfig(plant)=// general obj to customize the  app functions , 
      // let getconfig= getconfig_(plantcfg),// general obj to customize the  app functions , 
                                      //  = {gpionumb:users[user].cfg.gpionumb,
                                      //    mqttnumb:users[user].cfg.mqttnumb,
                                      //    relaisEv:users[user].cfg.relaisEv,
                                      //    devid_shellyname:users[user].cfg.devid_shellyname
                                      //  }
                                      // 
    let{gpionumb,mqttnumb,mqttprob,relaisEv,devid_shellyname,mqttWebSock}=plantconfig;
let pythonprobs=   [...plantconfig.pythonprob];
if(PRTLEV>5) console.log('startfv_(), got pythonprob cfg .',pythonprobs);

const keepDeviceDef=true;// is true, try false
 if(keepDeviceDef&&!eM.init){// eM is not initiated (non recovered from started[name] )
 //  abilita(eM.state);//// abilita sezione gestione eventi ( relais_)  plant nella pagina
 abilita(eM.state).then((devices)=>{ 

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><   todo   devices > {relais_:[],probes_:[]}// probs are input devices with only syncread() , can be mqtt or modbus

  abilita2(devices); eM.init=true;
  if(nRWaiting[plant])nRWaiting[plant]();// call the nr listener to add plant eM to node-red socket closure
  nRWaiting[plant]=null// reset

  //startfv(eM,session);})// ** call setPump to allineate pump state to state.relays
  startfv(eM);})// ** call setPump to allineate pump state to state.relays
// .catch();
 }else{
 // startfv(eM,session);// ** call setPump to allineate pump state to state.relays
  startfv(eM);// ** call setPump to allineate pump state to state.relays
 }

  // put here code that can be done waiting the devices resolution !
  // ................

//  }
      // DDWW nb con l'evento 'whoami' la pagina browser dovrebbe aver gia recepito lo user che sta chiedendo la gestione del plant
              //    todo:
              //         in tale .on('whoami',,) creare un session nel spa browser ( un obj) che ricorda alla spa lo user creato con passport che viene
              //          - gia passato nel session del req (req.session.user  o req.user )  per il server ( che al event 'connection' manda appunto il whoamI al browser e stora nel closure il user)
  function    // configura il plant nella pagina per recepire la configurazione storata in state.app.plantcfg.name

  abilita(state){// plantcfg=               . build devices . gpio or mqtt


// let ejscont=state.app.plantcnt;// ejs context=ejscontext(plant).pumps=[{id,title},,,,]
                                  // getejscon(plantcfg);// noe the pumps view are generated from html and not using ejs !!!!
// moved here , right location ?



return buildPlantDev();


async function buildPlantDev(){// build here the plant ctl devices (ctl/eM/fn).iodev.relais_ dev/pumps (+ /button switch) and their handlers 


// start building relais_ the dev io ctl  
// start mqtt connection :
let mqttInst;//
// register gpio 11 as mqtt device and try connecting
if(!(mqttInst=mqtt.init(plantconfig))){// 02052023: now work with instance not the class , must be passed to getio.js , and  something else ? ....
                                            // devid_shellyname={11:'shelly1-34945475FE06',,}
                                            // AAFF :temporaneamente use shelly 1 std, so after start mqtt connection  wait connection and subsribe all gpio , 
                                            // so  as soon cb is called we have status[gp]=[] (the subscription is ok )
  console.log(' fv3():mqtt client not available, exit/continue without the mqtt dev,  or retry connection to mosquitto');
}
 
/*
eM.iodev={relais_:[],// the io dev ctl list , their name are in relaisEv array. if null the ctls func (readSync and writeSync ) wont be called 
//gpionumb=gpionumb||[12,16,20,21,26,19,13,6];mqttnumb=mqttnumb||[11,null,null,null,null,null,null,null];
// methods, no attuators ,
probes_:[]// read only sensor or state var in mqtt persistence
}*/

// GGTTFF
eM.pumpsHandler={}; // not the super . the app can have many browser connected each one with its handler to manage the update of the browser
   //  only one plant will have the button handler set  as its pumpHandler !!! so set a flag the first plant get the button association end the other nothing !
eM.iodev={};

// using getio,  call old getctls(gpionumb,mqttnumb);

  // getio(gpionumb,mqttnumb).then((cts)=>{
  //.iodev.relais_=cts;run();});}// load in ctl the oparational available dev i/o

// must await it !
// eM.iodev.relais_= await getio.getctls(gpionumb,mqttnumb).ctls;
// let devices= await 
let myctls,myprobs;
myctls_= getio.getctls(mqttInst,gpionumb,mqttnumb,false,mqttWebSock);// get devices choosing from describing gpio and mqtt info array : these are the visible rele/var in browser
                                          // promise resolving into : {ctls:[ctl1,,,,,],devmap:[{devNumb,devType,portnumb},,,,]}
                                          // get pump/relais r/w devices from preferred  mqtt or gpio arrays
myprobs_= getio.getctls(mqttInst,null,mqttprob,true,null);// promise resolving into :   {ctls,devmap} , true = a probe/var device. invisible in browser
                                            // get probs  read only devices from  mqtt, true means is a probe type (type='in')
                                            // + get var, intermediate status / context to be used by other algo , connectable to red note


return   new Promise(function(resolve, reject) {
myctls_.then(
  (ctl1)=>{
          myprobs_.then((ctl2)=>{// all resolved
                                resolve({myctls:ctl1,myprobs:ctl2,pythonprobs});// DDQQAA
  });
}
)
});

}// ends buildPlantDev
  }// ends abilita

function abilita2(devices_){// {myctls,myprobs,pythonprob} // DDQQAA
  let devices=devices_.myctls,// 
                                /* 	  	  	   	devices={
                                                          ctls:[ctl1=new fc(gp,ind,inorout,cfg)= 	
                                                                  {gpio=11,
                                                                  devNumb=0,// array index 0,1,2
                                                                  type=inorout,
                                                                  cfg,
                                                                  cl=1(clas='out')/2(a var)/3(clas='in'OR'prob'),
                                                                  isOn,
                                                                  readsync,
                                                                  writesync}
                                                                  ,ctl2,,],
                                                          devmap:[{devNumb,devType,portnumb},,,,]}  
                                */
//eM=socket.eM,

      probes=devices_.myprobs;// 
console.log(' buildPlantDev(),got dev ctl');
eM.iodev.relais_=Array(devices.ctls.length).fill(null);// fill relays/pump  list in browser , inorout='out' cioe out capable
eM.iodev.probs_=Array(probes.ctls.length).fill(null);//  inorout='in-var'
                                                      // in algo triggers frame we assign the probs to use for each input used by algo ,  
                                                      // ex : the number 2 (night)program schedule use the 2nd registered probe models , 
                                                      //    that is the shelly dev number mqttprob[2] or mqttprob[2-1]  
eM.iodev.pythonprobs_=devices_.pythonprobs;// just copyed from models !  pythonprobes_

let state=eM.state;
state.devMap=Array(devices.ctls.length).fill(null);
state.probMap=Array(probes.ctls.length).fill(null);

/*devices.ctls.forEach((mdev,index)=>{
  if(mdev){eM.iodev.relais_[index]=mdev.ctl;
    state.pumpMap[index]=devices.devmap[index].portnumb;// just to make easy the debug
  }
});*/
builddev(devices,eM.iodev.relais_,state.devMap,0);  // reset pumpsHandler[ind], to call browser socket  emitters x pumps
                                                    // transform devices={devmap,ctls} >>  state.devMap eM.iodev.relais_  : the ctl of  relays listed in browser , whose name is in relaisEv , index 0..relaisEv.length-1
                                                    //                                                                       and the ctl of dummy dev with portid=0 and index >=relaisEv.length 

builddev(probes,eM.iodev.probs_,state.probMap,1); //                                      state.probMap eM.iodev.probs_   : will be used 
                                                //                                                                        - in events like these.on("initProg", and these.on('genZoneRele',
                                                //                                                                          looking at its input set in the exec  builder prog_parmFact(sched) :
                                                //                                                                              let dataArr={
                                                //                                                                              initProg:{dataArr:sched},// std input dataArr coming from probSched={ mapping:[4,2]}
                                                //                                                                              genZoneRele:{dataArr:sched}}
                                                //                                                                                  nb consumed in the events as sched.mapping   and sched.probMapping

                                                //                                                                          called by event socket.on('startprogrammer',repeatHandler1);
                                                //                                                                            where from input coming from browser (triggers2) we get the 
                                                //                                                                              sched.probMapping=toeval(eM.state,triggers2.probMapping);// mapping algo vars to plant devices !, input used when call last event genZoneRele of related exec created with prog_parmFact(sched)
                                                //                                                                              sched.mapping=toeval(eM.state,triggers2.mapping); //  = [0,1,2,3,4,5]
                                                //                                                                                   where sched.probMapping is filled in probemapping input where usually also set state.probmapping 
                                                //                                                                                   where sched.mapping is filled in devmapping input where usually also set state.devmapping 
                                                //                                                                            
                                                //                                                                        - to store/write or get/read intermediate var status connectable to node red

function builddev(devices,ct,map,type){// fill obj map with dev id/port (see models.js) + fill ctl  in ct[index of devices], ct can be  iodev.relais_ or iodev.probs_  
                                        // copy dev ctl of devices e probs into  ct=iodev.relais_  e iodev.probs_
                                        // fill map with the dev portid
devices.ctls.forEach((mdev,index)=>{
  if(mdev){ct[index]=mdev;
    map[index]=devices.devmap[index].portnumb;// just to make easy the debug, for ever index we know the portnumber of the model assocated device
   if(type) console.log(' builddev(), device of type probe , id/port ',map[index],' was added on ctl.iodev.probs_, on index ',index);
   else console.log(' builddev(), device of type relay , id/port ',map[index],' was added on ctl.iodev.relais_, on index ',index);
  }
});}


console.log(' buildPlantDev(),got dev ctl list: ',state.devMap);
// ???????????????????????
// run();// load in ctl the oparational available dev i/o


if(relaisEv.length>eM.iodev.relais_.length)console.error('buildPlantDev() : managed dev relaisEv are more then avalable devices .iodev.relais_ ! plesa abort ')
  // implements also a button/algo handler array for actuators / pumps

  // GGTTFF
let pumpsHandler=eM.pumpsHandler; 

  relaisEv.forEach((pump,ind) => {// ex: pump='pdc', ind=2
                                // will for each numbSubscr dev :
                                // - add  socket event to sync raspberry buttons and web button
                                // - set interrupts on dev ctl iodev.relais_
    
if(!eM)console.error('event connection setting hw button , eM is still null ');
if(!eM)console.log('event connection setting hw button, eM is still null ');

// to do check the relais are not alredy set to other plant/eM
pumpsHandler[ind]=watchparam(pump);// handler for actuators, each (button )handler emit the socket.emit('pump' to browser to update the visibile relay flags 

if(relais&&relais[ind])relais[ind].watch(pumpsHandler[ind]);// attach same handler watchparam(pump) to all gpio pump  buttons 
                          // that handler works also x algo handler called in attuators/setpump   ex pumpsHandler[0](err,value) 0 means pdc pump

// set interrups : now do the same for mqtt interrupts for var dev updating  and rele dev , cl = 1 e 2 , no cl 4

if(eM.iodev.relais_[ind]&&eM.iodev.relais_[ind].cl&&(eM.iodev.relais_[ind].cl==2||eM.iodev.relais_[ind].cl==1)){// the dev is a mqtt var , see VVCC in howto

  // define interrupt handler for hadling cmd topic topicNodeRed in cl 1 e 2 
  eM.iodev.relais_[ind].int0=Inter0;// handler point to setPump()
  eM.iodev.relais_[ind].int1=Inter1;// handler point to setManual()
    
    function Inter0 (val='0',queue,lastwrite){// the int func . 25052023 val is '0' or '1' > error !!!  .  call setPump !

    let isOn=val==1,isoff=0;
    console.log(' abilita2 interrupt Inter0 : receiving   var ',pump,', msg val (0/1) : ',val,' , actual status is :',state.relays[pump],' , queue is :',queue,', lastwrite (true/false) was ',lastwrite);
    // idea just interrupt if is different then state.ralays[dev]!
    let val_;
    if(!Number.isNaN(val_=Number(val))){// val is conveted to integer

      if(val_==0) ;else val_=1;
  console.log(' abilita2 interrupt : fire interrupt to change value : ',val,' so we change val as ',val_,' , on dev ',pump);
 //   setPump(ind,val_!=0,eM,session,clientDiscon);// return a promise , ok ?? val=0,1
    setPump(ind,val_!=0,eM);// return a promise , ok ?? val=0,1
      // <<<<<<<<<<<<    would be better call user algo ( manual set ) ?

    } else console.log(' abilita2 interrupt : fire interrupt to change value : ',val,' but was not a string number so discard .  , on dev ',pump);
  }

  function Inter1 (val=0,queue,data){// url='setMan', (val,checked,queue,lastwrite){// the int func . 25052023 val is '0' or '1' > error !!!  . call setManual
                                      // 25052023 val,checked is 0 or 1   . call setManual
                                      /* {payload: 1,
                                          sender: {
                                            plant: "Casina_API",
                                            user: 55,
                                          },
                                          url: "setMan",
                                          checked: 1,
                                        }*/
  
  let val_,checked_;
  //  if(!Number.isNaN(val_=Number(data.val))&&!Number.isNaN(checked_=Number(data.checked))&&data,val&&data.checked){// val='0','1'  . checked='0','1'
  if(!isNaN(val_=data.payload)&&!isNaN(checked_=data.checked)){// payload is integer, so checked : if is not 0/1 or '0'/'1'
   
    console.log(' abilita2 interrupt Iter1 : receiving   var ',pump,', msg val (0/1) : ',val_,'  checked : ',checked_,'  , actual status is :',state.relays[pump],' , queue is :',queue,', data was ',data);

      if(val_==0) ;else val_=1;// ok funzione sia con 0 che con '0'


  console.log(' abilita2 interrupt : fire interrupt to set/unset : ',checked_,' Manual Algo with value : ',val_,' , on dev ',pump);

  //    setPump(ind,val_!=0,eM);// return a promise , ok ?? val/checked=0,1
  setManual (pump, val_,"ext cmd",checked_,eM);// val_ /checked_ =0/1
    } else console.log(' abilita2 interrupt Inter1 : fire interrupt to change value : ',val,' but was not valid message to process .  , on dev ',pump);
  }

  // set other int handler for different income msg :
  // eM.iodev.relais_[ind].int1= .....



}



});

// now find and process the 'int' dummy dev to set a interrupt handler that map the topicNodeRed to websocket handler

let mqtt2webS;
for(let ii=relaisEv.length;ii<eM.iodev.relais_.length||!mqtt2webS;ii++){// relais_ contain the int dummy dev with index>=relaisEv.length (usually =)
  if(eM.iodev.relais_[ii].gpio==0)mqtt2webS=eM.iodev.relais_[ii];// the ctl , dev dummy with gpio=portid=0, that read from mqtt node-red like cmd 
}
if(mqtt2webS){
  mqtt2webS.intWebSoc=intWebSock;// handler point to setManual()
 
  
}



function intWebSock(val=0, devqueue, message){// val=0/1, the int handler of a formatted request serving url mqttxwebsock
  // old : message='{"payload":1,"sender":{"plant":"Casina_API","user":xx,"token":yyy},"url":"mqttxwebsock","event":"repeatcheckxSun","data":{theeventhandlerparams=starthour,stophour,dminutes,triggers)}}' 
  // message={"payload":1,"sender":{"plant":"Casina_API","user":77},"url":"mqttxwebsock","event":"repeatcheckxSun","data1":[1,23,2,{"FVPower":30}]} 
  let mevent=message.event,param=message.param,startAnt=false,startPgm=false;
  state=state;// TODO :  recover state for this active user plant that registered the mqtt dev topic , 
  //                    better validate the token to avoid a different user having the mqtt broker access send a mqtt pub to a different user topic dev 
  // the user auth staff is in ..........................
  let xstart,xstop,xmin,data=message.data;
  if((mevent)){

  if(mevent=="stopcheckxSun"){
    console.log('intWebSock() stopping anticipate Algos');
    stopRepeat();

  
    }else if(mevent=="stopcheckxPgm"){
      console.log('intWebSock() stopping program  Algos');

        stopprogrammer();
    
    }else if(mevent=='repeatcheckxPgm'&&(data)&&(xstart=data[0])&&(xstop=data[1])&&(xmin=data[2])){
      
      startPgm=true;
    }else if(mevent=='repeatcheckxSun'&&(data)&&(xstart=data[0])&&(xstop=data[1])&&(xmin=data[2])){
      
      startAnt=true;
    }
        if(startAnt){
          if(state.anticipate==null||!state.anticipate)// dont run alredy
        {
          console.log('intWebSock() starting anticipate  Algos');
          repeatHandler.apply(this,data);// pass data array as params
        }
      }
      else if(startPgm){
        if(state.program==null||!state.program)// dont run alredy
        {
          let triggers2={};triggers2=message.data[3];// only "PGMgiorno" : { "8:30" : 27, "17:00" : 30 },
          // recover using previous sets and recoverd in .data
/*
                                                                        "triggers2" : {
                                                                          "Tgiorno" : true,
                                                                          "PGMgiorno" : { "8:30" : 27, "17:00" : 30 },
                                                                          "Tnotte" : false,
                                                                          "PGMnotte" : { "notte" : { "8:30" : 20, "17:00" : 22 } },
                                                                          "lastT" : ["21/08/2023, 09:33:23", { "notte" : 23.8, "giorno" : 24.3 }],
                                                                          "mapping" : "==&&state.devmapping=[0,1,2,3,-1,5]",
                                                                          "probMapping" : "==&&state.probmapping=[2,4,0,3,1,5]",
                                                                          "ei" : "S"
                                                                      }
*/   
if(triggers2&&triggers2.PGMgiorno){ 
  triggers2.mapping="==&&state.devmapping=[0,1,2,3,-1,5]";
  triggers2.probMapping="==&&state.probmapping=[2,4,0,3,1,5]";triggers2.ei=message.param.ei||"S";triggers2.Tgiorno=true; 
  console.log('intWebSock() starting program  Algos');                                              
// setTimeout(()=>{ repeatHandler1(xstart,xstop,xmin,triggers2);},1500);
repeatHandler1(xstart,xstop,xmin,triggers2); 
}}
      }

}else console.log(' intWebSock() cant find a handler for mevent ',mevent);

}

// moved : displayView(relaisEv,state);

    // socket.emit('status',,,) .on('status',)
  }// ends abilita2()
  cb();
  }// ends startfv_

  function displayView(plantconfig,state){
    relaisEv=plantconfig.relaisEv;
    scope={relaisEv}// pass the part of plantcfg che interessa lo spa nel browser , to config pumps in html js  after  emit('view',,)
    //was : ejscont=model.ejscontext('luigi')// to generate pumps list in html after  emit('view',,)
    
    let ejscont=state.app.plantcnt;// ejs context=ejscontext(plant).pumps=[{id,title},,,,]
        // view the relays input on browser , see there the def of context ={ejscont,scope}
        let context={ejscont,scope};
        socket.emit('view', context); // nb .on('pump',,) can be not jet assigned 
        console.log('event startuserplant : abilita(). it is  emitting socket event view, user plant is: ',plantconfig);
    }

  var lightvalue = 0; //static variable for current status

  // set local gpio relay to some button on web page, web page will emit a socket event 'light' that will in this server activate
  // the gpio port

  if(pushButton)pushButton.watch(function (err, value) { // detail : Watch for io hardware interrupts on specific pushButton  on raspberry only 
                                            // to review , see also staff/webserver07112022.txt

    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    socket.emit('light', lightvalue); //fire event 'light' handled in browser send button status to client, if available
    if (lightvalue == 1) {
      // anyway send server info about new event to process
    //   eM.emit('button', lightvalue);// utton pressed event, or a new status var value to set
      // todo  implement button handler !
      //buttoncaused = true;
    }
  });

  function watchparam(pumpName){// the handler emit the socket.emit('pump' to browser. handler for all pump gpio button >>> using a closure is a bit forcing , probably one more param is enougth
                                        // >> pumpName in relaisEv
  return function watch (err, value) { // :YUIO   the handler 
                                      // - Watch for io hardware interrupts ( manual pumps Button ), 
                                      // we watch also (these handlers are put in the bank pumpsHandler[ind]  called by setPump(pumpnumber,on) ): 
                                      // - Anticipating algo that also can trigger pumps updates 
                                      // >>> emit/fires socket events pumpName
                                      // remember that those events  are handler  in browser .on()
                                      //          -.on() updates gui button then return/pass  pumpName event back to server
                                      //              pumpName event will call    onRelais(pump,data=true/false) to command the relays gpio
                                      //                                                      using relais_ gpio
                                      //                      see : socket.on(pump,onRelais);  pump==pumpName
                                      //            >> anticipating algo in setPump(pumpnumber,on) anyway will also launch onRelais(pump,data=true/false) in case the bwowser page in not (socket) connected
                                      //                so if the browser is connected the set gpio relay function will be called two times  with same value !!
                                      //      >>>> server handler commands pump relais 
    if (err) { //if an error
      console.error('on activating pump: ',pumpName,' There was an error', err); //output error message to console
      return;
    }
    console.log(' watchparam ( server button handler, called also by algo activated setPump() ) : it is firing a socket event pump for pump: ',pumpName,' so in browser well set pump flag : ', value); //output error message to console
    lightvalue = value;
    socket.emit('pump',pumpName, lightvalue); //send button status to browser client, if available  
                                                // >> pumpName in relaisEv
                                                 // accoppiato con onrelais  
                                                 // **********************************
                                                 // >>>>   .on('pump)  can be not set , till browser ask to connct to this plant !!!!!!!!!!!!!!!


    /*   >>>>>>>>>>>>>>>>>>  todo : nb like light is better impleent a callback to server to set state.relais=[0,0,0,0]
    instead of:
    if (lightvalue == 1) {
      // anyway send server info about new event to process
      eM.emit('button', lightvalue);// utton pressed event, or a new status var value to set
      // todo  implement button handler !
      //buttoncaused = true;
    }
    */
  

  }}



  socket.on('light', function (data) { //handler of  'light' event fired on browser ,get light switch status from client web page .   data=0/1 ?
    lightvalue = data;

    LED.readSync().then((led)=> checkit(led));

    function checkit(val){
    if (lightvalue !=val) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
      /*if (buttoncaused) {
        buttoncaused = false;
      } else {
        // eM.emit('web', 1);
      }*/
    }else console.log(' brower ask to change value but is as before ?: ',lightvalue); // ex 0
  }
});

// the same x relais , but without using a closure

// moved 
 function onRelais_  (pump,data) { // dead code //pumps unique handlerget pumps switch status from client web page.  data =0/1
  lightvalue = data;
  if (relais_[pump]&&lightvalue != relais_[pump].readSync()) { //gpio comanding relays is called, only change LED if status has changed
    if(relais_[pump])relais_[pump].writeSync(lightvalue); //turn LED on or off
    /*
    if (buttoncaused) {// means that the relay is requested by user raspberry button press (or algo anticipating), not corresponding seb button press
      buttoncaused = false;
    } else {
      // eM.emit('web', 1);
    }*/
  }else console.log(' browser ask ',pump,' rele to change value but is as before : ',lightvalue); // ex 0
}

 /*
  // implements also a ralays array for actuators / pumps
 relaisEv.forEach((pump,ind) => {
  socket.on(pump,onRelais);// same handler for all pumps events
 });*/
 
 
 function onRelaisClos(session){

  return function(pump,val,coming){// return with a void closure ?
    console.log(' onRelaisClos() called x pump: ',pump,' set value: ',val,' coming from: ',coming,' ctl is null: ',!eM,', socket id ',socket.id,', user ',user,', plantname ',state.app.plantname);
    if(!eM)console.error('onRelaisClos(), eM is null , cant process browser old event call');
    if(!eM)console.log('onRelaisClos(), eM is null ');else console.log(' onRelaisClos(), eM is found '); 
    if(eM)onRelais(pump,val,coming,eM);}//dont wait! eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
 }
 function onRelaisClos_(pump,val,coming){// return with a void closure ?
   if(!eM)console.error('onRelaisClos(), eM is null , cant process browser old event call');
    if(!eM)console.log('onRelaisClos(), eM is null , ssessionid ' ,session.id,' socketid ',session.socketId);else console.log(' onRelaisClos(), eM is found '); 
    if(eM){
      console.log(' onRelaisClos() called x pump: ',pump,' set value: ',val,' coming from: ',coming,' ctl is null: ',!eM,', socket id ',socket.id,', user ',user,', plantname ',eM.state.app.plantname);
      onRelais(pump,val,coming,eM);
 }}//dont wait! eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
    
 

// socket.on('pump',onRelaisClos());// 
 socket.on('pump',(a,b,c) => {// this will change immediately the pump dev value
  if(!eM)console.log('error: pump socket event called ,param: ',a,b,c);// to log too
  if(!eM)console.error('pump socket event, eM is null ',a,b,c);

  onRelaisClos_(a,b,c);// same result as  : onRelaisClos()(a,b,c)  ??
 });// 


  socket.on('manualAlgoProposal',(pump_, val, coming,checked)=>{
        console.log(' socket.on(manualAlgoProposal  handle set manual proposal');
        setManual(pump_, val, coming,checked,eM);
      });
  




                            //  >>>>>>>>>>>>>>>>   startfv can alredy fired the event before a user in some browser 
                            /* i also could :
                            socket.on('pump',(pump,val,coming) => {
                              console.log(' onRelaisClos() called x pump: ',pump,' set value: ',val,' coming from: ',coming);
                              onRelais(pump,val,coming,eM);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)

                            );
                            */


function setanticipateflag(set_,algo,activeAlgoRes=null){ //  AAQQOO  
                                                          // store in state the algo launch params (ex: triggers), update state store :
                                                          // state[algo]=set_ ex state.anticipate={....}  .
                                                          // if set_=null :  state.anticipate=false
                                                          //    state[algo]=false     the algo init parm are false because the algo is not active
                                                          //    and
                                                          //    state[activeAlgoRes]=false    the last algo result are nullified so dont influence relay set 


                                                    // calls anticipateFlag , that:
                                                    // - set algo init param if set_ != null (state[algo]=)
                                                    // - otherwhise reset algo init param  e algo result (state[activeAlgoRes]=null)
                                                    // - call api.writeScriptsToFile(fn) to write fn.state onto persistand + call websocket topic to update state staff on browser + ....


                                                          // nbnb is duplicated  on     other namespace.on() !!!! todo do 1 function only !!!!


  if(!eM)console.error('.. setanticipateflag() eM is null ');
  if(!eM)console.log('.. setanticipateflag() eM is null ');else console.log(' . setanticipateflag(), eM is found '); 
    console.log(' setanticipateflag() called to set running algo: ',algo,' init param: ',set_,' , in state.',algo,' ,(if null init parm will also  reset state.',activeAlgoRes);
    //if(set_)
    anticipateFlag(set_,eM,algo,activeAlgoRes);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)


// repeat=checkFactory(eM);// eM could not still be set by a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
 console.log('repeat could not be set now because eM is still null !! well be set on :  socket.on(startuserplant...');

socket.on('repeatcheckxSun',repeatHandler);// start anticipating algo with setting and run an execute()
function repeatHandler(starthour,stophour,dminutes,triggers) {// called also by ....
                                                                /*      "triggers" : {
                                                                                      "PdCTrig" : false,
                                                                                      "temp" : "",
                                                                                      "PdCTrig1" : true,
                                                                                      "FVPower" : "35",
                                                                                      "Tmax" : "",
                                                                                      "Psav" : "",
                                                                                      "Bsav" : ""
                                                                                  }
                                                                */
  if(!eM)console.error(' repeatHandler(), eM is null ');
  if(!eM)console.log(' repeatHandler(), eM is null ');else console.log(' repeatHandler(), eM is found '); 


  // non va perche allo start anticipate is recovered from state is not null but the algo must to start !
  //if(eM.state.anticipate != false&&eM.state.anticipate != null){
  //  console.log('repeatHandler() socket event handler , anticipate is already active ! ');return  }

    // already recovered !! repeat=repeat||checkFactory(eM);// could be find null ???           DDHH
    if(repeat.repeatcheckxSun(starthour,stophour,dminutes,antic_parmFact())==0)// exit ok 
    setanticipateflag({running:true,starthour,stophour,dminutes,triggers},'anticipate');// store in state the algo launch params (ex: triggers), update state store
    else {repeat=null;
   console.log(' setanticipateflag() not called ');
    }
  }


socket.on('stopRepeat',stopRepeat);
function stopRepeat()  {
  repeat=repeat||checkFactory(eM);// could be find null ???,  can we comment out ?
  console.log(' stopRepeat event fired');
  if(repeat){
  repeat.stopRepeat();
  setanticipateflag(false,'anticipate','lastAnticAlgo');//// reset in state the algo launch params (ex: triggers), ex : state.anticipate=false
                                                          //  update state.lastAnticAlgo
  }
  }


// now the same x programming temperature x many zones
socket.on('startprogrammer',repeatHandler1);// start anticipating algo with setting and run an execute()
function repeatHandler1(starthour,stophour,dminutes,triggers2) {// triggers2 keys sono gli items di :extract2 =  ["Tgiorno","PGMgiorno","Tnotte","PGMnotte","lastT","mapping","probMapping","ei","TgiornoTollerance"],
                                                                

                                                                /*        "triggers2" : {
                                                                          "Tgiorno" : true,
                                                                          "PGMgiorno" : { "8:30" : 27, "17:00" : 30 }, // associato al virtual rele g ( index 2)
                                                                          "TgiornoToll": { "8:30" : 1.5, "17:00" : 1.5 }
                                                                          "TgiornoTollerance":1.5,
                                                                          "Tnotte" : false,
                                                                          "PGMnotte" : { "notte" : { "8:30" : 20, "17:00" : 22 } },
                                                                          "lastT" : ["21/08/2023, 09:33:23", { "notte" : 23.8, "giorno" : 24.3 }], // NOT used to start programalgo !, just x info
                                                                          "mapping" : "==&&state.devmapping=[0,1,2,3,-1,5]",  // serve solo a mappare diversamente i dev mostrati nel browser con gli index che sono associati a rele con ruolo specifico negli Algo
                                                                          "probMapping" : "==&&state.probmapping=[2,4,0,3,1,5]",
                                                                          "ei" : "S"
                                                                      }
                                                                */
  console.log(' startprogrammer socket event handler repeatHandler1() called with triggers2: ',triggers2 ,' controller fn is null: ',eM==null)   ;                                                            // sched={'giorno':['8:30':t1,"17:00":t2]} see initProg event x keys definitions
  let sched={programs:{}};// sched={programs:{giorno:{sched:{'16:10':-3,,,,},toll:{'16:10':1.5,,}},notte:{}},  HHDD
                          //  probMapping:[],
                          // mapping:[],
                          // ei} 
  if(!triggers2)return;


  // anyway restart according to state.program
  //if(eM.state.program != false&&eM.state.program != null){    console.log('startprogrammer socket event handler , program algo is alredy active ! ');return  }

  // if(triggers2.Tgiorno&&triggers2.PGMgiorno)Object.assign(sched, triggers2.PGMgiorno);
  // if(triggers2.Tnotte&&triggers2.PGMnotte)Object.assign(sched, triggers2.PGMnotte);
  if(triggers2.Tgiorno&&triggers2.PGMgiorno){sched.programs.giorno={sched:triggers2.PGMgiorno};
  if(triggers2.TgiornoTollerance)sched.programs.giorno.TgiornoTollerance=triggers2.TgiornoTollerance;
    if(triggers2.TgiornoToll){sched.programs.giorno.toll=triggers2.TgiornoToll;// // tolleranze (un valore x all), same keys of sched.giorno.sched
      console.log(' startprogrammer socket event handler repeatHandler1() saved tollerate array: ',triggers2.TgiornoToll,'\n sched: ',sched);
    }else{// TgiornoToll is not defined . probably this is a call from plant/state recovery and the state was no really set with current version 
      // just fill with 0 tollerance and build here
      sched.programs.giorno.toll={};sched.programs.giorno.TgiornoTollerance=0;
      let ks=Object.keys(triggers2.PGMgiorno);// PGMgiorno= {'8:30':0,"10:50":1022} >  {'8:30':0,"10:50":22}
      for(let ii=0;ii<ks.length;ii++){
        sched.programs.giorno.toll[ks[ii]]=0;
      }


    }
  }
  if(triggers2.Tnotte&&triggers2.PGMnotte){sched.programs.notte={sched:triggers2.PGMnotte};
    if(triggers2.TnotteToll){sched.programs.notte.toll=triggers2.TnotteToll;// // tolleranze (un valore x all), same keys of sched.giorno.sched
    console.log(' startprogrammer socket event handler repeatHandler1() saved tollerate array: ',triggers2.TnotteToll,'\n sched: ',sched);
  }else{// TgiornoToll is not defined . probably this is a call from plant/state recovery and the state was no really set with current version 
    // just fill with 0 tollerance and build here
    sched.programs.notte.toll={};sched.programs.notte.TgiornoTollerance=0;
    let ks=Object.keys(triggers2.PGMnotte);// PGMgiorno= {'8:30':0,"10:50":1022} >  {'8:30':0,"10:50":22}
    for(let ii=0;ii<ks.length;ii++){
      sched.programs.notte.toll[ks[ii]]=0;
    }


  }
  }

  sched.probMapping=toeval(eM.state,triggers2.probMapping);// mapping algo vars to plant devices !, input used when call last event genZoneRele of related exec created with prog_parmFact(sched)
                                                            // // preferred use :  ('==&&state.mapping=[0,1,3,2,4];')   will fill the state.mapping var ! and returs the array 
  sched.mapping=toeval(eM.state,triggers2.mapping);// mapping algo vars to plant devices !, input used when call last event genZoneRele of related exec created with prog_parmFact(sched)
  if(triggers2.ei&&triggers2.ei=='S')sched.ei='S';else sched.ei='W';

  if(!eM)console.error(' repeatHandler1(), eM is null ');
  if(!eM)console.log(' repeatHandler1(), eM is null ');else console.log(' repeatHandler(), eM is found '); 

    // already recovered !!    repeat1=repeat1||checkFactory(eM);// could be find null ???  DDHH

    console.log(' startprogrammer socket event handler repeatHandler1() is launching repetition job repeatcheckxSun() with sched: ',sched );


                                                                                                                    /*
                                                                                                                    sched:  {
                                                                                                                      programs: { giorno: { sched: [Object] } },
                                                                                                                      probMapping: [ 2, 4, 0, 3, 1, 5 ],
                                                                                                                      mapping: [ 0, 1, 2, 3, -1, 5 ],
                                                                                                                      ei: 'S'
                                                                                                                    }
                                                                                                                        */


    if(repeat1.repeatcheckxSun(starthour,stophour,dminutes,prog_parmFact(sched))==0)// exit ok 
    setanticipateflag({running:true,starthour,stophour,dminutes,triggers2},'program');
    else {repeat1=null;
   console.log(' startprogrammer() not called ');
    }
  }


socket.on('stopprogrammer',stopprogrammer);
function stopprogrammer() {
  repeat1=repeat1||checkFactory(eM);// could be find null ??? DDHH
  console.log(' stopprogrammer event fired');
  if(repeat1){
  repeat1.stopRepeat();
  setanticipateflag(false,'program','lastProgramAlgo');// set state.program=null , so init parm = null means that the algo is not active !
                                                        //// store in state the algo launch params (ex: triggers),  update state.lastAnticAlgo
  
  }
  }



  socket.on('disconnect',() => {// to do 
    // set a flag to avoid browser .emit call from any function that can do that
    // eM will run also if the client dead . when a new connection come and it refears to same plant of the running eM , attact it to the closure and goon  
    clientDiscon=true;
  });


 }// ends cf (or cb ?!) function (socket) on sockets.on('connection',)




);// ends io.sockets.on('connection'


// todo what is this ?
// run a bash shell
process.on('SIGINT', function () { //on ctrl+c
  console.log('control c got');
  LED.writeSync(valCorrection(0)); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  if(pushButton)pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});




//return 'ok';    ??


function anticipateFlag(set_,fn,algo,activeAlgoRes){// like onRelais, write state after completed it to store anticipate algo init param// algo =anticipate/program/manual
                                                    // sets state.activeAlgoRes to store the temp results of algo  
                                                    // if set_=null  state.activeAlgoRes=null
                                                    //  new:
                                                    // - set algo init param if set_ != null
                                                    // - otherwhise reset algo init param  e algo result (state[activeAlgoRes]=null)
                                                    // - call api.writeScriptsToFile(fn) to write fn.state onto persistand + call websocket topic to update state staff on browser + ....

  if(!fn)console.error('anticipateFlag(), eM is null ');
  if(!fn){console.log('anticipateFlag(), eM is null ');}else console.log(' anticipateFlag(), eM is found ');
  let state=fn.state;
  state[algo]=set_;// state.program=
  if(set_==null)state[activeAlgoRes]=null;// nullify last algo results 
  return api.writeScriptsToFile(fn)// // - write fn.state to file_=fn.state.app.plantname , fn=ctl
                                      // - send state to browser using socket :fn.socket.emit('status,,) + ....
    .catch(function(err) {
      console.log(' anticipateFlag(),  error calling api.writeScriptsToFile : ',err);
        console.error(err);

        // process.exit(1);
      });
}

async function onRelais(pump,data,coming,fn) { //pumps unique handlerget pumps switch status from client web page  data=0/1 pump ='pdc',,,
                                                // return a promise but is never used !
                                  // accoppiato con emit('pump',)   
                                  // >> pump in relaisEv
                                  //  onRelais can be called  from :
                                  //     - this server using   setPump() che chiamera onRelais sia direttamente che via browser (feedback )
                                  //      or
                                  //     - browser(via .emit('pump',,'browser')) che ha origine da 
                                  //          - browser user changing flag
                                  //          - come feedback del event 'pump' lanciato dal server dal gpio button handler  :
                                  //                pumpsHandler[pumpnumber]= watchparam(pump)) 
                                  //                this handler can be called by gpio button change or
                                  //                 by  setPump() 
                                  // 
                                  //          nb setPump() chiama onRelais sia direttamente che via browser ( come feedback )
                                  //              setPump è chiamato da startfv, attuators
 
                                  // this is ....  global ?
  if(isNaN(data)){
    console.log('OnRelais started x mqttnumb dev , pump/devName: ',pump, ', plantname ',fn.state.app.plantname,', to set ',data,',  but data is not a number so return'); 
    return   
  }  

  // no sessio + clientdiscon in param but :
  let session=null,
   clientDiscon=true;
   if(fn.getcontext){session=fn.getcontext.getSession();clientDiscon=fn.getcontext.getCliDiscon();
   }

  if(data!=0)data=1;// normalize data                            
  //console.log('OnRelais started x mqttnumb dev , pump/devName: ',pump, ', plantname ',fn.state.app.plantname,', to set ',data,',  coming from ',coming);
  if(!fn)console.error('onRelais(), eM is null ');
  let state=fn.state,relaisEv=state.app.plantconfig.relaisEv;
  let value=state.relays[pump];// true/false, pump value as recorded on status
  //let data = data,// 0/1 value to set
  let pump_=relaisEv.lastIndexOf(pump);// the index in relais_
  const useCb=true;
  if(pump_>=0){// found
    let sessionid=null,socketid=null;
    if(session){sessionid=session.id,socketid=session.socketId;}


  
    //fn.state.discFromBrow=fn.state.discFromBrow||[false,false,false,false,false,false,false];
    if(coming&&coming==Serv_){// set a expiring flag if coming from server. when comes browser duplicated command il the flag is set and valid we dont care 
      console.log('OnRelais started x mqttnumb dev , pump/devName: ',pump, ', plantname ',fn.state.app.plantname,' , session id ',sessionid,', socket id ',socketid,', to set ',data,',  coming from ',coming,' browserstopflag ', fn.state.discFromBrow);
     // put in  fn.state.discFromBrow[pump_]=true;// better : pdate().getTime(); the expiration data
                                        // discFromBrow was init with false in loadScriptsFromFile 


      if(!useCb){
      if(!clientDiscon)// if client is disconnected we will anyway blocking double browser req , so it is useless 
      // discFromBrow  > discFromBrow[pump_]  ??
      if(fn.state.discFromBrow&&state.blocking){ clearTimeout(state.blocking);// fn.state.discFromBrow : the server req  (onRelais ) is followed by a browswer req : 
                                                                            //    so if a previous browser timeout was set , reset it and  reset the interval of browser  blocking 
      state.blocking=setTimeout(()=>{ fn.state.discFromBrow=false ;state.blocking=null},2000);// discard browser req, server req  is enougth
    }



    }
    }else{// coming from browser , 


      if(!useCb){
      if(//             // if the socket conn is became disconnected , this req cant come here , so the connection is active, so check if timeout is
        fn.state.discFromBrow==true) {//  all onRelais browser are probably duplicated of a onRelais server req if it come on a not expired time out  

                                   //  this way can happend (rarely) that also concomitant browser req from user activity , that's a pity !!!
                                   // so every browser req tha comes in timeout validity will be discard 
        console.log('OnRelais started x mqttnumb dev , pump/devName: ',pump, ', plantname ',fn.state.app.plantname,' , session id ',sessionid,', socket id ',socketid,', to set ',data,',  coming from ',coming,' but it comes on a not expired time out on which the duplicated req is expected  ');
        // error : fn.state.discFromBrow=false;// optional , is anyway done by timeout
        // the previous was the server cmd , so dscard the browser duplicated 
       
       // /* optional ? 
         return api.writeScriptsToFile(fn)// upddate persistance and send status to browser
        .catch(function(err) {
          console.log(' onRelais(),  writefile catched : ',err);
            console.error(err);
            // process.exit(1);
          });
       //  */
      }
    }else {
      if(fn.getcontext&&fn.getcontext.processBrow)
      if(!fn.getcontext.processBrow()){
        console.log('OnRelais started x mqttnumb dev , pump/devName: ',pump, ', plantname ',fn.state.app.plantname,' , session id ',sessionid,', socket id ',socketid,', to set ',data,',  coming from ',coming,' but it we dont process it   ');
 
        return;
      }
    }


    }

    // console.log('OnRelais started x mqttnumb dev , pump/devName: ',pump, ', plantname ',fn.state.app.plantname,' , session id ',sessionid,', socket id ',socketid,', to set ',data,',  coming from ',coming,' but it comes on a  expired time out on which the duplicated req is expected  ');
 

    let ctl=fn.iodev.relais_[pump_];// pump_= ctl.devNumb
    if (ctl) {

      console.log('OnRelais  accept processing pump/devName: ', pump, ', found with index ', ctl.devNumb, ', devid/portid ', ctl.gpio, ', is a mqttdev?: ', !!ctl.cfg);
      console.log('......, plantname ', fn.state.app.plantname, ' , session id ', sessionid, ', socket id ', socketid, ', to set ', data, ',  coming from ', coming);

      if (!!ctl.cfg) console.log('.......  mqtt dev feature from model mqttnumb : cl_class (mqttnumb:1rele/2var mqttprob:3probe/4var) ', ctl.cl, ', plant ', ctl.mqttInst.plantName, ' class ', ctl.cfg.clas, ', protocol ', ctl.cfg.protocol);
      curval = valCorrection(await ctl.readSync());// 0/anynumber or null  present value of gpio register   now better 0/1 or null(cant know)
      //  if(curval==null)curval=0;// std out 
      if (isNaN(curval)) curval = null;// must be a number 
    }
    else // if the device is not available read a dummy 0
      curval = null;// 0;
  console.log(' onRelais, coming from: ',coming,', current rele position x dev name ',pump,', is ',curval,' asking to set : ',data); 
  // console.log('              onRelais, state: ',state); 
    let lchange=false; //  >>>>>>>  TODO : gestire le incongruenze tra state.relays  e current relay value : curval
  if(curval==null||value&&curval==0||((!value&&curval!=0))){// state != cur value . a problem if not just starting!
    console.warn(' onRelais, find current pump ',pump,' state different from current hw pump position thats: ',curval); 
    console.log(' warn: onRelais, find current pump ',pump,' state different from current hw pump position thats: ',curval); // ????  >>>>>>>  TODO ??: gestire le incongruenze tra state.relays  e current relay value : curval
    lchange=true;// state and present value are different !
  }
  // new 
  else  lchange=true; // anyway rewrite the data (if a mqtt and a external set a data we rewrite x confirmation and to update browser and state )
 
 // now ever write  if (!curval||data != curval) 
 
  { // 0/1 != 0/1 gpio comanding relays is called,>>>>> only change gpio if current position/value is different from present hw relay value !!
    console.log(' onRelais,  changing/confirm current rele hw position/value x ',pump,' , index ',pump_,' ,  to new value: ',data); 
    if(fn.iodev.relais_[pump_])fn.iodev.relais_[pump_].writeSync(valCorrection(data)); //turn LED on or off
    console.log(' onRelais,  todo : verifying current rele  position/value changing  x ',pump,' now is: ',data); 
    //console.log(' ****\n browser/algo ask ',pump,' relay to change value into : ',data); // ex 0
    /*
    if (buttoncaused) {// means that the relay is requested by user raspberry button press (or algo anticipating), not corresponding seb button press
      buttoncaused = false;
    } else {
      // eM.emit('web', 1);
    }*/

    // update staus in case the new pump data comes from button o from browser   
    // >>>  state and  cur value will be the same 
   
    if(value&&data==0||((!value&&data!=0))){// state != cur value (data=lightvalue)
      // update state
      state.relays[pump]=!value;

      let plantname= state.app.plantname,// o app.plantcfg.name 
      procedura='unknown';// to do .....
    // update status file , dont need to wait so not async func  otherwise see doc on async in .on handler
    // 
    if(PRTLEV>5)console.log(' onRelais(), to update, now call writeScriptsToFile: ',plantname,' scripts/state: ',state);
    // return // not mandatory
    //return api.writeScriptsToFile(state,plantname,procedura)
    return api.writeScriptsToFile(fn)// upddate persistance and send status to browser
    .catch(function(err) {
      console.log(' onRelais(),  writefile catched : ',err);
        console.error(err);

        // process.exit(1);
      });
    }

  }
  /* now useless : 
  else {console.log(' onRelais(), browser/algo ask ',pump,' rele to change value but was alredy set : ',data); // ex 0
          if(lchange){state.relays[pump]=!state.relays[pump];// to do 05052023 ??
          console.warn(' onRelais() status ricociliato con current value : ',data);
          }
  }*/



} else console.error(' onRelays() cant find a device from name: ',pump);// error
}


/*

let repeat=checkFactory(eM);
socket.on('repeatcheckxSun',repeat.repeatcheckxSun(starthour,hourinterval));// same handler for all pumps events

socket.on('stopRepeat',repeat.stopRepeat());// same handler for all pumps events

function checkFactory(ctl){repeatcheckxSun:function(){
},
stopRepeat:function(){

}
  return {


  }
}

to start gfg_Run use :
window.setInterval(function(){ // Set interval for checking
    var date = new Date(); // Create a Date object to find out what time it is
    if(date.getHours() === 8 && date.getMinutes() === 0){ // Check the time
        // Do stuff
    }
}, 60000); // Repeat every 60000 milliseconds (1 minute)


------------------
so :
function gfg_Run() {
  timer = setInterval(callFn_, 2000);
  }
  function gfg_Stop() {
  clearInterval(timer);
  
  }


*/



function recoverstatus(plantcfg,plantcnt,plantconfig,feature){// this ctl is the ctl whose state must be updated from file if exist (persistnce)
  // this.state is asic state x new ctl. if we have stored , get it 

  // old : >>>>   returns a promise resolved we  finish to write status back with promise .writeScriptsToFile
let that=this,// the ctl/fn/eM=context is the app event manager

state=that.state,reBuildFromState=that.reBuildFromState;
  return new Promise(function(resolve, reject) {

    //console.log(' recoverstatus,  starting  : ',that);
 // api.loadScriptsFromFile(plantname,this).catch(function(err) {
    api.loadScriptsFromFile(plantcfg,plantcnt,plantconfig,that,feature).catch(function(err) {// will update/recover/new  : (that=ctl).state

    console.log('Could not load scripts from file:',plantcfg.name, err);
    reject();
    process.exit(1);
}).then(function(that_) {// resolved results is that_ , that_ :it is that with updated state read from file
                        // the  current plant state: from saved in file or a basic state  if new controller (that)
    // verify that we can now write back to the file.
    if(PRTLEV>5)console.log(' recoverstatus() , now loadScriptsFromFile is resolved so callwriteScriptsToFile() writefile: ',plantcfg.name,' script: ',that_.state);
    //return api.writeScriptsToFile(scripts,plantname)
 
    // recover registered functionality if start from a new instance 
    
    // if(reBuildFromState){}// moved on calle , because of the problem of writing 2 times the state !
    


    return api.writeScriptsToFile(that_)// or that is the same ! nb this promise  is thenable to a .then function if any. here have AWQ
    .catch(function(err) {
      console.log(' recoverstatus,  writeScriptsToFile rejected so catched with error : ',err);
        console.error(err);
        reject();
        process.exit(1);
      });
  })
.then(function(state) {  // >>>> after update file with writeScriptsToFile(that_) promise, we resolve  the promise returned by recoverstatus(plantname)
  // console.log(' recoverstatus,  resolving : ',that,'\n state: ',state)
  ;
  // that.state=state;// already done , update state recovering from persistence
  
  // this.state.app.plantname=plantname;
 // startfv_(this);//statusrecovered(this.state);
 console.log(' recoverstatus,  resolving 2  state : ',that.state);
 resolve(that);
})
.catch(function(err) {
  console.error('recoverstatus() failed, error: ',err);
  process.exit(1);
})

;

  });

/*
 that=this;
 return new Promise(function(resolve, reject) {
    api.loadScriptsFromFile(plantname,that)
      .catch( .... reject())
      .then(function(that_) {// resolved results is that_ : it is that with updated state read from file

                ....
                return api.writeScriptsToFile(that_)// or that is the same ! nb this promise  is thenable to a .then function if any. here have AWQ
                  .catch(function(err) {
                                reject();
                  }
            }
          )



      ).then(function(state) {  // >>>> after update file with writeScriptsToFile(that_) promise, we resolve  the promise returned by recoverstatus(plantname)

            console.log(' recoverstatus,  resolving 2  state : ',that.state);
            resolve(that);
      ).catch(function(err) {
              console.error('recoverstatus() failed, error: ',err);
              process.exit(1);
          )

*/


}
  function antic_parmFact(noparms){// se param x anticipating exec
  
      //  let{procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
  //let  pdate=new Date();pdate.setHours(pdate.getHours()+dOraLegale);
  let procName='startAntic_'// 'anticipate'
  + pdate().toLocaleString(),algo='anticipate';
  console.log(' checkFactory()  define  procedure ',procName);
  //if(fn);else {console.error(' checkfactory() cant find the ctl . stop ');console.log(' checkfactory() cant find the ctl . stop ');}
  

  // nb passing results via state , not in event chain 
  let ev2run = {connect:null,openapi:null,weather:null,startcheck:null};// {the eventasynctorun in sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means dataArr data
  
  
  let dataArr=//{begin:0,startcheck:0}; 
  //{begin:null,openapi:null,startcheck:null}; 
  {begin:null,// error todo  :  connect:null,
    openapi:null,weather:null,startcheck:{dataArr:{algo}}};// use key dataArr to distinguish in consolidated input 
  let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
  let a=processAsync={},b=asyncPoint={};// ok ?
  return {procName, a,b,ev2run, asyncPoint, processAsync, dataArr,algo:"anticipate"};

  }


  function prog_parmFact(sched){ // the execute cfg param  builder
                                  // from browser we got sched
                                          // , the key are the key generated in initProg that define the probes whose temperature must be controlled
                                          // probSched= probe address={}
    //  let{procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
   // let  pdate=new Date();pdate.setHours(pdate.getHours()+dOraLegale);
let procName='startProg_'// 'program'
+ pdate().toLocaleString(),algo='program';

console.log(' prog_parmFact()  define  procedure ',procName,' with sched: ',sched);// input of genZoneRele will be {'initProg':{giorno:19.2,notte:,,,,},dataArr:sched={'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}}
//if(fn);else {console.error(' checkfactory() cant find the ctl . stop ');console.log(' checkfactory() cant find the ctl . stop ');}

let ev2run = {initProg:null,// will put probes result as input of genZoneRele ev
  // preparazione dati , checks,....
  genZoneRele:"initProg"};// input coming from previous event initProg. attivare valvole x risc generale e poi singole zone
let dataArr_=//{begin:0,startcheck:0}; 
//{begin:null,openapi:null,startcheck:null}; 
{
  // initProg:null,
  initProg:{dataArr:sched},// std input dataArr coming from sched
  genZoneRele:{dataArr:sched}};// std input dataArr coming from sched
let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
let a=processAsync={},b=asyncPoint={};// todo 
return {procName, a,b,ev2run, asyncPoint, processAsync, dataArr:dataArr_,algo:'program'};

}


  const { exec } = require('child_process');

  async function shellcmd(sh,param){// param={addr:'notte',val:18}
    console.log(' executing shellcmd() param: ',param);
    let val=param.val,reg=4098,addr;
    if(sh=='modbusRead'&&param&&param.addr&&param.register){// in read val not used !
      // if(param.addr=='notte')addr=4;else if(param.addr=='giorno')addr=2;else if(param.addr=='taverna')addr=9;else if(param.addr=='studio')addr=5;else;
      addr=param.addr;// 1-999
      if(param.register=='temp')reg=4098;else if(param.register=='active')reg=4188;else;
      let myexec='python3 '+rs485+' r '+addr+' '+reg+' 0';
      console.log(' executing cmd: ',myexec);
    return new Promise(function(resolve, reject) {

        exec(myexec,
        (error, stdout, stderr) => {
          console.log(' executing shell: ',stdout,' cioe ${stdout}');
          console.log(' std error is ',stderr);
          if (error !== null) {
            console.log(`exec error: ${error}`);
              reject(error);
        }
          else {resolve(stderr);// pass std error results
            console.log(' shellcmd returned : ',stderr,' cioe ${stderr}');
          }
        });
      });
    }
    else return null;
  }

function consolidate(state, lastalgo) {// works on virtual dev  [false, false, false, false,false,false]= [heat,pdc,g,n,s,split], 
  // lastalgo = anticipate,program,user   : used ??
  // done : puo essere chiamato sia da anticipate che da program. ma ultimamente program chiama optimize() !!!  >>> todo  sistemare un unico optimize !?!  >> fatto , consolidate() :OK
  // heat : se impostato da program  antic puo solo fare or 

  // >>>  torna il valori dei rele , ricalcolati tenuto conto di 3 calcoli degli algo , il piu recente e i due precedenti  set !!! 


  // news : 04062023 >>>>>>>>>>>>>>>>><
  // works on virtual dev  , now will also map virtual anticipate intermediate res : see MMNN


  let date = pdate();
  // user part must still todo

  // >>>>   program if not null cant have any null val !! ( only true or false)


  //let res = new Array(state.app.plantconfig.relaisEv.length); res.fill(false);// so if any of proposal has lower dimension we complete with false (std)
  // fill result with def value. that will be the value if all antic,program,and user suggested null value
  let res =[...state.app.plantconfig.relaisDef];// clone array
  let curpumps = state.relays,// cur gpionumb/mqttnumb state with name keys
   antic, anticGap, program // proposals
    , user;// the user manual set proposal , valid (no timeout)
  // see what set are active (lastxxxAlgo not false)
   if (state.lastAnticAlgo
    && state.anticipate && state.anticipate.starthour <= date.getHours() && state.anticipate.stophour > date.getHours()
    //||lastalgo=='anticipate'
  ) {antic = state.lastAnticAlgo.pumps;// non vero : state.lastAnticAlgo could not jet assigned
    
  }
  if (state.lastProgramAlgo
    && state.program && state.program.starthour <= date.getHours() && state.program.stophour > date.getHours()
    // ||lastalgo=='program'
  ) {program = state.lastProgramAlgo.pumps;
    anticGap=state.lastProgramAlgo.anticGap;// the anticipate proposal flag (activate item x item the anticipate proposal , item gaspdcPref  of anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,false]})

  // check scadenza

  }if (state.lastUserAlgo)// is alredy stored in state.user
    if (isscad(date, state)) {// check if the user proposed (items ?) is still valid (see defTo in ms), so review the valid lastUserAlgo.pumps
      
                                // state.user=isscad(date,state.lastUserAlgo.scad);
      // state.lastUserAlgo = false;
    }
  if (state.lastUserAlgo
    //||lastalgo=='user'
  ) user = state.lastUserAlgo.pumps;// valid user set proposal

  if (antic) {
    console.log(' consolidate() found anticipate relays set: ', antic);
  }
  if (program) {
    console.log(' consolidate() found program relays set: ', program);  
      console.log(' consolidate() found program/anticipated activation flags: ', anticGap);
  }
  if (user) {
    console.log(' consolidate() found not expired manualuser  relays set: ', user);
  }

  /*
  ricorda che quando un algo cambia relay, con setPump(), lancia 2 azioni  :  al browser e interna , il browser richiama l'interna che e in pratica un duplicato
   invece se lo user modifica allora ilbrowser chiama l'interna 
 quindi se lo user cambia un rele per flaggare che lo user blocca per ,es, la giornata la modifica del rele da parte dei algo , bisogna evitare di spedire ilrichiamo del 
 browser !!!! see DEW
  */

  let antMap = state.app.plantconfig.anticInterm2VirtMap,// update of virtual dev to apply if a intermediate is set true by anticipate. {gaspdcPref:[true,true,true,null,null,true,null]}/
                                                          // anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,false]}
  apply;
  const sol = 1;// scelta implementativa , 
  // 0: apply intermedate then merge with program and user 
  // 1: merge , then apply intermediate .thats the preferred choice

  // a: process antic + program
  if (antic) {
    // MMNN :

    // antMap={ant=gaspdcPref:res=[true,false,null,,,null]}
    if (sol == 0) applyIntermed(antic,anticGap);

    if (program) {// antic + program + possibly user
      // program and antic  case 
      // take current relays (program + day modification of user and apply some lastalgo proposal
      if (lastalgo = 'program' || lastalgo == 'anticipate') {// useless. probaly  ever
        /*
        res.push(antic[0] || program[0]);
        // idem per pdc e g,n,s e split:
        res.push(antic[1] || program[1]);
        res.push(antic[2] || program[2]);
        res.push(antic[3] || program[3]);
        res.push(antic[4] || program[4]);
        res.push(antic[5] || program[5]);
        */

        // anticipate and user can have null val (dont set that index), program  cant have null val .
        // old antic version : was set all real pumps to activate in case of anticip
        //  antic.forEach((val,ind)=>{if(val==null)res.push(program[ind]);else res.push(val)});// prog e antic active : take antic values if not null otherwise let program values !

        // new antic version : is relevant only to set relaisEv.gaspdcPref internal intermediate var
        // so as anyway program algo (or loopalgo) is working ( def program desidered temp is {} thats mean anyway temperature is ok )
        //  if we find gaspdcPref we set the pumps to activate pdc on some zones so using like the old anticipate virtual to real map  ,
        //  anzi, indeed we add in program virtual to real map the activation of some real on gaspdcPref : lh + pdc + g 
        //  and we can move that map from browser to model.js , see LLGGYY

        antic.forEach((val, ind) => { if (val == null) {if(program[ind]!=null)res[ind] = program[ind];} else res[ind] = val });// prog e antic active, settings result:
                                                                                                      // take antic values (val) if not null, otherwise take not null program values !
      }
      // save 

    } else
      antic.forEach((val, ind) => { if(val!=null)res[ind] = val });// antic >> res
  } else {
    if (program) program.forEach((val, ind) => { if(val!=null) res[ind] = val });// program >> res
  }

  // b: apply user wants , initially user will have day validity res will bet set by antic and/or program if active or can be null
  // apply default if no assign and program :
  // alredy done if(!res){res=new Array(state.app.plantconfig.relaisEv.length);res.fill(false);}// todo  same length as  relaisEv


  res.forEach((val, ind) => {
    if (user) {
      if (user[ind] == null) {
        ;//if(res[ind]==null)res[ind]=false;// should not be any null val in res !!!
      } else {
        res[ind] = user[ind];
        console.log(' consolidate() merging  found a valid manual set for pump index ', ind, ', that overwrite anticipate and program indication in ', res[ind]);
      }
    }
    if (res[ind] == null) {
      console.error(' consolidate() merging : after merge antic, program and user we  found a unexpexted null set x dev at index ', ind,', so we set false');
      res[ind] = false;// should not be any null val in res !!!
  }
    /*
    // only for lastalgo=='user'
    state.user=true;
    */
  });
  if (sol == 1) apply = applyIntermed(res,anticGap);

  console.log(' consolidate() , at hour ', date.getHours(), ', merging anticipate (', antic, '), program (', program, ') and usermanual (', user, ') applyed intermedite (', apply, ') , relays merge into: ', res);

  return res;

  function isscad(date, state) {// check scadenza dei manual set in lastUserAlgo
    // lastUserAlgo={defTo=[],pumps:[true,false,null,,,],updatedate,policy,algo}
    let someset = false;
    state.lastUserAlgo.pumps.forEach((val, ind) => {

      if (val != null) {// null val , can be true or false
        let scad = state.lastUserAlgo.defTO[ind];// scad time 
        console.log(' isscad() for plant checking user set for pump index ', ind, ', con scadenza  ', scad, ' > when date.time ', date.getTime());
        if (scad < date.getTime()) {
          state.lastUserAlgo.pumps[ind] = null;// reset va
         someset = true;
      }}
    });
    if(someset)console.log(' ..... so found some manual proposed item invalid , so the valid one is now :', state.lastUserAlgo.pumps);else console.log(' ..... so found manual expired ');
    return someset;
  }


  function applyIntermed(proposal,smallgapTemp) { // antMap : see anticInterm2VirtMap in model.js. proposal is current proposed relays to update if intermediate is set 
                                                  // ex proposal=[false,false,false,false,false,false,true,false] so  gaspdcPref is true, int=7 , allora contagia anche i dev in antMap:
                                                  // >>>>  proposal=[true,true,true,false,false,true,true,false]
    if (antMap) {// antMap={gaspdcPref:[true,true,true,null,null,true,null]}/// the intermediate proposal to apply on other dev, if a intermediate var (gaspdcPref) is found true
                //  smallgapTemp=[false,false,true,null,,] if true then ,  if the anticipate proposal item  is true :  relay to proposal
      for (ant in antMap) {// ant is an itermediate var registered in antMap , example: ant=gaspdcPref
        let ind;
        if ((ind = state.app.plantconfig.relaisEv.indexOf(ant)) >= 0)// ind : index of ant
          if (proposal[ind])// the proposal says if intermediate of index ind is proposed true , so apply its consequences described in antMap[ant]
          {
            console.log('applyIntermed() found set the intermed var  of name ', ant, ' so apply its proposal gaspdcPref:[true,true,true,null,null,true,null] for true item in act flag : smallgapTemp[]');
            antMap[ant].forEach((val, ind) => {// force any (not  null) interm var PROPOSAL: [true,true,true,null,null,true,null] if intermediate algo activated it : smallgapTemp[ind].smallgap=true
              if(smallgapTemp&&smallgapTemp[ind]==true)
              if (val == true) proposal[ind] = true; else if (val == false) proposal[ind] = false;// fill virtual pump from intermediate virtual pumps
            });
            return true
          }
      }
    }
    return;
  }
}


function toeval(state,evstr){// preferred use :  '>>&&state.devmapping=[0,1,3,2,4];'   will fill the state.devmapping var !
  let templP;
  if(evstr)templP=evstr.split('&&');

      if(templP){
        if(templP[0]=='>>'){//preferred : when wants to set some var and return a value (state.mapping), beter work only in state var : '>>&&state.mapping=[0,1,3,2,4];'
        // run eval
        fc=templP[1];// jsfunctionText
        console.log(' first looseJsonParse in template ...&&fc&&... evaluating fc js code , fc is :',fc);
        let myf='"use strict";' + fc;
        eval( fc);// set devmapping. eval has this scope to work with ! so also vars. eval() will return the last calculated expression 
        console.log('looseJsonParse in ...&&fc&&... evaluating fc:',fc);
        return state.devmapping;// return
      }
      else       if(templP[0]=='=='){//// when wants only return a value
        fc=templP[1];// jsfunctionText
        console.log(' first looseJsonParse in template ...&&fc&&... evaluating fc js code , fc is :',fc);
        let myf='"use strict";' + fc;
        let calc=eval( fc);// eval has this scope to work with ! so also vars. eval() will return the last calculated expression 
        console.log('looseJsonParse in ...&&fc&&... evaluating fc:',fc,' evaluated : ',calc);
        return calc;
      }
    }
return null;

}
function checkval(lastUserAlgo){return true;}// todo  return true if updatedate + defTo is < curdate, the pumps request is valid 

function  valCorrection(value){// change 0 <> 1 user only in raspberry because the gpio had inverted on/off in connecting the port to rele
  if(value==null||isNaN(value))return value ;
  if(INVERTONOFF_RELAY)if(value==0)return 1; else return 0;
  
  }
  function genYaml(model,cfgdata,plant){// edit models.js template with user devices , generate yalm
    // nothing   mystring    >     "mystring"
    //    "mystring"          >    "£mystring£"   
    // &  is  : '
    // to ee how to convert a valid current yalm to json and opposite see . https://onlineyamltools.com/convert-yaml-to-json


    // 


    // std : "....."
    // cfgdata={version:'stdFV',virtualdev:[]}
  const FV3='fv3_optimize_'
  let version,virtual,addr,
  yaml_automation=[],
      yaml_mqtt={mqtt:[],automation:yaml_automation};


            
  if(cfgdata)
  if(version=cfgdata.version){
    if(version=='stdFV'&&(!model.version||model.version=='stdFV')){
      virtual=cfgdata.virtualdev;// [{addr:'shelly1-34945475FE06',devType:'shelly1',},,,,,,{subtopic:'var_gas-pdc_',varx:4,devType:'mqttstate'},] , a std FV optimizator process with its  std virtual devices indexing 0,,7 
      // relaisEv:['heat','pdc','g','n','s','split','gaspdcPref','block acs']
      if(virtual&&virtual.length&&virtual.length>=7&&virtual[0]&&virtual[6]){

        let mqttnumb=model.cfg.mqttnumb;

        // ind=0 dev 
        addr=virtual[0].addr;// = shelly1-34945475FE06
        //{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb 
        
        if (virtual[0].devType='shelly1'){// mandatory virtual[0]={devType:'shelly1',addr:'shelly1-34945475FE06'}
        mqttnumb[0].subtopic=addr;// update devo 0 model on numbmqtt
      
        // set yaml entity
        yaml_mqtt.mqtt.push({switch:yaml_dev_shelly_rele_def("sunshine_startgenerator",addr)});




        // mandatory : index 6 : preferred gas/fv var dev 
        if(addr=virtual[6].subtopic)// virtual=[{devType:'shelly1',addr:'shelly1-34945475FE06'},,,,,,{subtopic:'var_gas-pdc_',varx:4,devType:'mqttstate'},]
        //  {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'}
        if (virtual[6].devType='mqttstate'){// mandatory virtual[0]={devType:'shelly1',addr:'shelly1-34945475FE06'}
          mqttnumb[6].subtopic=addr;// update dev 1 model on numbmqtt
          mqttnumb[6].varx=virtual[6].varx;
          let varTopic='@'+plant+'@'+addr+virtual[6].varx,// '@Casina_API@ctl_var_gas-pdc_4'
          name_="sunshine_optimizing";
        // set yaml entity
        yaml_mqtt.mqtt.push({select:yaml_dev_mqtt_var_def(name_,varTopic)});// varTopic is yaml attribute_topic
        yaml_automation.push(yaml_dev_shelly_automation_def(name_,varTopic,plant,mqttnumb[6].portid));          

        
          return YAML.stringify(yaml_mqtt,{lineWidth:200});

        }else return;
        }  else return;
      }else return;

    }
  }
  function yaml_dev_shelly_automation_def(name,topic,plant,user){
    const topic2snd=topic+'/NReadUser/cmd';
    return{alias: FV3+name,
                      id:FV3+name,
                      initial_state:true,
                      trigger:[{platform:"state",entity_id:"select."+name}],
                   //   action:[{service:"mqtt.publish",data:{topic:topic2snd,payload:'{"payload_":{{ states.select.'+name+'.state }},"sender":{"plant":"'+plant+'","user":'+user+'},"url":"setMan","checked":1}'}}]
                      action:[{service:"mqtt.publish",data:{topic:topic2snd,payload:'{"payload_":"{{ states.select.'+name+'.state }}","sender":{"plant":"'+plant+'","user":'+user+'},"url":"setMan","checked":1}'}}]

                    };// 

    
    /*id: "optimize"
    initial_state: true
    trigger:
      - platform: state
        entity_id: select.NRInt
    condition:
    action:
      - service: mqtt.publish
        data:
          topic: '@Casina_API@ctl_var_gas-pdc_4/NReadUser/cmd'
          payload: .....
           */

    }
    function yaml_dev_shelly_rele_def(name,name_){// a switch  name= shelly1-34945475FE06
    
      return{ 
                        // id:FV3+"_"+name,
      name:name,
      qos:1,
      state_topic:"shellies/"+name_+"/relay/0",
      // value_template: '"{% if value == 'on' %} on {% else %} off {% endif %}" ', how  to code ' ?

      payload_on: ' "on"',
    payload_off: '"off"',
    state_on: '"on"',
    state_off: '"off"',
    command_topic: "shellies/"+name_+"/relay/0/command",
    json_attributes_topic: "shellies/"+name_+"/relay/0",
    json_attributes_template: '{ "jsonattr": "{{value}}"}'
                      };// £ means leave ""
                      /*
- switch:
    name: "RSSI"
    qos: 1
    state_topic: shellies/shelly1-34945475FE06/relay/0
#      value_template: "{% if value == 'on' %} on {% else %} off {% endif %}" only x sensor ?
    payload_on: "on"
    payload_off: "off"
    state_on: "on"
    state_off: "off"
    command_topic: shellies/shelly1-34945475FE06/relay/0/command
    json_attributes_topic: shellies/shelly1-34945475FE06/relay/0
    json_attributes_template: >
      { "jsonattr": "{{value}}"}
                      */
 }

 function yaml_dev_mqtt_var_def(name,attTopic){// a select  attTopic=  '@Casina_API@ctl_var_gas-pdc_4', to add  with starting and ending &
  return{ 
                    // id:FV3+"_"+name,
  name:name,

command_topic: "Node-Red-Register",
json_attributes_topic:attTopic,
json_attributes_template: ' { "algoSuggested": "{{value_json.payload}}"}',
options:['"0"','"1"']

                  };// £ means leave ""
                  /*
-   - select:
    command_topic: Node-Red-Register
    json_attributes_topic: '@Casina_API@ctl_var_gas-pdc_4'
    json_attributes_template: >
      { "algoSuggested": "{{value_json.payload}}"}
    name: "NRInt"
    options:
      - "0"
      - "1"
                  */
}

function stringIsFloatorInt(str){
  if(str==null||str=="")return false;
 if (Number.isNaN(Number(str)))return false;
 return true;
}
function stringIsInt(str){
  if(str==null||str=="")return false;
  if(Number.isInteger(Number(val)))return true;
  return false;
}
  }