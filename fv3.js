// **
//  this is a server end points: 
// - attende (esporto CXD)che il main app chiami (la export function)  fornendo un factory che per impianti tipo fusionsolar qui si puo' istanziare per avere un eventmanager di un impianto , cioe un fsm di un impiantochiami 
// - chiama  (xxx) la app chiedendo  
// IL fsm (locale o remoto (cms script o server remoto)) che torna una classe di fsm compatibile (fusionsolar)
// 
//  quando ho una connessione web istanzio/recupero un fsm singlethon che gestisce l'impianto user/plant luigi : > INSTANZ

// load page cfg 
require('dotenv').config();// load .env
const model=require("./nat/models.js");


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
const PersFold=process.env.PersFold;// persistence folder .data
const test1=require("cors");
const IsRaspberry=process.env.IsRaspberry != 'false';
console.log(' is raspberry: ',IsRaspberry,PersFold);
var https_ = require('https'); //require http server, and create server with function handler()
var http_ = require('http'); //require http server, and create server with function handler()
//console.log('http_.request:',http_.request);

// following the expresss set up  to manage user auth using session , see 
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
app.use(bodyParser.urlencoded({ extended: false }));
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
    if (username === "john" && password === "doe") {// add all user 
      console.log("authentication OK");
      return done(null, DUMMY_USER);
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  })
);

app.get("/", (req, res) => {
  const isAuthenticated = !!req.user;
  if (isAuthenticated) {
    console.log(`user is authenticated, session is ${req.session.id}`);
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


app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

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

var io = require('socket.io')(http) //require socket.io module and pass the http object (server on wich socket will be built)

// session setup :
// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

if(sessionMiddleware)io.use(wrap(sessionMiddleware));
if(passport)io.use(wrap(passport.initialize()));
if(passport)io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});



//console.log('after createserver , http_.request:',http.request);
let mqtt=require('./nat/mqtt');
var fs = require('fs'); //require filesystem module

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
const getio=require('./nat/io/getio.js').init(Gpio);// *****************************
                                          //  getctls(gpionumb,mqttnumb) will call old getctls(gpionumb,mqttnumb) !! so in .on('',  ... call it !)
                                          // NNBB getctls+getio are now moved to  module getio. seems called only by getctls that now is moved . so why mantain getio here ?
                                          // getio will be called when browser select the plant to manage
                                          // we used goon server handler definition waiting the device built (promise resolution) before to goon the run() section that started the server
                                          // NOW goon with handler definition then run the run() section ( start the server !)


let pumpsHandler=[];//  relais handler , also used by anticipating algo too (actuators)
                    // both button and algo actuacor can call this bank of handler(err,newvalue) 
                    // state.relays names are mapped to pumpsheader index in attuators() : pdc>0, g>1,n>2,s>3


// TODO  here the input def used before we write the getctls() io config. in future getctls will def following input too !

var pushButton ;
if(Gpio)pushButton= new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
let relais;
if(Gpio)relais= // arrays of io ctl
[new Gpio(18, 'in', 'both'),// gpio relay button to set gpio phisical relays : see :YUIO
new Gpio(23, 'in', 'both'),
new Gpio(24, 'in', 'both'),
new Gpio(25, 'in', 'both'),
new Gpio(4, 'in', 'both'),
new Gpio(17, 'in', 'both')
];









// relaisEv=relaisEv||['heat','pdc','g','n','s','split'];// socket event to sync raspberry buttons and web button, the 'name' of relais_ !


jrest_=require('./nat/rest.js');jrest_.init(http_,https_);
 const aiax=jrest_.jrest;//  che fa ?
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

  eMClass = app.getEventMng();// the fv ctl build as a eventemitter subclass singleton instance 

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
     console.log(' eMCustomClass : this is :\n',JSON.stringify(this,null,2));
    //eMClass.apply(this,arguments);// calls instatiators
    // this=new eMClass(arguments);
    Object.assign(this, new eMClass(arguments));
    console.log(' eMCustomClass : this now is :\n',JSON.stringify(this,null,2));
    this.cfg();// defined in this module, calls customOn(())

  }





// ccbb : the instanziator INSTANZ

