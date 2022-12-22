// **
//  this is a server end points: 
// - attende (esporto CXD)che il main app chiami (la export function)  fornendo un factory che per impianti tipo fusionsolar qui si puo' istanziare per avere un eventmanager di un impianto , cioe un fsm di un impiantochiami 
// - chiama  (xxx) la app chiedendo  
// IL fsm (locale o remoto (cms script o server remoto)) che torna una classe di fsm compatibile (fusionsolar)
// 
//  quando ho una connessione web istazio/recupero un fsm singlethon che gestisce l'impianto user/plant luigi

var https_ = require('https'); //require http server, and create server with function handler()
var http_ = require('http'); //require http server, and create server with function handler()
console.log('http_.request:',http_.request);
var http = http_.createServer(handler); //require http server, and create server with function handler()
console.log('after createserver , http_.request:',http.request);
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server on wich soket will be built)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
let relais_=[new Gpio(5, 'out'),
new Gpio(5, 'out'),
new Gpio(6, 'out'),
new Gpio(7, 'out')
];
let pumpsHandler=[];// relais handler , also used by anticipating algo too (actuators)

var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
let relais=[new Gpio(18, 'in', 'both'),
new Gpio(19, 'in', 'both'),
new Gpio(20, 'in', 'both'),
new Gpio(21, 'in', 'both')
];
let relaisEv=['pcd',// socket event to sync raspberry buttons and web button
'g','n','s'];

jrest_=require('./nat/rest.js');jrest_.init(http_,https_);
 const aiax=jrest_.jrest;//  che fa ?
function aiax__(url,body,head){// relay to rest  .rest(uri, method,formObj,head) 
  // remember :  response = {data, token}=await  this.rest(uri, method,formObj,head) 
  //                                              .catch((err) => { console.error(' REST got ERROR : ',err); }); 

 return jrest_.jrest(url,'POST',body,head);
}

// cfg 
const Proto = true;// a tecnique to use (2 alternative)


