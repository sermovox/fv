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
let relais_=[new Gpio(5, 'out'),// gpio phisical relays, see :YUIO
                                // from pump name the gpio is relais_[relaisEv.lastIndexOf(pump)];
new Gpio(5, 'out'),
new Gpio(6, 'out'),
new Gpio(7, 'out')
];
let pumpsHandler=[];//  relais handler , also used by anticipating algo too (actuators)
                    // both button and algo actuacor can call this bank of handler(err,newvalue) 
                    // state.relays names are mapped to pumpsheader index in attuators() : pdc>0, g>1,n>2,s>3

var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
let relais=[new Gpio(18, 'in', 'both'),// gpio relay button to set gpio phisical relays : see :YUIO
new Gpio(19, 'in', 'both'),
new Gpio(20, 'in', 'both'),
new Gpio(21, 'in', 'both')
];
let relaisEv=['pdc',// socket event to sync raspberry buttons and web button
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

  // console.log('  the factory instance is :\n',JSON.stringify(new eMClass(),null,2));
  //console.log('  the factory log is :\n',eMClass.toString());
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
  // so we instatiate or recover  the fsm: that is a eventmanager or connect to the server with a socket that has the same event managed (so the socket is the session/instance of the event manager for the plant)!
  let inst;
  if (client) {
    let name = client.name;
    console.log('ccbb  name:',client,' instance alredy started? : ',started[name]);
    //console.log('ccbb  factory:',eMCustomClass.toString());

    if (started[name]&&started[name].inst)// its alredy requested and a instance is alredy set, so continue on a fv instance 
    {console.log('ccbb   find an alredy running plant with name ',name,' with cur state: ',started[name].inst.state);
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
function anticipate(state){// returns the new pumps state


  let a=1,ret;
  if(a==1)
  ret= [true,true,false,false];
  else ret= null;
  console.log('anticipate algo calc new relays values : ',ret)
  return ret;  
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
  { inverter:  {body: {devIds:"1000000035350464",
                devTypeId:"38"},
                extract:(data)=> {
                  console.log(' aiax extracting inverter info from aiax data got: ',JSON.stringify(data,null,2));
                  let ret= state.aiax.inverter= data.data[0].dataItemMap.mppt_power;
                  console.log(' aiax x inverted got: ',ret);
                  return ret;
                 }},
    battery :  {body:{devIds:"1000000035350466",
                devTypeId:"39"},
                extract:(data)=> {
                  
                  console.log(' aiax extracting battery info from aiax data got: ',JSON.stringify(data,null,2));
                  let ret= state.aiax.inverter= data.data[0].dataItemMap.battery_soc;
                  console.log(' aiax x battery got: ',ret);
                  return ret;


                 }}
    } ,

    url='https://eu5.fusionsolar.huawei.com/thirdData/getDevRealKpi';

let results={},resu;
 let keylist=  Object.keys(bodies);
  for(let i=0;i<keylist.length;i++){
   //  Object.keys(bodies).forEach(function(key,index) {// for each bodies items post 
      // key: the name of the object key
      // index: the ordinal position of the key within the object 
   
    let key=keylist[i],el=bodies[key];
    console.log(' getstat, looping x device: ',el);
      resu= //{data,token}
      await aiax(url,'POST',
        el.body,
      head={"Content-Type": "application/json","XSRF-TOKEN":state.token});// a promise
      console.log(' getstat recover from device: ',key,'aiax call: ',JSON.stringify(resu,null,2));
  
 if(resu&&resu.data)results[key]=el.extract(JSON.parse(resu.data));// set info into state.aiax .  ex x inverter      =body.data.data[1].dataItemMap.mppt_power;
 else results[key]=null;
 console.log(' getstat recover from device: ',key,' info is : ',results);
      
      };
  /*} catch(err) {// if any of the await reject:
    console.error('  ???? getstat catched , probably the token expired for plant:', plant, ',error: ', err);
     state.token=null;// will reset
     this.state.stepInd=0;// restart ev2run loop
 }*/
 console.log(' getstat, returning :  ',results);
  return results;//  a promise if async (uso await !)  results={inverter:1.2,battery:2.5}
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
                      const d = new Date();let hour = d.getHours()+1;// rome time , <24
                      console.log(' getWeath , date: ',d,' hour: ',hour);
                      let ret1= data.hourly.cloudcover[hour],// better do a mean of next 2 hour
                      ret2=  data.hourly.cloudcover[hour+1];
                      let ret= state.aiax.cloudly=(ret1+ret2)/2; 
                      console.log(' aiax cloudly got: ',ret);
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
      /*} catch(err) {// if any of the await reject:
        console.error('  ???? getstat catched , probably the token expired for plant:', plant, ',error: ', err);
         state.token=null;// will reset
         this.state.stepInd=0;// restart ev2run loop
     }*/
     console.log(' getWeath, returning :  ',results);
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

  eM.emit('reset', cfg);// reset fsm   todo 
  repdayly(plant,10, 12, eM);// (10,16) start a interval check for start energy consumption/accumulating
}

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
          console.log(' handler fired by event connect, with input data: ',dummyinput,', token is : ',token);

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
    console.log('login rest await returned with token:', resu.token);
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
    console.log(' event openapi fired handler , with input data: ',dummy);
    let state= these.state; // IS OK ???????
    let resu=await getstat(state)//  ={inverter:1.2,battery:2.5};
    .catch(error => { 
      console.error('  openapi getstat() catched , probably the token expired for plant:', state.app.plantname, ',error: ',error);
      // .............
  });

  console.log(' event openapi finally returning a global results on cb: ',resu);
    cb(0,resu);// pass data on ev2run input
  });

  these.on('weather', async function (dummy, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
    // await getstat(state.aiax);// the conn cfg data
    console.log(' event weather fired handler , with input data: ',dummy);
    let state= these.state; // IS OK ???????
    let resu=await getWeath(state,'https://api.open-meteo.com/v1/forecast?latitude=45.9655&longitude=12.6623&hourly=cloudcover&timezone=Europe%2FBerlin')//  ={inverter:1.2,battery:2.5};
    .catch(error => { 
      console.error('  openapi getstat() catched , probably the token expired for plant:', state.app.plantname, ',error: ',error);
      // .............
  });

  console.log(' event weather finally returning a global results on cb: ',resu);
    cb(0,resu);// pass data on ev2run input
  });

  these.on('startcheck', async function ( inp, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
// i should got async data both in state.aiax.inverter....   and in inp={inverter:3.2,battery:0,,}

    let state=these.state;//this.state;
    console.log(' handler fired by event startcheck, with input data: ',inp,' state: ',state);
 
    /* old
    let calc=(st) =>{// returns false if anticipating
      // ............
      return true;
    };*/
    let endexec,aTT;

      if(aTT=anticipate(state)){// algo : null if not anticipating, [pdc,...] if anticipating with its pump setting
      attuators(state,aTT[0],aTT[1],aTT[2],aTT[3]);// (pdc,g,n,s)  set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
    endexec= aTT.toString();// pass aTT on ev2run input, seems useless
    let datenow=new Date();
    state.anticipating={date:datenow,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
                                                // pumps relay set after
//     state.anticipating={date,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
      }else{
        state.anticipating=false;
        endexec='noanticipating';// just exit  executing ev2run
        // trim some valves, ex base timetable
      }

      //sendstatus(state);//
      // or directly:
      io.sockets.emit('status',JSON.stringify(state,null,2));
    
    cb(0, {execute:endexec});// 
  });

}



function repdayly(plant,hin, hout, fn) {// program timetable of  generic test event firing: fire procedure execute(,'startcheck',,,) with specific event list (ev2run ......) , connect + startcheck,   to perform check to start anticipating
                                        // note that these events must be defined on customOn()
                                        // to do  to start at a time in a day . it will call ececute .. and at every hour 

 let procName='startcheck';


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
//let n=5;

  // debug : run now, todo run at hin hur of the day x,y,z,,,                                      
  callNTimes(plant,hout - hin, 10000, fn);// better move : :here  . schedula fn.execute tra un ora e ulteriori hout-hin volte

// :here

  function callNTimes(plant,n, time, fn) {// start the fv server main event (check periodically the status of fv ctl) : evname=startcheck, asyMajorEv=''
                                          // every time (1 ora) fire a fn.execute()

                                          // to review see: https://www.w3schools.com/jsref/met_win_settimeout.asp
                                          // here n is a closure var , could be passed iteratetivily as param !

    function callFn() {// n-- , se positivo lancia fn.execute e dopo ulteriore ora itera callFn
      if (n--<=0) {
        console.log(' callFn start priodically procname procedure ending, time:',new Date(),' n is: ',n);  
        return;}

      console.log(' callFn start priodically procname procedure now, time:',new Date(),' n is: ',n);
//      n--;
//      console.log(' callFn start priodically procname procedure now, time:',new Date(),' n is: ',n);
      // fn(asyncFunc,asyMajorEv,asyProcess, evname=startchec)k,evtype,evcontingencyparam,evfunc,evdata);
      // better : // fn(asyncFunc,asyMajorEv,asyProcess, evcontingencyparam,evfunc,evdata);
      
      // fn.execute(asyncFunc, asyMajorEv, asyProcess, evname = startcheck, evtype, evcontingencyparam, evfunc, evdata);// check periodically the status of fv ctl)
      //fn.execute(procName, evcontingencyparam, evAsyn,ev2run, evAsync,    processAsync, dataArr)
        fn.execute(procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr);
      // asyncFunc,asyMajorEv,asyProcess sono funzioni passate qui per personalizzare eM o usare dati eM per eseguire local process , es leggere un file chiamare un aiax
      // o mandare avanti un process locale come gli stati interfaccia web usando dati parziali o finali (cb) di eM
    //  console.log(' callFn start priodically after execute , time:',new Date());
      setTimeout(callFn, time);
    }

    console.log(' callFn start priodically , time:',new Date());

    
    //fn.execute(procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr);
    //setTimeout(callFn, time);// schedule tra 1 ora callFn 
    callFn();


  }


}

function sendstatus(state){
  io.sockets.emit('status',JSON.stringify(state,null,2));
}



function attuators(state,pdc,g,n,s){
// we action simulating to push gpio button events
let relays=state.relays;
console.log(' attuators() : current relays pump state is : ',relays);
if(pdc!=relays.pdc){relays.pdc=setPump(0,pdc);}else;
if(g!=relays.g){relays.g=setPump(1,g);}else;
if(n!=relays.n){relays.n=setPump(2,n);}else;
if(s!=relays.s){relays.s=setPump(3,s);}else;



}
function setPump(pumpnumber,on){// on : changing value (true or false)
  console.log(' setpump() is changing relay value x pump ',pumpnumber);
  let on_;
  if(on)on_=1;else on_=0;
  pumpsHandler[pumpnumber](0,on_);// called by anticipating algo in attuators
                                // its a copy of gpio button ralays handler (so we are simulating a gpio button press) that launch socket events
                                 // after set the browser pump flag will return with a socket handler that will call
                                 // onRelais(pumpnumber,on) : the gpio phisicalrelay
                                 // so the gpio relays can be called 2 times !
                                 // see :YUIO

  onRelais(pumpnumber,on_);// anyway set directly the gpio relay, in case the browser is not connecte ! 
  
  return true;}


// here the body :it wait for a get call connection , then add a gpio button listener to emit event on fv controlle eM   :
// when connected (can be many user browser session ?) add a button and a socket listener
io.sockets.on('connection', function (socket) {// WebSocket Connection :server is listening a client browser so now we built the socket connection, transmit to server if there are status updates 

console.log('socket connected to a client');

  // define the listener :
  socket.on('startuserplant', function (data,feat) { // user press button to connect to some plant, so this event is fired , feat url enc
    console.log('event startuserplant listening handler for plant ',data,' feature: ',feat);

    // get user login or just the plant name in some html field + button start that will fire event startuserplant
    let user = { name: data };
    eM = ccbb(user);// ** il fsm recupera/crea un siglethon x user/plant 
    if (eM) {
      startfv(eM,user);// ** start/update singlethon 
    }
    // abilita sezione gestione eventi plant nella pagina
    abilita(data);
  });

  function    // abilita sezione gestione eventi plant nella pagina
  abilita(data){

    // view the relays input on browser 
    socket.emit('view', data); 
    console.log('event startuserplant emit socket event view, data is: ',data);
  }

  var lightvalue = 0; //static variable for current status



  // set local gpio relay to some button on web page, web page will emit a socket event 'light' that will in this server activate
  // the gpio port

  pushButton.watch(function (err, value) { //Watch for io hardware interrupts on pushButton  
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

  function watchparam(pumpName){// handler for all pump gpio button >>> using a closure is a bit forcing , probably one more param is enougth
  return function watch (err, value) { // :YUIO 
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
    console.log(' watchparam: updating pump: ',pumpName,' state. try set value: ', value,' fire a socket event : ',pumpName); //output error message to console
    lightvalue = value;
    socket.emit('pump',pumpName, lightvalue); //send button status to browser client, if available  pompname=pdc,,,,

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

  // implements also a button/algo handler array for actuators / pumps
 relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
                                  // 'g','n','s']
  relais[ind].watch(pumpsHandler[ind]=watchparam(pump));// attach a handler watchparam(pump) to all gpio pump  buttons 
                                                        // that handler works also x algo handler called in attuators/setpump   ex pumpsHandler[0](err,value) 0 means pdc pump
  
 });

  socket.on('light', function (data) { //handler of  'light' event fired on browser ,get light switch status from client web page .   data=0/1 ?
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
      /*if (buttoncaused) {
        buttoncaused = false;
      } else {
        // eM.emit('web', 1);
      }*/
    }else console.log(' brower ask to change value but is as before ?: ',lightvalue); // ex 0
  })

// the same x relais , but without using a closure

// moved 
 function onRelais_  (pump,data) { //pumps unique handlerget pumps switch status from client web page.  data =0/1
  lightvalue = data;
  if (lightvalue != relais_[pump].readSync()) { //gpio comanding relays is called, only change LED if status has changed
    relais_[pump].writeSync(lightvalue); //turn LED on or off
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

 socket.on('pump',onRelais);// same handler for all pumps events




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

function onRelais  (pump,data) { //pumps unique handlerget pumps switch status from client web page  data=0/1 pump ='pdc'
  let lightvalue = data
  pump_=relaisEv.lastIndexOf(pump);// the index in relais_
  if(pump_>=0){
  curval=relais_[pump_].readSync();
  console.log(' onRelays current status x ',pump,' is ',curval,' asking to set : ',data); 
  if (lightvalue != curval) { //gpio comanding relays is called, only change LED if status has changed
    relais_[pump_].writeSync(lightvalue); //turn LED on or off
    console.log(' ****\n browser/algo ask ',pump,' relay to change value into : ',lightvalue); // ex 0
    /*
    if (buttoncaused) {// means that the relay is requested by user raspberry button press (or algo anticipating), not corresponding seb button press
      buttoncaused = false;
    } else {
      // eM.emit('web', 1);
    }*/
  }else console.log(' browser/algo ask ',pump,' rele to change value but is as before : ',lightvalue); // ex 0
} else;// error
}