let started ={};// {luigimarson:{  inst,,,}};// inst bank
ccbbRef=function ccbb(plantname) {// when client/plant got a request (a button) for a plant on a webpage , we fire : socket.on('startuserplant' ,that to operate/ register the fv ctl inst
  // so we instatiate or recover  the fsm: that is a eventmanager or connect to the server with a socket that has the same event managed (so the socket is the session/instance of the event manager for the plant)!
  let inst;
  if (plantname) {
    let name = plantname;
    console.log('ccbb  name:',plantname,' instance alredy started? : ',started[name]);
    //console.log('ccbb  factory:',eMCustomClass.toString());

    if (started[name]&&started[name].inst)// its alredy requested and a instance is alredy set, so continue on a fv instance 
    {console.log('ccbb   find an alredy running plant with name ',name,' with cur state: ',started[name].inst.state);
    started[name].inst.reBuildFromState=false;
      return started[name].inst;// just goon using the alredy running inst x plant name ( and its stored state inst.state )
            /*  **************
            would be better like in web post handler recover the session/state x a plant and run a stateless handler
            see where we talk about implement the ctl using a http post handler , instead of a app.ctl implementation

            */




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
        // inst.state.app.plantname=name;// todo in .cfg()

        //??
        // started.name.inst.start();// start the new instance


      }
      return inst;

    }
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




  function program(state,inp,probes){// /  probes={giorno:19.2,notte:,,,,}   
                                      // inp={'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}, 
                                      //  'notte':....}
                                    // the program algo : returns the new pumps state, store algo result on state.lastProgramAlgo

console.log('program() called with programming/scheduling data inp: ',inp,' and current probs: ',probes);
console.log('program() NB before call consolidate ret=optimize(ret) can have any null value!');

let ret=null,h,m;
let  date=new Date();date.setHours(date.getHours()+1);

// register into the last read probes
state.program.triggers2.lastT=[date.toLocaleString(),probes];//JSON.stringify(probes)]; anomalus array with different types
// find zone to activate
    if(probes&&inp){// zonaa,zonab ...

      let zonelist=  Object.keys(inp),toactivate=[],activation=false;;
     
      h=date.getHours();m=date.getMinutes();
 
        // Do stuff

      for(let i=0;i<zonelist.length;i++){// scan inp keys : the zones to find the current index in inp
        if(toact(zonelist[i],probes[zonelist[i]],inp[zonelist[i]])){// zona,valore sonda, programma x la zona
          activation=true;
          toactivate.push(zonelist[i]);
        }

      }




      /*
      >>>>>>>>>>>>>><
      to increse performance   solo se lastProgramAlgo cambia allora esco con un res, atrimenti aggiorno le date in lastProgramAlgo 
      ma esco con null cosi non si cambiano i rele/pumps !

      */

      let changing=false;
    if (activation)  {
      ret = [true, null, toactivate.indexOf('giorno')>=0,toactivate.indexOf('notte')>=0, false,null];// [heat,pdc,g,n,s,split]
        // set pdc + split according to text + hour + fv power
        
        if(ret&&state.lastProgramAlgo&&ch(ret,state.lastProgramAlgo.pumps)){// no change
          state.lastProgramAlgo={updatedate:date.toLocaleString(),probes,pumps:ret,model:'programbase'};// rewrite , just to set update date
          ret=null;
          console.log('programming() found no changes in [heat,pdc,g,n,s,split], so set ret: ',ret);
        }else{
          state.lastProgramAlgo={updatedate:date.toLocaleString(),probes,pumps:ret,model:'programbase'};
          ret=optimize(ret,date,h,m);//
          console.log('programming() found low temp in house, so after optimize() set relay [heat,pdc,g,n,s,split]: ',ret);

        }
    }// else leave ret undefined !
   

  else {
    
    ret =[false, null,false,false, false,null];// [false, null,null,null,null,null];
    if(ret&&state.lastProgramAlgo&&ch(ret,state.lastProgramAlgo.pumps)){// no change
      ret=null;
      console.log('programming() found no changes in [heat,pdc,g,n,s,split], so set ret: ',ret);

    }else{
      console.log('programming() didnt find any low temp in house');
      state.lastProgramAlgo={updatedate:date.toLocaleString(),probes,pumps:ret,model:'programbase'};
    }
  }

 

    }  else { state.lastProgramAlgo=false;ret = null;}
    if(state.lastAnticAlgo)console.log('programming  algo calc its new BASIC relays values proposal,present  lastAnticAlgo [pdc, g, n, s, heat,split] are : ',state.lastAnticAlgo.pumps);
    console.log('   >>> basic (not null) are relays comandable by program algo (thermostat programs Tx and PGMx ) : , the others are set by other algo or by user via browser');
    console.log('   >>> basic can control also relays specifically calc to optimize pdc/gas production (pdc and split and )');
    console.log('   >>> ex : basic set heat and g/n and gas, then anticipate force heat g/n/s + split and pdc. when anticipate ends basic will be recovered . if user off n manually at next running progran can or not change n ');
    console.log('       (use some flag for temp user action (next run program will force its values ) or modify the sched temp PDCx and rerun program or manually set pumps blocking or not the algos x some time (day))');
   
    console.log('BASIC values are anded with last assigned ANTICIPATE values recovered from state: : ',ret);
    console.log('   >>> anticipte relays force some relays as in some zones would be found a low temp. also set relays to set values comptible with pdc production , whatever best cfg set by user or program algo ');
    console.log('   >>> when anticipate ends the stored relays state are recovered  ');


    /* old
    if(state.lastAnticAlgo&&(state.anticipate||state.user)) // modify the program res if there are also user and anticipate proposal
      return consolidate(state,'program');
    else return ret;// the program algo res , con be null
    */
if(ret){// program wants to set some relays, ret can have nul val that must be resolved  also looking at other proposal user+ anticipate 
  return consolidate(state,'program',date);
}return null;



    function toact(zona,sonda,sc_){// zona,valore sonda, sc=programma x la zona. cerca le zone con temp inferiore alla programmata
      // sc={sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}

      let sc=sc_.sched;
      // nb toll future use : query lastAnticAlgo to see if a fv production is expected in short time
      // if(lastAnticAlgo.short)dt=true;
       let keylist=  Object.keys(sc);// orari del programma
       
       let slot=-1,last=keylist.length-1,temp=sc[keylist[last]],resu='none',tempx='';
       // resu='slot x : '+ last +' temp ' + sc[keylist[keylist.length-1]; 
        
        for(let i=0;i<keylist.length;i++){//
         //  Object.keys(bodies).forEach(function(key,index) {// for each bodies items post 
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
            //tempx =tempx + '-'+i; 
            let ma=keylist[i].split(":");// ['8','30']

            console.log(' toact() analizing  zona: ',zona,' orario: ',keylist[i],',  with present hour min : ',h,m,)
          
            if(h<ma[0]){// 10 < '8'
            // got! ends scan the index in sc is slot
            slot=i-1;i=1000;
            //tempx =tempx + ' - got slot '+ slot ;// ma[0]; 
            console.log(' got slot because present hour is less then slot+1 hour');
          }
          
          else{      if(!(h>ma[0])&&m<ma[1]){
            
                               slot=i-1;i=1000;
                              // tempx =tempx + ' - got slot '+ slot +' minute '+m;// ma[0]; 
                              console.log(' got slot because present hour is = but current min is < !');
                    }
          
               }
          
          }
          if(slot<0)slot=last;

          temp=sc[keylist[slot]];//programmed temp 
          // if(lastAnticAlgo.short)// last anticipate expect to produce fv energy (> 2kWh) in short time (less 1 hour)
          if(sc_.sched&&sc_.sched[keylist[slot]]>0&&sc_.sched[keylist[slot]]<1)
            temp+=sc_.sched[keylist[slot]];

          
         
      
        //resu=tempx+' - slot '+ slot +'/'+(slot+1)+', temp ' + sc[keylist[slot]]; 
        console.log(' toact() slot: ',slot, ' temp: ',temp);
       // 
       if (temp>sonda)  {
        return true;
      }// else leave ret undefined !
      
      
      else ;
      
      
      }
      function ch(ret,oldret){

        if(ret.join()==oldret.join())return false;// ret == oldret so pumps are the same 
        return true;
        }

}


function optimize(res,date,h,m){//res=[heat,pdc,g,n,s,split]
  // set pdc + split according to text + hour + fv power  .>>    what is text ???
// here calc pdc + split according to text and hour , 
// can also call anticipate on behalf (al posto di usare) of anticipate exsec job that just fill state.aiax and state.anticipate but we must be shure program algo shoul be active !
// anyway user can reset the value
res[1]=false;// pdc
res[5]=false; //split
  return res;
}


function anticipate(state,algo){// the algo : returns the new pumps state, store algo result on state.lastAnticAlgo
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
 let {battery,inverter,cloudly}=state.aiax,// filled with aiax in  getstat/bodies
 
 
 temp=20,
 {running,starthour,stophour,dminutes}=state.anticipate,
 triggers;
 if(state.anticipate)triggers=state.anticipate.triggers;

  let a=2,//// basic model save battery
  ret,model;
if(triggers){
if(triggers.PdCTrig1){a=2; console.log(' anticipate algo find required policy : PdCTrig1');
     model="PdCTrig1";// add .policy=.....
     }

  if (a == 1)
    ret = [false, false, false, false,false,false];// [heat,pdc,g,n,s,split] 
  else if (a == 2) {// basic model save battery
    if (triggers)
    { if (cloudly <= (100- triggers.FVPower)) {
      ret = [true, true, true,null, null,true];// [heat,pdc,g,n,s,split] 
      console.log('anticipate() find cloudily low so start pdc');
    }else{// no anticipating, so no requirements
      ret = [null, null, null,null, null,null];// [heat,pdc,g,n,s,split] 
    }
  }
  }
  else ret = null;// algo not producing any advise requirements
  console.log('anticipate algo calc new relays values : ',ret);
   
}else {
  console.log('anticipate algo cant find triggers, so retuns null ');
  console.error('anticipate algo cant find triggers ');
ret= null;//[false, false, false, false,false,false];  
}
if(ret){
let  pdate=new Date();pdate.setHours(pdate.getHours()+1);
//state.lastAnticAlgo={updatedate:new Date().toLocaleString(),level:1,policy:0,algo,pumps:aTT,model};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand relays to perform a objective; eco,lt,ht,timetable
state.lastAnticAlgo={updatedate:pdate.toLocaleString(),level:1,policy:0,algo,pumps:ret,model};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand relays to perform a objective; eco,lt,ht,timetable

// pumps relay set after
}else {// do nothing , reset last antic results
  state.lastAnticAlgo=false;
}
// consolidate with program algo  and user manual, also if lastAnticAlgo=false : program <> anticipate
if(state.lastProgramAlgo&&ret) return consolidate(state,'anticipate');
else return ret;

}

function login(userName) {// to call to set login on inverter openapi, got the token

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
console.log(' login() started x sername: ',userName);

  let body=
    {
      //"userName":"MarsonLuigi_API",
      userName:userName,
      "systemCode":"Huawei@123" // put in .env
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
  console.log(' getstat called with state: ',JSON.stringify(state,null,2));
  let bodies=// {body,devTypeId,extract}. extract: extrat usefull info (put in state.aiax,xxx) from resu.data, result=resu={data,token} 
  { inverter:  {body: {devIds:"1000000035350464",// body: the post request 
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
    battery :  {body:{devIds:"1000000035350466",
                devTypeId:"39"},
                extract:(data)=> {
                  
                  console.log(' aiax extracting battery info from aiax data got: ',JSON.stringify(data,null,2));

                  // todo : change state.aiax.inverter to state.aiax.battery 
                  let ret= state.aiax.battery= data.data[0].dataItemMap.battery_soc;
                  console.log(' aiax x battery got: ',ret);
                  return ret;


                 }}
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
    console.error('aiax got bed result, exit execute procedure with undefined val, error: ',error);
  }

  console.log(' getstat recover from device: ',key,', the value : ',res); 

    // in case aiax fire error and be rejected , res=undefined
  if (res === null) {// token expired
    console.log(' getstat recover from device: ',key,' an expiered token');
    i=100;results=null;
  } else if (res === undefined) { // true
    console.log(' getstat recover from device: ',key,'aiax result cant be calc, so exit execute procedure ');
    i=100;results=undefined;
  }else  { results[key]=res;// goon next dev
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
  return results;//  a promise if async (uso await !)  results={inverter:1.2,battery:2.5}, null if expired token , und if error
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
      console.log(' getWeath called with state: ',JSON.stringify(state,null,2));
      let bodies=// {body,devTypeId,extract}. extract: extrat usefull info (put in state.aiax,xxx) from resu.data, result=resu={data,token} 
      { cloudly:  {body: null,// to be transf into url enc
                    extract:(data)=> {
                      console.log(' getWeath aiax extracting weather info from aiax data got: ',JSON.stringify(data,null,2));
                      let  d=new Date();d.setHours(d.getHours()+1);
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


function startfv(eM) {// ** start/update singlethon 
  // console.log(' startfv : the ctl instance is :\n',JSON.stringify(eM,null,2));
  let plant=eM.state.app.plantname;
  console.log(' startfv plant: ',plant,' , following  we allign relay according with current recovered state running setPump()');

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

      let resu=await login(plant)// or login(plant).then(cb)
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
      console.log('connect(): token not available, so fired login rest await that returned with token:', resu.token);
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
    console.error(' getstat recover from device: ',key,'aiax result cant be calc ');
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
    console.log(' handler fired by event startcheck, with input data: ',inp,' state: ',state);
 
    /* old
    let calc=(st) =>{// returns false if anticipating
      // ............
      return true;
    };*/
    let aTT,res={};

    if((aTT=anticipate(state,'anticipate0'))&&aTT.length>0){// algo : null if not anticipating, [pdc,...] if anticipating with its pump setting

      // await   // dont need to wait !
      attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5])//[heat,pdc,g,n,s,split] val=true/false/null   set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
                                                                  // ?? (pdc,g,n,s)  set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
        .then((results) => { // could also await in this async func !
         
            console.log("All setPump resolved");

            // do nothing with results array
          //  resolve(results);  // WARNING :  hopily all it has called :
        })
        .catch((e) => {
            // Handle errors here
            console.error("attuators error: ",e);
        });

      res.execute=aTT.toString();// pass aTT on ev2run input, seems useless

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

console.log(' handler fired by event initProg ');

let state= this.state, // IS OK ???????, must be not null , defined in  app2 constructor()/clearState()
  plant=state.app.plantname;// the real input , no dummy !

// just update status to the  ....? if needed 

let probes , reads=2,retry=false;

    probes={};
    probes.notte=parseFloat(await shellcmd('modbusRead',{addr:'notte',register:'temp',val:0}).catch(error => { // val useless
      console.error('  shellcmd catched ,error: ', error);
      retry=true;
    }));
    if(retry){
      retry=false;
      probes.notte=parseFloat(await shellcmd('modbusRead',{addr:'notte',register:'temp',val:0}).catch(error => { // val useless
        console.error('  shellcmd catched ,error: ', error);
        retry=true;
      }));
    }
    if(retry){retry=false;reads--;}
    probes.giorno=parseFloat(await shellcmd('modbusRead',{addr:'giorno',register:'temp',val:0}).catch(error => { // val useless
      console.error('  shellcmd catched ,error: ', error);
      retry=true;
    }));
    if(retry){
      retry=false;
      probes.giorno=parseFloat(await shellcmd('modbusRead',{addr:'giorno',register:'temp',val:0}).catch(error => { // val useless
        console.error('  shellcmd catched ,error: ', error);
        retry=true;
      }));
    }
    if(retry){retry=false;reads--;}
    console.log('  genZoneRele , reading temp , sonda gave:  ',probes);

if(reads<1){probes=null;// todo retry if fails some read
    //todo exit execute
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
                            // inp_= {'initProg':{giorno:19.2,notte:,,,,},dataArr:{'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}, 'notte':....}
  let inp,probes=null;
  if(inp_&&inp_.dataArr){inp=inp_.dataArr;//  inp={'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}, 
                                          //  'notte':....}
  }
if(inp_&&inp_.initProg){probes=inp_.initProg;// probes={giorno:19.2,notte:,,,,}

  let state=these.state;//this.state;
  console.log(' handler fired by event genZoneRele , with input data: ',inp_,' state: ',state);

  /* old
  let calc=(st) =>{// returns false if anticipating
    // ............
    return true;
  };*/
  let res={},aTT;

    if((aTT=program(state,inp,probes))&&aTT&&aTT.length>0){//  probes={giorno:19.2,notte:,,,,}  
                                          // inp={'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}, 
                                          //  'notte':....}

      
    attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5])// [heat,pdc,g,n,s,split] val=true/false/null   set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)

    .then((results) => { // could also await in this async func !
         
      console.log("All setPump resolved");

      // do nothing with results array
    //  resolve(results);  // WARNING :  hopily all it has called :
  })
  .catch((e) => {
      // Handle errors here
      console.error("attuators error: ",e);
  });



    // endexec= aTT.toString();// pass aTT on ev2run input, seems useless
  res.execute=aTT.toString();// in case of void array can be ""
      
  // register result of the exec procedure!
  //state.lastAnticipating={updatedate:new Date().toLocaleString(),level:1,policy:0,procedure:proc,pumps:aTT};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
                                              // pumps relay set after
//     state.anticipating={date,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
    }else{// aTT returned undefined or null : 
    //  state.lastAnticipating=false;
     // endexec='genZoneRele: no action';// just exit  executing ev2run

     res.noexec='noprogramming';

      // trim some valves, ex base timetable
    }

    //sendstatus(state);//
    // or directly:
    // io.sockets.emit('status',JSON.stringify(state,null,2));
  
  cb(0, res);// false : nothing to do 


};




// end event to process programming algo 


});
}// ends custom


function repdayly(plant,hin, hout, fn) {// old : prefer checkFactory()
                                        // program timetable of  generic test event firing: fire procedure execute(,'startcheck',,,) with specific event list (ev2run ......) , connect + startcheck,   to perform check to start anticipating
                                        // note that these events must be defined on customOn()
                                        // to do  to start at a time in a day . it will call ececute .. and at every hour 
const d = new Date();
let procName='startcheck'+ d.toLocaleString();


console.log(' old (prefer .....) repdayly()  start  procedure ',procName,' fn: ',fn);
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

  function callNTimes(plant,n, time, fn) {// start the fv server main event (check periodically the status of fv ctl) : evname=startcheck, asyMajorEv=''
                                          // every time (1 ora) fire a fn.execute()

                                          // to review see: https://www.w3schools.com/jsref/met_win_settimeout.asp
                                          // here n is a closure var , could be passed iteratetivily as param !

    function callFn() {// n-- , se positivo lancia fn.execute e dopo ulteriore ora itera callFn
      if (n--<=0) {
        console.log(' callFn start priodically ',procName, ' procedure is ending, cur time:',new Date(),' n is: ',n);  
        return;}

      console.log(' callFn start priodically exec procedure ',procName, '.  cur time:',new Date(),' n is: ',n);
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




    console.log(' callFn start priodically , time:',new Date());

    
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
        let  pdate=new Date();pdate.setHours(pdate.getHours()+1);
      console.log(' callFn start priodically exec procedure ',procName, ' for plant: ',fn.state.app.plantname,'.  cur time:',pdate);//,' this day, after this exec, we run other ',n,' times');
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
        const pdate = new Date();  pdate.setHours(pdate.getHours()+1);  //closure with inner callF, the closure state n will be updated till hourout is got !
       
        // console.log(' repeatcheckxSun : start hour ',hourin,' stop hour: ',hourout);                                                 
        let hourinterval = hourout - hourin;// ex  9-8=1  , the testing to do will be 2, one at 8 , one at 9
        let goon, onceaday = true;
        if (DEBUG) goon = true; else goon = false;// debug is true, production = false   , now false !
        if (goon);//;// one day start immediately
        else {

          let min; if (DEBUG1) { min = pdate.getMinutes() + 2; }//if(min>59)min=min-60;}// start 2 min later
          else min = 0;
          //if(hourin==0)hourin=1;
          console.log(' repeatcheckxSun : at ', pdate, ' setinterval  handler registering;  minutes to match: ', min, '; hour to match: >=', hourin, '; hourout: ', hourout, ', period: ', period, ', procname: ', execParm.procName);

          let minIn = hourin * 60 / period,// in in minuti normalizzati
            minOut = hourout * 60 / period,// in in minuti normalizzati
            minN = min / period;// additional condition iniziale todo

          interv = setInterval(function () { // Set interval for checking, never stop till the repetion ends 
            var date = new Date(); // Create a Date object to find out what time it is   gtm ?
            date.setHours(date.getHours()+1);
            let dm = date.getMinutes(), dh = date.getHours();
            if (dh == 0&&dm==0) onceaday = true;

            let
              dateN = (dh * 60 + dm) / period,// present time normlized
              cicles = minOut - dateN;// cicles of period minutes to run execute
              if(cicles<1)cicles=1;// min 

            console.log(' repeatcheckxSun : setinterval  handler called x procName: ', execParm.procName, ' at hour: ', dh, ' and minutes: ', dm, '. present time norm: ', dateN, 'must be in: ', minIn, '-', minOut);
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
  io.sockets.emit('status',state,prettyjson);// no   , socket.emit...
}



function attuators(fn,heat,pdc,g,n,s,split){// ctl,true/false,,,   (heat,pdc,g,n,s,split)
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
  if(fn.devio.relais_[pump_])// curval=await this.relais_[pump_].readSync();// 0/1
    curval=await fn.devio.relais_[pump_].readSync();// 0/1
  else curval=0;
  if(value&&curval==0||((!value&&curval==1))){// state value != cur rele value 
    console.warn(' bug to fix : attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
    console.log(' bug to fix : attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
  }
}}
}

function setPump(pumpnumber,on,fn){// 0,1,2,3    on : changing value (true/1 or false/0)
  console.log(' setpump() will emit socket pump event (+ direct onrelays()) to change browser relay value x pump number',pumpnumber);

  let on_,state=fn.state;
  let relaisEv=state.app.plantconfig.relaisEv;
  if(on)on_=1;else on_=0;// conver true > 1
  pumpsHandler[pumpnumber](0,on_);// called by anticipating algo in attuators
                                // its a copy of gpio button relays handler (so we are simulating a gpio button press) that launch socket events
                                 // after set the browser pump flag will return with a socket handler that will call
                                 // onRelais(pumpnumber,on,'browser...',) : the gpio phisicalrelay
                                 // so the gpio relays can be called 2 times !
                                 // see :YUIO
  console.log(' setpump() just emitted socket  event x pumpnumber',pumpnumber,' asking to set: ',on);
  //onRelais(pumpnumber,on_,'server',state);// anyway set directly the gpio relay, in case the browser is not connecte ! 
                                          // ERROR : pump not pumpnumber !
  onRelais(relaisEv[pumpnumber],on_,'server',fn);// dont wait, WARNING usually called before the duplicate call coming from browser as feedback of previous  pumpsHandler[pumpnumber] call !
                                    
                                          
  
  return Promise.resolve(true);// why return promises ?
}



// here the body :it wait for a get call connection , then add a gpio button listener to emit event on fv controlle eM   :
// when connected (can be many user browser session ?) add a button and a socket listener
io.sockets.on('connection', function (socket) {// WebSocket Connection :server is listening a client browser so now we built the socket connection, transmit to server if there are status updates 

console.log('socket connected to a client');


// here the init x session auth :

console.log('on connection got from a browser with user session set in login, user: ',socket.request.user,`new connection ${socket.id}`);
let user=socket.request.user ? socket.request.user.username : '';// set user in closure

socket.on('whoami', (cb) => {// used ?, respond indicating current user to client socket. is needed ? , we can pass user info in specific event emits
  cb(user);// set by passport , send user also at event level , not used
});

const session = socket.request.session;// session used in other tcp request ??, if only socket are used the user is avaible here for all socket connection closure !
console.log(`saving user and sid ${socket.id} in session ${session.id}`);
session.socketId = socket.id;
session.user = user;
session.save();// save socketid



  let eM,//  >>> e' settato da socket.on('startuserplant',...  ed e' legata/propieta del connection handler dove sono def gli socket events es socket.on()
        // poi usato da ......
        
   repeat,// active rep func x anticipate
  repeat1;// active rep func x temperature programmer
  // define the listener :
  socket.on('startuserplant', function (plant_,feat) { // user press button to connect to some plant, so this event is fired , feat url enc
                                                      // inst/fn/ctl/eM :  here we create the ctl of the plant that will be passed to all the service functions 
                                                      // todo : emit login screen x user=data
    console.log('event startuserplant listening handler for plant ',plant_.name,' feature: ',feat);

    if(plant_);else return;


    // user login or just the plant name in some html field + button start that will fire event startuserplant
    let user_ = user,// the user is the passport user set in session/req.user when (in closure) the client ask a ws connection to server
   plantcnt=model.ejscontext(plant_);// ejs context=plantcnt={pumps:[{id,title},,,,]}
    plantconfig=model.getconfig(plant_);// 
    plantcfg=model.getcfg(plant_);// get plant cfg from available pool. : return plants[plant].cfg;
    // todo if(plantcfg&&...)
    eM = ccbbRef(plantcfg.name);// ** il fsm recupera/crea un siglethon x plant , state to be updated with recoverstatus()
    if(eM)console.error('startuserplant , eM is built/recovered from pool ');
    if(eM)console.log('startuserplant , eM is built/recovered from pool ');
    eM.socket=socket;// update/embed the socket to connect the browser client
    if (eM) {
     // startfv_(eM,user);// ** start/update singlethon 
     recoverstatus.call(eM,plantcfg,plantcnt,plantconfig).then((em_) => startfv_(em_)); // >>>>   recoverstatus() returns a promise resolved. we finished to write status back with promise .writeScriptsToFile
                                                                    // ctl event status: in eM.state 
                                                                    // socket in eM.socket
                                                                    // plant cfg in eM.status.plantcfg, 
                                                                    // dev i/o still to build 
                                                                    // will cb startfv_   // TTGG  // why do not use eM invece di passarlo come em_ ?
                                                                    //recoverstatus_.call(eM,user.name).then((em_) => startfv_(em_));// will cb startfv_
// load also ejs context x future use :




     // DANGER  :::   here state could not jet be recovered by previous promise !!!!
     //     so , it is really dangerous ? we just add properties to state 
     let state=eM.state;
     if(eM.reBuildFromState){// we got status in persistance
     
    

   
     // same handler that : on('repeatcheckxSun',(starthour,stophour,hourinterval) );
     
     
     if(state.anticipate){
      let {dminutes,starthour,stophour,triggers}=state.anticipate;
      console.log('event startuserplant loading the repeating procedure from state.anticipate:  ',state.anticipate);

      // same handler that : socket.on('repeatcheckxSun', );
     repeatHandler(starthour,stophour,dminutes,triggers);// and rewite the state alredy wrote by TTGG  

     }
     // 
     if(state.program){
      let {dminutes,starthour,stophour,triggers2}=state.program;
      console.log('event startuserplant loading the repeating procedure from state.anticipate:  ',state.program);

      // same handler that : socket.on('repeatcheckxSun', );
     repeatHandler1(starthour,stophour,dminutes,triggers2);// and rewite the state alredy wrote by TTGG  

     }
     eM.reBuildFromState=false;// reset now the ctl has the procurure loaded on closure checkFactory()
     }

    }
    return;// thread ends
  });// ends on('startuserplant'
// });

  function startfv_(eM){// entry point when staus is recovered from file   // // why do not use eM invece di passarlo come em_ ?
  
    let plant=eM.state.app.plantname;// or app.plantcfg.name

    // user=plant;todo recuperare da status ?? no gia sistemato col event 'whoami' see DDWW
  
    
  abilita(eM.state);//// abilita sezione gestione eventi ( relais_)  plant nella pagina
  startfv(eM);// ** start/update/recover plant singlethon ctl eM state and .....


  }
      // DDWW nb con l'evento 'whoami' la pagina browser dovrebbe aver gia recepito lo user che sta chiedendo la gestione del plant
              //    todo:
              //         in tale .on('whoami',,) creare un session nel spa browser ( un obj) che ricorda alla spa lo user creato con passport che viene
              //          - gia passato nel session del req (req.session.user  o req.user )  per il server ( che al event 'connection' manda appunto il whoamI al browser e stora nel closure il user)
  function    // configura il plant nella pagina per recepire la configurazione storata in state.app.plantcfg.name

  abilita(state){// plantcfg=               . build devices . gpio or mqtt
    let plantconfig=state.app.plantconfig;
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
let{gpionumb,mqttnumb,relaisEv,devid_shellyname}=plantconfig;

let ejscont=app.plantcnt;// ejs context=ejscontext(plant).pumps=[{id,title},,,,]
                                  // getejscon(plantcfg);// noe the pumps view are generated from html and not using ejs !!!!
// moved here , right location ?

buildPlantDev();


async function buildPlantDev(){// build here the plant ctl devices (ctl/eM/fn).iodev.relais_ dev/pumps (+ /button switch) and their handlers 




// start building relais_ the dev io ctl  
// start mqtt connection :
let isAvail;// old , better or mqtt.avail itself
// register gpio 11 as mqtt device and try connecting
if(!(isAvail=mqtt.init(devid_shellyname))){// devid_shellyname={11:'shelly1-34945475FE06'}
                                            // AAFF :after start mqtt connection  wait connection and subsribe all gpio , 
                                            // so  as soon cb is called we have status[gp]=[] (the subscription is ok )
  console.log(' fv3():mqtt client not available, exit/continue without the mqtt dev,  or retry connection to mosquitto');
}
 

eM.iodev={relais_:[],// the io dev ctl list , their name are in relaisEv array. if null the ctls func (readSync and writeSync ) wont be called 
//gpionumb=gpionumb||[12,16,20,21,26,19,13,6];mqttnumb=mqttnumb||[11,null,null,null,null,null,null,null];
// methods, no attuators ,
}

// using getio,  call old getctls(gpionumb,mqttnumb);

  // getio(gpionumb,mqttnumb).then((cts)=>{
  //.iodev.relais_=cts;run();});}// load in ctl the oparational available dev i/o

// must await it !
// eM.iodev.relais_= await getio.getctls(gpionumb,mqttnumb).ctls;
let devices= await getio.getctls(gpionumb,mqttnumb);
console.log(' buildPlantDev(),got dev ctl');
eM.iodev.relais_=Array(devices.ctls.length).fill(null);

state.pumpMap=Array(devices.ctls.length).fill(null);

devices.ctls.forEach((mdev,index)=>{
  if(mdev){eM.iodev.relais_[index]=mdev.ctl;
    state.pumpMap[index]=devices.devmap[index];
  }
});
console.log(' buildPlantDev(),got dev ctl list: ',state.pumpMap);
// ???????????????????????
// run();// load in ctl the oparational available dev i/o

}// ends buildPlantDev

if(relaisEv.length>eM.iodev.relais_)console.error('buildPlantDev() : managed dev relaisEv are more then avalable devices .iodev.relais_ ! plesa abort ')
  // implements also a button/algo handler array for actuators / pumps
  relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
    // 'g','n','s']
    
if(!eM)console.error('event connection setting hw button , eM is still null ');
if(!eM)console.log('event connection setting hw button, eM is still null ');
pumpsHandler[ind]=watchparam(pump);// handler for actuators, each handler emit the socket.emit('pump' to browser.
if(relais&&relais[ind])relais[ind].watch(pumpsHandler[ind]);// attach same handler watchparam(pump) to all gpio pump  buttons 
                          // that handler works also x algo handler called in attuators/setpump   ex pumpsHandler[0](err,value) 0 means pdc pump

});





scope={relaisEv}// pass the part of plantcfg che interessa lo spa nel browser , to config pumps in html js  after  emit('view',,)
//was : ejscont=model.ejscontext('luigi')// to generate pumps list in html after  emit('view',,)


    // view the relays input on browser , see there the def of context ={ejscont,scope}
    let context={ejscont,scope};
    socket.emit('view', context); // nb .on('pump',,) can be not jet assigned 
    console.log('event startuserplant : abilita(). it is  emitting socket event view, user plant is: ',plantconfig);
    // socket.emit('status',,,) .on('status',)
  }// ends abilita()



  var lightvalue = 0; //static variable for current status

  // set local gpio relay to some button on web page, web page will emit a socket event 'light' that will in this server activate
  // the gpio port

  if(pushButton)pushButton.watch(function (err, value) { //Watch for io hardware interrupts on pushButton  
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
 
 
 function onRelaisClos(){

  return function(pump,val,coming){// return with a void closure ?
    console.log(' onRelaisClos() called x pump: ',pump,' set value: ',val,' coming from: ',coming,' ctl is null: ',!eM);
    if(!eM)console.error('onRelaisClos(), eM is null , cant process browser old event call');
    if(!eM)console.log('onRelaisClos(), eM is null ');else console.log(' onRelaisClos(), eM is found '); 
    if(eM)onRelais(pump,val,coming,eM);}//dont wait! eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
 }


// socket.on('pump',onRelaisClos());// 
 socket.on('pump',(a,b,c) => {
  if(!eM)console.log('pump socket event called ,param: ',a,b,c);
  if(!eM)console.error('pump socket event, eM is null ',a,b,c);

  onRelaisClos()(a,b,c)
 });// 
                            //  >>>>>>>>>>>>>>>>   startfv can alredy fired the event before a user in some browser 
                            /* i also could :
                            socket.on('pump',(pump,val,coming) => {
                              console.log(' onRelaisClos() called x pump: ',pump,' set value: ',val,' coming from: ',coming);
                              onRelais(pump,val,coming,eM);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)

                            );
                            */


function setanticipateflag(set_,algo,activeAlgoRes=null){ // store in state the algo launch params (ex: triggers), update state store :
                                                          // state[algo]=.... ex state.anticipate={....}  .
                                                          // if set_=null :  state.anticipate=false
                                                          //    state[algo]=false     the algo init parm are false because the algo is not active
                                                          //    and
                                                          //    state[activeAlgoRes]=false    the last algo result are nullified so dont influence relay set 
                                                          
  if(!eM)console.error('.. setanticipateflag() eM is null ');
  if(!eM)console.log('.. setanticipateflag() eM is null ');else console.log(' . setanticipateflag(), eM is found '); 
    console.log(' setanticipateflag() called to set running algo: ',algo,' init param: ',set_,' , in state.',algo,' ,(if null init parm will also  reset state.',activeAlgoRes);
    //if(set_)
    anticipateFlag(set_,eM,algo,activeAlgoRes);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)


// repeat=checkFactory(eM);// eM could not still be set by a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
 console.log('repeat could not be set now because eM is still null !! well be set on :  socket.on(startuserplant...');

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


socket.on('stopRepeat',() => {
  repeat=repeat||checkFactory(eM);// could be find null ???
  console.log(' stopRepeat event fired');
  if(repeat){
  repeat.stopRepeat();
  setanticipateflag(false,'anticipate','lastAnticAlgo');//// reset in state the algo launch params (ex: triggers), ex : state.anticipate=false
                                                          //  update state.lastAnticAlgo
  }
  });// 


// now the same x programming temperature x many zones
socket.on('startprogrammer',repeatHandler1);// start anticipating algo with setting and run an execute()
function repeatHandler1(starthour,stophour,dminutes,triggers2) {// sched triggers2 keys:extract2 = ["Tgiorno","PGMgiorno","Tnotte","PGMnotte"],
  console.log(' startprogrammer socket event handler repeatHandler1() called with triggers2: ',triggers2 )   ;                                                            // sched={'giorno':['8:30':t1,"17:00":t2]} see initProg event x keys definitions
  let sched={};// {giorno:{'16:10':-3,,,,},notte:{}} 
  if(!triggers2)return;
  // if(triggers2.Tgiorno&&triggers2.PGMgiorno)Object.assign(sched, triggers2.PGMgiorno);
  // if(triggers2.Tnotte&&triggers2.PGMnotte)Object.assign(sched, triggers2.PGMnotte);
  if(triggers2.Tgiorno&&triggers2.PGMgiorno){sched.giorno={sched:triggers2.PGMgiorno};
    if(triggers2.PGMgiornoToll){sched.giorno.toll=triggers2.PGMgiornoToll;// // tolleranze (un valore x all), same keys of sched.giorno.sched
      console.log(' startprogrammer socket event handler repeatHandler1() saved tollerate array: ',triggers2.PGMgiornoToll,'\n sched: ',sched);
    }
  }
  if(triggers2.Tnotte&&triggers2.PGMnotte){sched.notte={sched:triggers2.PGMnotte};
    if(triggers2.PGMnotteToll)sched.notte.toll=triggers2.PGMnotteToll;// // tolleranze (un valore x all), same keys of sched.giorno.sched
  }
  if(!eM)console.error(' repeatHandler1(), eM is null ');
  if(!eM)console.log(' repeatHandler1(), eM is null ');else console.log(' repeatHandler(), eM is found '); 
    repeat1=repeat1||checkFactory(eM);// could be find null ???
    console.log(' startprogrammer socket event handler repeatHandler1() is launching repetition job repeatcheckxSun() with sched: ',sched );
    if(repeat1.repeatcheckxSun(starthour,stophour,dminutes,prog_parmFact(sched))==0)// exit ok 
    setanticipateflag({running:true,starthour,stophour,dminutes,triggers2},'program');
    else {repeat1=null;
   console.log(' startprogrammer() not called ');
    }
  }


socket.on('stopprogrammer',() => {
  repeat1=repeat1||checkFactory(eM);// could be find null ???
  console.log(' stopprogrammer event fired');
  if(repeat1){
  repeat1.stopRepeat();
  setanticipateflag(false,'program','lastProgramAlgo');// set state.program=null , so init parm = null means that the algo is not active !
                                                        //// store in state the algo launch params (ex: triggers),  update state.lastAnticAlgo
  
  }
  });// 

 }// ends cf (or cb ?!) function (socket) on sockets.on('connection',)




);// ends io.sockets.on('connection'


// todo what is this ?
// run a bash shell
process.on('SIGINT', function () { //on ctrl+c
  console.log('control c got');
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  if(pushButton)pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});




//return 'ok';    ??


function anticipateFlag(set_,fn,algo,activeAlgoRes){// like onRelais, write state after completed it to store anticipate algo init param// algo =anticipate/program
  if(!fn)console.error('anticipateFlag(), eM is null ');
  if(!fn){console.log('anticipateFlag(), eM is null ');}else console.log(' anticipateFlag(), eM is found ');
  let state=fn.state;
  state[algo]=set_;
  if(set_==null)state[activeAlgoRes]=null;// nullify last algo results 
  return api.writeScriptsToFile(fn)
    .catch(function(err) {
      console.log(' anticipateFlag(),  writefile catched : ',err);
        console.error(err);

        // process.exit(1);
      });
}

async function onRelais  (pump,data,coming,fn) { //pumps unique handlerget pumps switch status from client web page  data=0/1 pump ='pdc',,,
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
                                  
  console.log('OnRelais started x pump: ',pump, ' coming from ',coming);
  if(!fn)console.error('onRelais(), eM is null ');
  let state=fn.state,relaisEv=state.app.plantconfig.relaisEv;
  let value=state.relays[pump];// true/false, pump value as recorded on status
  let lightvalue = data,// 0/1 value to set
  pump_=relaisEv.lastIndexOf(pump);// the index in relais_
  if(pump_>=0){// found
  if(fn.iodev.relais_[pump_])
    {curval=await fn.iodev.relais_[pump_].readSync();// 0/1 present value of gpio register
    if(curval==null)curval=0;// std out 
  }
  else // if the device is not available read a dummy 0
    curval=0;
  console.log(' onRelais, coming from: ',coming,', current rele position x ',pump,' is ',curval,' asking to set : ',data); 
  console.log('              onRelais, state: ',state); 
    let lchange=false; //  >>>>>>>  TODO : gestire le incongruenze tra state.relays  e current relay value : curval
  if(value&&curval==0||((!value&&curval==1))){// state != cur value . a problem if not just starting!
    console.warn(' onRelais, find current pump ',pump,' state different from current hw pump position thats: ',curval); 
    console.log(' warn: onRelais, find current pump ',pump,' state different from current hw pump position thats: ',curval); // ????  >>>>>>>  TODO ??: gestire le incongruenze tra state.relays  e current relay value : curval
    lchange=true;// state and present value are different !
  }
  if (lightvalue != curval) { // 0/1 != 0/1 gpio comanding relays is called,>>>>> only change gpio if current position/value is different from present hw relay value !!
    console.log(' onRelais,  changing current rele hw position/value x ',pump,' to new value: ',lightvalue); 
    if(fn.iodev.relais_[pump_])fn.iodev.relais_[pump_].writeSync(lightvalue); //turn LED on or off
    console.log(' onRelais,  todo : verifying current rele  position/value changing  x ',pump,' now is: ',lightvalue); 
    //console.log(' ****\n browser/algo ask ',pump,' relay to change value into : ',lightvalue); // ex 0
    /*
    if (buttoncaused) {// means that the relay is requested by user raspberry button press (or algo anticipating), not corresponding seb button press
      buttoncaused = false;
    } else {
      // eM.emit('web', 1);
    }*/

    // update staus in case the new pump data comes from button o from browser   
    // >>>  state and  cur value will be the same 
   
    if(value&&data==0||((!value&&data==1))){// state != cur value (data=lightvalue)
      // update state
      state.relays[pump]=!value;

      let plantname= state.app.plantname,// o app.plantcfg.name 
      procedura='unknown';// to do .....
    // update status file , dont need to wait so not async func  otherwise see doc on async in .on handler
    // 
    console.log(' onRelais(), to update, now call writeScriptsToFile: ',plantname,' scripts/state: ',state);
    // return // not mandatory
    //return api.writeScriptsToFile(state,plantname,procedura)
    return api.writeScriptsToFile(fn)// upddate persistance and send status to browser
    .catch(function(err) {
      console.log(' onRelais(),  writefile catched : ',err);
        console.error(err);

        // process.exit(1);
      });
    }

  }else {console.log(' onRelais(), browser/algo ask ',pump,' rele to change value but was alredy set : ',lightvalue); // ex 0
          if(lchange){state.relays[pump]=!state.relays[pump];
          console.warn(' onRelais() status ricociliato con current value : ',data);
          }
}



} else;// error
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



function recoverstatus(plantcfg,plantcnt,plantconfig){// this ctl is the ctl whose state must be updated from file if exist (persistnce)
  // this.state is asic state x new ctl. if we have stored , get it 

  // old : >>>>   returns a promise resolved we  finish to write status back with promise .writeScriptsToFile
let that=this,// the ctl/fn/eM=context is the app event manager

state=that.state,reBuildFromState=that.reBuildFromState;
  return new Promise(function(resolve, reject) {

    //console.log(' recoverstatus,  starting  : ',that);
 // api.loadScriptsFromFile(plantname,this).catch(function(err) {
    api.loadScriptsFromFile(plantcfg,plantcnt,plantconfig,that).catch(function(err) {// will update/recover/new  : (that=ctl).state

    console.log('Could not load scripts from file:',plantcfg.name, err);
    reject();
    process.exit(1);
}).then(function(that_) {// resolved results is that_ , that_ :it is that with updated state read from file
                        // the  current plant state: from saved in file or a basic state  if new controller (that)
    // verify that we can now write back to the file.
    console.log(' recoverstatus() , now loadScriptsFromFile is resolved so callwriteScriptsToFile() writefile: ',plantcfg.name,' script: ',that_.state);
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
  function antic_parmFact(noparms){
  
      //  let{procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
  let  pdate=new Date();pdate.setHours(pdate.getHours()+1);
  let procName='startAntic_'// 'anticipate'
  + pdate.toLocaleString(),algo='anticipate';
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


  function prog_parmFact(sched){// from browser we got sched={'giorno':['8:30':t1,"17:00":t2]}  , the key are the key generated in initProg that define the probes whose temperature must be controlled
  
    //  let{procName, a,b,ev2run, asyncPoint, processAsync, dataArr}=execParm;
    let  pdate=new Date();pdate.setHours(pdate.getHours()+1);
let procName='startProg_'// 'program'
+ pdate.toLocaleString(),algo='program';

console.log(' prog_parmFact()  define  procedure ',procName,' with sched: ',sched);// input of genZoneRele will be {'initProg':{giorno:19.2,notte:,,,,},dataArr:sched={'giorno':{sched:{'8:30':t1,"17:00":t2},toll:{'8:30':dt1,"17:00":dt2}}
//if(fn);else {console.error(' checkfactory() cant find the ctl . stop ');console.log(' checkfactory() cant find the ctl . stop ');}

let ev2run = {initProg:null,// will put probes result as input of genZoneRele ev
  // preparazione dati , checks,....
  genZoneRele:"initProg"};// attivare valvole x risc generale e poi singole zone
let dataArr=//{begin:0,startcheck:0}; 
//{begin:null,openapi:null,startcheck:null}; 
{initProg:null,genZoneRele:{dataArr:sched}};
let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
let a=processAsync={},b=asyncPoint={};// todo 
return {procName, a,b,ev2run, asyncPoint, processAsync, dataArr,algo:'program'};

}








  const { exec } = require('child_process');
  async function shellcmd(sh,param){// param={addr:'notte',val:18}
    console.log(' executing shellcmd() param: ',param);
    let val=param.val,reg=4098;
    if(sh=='modbusRead'&&param&&param.addr&&param.register){// in read val not used !
      if(param.addr=='notte')addr=4;else if(param.addr=='giorno')addr=2;else if(param.addr=='taverna')addr=9;else if(param.addr=='studio')addr=5;else;
      if(param.register=='temp')reg=4098;else if(param.addr=='active')reg=4188;else;
      let myexec='python3 rs485.py r '+addr+' '+reg+' 0';
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

          else {resolve(stderr);
            console.log(' shellcmd returned : ',stderr,' cioe ${stderr}');
          }

        });

      });

    }
    else return null;
  }

  function consolidate(state,lastalgo,date){// [false, false, false, false,false,false]= [heat,pdc,g,n,s,split], lastalgo = anticipate,program,user
// puo essere chiamato sia da anticipate che da program
// heat : se impostato da program  antic puo solo fare or 


// user part mut be todo


// >>>>   program if not null cant have any null val !! ( only true or false)


 let res=[];
 let curpumps=state.relays,antic,program,user;
 // see what set are active (lastxxxAlgo not false)
 if(state.lastAnticAlgo
  //||lastalgo=='anticipate'
  )antic=state.lastAnticAlgo.pumps;// non vero : state.lastAnticAlgo could not jet assigned

 if(state.lastProgramAlgo
  // ||lastalgo=='program'
  )program=state.lastProgramAlgo.pumps;
 
 
 // check scadenza

 if(state.lastUserAlgo)// is alredy stored in state.user
   if(isscad(date,state.lastUserAlgo.scad)){// state.user=isscad(date,state.lastUserAlgo.scad);
    state.lastUserAlgo=false;
   }
 if(state.lastUserAlgo
  //||lastalgo=='user'
  )user=state.lastUserAlgo.pumps;

    if (antic) {console.log(' consolidate() found anticipate relays set: ',antic);
    } else if (program) {console.log(' consolidate() found program relays set: ',program);
    } else if (user) {
      console.log(' consolidate() found manualuser  relays set: ',user);
    }

 /*
 ricorda che quando un algo cambia relay, con setPump(), lancia 2 azioni  :  al browser e interna , il browser richiama l'interna che e in pratica un duplicato
  invece se lo user modifica allora ilbrowser chiama l'interna 
quindi se lo user cambia un rele per flaggare che lo user blocca per ,es, la giornata la modifica del rele da parte dei algo , bisogna evitare di spedire ilrichiamo del 
browser !!!! see DEW
 */


    // a: process antic + program
    if (antic) {

      if (program) {// antic + program + possibly user
        // program and antic  case 
        // take current relays (program + day modification of user and apply some lastalgo proposal
        if (lastalgo = 'program' || lastalgo == 'anticipate') {// useless
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
          antic.forEach((val,ind)=>{if(val==null)res.push(program[ind]);else res.push(val)});

        }
        // save 


      } else 
      res = antic;// only antic + possibly user
    } else {
      if (program) res = program;// only program + possibly user
    }

    console.log(' consolidate() merging anticipate and program relays merge into: ',res);

    // b: apply user wants , initially user will have day validity res will bet set by antic and/or program if active or can be null
    // apply default if no assign and program :
    res=res||(new Array(6)).fill(false);

   
      res.forEach((val,ind)=>{
        if(user){
        if(user[ind]==null){
          ;//if(res[ind]==null)res[ind]=false;// should not be any null val in res !!!
        }else{res[ind]=user[ind];

        }

      }
      if(res[ind]==null)res[ind]=false;// should not be any null val in res !!!
      /*
      // only for lastalgo=='user'
      state.user=true;
      */ 
    });
      return res;
  

    function isscad(date,scad){// check scadenza
      return true;
    }
}
  