function handler(req, res) { //create server html def page : user cfg and monitoring
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

let eMClass,eMCustomClass,// the fv ctl build as a eventemitter subclass singleton instance 
  appstat;


// new : xxx

let fsmmanager = require('./app2.js');
const opt=null;
fsmmanager(opt, function (app, opt, no_ccbb) {// ask fsm factory app to give the event factory eMClass, or connect as login to the app server
  //  app will cb here giving the factory that will be instatiated when we know the plant/user
  // opt={name:'fusionsolar'}?    or  opt1 = {aiax}; but here we reference directly to rest.js , not used ! 
  // no_ccbb   needed ??

  eMClass = app.getEventMng();// the fv ctl build as a eventemitter subclass singleton instance 

  console.log('  the factory instance is :\n',JSON.stringify(new eMClass(),null,2));
  console.log('  the factory log is :\n',eMClass.toString());
  appstat = app.state;// use x ?

})

if (Proto) eMClass.prototype.cfg = function () {// add a cfg static func that add custom .on on all instance 
                                                // similar to subclass that just add cfg func to all instances !!!
                                                //    and in constructor of subclass call cfg !!

                                                console.log('  cfg , this is :\n',JSON.stringify(this,null,2));
                                            //customOn.call(this);}
                                            customOn(this);
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
    this.cfg();// calls customOn(())

  }





// the instanziator 

let started ={};// {luigimarson:{  inst,,,}};// inst bank
function ccbb(client) {// when client got a request (a button) for a plant on a webpage , we fire : socket.on('startuserplant' ,that to operate/ register the fv ctl inst
  // so we instatiate the fsm: that is a eventmanager or connect to the server with a socket that has the same event managed (so the socket is the session/instance of the event manager for the plant)!
  let inst;
  if (client) {
    let name = client.name;
    console.log('ccbb  name:',client,' started: ',started[name]);
    console.log('ccbb  factory:',eMCustomClass.toString());

    if (started[name]&&started[name].inst)// its alredy requested and a instance is alredy set, so continue on a fv instance 
      return started[name].inst;// just goon using the alredy running inst
    else {// start a fv instance
      started[name] = {};
      //if (!started.name.inst) 
      {
        // let inst=started[name].inst = new eMClass(client.cfg_);// create the fv ctl
        // if(Proto)inst.cfg();
        // OR:
        console.log('ccbb  , newing eMcustomclass');
       // let inst=started[name].inst = new eMCustomClass();// create the fv ctl
      inst=started[name].inst = (new eMClass()).cfg();// create the fv ctl, customize its .on


        inst.state.app.plantname=name;

        //??
        // started.name.inst.start();// start the new instance


      }
      return inst;

    }
  }

  // https://api.open-meteo.com/v1/forecast?latitude=45.6055&longitude=12.6723&hourly=temperature_2m,weathercode,cloudcover&timezone=Europe%2FBerlin
  //https://open-meteo.com/en/docs#latitude=45.65&longitude=13.77&hourly=temperature_2m,weathercode,cloudcover&timezone=Europe%2FBerlin

}

// end new : xxx



/*

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

  console.log('start listen web request, http: ',http);

  http.listen(8080); //listen to port 8080, wait a user to connect and login to get the user name

  console.log('started listen web request, http: ',http);

  // other client init stall 


  return conf();// before first user web conn ( that will start the plant fv ctl) , must return 1

}// ends startweb
startweb();

let token = null,
  openapi = { baseurl: '', user: '', pass: '' },// data to connect openapi
  cfg = {},
  tokens={};

  function tokenaiax(method,procedure,cb){// will get token or create a new one if expired

let body=
    {
      "userName":"MarsonLuigi_API",
      "systemCode":"Huawei@123"
      }
      
// ...................

    cb();

  }
function anticipate(state){


  let a=0;
  if(a==0)return true;else return false;
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
  let bodies=
  { inverter:  {body: {devIds:"1000000035350464",
                devTypeId:"38"},
                extract:(data)=> {
                  return state.aiax.inverter= data.data.data[1].dataItemMap.mppt_power;
                 }},
    battery :  {body:{devIds:"1000000035350466",
                devTypeId:"39"},
                extract:(data)=> {
                  return state.aiax.battery=some;
                 }}
    } ,

    url='https://eu5.fusionsolar.huawei.com/thirdData/getDevRealKpi';

let results={},resu;

  try {
    Object.keys(bodies).forEach(async function(key,index) {
      // key: the name of the object key
      // index: the ordinal position of the key within the object 

    let el=bodies[key];
      resu=await aiax(url,'POST',
        el.body,
      head={"Content-Type": "application/json","XSRF-TOKEN":state.app.token});// a promise
  
 if(resu)results[key]=el.extract(resu.data);// ex x inverter      =body.data.data[1].dataItemMap.mppt_power;

      
      });
  } catch(err) {// if any of the await reject:
    console.error('  login catched , probably the token expired for plant:', plant, ',error: ', err);
     state.token=null;// will reset
     this.state.stepInd=0;// restart ev2run loop
 }

  return results;//  a promise if async (uso await !)  results={inverter:1.2,battery:2.5}
  }





// https://www.npmjs.com/package/await-event-emitter
function conf() {// config and start fv server instance(the controller)

}


function startfv(eM,plant) {// ** start/update singlethon 
  console.log(' startfv : the ctl instance is :\n',JSON.stringify(eM,null,2));
  console.log(' startfv plant: ',plant);

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

  eM.emit('reset', cfg);// reset fsm
  repdayly(plant,10, 16, eM);// (10,16) start a interval check for start energy consumption/accumulating
}

function customOn(these) {
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
 
 these.on('connect',
    // se tolgo async non posso usare await f ma devo usare f().then() 
    // >>>>>>>>>>>>>>>>>>><  probabilmente ,on non puo tornare un async func !!!!!!!!!!!!!!!!!!!!!!!!!!
    
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
          console.log(' event connect fired handler , with input data: ',dummyinput,' token is : ',token);

    let state= this.state, // IS OK ???????

      plant=state.app.plantname;// the real input , no dummy !

    if(!token)  {// update status
      let resu=await login(plant)// or login(plant).then(cb)
      .catch(error => { 
        console.error('  login catched , probably the token expired for plant:', plant, ',error: ', error);
        state.token=null;// will reset
        this.state.stepInd=0;// restart ev2run loop
    });
    console.log('login rest await returned with token result ',JSON.stringify(resu,null,2));
    if(resu.token)state.token=resu.token;
    cb(0,state.token);	// goon with framework event chaining

      // nbnb il chaining si poteva fare anche chiamando il prossimo event con un .emit !!! 
      //      see https://medium.com/finnovate-io/using-event-emitter-to-create-complex-asynchronous-workflows-in-node-js-94a31327d428
      //      questo lo facciamo se esco dallo std che e' seguire la  sequenza ev2

      // nbnb   se ho il token e poi al secondo step openapi fallisce perche scaduto allora annullo il token e resett rilanciando il event connect kkk 
 
  }
  return 1;// what .on returns ?,  anyway if  this.state.stepInd=0 app will restart ev2run loop 
})
  ;

  these.on('openapi', async function (dummy, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
    // await getstat(state.aiax);// the conn cfg data
    console.log(' event openapi fired handler , with input data: ',dummy)
    let state= this.state; // IS OK ???????
    let resu=await getstat(state)//  ={inverter:1.2,battery:2.5}
    .catch(error => { 
      console.error('  openapi catched , probably the token expired for plant:', plant, ',error: ', error);
      // .............
  });


    cb(0,resu);// pass data on ev2run input
  });
  these.on('startcheck', async function ( inp, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
// i should got async data both in state.aiax.inverter....   and in inp={inverter:3.2,battery:0,,}
console.log(' event startcheck fired handler , with input data: ',inp);
    let state=this.state;
    let calc=(st) =>{
      // ............
      return true;
    };
    if(calc(state)){
      state.anticipating=false;
      // trim some valves, ex base timetable
    }else {
      //start anticip
      state.anticipating={date,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
      //  
      let aTT=anticipate(state);// ??
      attuators(1,1,0,0);// (pdc,g,n,s)  set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
    cb(0, aTT);
    }
  });

}



function repdayly(plant,hin, hout, fn) {// program timetable of  generic test event firing: fire procedure execute(,'startcheck',,,) with specific event list (ev2run ......) , connect + startcheck,   to perform check to start anticipating
                                        // note that these events must be defined on customOn()
  callNTimes(plant,hout - hin, 3600, fn);

  // pprogram the process to call 
 let procName='startcheck';
 // let evAsyn = {asyncFunc:'',evname1:1,startcheck:0};// {asyncfunc to run in some poins:avalue?,the eventasynctorunin sequence:avalue?}startcheck=1 after updated the status will fire startcheck
let ev2run = {connect:null,openapi:null,startcheck:null};// {the eventasynctorun in sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means dataArr data
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
{begin:null,openapi:null,startcheck:null}; 
                                   // ?? // event or processasync key
let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
let processAsync={},asyncPoint={};



  function callNTimes(plant,n, time, fn) {// start the fv server main event (check periodically the status of fv ctl) : evname=startcheck, asyMajorEv=''
    function callFn() {
      if (--n < 0) return;
      // fn(asyncFunc,asyMajorEv,asyProcess, evname=startcheck,evtype,evcontingencyparam,evfunc,evdata);
      // better : // fn(asyncFunc,asyMajorEv,asyProcess, evcontingencyparam,evfunc,evdata);
      
      // fn.execute(asyncFunc, asyMajorEv, asyProcess, evname = startcheck, evtype, evcontingencyparam, evfunc, evdata);// check periodically the status of fv ctl)
      //fn.execute(procName, evcontingencyparam, evAsyn,ev2run, evAsync,    processAsync, dataArr)
        fn.execute(procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr);
      // asyncFunc,asyMajorEv,asyProcess sono funzioni passate qui per personalizzare eM o usare dati eM per eseguire local process , es leggere un file chiamare un aiax
      // o mandare avanti un process locale come gli stati interfaccia web usando dati parziali o finali (cb) di eM

      setTimeout(callFn, time);
    }
    setTimeout(callFn, time);
  }

}

function attuators(pdc,g,n,s){
// we action simulating to push button events
if(pdc)pumpsHandler[0];else;
if(g)pumpsHandler[1];else;
if(n)pumpsHandler[2];else;
if(s)pumpsHandler[3];else;


}



// here the body :it wait for a get call connection , then add a gpio button listener to emit event on fv controlle eM   :
// when connected (can be many user browser session ?) add a button and a socket listener
io.sockets.on('connection', function (socket) {// WebSocket Connection :server is listening a client browser so now we built the socket connection, transmit to server if there are status updates 

console.log('socket connected to a client');

  // define the listener :
  socket.on('startuserplant', function (data) { // user press button to connect to some plant, so this event is fired 
    console.log('event startuserplant listening handler for plant ',data);

    // get user login or just the plant name in some html field + button start that will fire event startuserplant
    let user = { name: data };
    eM = ccbb(user);// ** il fsm recupera/crea un siglethon x user/plant 
    if (eM) {
      startfv(eM,user);// ** start/update singlethon 
    }
  });

  var lightvalue = 0; //static variable for current status



  // set local gpio relay to some button on web page, web page will emit a socket event 'light' that will in this server activate
  // the gpio port

  pushButton.watch(function (err, value) { //Watch for io hardware interrupts on pushButton  

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

  function watchparam(pumpName){// handler for all pump button >>> using a closure is a bit forcing , probably one more param is enougth
  return function watch (err, value) {// - Watch for io hardware interrupts ( manual pumps Button ), OR 
                                      // - Anticipating algo trigger pumps updates 
                                      // >>> emit/fires socket events pumpName
                                      // remember that those events  handlers  in browser
                                      //          -updates gui button then return/pass events back to server
                                      //      >>>> server handler commands pump relais 
    if (err) { //if an error
      console.error('on activating pump: ',pumpName,' There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    socket.emit(pumpName, lightvalue); //send button status to client, if available

    /*   >>>>>>>>>>>>>>>>>>  todo : nb like litht is better impleent a callback to server to set state.relais=[0,0,0,0]
    instead of:
    if (lightvalue == 1) {
      // anyway send server info about new event to process
      eM.emit('button', lightvalue);// utton pressed event, or a new status var value to set
      // todo  implement button handler !
      //buttoncaused = true;
    }
    */
  

  }}

  // implements also a ralays array for actuators / pumps
 relaisEv.forEach((pump,ind) => {// ['pcd',// socket event to sync raspberry buttons and web button
                                  // 'g','n','s']
  relais[ind].watch(pumpsHandler[ind]=watchparam(pump));// attach a handler watchparam(pump) to all pump buttons 
  
 });

  socket.on('light', function (data) { //handler of  'light' event fired on browser ,get light switch status from client web page
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
      if (buttoncaused) {
        buttoncaused = false;
      } else {
        // eM.emit('web', 1);
      }
    }
  })

// the same x relais , but without using a closure

 function onRelais  (pump,data) { //pumps unique handlerget pumps switch status from client web page
  lightvalue = data;
  if (lightvalue != relais_[pump].readSync()) { //only change LED if status has changed
    relais_[pump].writeSync(lightvalue); //turn LED on or off
    if (buttoncaused) {// means that the relay is requested by user raspberry button press (or algo anticipating), not corresponding seb button press
      buttoncaused = false;
    } else {
      // eM.emit('web', 1);
    }
  }
}
 
  // implements also a ralays array for actuators / pumps
 relaisEv.forEach((pump,ind) => {
  socket.on(pump,onRelais);// same handler for all pumps events
  
 });






}
);// ends io.sockets.on('connection'

// run a bash shell
process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});

return 'ok'


