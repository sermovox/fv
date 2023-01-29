// **
//  this is a server end points: 
// - attende (esporto CXD)che il main app chiami (la export function)  fornendo un factory che per impianti tipo fusionsolar qui si puo' istanziare per avere un eventmanager di un impianto , cioe un fsm di un impiantochiami 
// - chiama  (xxx) la app chiedendo  
// IL fsm (locale o remoto (cms script o server remoto)) che torna una classe di fsm compatibile (fusionsolar)
// 
//  quando ho una connessione web istazio/recupero un fsm singlethon che gestisce l'impianto user/plant luigi

var https_ = require('https'); //require http server, and create server with function handler()
var http_ = require('http'); //require http server, and create server with function handler()
//console.log('http_.request:',http_.request);
var http = http_.createServer(handler); //require http server, and create server with function handler()
//console.log('after createserver , http_.request:',http.request);
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server on wich soket will be built)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(5, 'out'); //use GPIO pin 4 as output
let relais_=[new Gpio(12, 'out'),// gpio phisical relays, see :YUIO
                                // from pump name the gpio is relais_[relaisEv.lastIndexOf(pump)];
                                // so in relaisEv there re the names !
new Gpio(16, 'out'),
new Gpio(20, 'out'),
new Gpio(21, 'out'),
new Gpio(26, 'out'),
new Gpio(19, 'out')
];
let pumpsHandler=[];//  relais handler , also used by anticipating algo too (actuators)
                    // both button and algo actuacor can call this bank of handler(err,newvalue) 
                    // state.relays names are mapped to pumpsheader index in attuators() : pdc>0, g>1,n>2,s>3

var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
let relais=[new Gpio(18, 'in', 'both'),// gpio relay button to set gpio phisical relays : see :YUIO
new Gpio(23, 'in', 'both'),
new Gpio(24, 'in', 'both'),
new Gpio(25, 'in', 'both'),
new Gpio(4, 'in', 'both'),
new Gpio(17, 'in', 'both')
];
let relaisEv=['heat','pdc',// socket event to sync raspberry buttons and web button, the 'name' of relais_ !
'g','n','s','split'];

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
const api={// see https://javascript.info/promise-chaining

  loadScriptsFromFile : function(src,ctl) {// src: file name key, ctl : controller 
                                            //  >>>  status will be recovered and assigned to ctl 
    return new Promise(function(resolve, reject) {
        let scripts,file;
        // if(src=='scripts')file='scripts';else if(src=='projects')file='projects';
        file=__dirname + '/.data/'+src+'.json';
        if (file&&fs.existsSync(file)) {
            try {
                scripts = require(file);
            } catch(err) {
                return reject('Cannot load scripts from file: ' + err.message);
            }/*
        } else {
            console.warn('cant find a data json obj: ',src);

        }
        if (fs.existsSync(src1)) {
            try {
                unitlist = require(src1);
            } catch(err) {
                return reject('Cannot load scripts from file: ' + err.message);
            }
        } else {
            console.warn('cant find a data json obj: ',src1);

        }
        if (fs.existsSync(src2)) {
            try {
                servicelist = require(src2);
            } catch(err) {
                return reject('Cannot load scripts from file: ' + err.message);
            }*/

            // update the staus on basic ctl

            ctl.state=scripts;
        } else {//  >>>  status cant be recovered so keep the basic status of ctl  and complete it

          //  console.log('loadScriptsFromFile , cant find a data json obj: ',file,' , so crete a basic state from ctl: ',ctl);
            ctl.state.app.plantname=src;// add to new std state the plantname

            // was:
           // scripts=ctl.state;
          
           // add relays status (false or look at present gpio ???????????????) 

          relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
            // 'g','n','s']
            ctl.state.relays[pump]=false;//  (false or look at present gpio ???????????????) 
            });


            console.log('loadScriptsFromFile, cant find a data json obj: ',file,' , so crete a basic state: ',ctl.state);



        }

        //PATH_TO_SCRIPTS = src;api.mapTriggers();
        console.log('loadScriptsFromFile , resolving scripts: ',scripts);
        resolve(ctl);
    });
},

writeScriptsToFile : function(fn,fromcaller) {// write only on scripts and projects, fn=ctl
                                    // piacerebe scrivere lo status su file a anche mandare via websoket, del ctl, lo status al browser
                                    // tuttavia se lo status esiste in file per un plant il ctl viene creato dopo ???? 
                                    // todo   for debug just add fromcaller in param !



  const new_scripts=fn.state,file_=fn.state.app.plantname;
  //fn.socket.emit('status',JSON.stringify(fn.state,null,2));// send the status to the browser too, also if the related section is not jet visible !
  fn.socket.emit('status',fn.state);// send the status to the browser too, also if the related section is not jet visible !

  return new Promise(function(resolve, reject) {
        let bank,file;
        //console.log('writescript: file ',file,' starting .... ',new_scripts);
        if(file_){
        file=__dirname + '/.data/'+file_+'.json';
       // console.log('writescript: file ',file,' writing .... ');
        try {
            require('fs').writeFileSync(file, JSON.stringify(new_scripts,null,2));
          //  console.log('writescript: file ',file,' writed ')
        } catch(err) {
            return reject('Cannot write scripts to file: ' + err.message);// return what ?
        }

       // api.mapTriggers();
       console.log('writeScriptsToFile(): updated',new_scripts,' on : ',new Date());//  (new Date()).toLocaleString()
        resolve(new_scripts);
    }else reject();
    });

} 
};




let eMClass,
eMCustomClass,// now never called.   the fv ctl build as a eventemitter subclass singleton instance 
  appstat;


// new : xxx

let fsmmanager = require('./app2.js');
//const { LOADIPHLPAPI } = require('dns');
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





// the instanziator 

let started ={};// {luigimarson:{  inst,,,}};// inst bank
function ccbb(client) {// when client/plant got a request (a button) for a plant on a webpage , we fire : socket.on('startuserplant' ,that to operate/ register the fv ctl inst
  // so we instatiate or recover  the fsm: that is a eventmanager or connect to the server with a socket that has the same event managed (so the socket is the session/instance of the event manager for the plant)!
  let inst;
  if (client) {
    let name = client.name;
    console.log('ccbb  name:',client,' instance alredy started? : ',started[name]);
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

}// end ccb()

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


function anticipate(state,algo){// the algo : returns the new pumps state
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
 let {battLevel,inverter,cloudly}=state.aiax,temp=20,
 {running,starthour,stophour,hourinterval}=state.anticipate,
 triggers;
 if(state.anticipate)triggers=state.anticipate.triggers;

  let a=2,//// basic model save battery
  ret,model;
if(triggers){
if(triggers.PdCTrig1){a=2; console.log(' anticipate algo find required policy : PdCTrig1');
      state.anticipating.model=model="PdCTrig1";// add .policy=.....
     }

  if (a == 1)
    ret = [false, false, false, false,false,false];
  else if (a == 2) {// basic model save battery
    if (triggers) if (cloudly <= (100- triggers.FVPower)) {
      ret = [true, true, true,false, false,true];
      console.log('anticipate() find cloudily low so start pdc');
    }// else leave ret undefined !
  }
  else ret = null;
  console.log('anticipate algo calc new relays values : ',ret);
   
}else {
  console.log('anticipate algo cant find triggers, so retuns  ');
  console.error('anticipate algo cant find triggers ');
ret= null;//[false, false, false, false,false,false];  
}
if(ret)
state.lastAnticAlgo={updatedate:new Date().toLocaleString(),level:1,policy:0,algo,pumps:aTT,model};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
                                                // pumps relay set after
else state.lastAnticAlgo=false;
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
    console.log(' getstat, looping  devices, now rest device: ',el);


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

  console.log(' getstat recover from device res: ',res); 

    // in case aiax fire error and be rejected , res=undefined
  if (res === null) {// token expired
    console.log(' getstat recover from device: ',key,' an expiered token');
    i=100;results=null;
  } else if (res === undefined) { // true
    console.log(' getstat recover from device: ',key,'aiax result cant be calc, so exit execute procedure ');
    i=100;results=undefined;
  }else  { results[key]=res;// goon next dev
  console.log(' getstat recover from device: ',key,' info is : ',results[key]);
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
 console.log(' getstat, returning :  ',results);
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
                      const d = new Date();let hour = d.getHours()+1;// rome time , <24
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

  // allign relays current status to state.relays :
  relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
    // 'g','n','s']
    setPump(ind,eM.state.relays[pump],eM);// setPump(ind,eM.state.relays[pump]);
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
  cb(0,state.token);	// goon with framework event chaining
  return 1;// what .on returns ?,  anyway if  this.state.stepInd=0 app will restart ev2run loop 
})
  ;

  these.on('openapi', async function (dummy, cb) {// the fsm ask state updates (we use openapi) : will set input of 'startcheck' , best to set also corresponding state ( last data gathered from fusionsolar)
    // question what is context ?
    // await getstat(state.aiax);// the conn cfg data
    console.log(' event openapi fired handler , with input data: ',dummy);
    let state= these.state; // IS OK ???????
    let resu=await getstat(state)//  ={inverter:1.2,battery:2.5};
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

  console.log(' event openapi finally returning a global results on cb: ',resu);
    cb(0,resu);// pass data on ev2run input, if undefined exit execute (stepInd=100), if null start again (stepInd=0) 
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
    let proc;
    if(inp)proc=inp.algo;
    let state=these.state;//this.state;
    console.log(' handler fired by event startcheck, with input data: ',inp,' state: ',state);
 
    /* old
    let calc=(st) =>{// returns false if anticipating
      // ............
      return true;
    };*/
    let endexec,aTT;

      if(aTT=anticipate(state,algo)){// algo : null if not anticipating, [pdc,...] if anticipating with its pump setting
      attuators(these,aTT[0],aTT[1],aTT[2],aTT[3],aTT[4],aTT[5]);// (pdc,g,n,s)  set relais x level 1, then after 1 hour (1,1,1,0), if noeco (1,1,1,1)
    endexec= aTT.toString();// pass aTT on ev2run input, seems useless

    // register result of the exec procedure!
    //state.lastAnticipating={updatedate:new Date().toLocaleString(),level:1,policy:0,procedure:proc,pumps:aTT};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
                                                // pumps relay set after
//     state.anticipating={date,level:1,policy:0};// level is the temp level 0, then 1 after 1 hour. policy is the param of algo that will comand reays to perform a objective; eco,lt,ht,timetable
      }else{// aTT returned undefined or null : 
      //  state.lastAnticipating=false;
        endexec='noanticipating';// just exit  executing ev2run
        // trim some valves, ex base timetable
      }

      //sendstatus(state);//
      // or directly:
      // io.sockets.emit('status',JSON.stringify(state,null,2));
    
    cb(0, {execute:endexec});// false : nothing to do 
  });

}



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
        console.log(' after execute we updates state running writeScriptsToFile()')
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
                                       

  let timer;
   
  const d = new Date();
  let procName='startcheck_'+ d.toLocaleString(),algo='base';
  console.log(' checkFactory()  define  procedure ',procName);
  if(fn);else {console.error(' checkfactory() cant find the ctl . stop ');console.log(' checkfactory() cant find the ctl . stop ');}
  
  let ev2run = {connect:null,openapi:null,weather:null,startcheck:null};// {the eventasynctorun in sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means dataArr data
  
  
  let dataArr=//{begin:0,startcheck:0}; 
  //{begin:null,openapi:null,startcheck:null}; 
  {begin:null,openapi:null,weather:null,startcheck:{algo}}; 
  let  evAsync={};// evAsync={aEv2runKey:itsasync,,,,,,}
  let processAsync={},asyncPoint={};
  
  
    function callFn_() {// n-- , se positivo lancia fn.execute e dopo ulteriore ora itera callFn
  
  
      console.log(' callFn start priodically exec procedure ',procName, ' for plant: ',fn.state.app.plantname,'.  cur time:',new Date(),' this day, after this exec, we run other ',n,' times');
  //      n--;
  //      console.log(' callFn start priodically procname procedure now, time:',new Date(),' n is: ',n);
      // fn(asyncFunc,asyMajorEv,asyProcess, evname=startchec)k,evtype,evcontingencyparam,evfunc,evdata);
      // better : // fn(asyncFunc,asyMajorEv,asyProcess, evcontingencyparam,evfunc,evdata);
      
      // fn.execute(asyncFunc, asyMajorEv, asyProcess, evname = startcheck, evtype, evcontingencyparam, evfunc, evdata);// check periodically the status of fv ctl)
      //fn.execute(procName, evcontingencyparam, evAsyn,ev2run, evAsync,    processAsync, dataArr)
        fn.execute(procName, null              , null,  ev2run, asyncPoint, processAsync, dataArr,
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
     let cilesxday,n;
    function callF(){
      
      if(n--<=0) {clearInterval(timer);// condition before lowering n 
        
      }else {
        console.log(' repeatcheckxSun :callF() called , after this curent check, daily checks procedure still to run  are: n= ',n); 
        callFn_();
      }
  
    }
  
    function gfg_Run_(hourinterval) {// daily job
      n=cilesxday;
      console.log(' repeatcheckxSun :gfg_Run() called , start day checks , n: ',n+1); //  ex 9 - 12  start the job at 9,10,11,12
    
      // callFn_();
      n++;callF();

      if(n>0){// example run from 9 to 12   so run on 9 19 11 12  , so we run 9 (calling callFn_)ando then more n=12-9=3 time (calling callF)
      let delta=3600000;
      if(DEBUG1)delta=60000*2;//2 minuti
      else if(hourinterval&&hourinterval>0&&hourinterval<6)delta=hourinterval*3600000;
      timer = setInterval(callF, delta);//36000000
      }
    }
         
    function gfg_Run(hourinterval) {// daily job  old
      n=cilesxday;
      console.log(' repeatcheckxSun :gfg_Run() called , start day checks , n: ',n); 
      let delta=3600000;if(hourinterval&&hourinterval>0&&hourinterval<6)delta=hourinterval*3600000;
      timer = setInterval(callF, delta);//36000000
      }
  
      function gfg_Stop() {// call from .......
      clearInterval(timer);
      }
  
    let interv;
      
    return {repeatcheckxSun:function (hourin,hourout,hourinterval){// register the procedure to repeat
      if(interv) clearInterval(interv); 
      if(timer) clearInterval(timer);                                        //closure with inner callF, the closure state n will be updated till hourout is got !
      console.log(' repeatcheckxSun : start hour ',hourin,' stop hour: ',hourout);                                                 
      cilesxday=hourout-hourin;
      let goon;
      if(DEBUG) goon=true;else goon=false;// debug is true, production = false
      if(goon)   gfg_Run_(0);// one day start immediately
      else
      interv=setInterval(function(){ // Set interval for checking, never stop till the repetion ends 
        var date = new Date(); // Create a Date object to find out what time it is   gtm ?
        let min=0;if(DEBUG1)min=hourinterval;
        console.log(' repeatcheckxSun : setinterval  handler called on day hour: ',date.getHours()+1,' minutes: ',date.getMinutes(),' hin: ',hourin,' MIN: ',min); 

       

        if((date.getHours()+1) == hourin && date.getMinutes() == min){ // Check the time
          console.log(' repeatcheckxSun :::::::::::');
            // run the repetitive procedure
            gfg_Run_(hourinterval);// ex 10-9=1  so start 1 at 9:00 the other 1 after a hour 
            // no , next will goon ! :   clearInterval(interv);
        }else   console.log(' repeatcheckxSun ************** ');
  
    }, 60000); // Repeat every 60000 milliseconds (1 minute)
    return 0;//ok, ??
                    },
            stopRepeat:function (){// stop requiredd by client browser
              console.log(' stopRepeat() called ');              
              clearInterval(interv);
              
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
  io.sockets.emit('status',state);// no   , socket.emit...
}



function attuators(fn,heat,pdc,g,n,s,split){// ctl,true/false,,,
// we action simulating to push gpio button events
let state=fn.state,relays=state.relays;
console.log(' attuators() : current relays pump state is : ',relays,' target values: ',heat,pdc,g,n,s,split);

// todo use relaisEv.forEach( ...  and pump_=relaisEv.lastIndexOf(pump);// the index in relais_

// debug:
console.warn('  attention that order in state.relays ',state.relays,' same as fn.state.relays ',fn.state.relays,' can be different from fn.relaisEv ',fn.relaisEv);
// so correct mapping state.relays > fn.relaisEv are done here !

if(heat!=relays.heat){
  incong('heat',state);
  console.log(' attuators() : as current pdc pump state : ',relays.heat,' is different from newval call setPump(0,',heat,')');
  //relays.pdc=
  setPump(0,heat,fn);}else;
if(pdc!=relays.pdc){
  incong('pdc',state);
  console.log(' attuators() : as current pdc pump state : ',relays.pdc,' is different from newval call setPump(1,',pdc,')');
  //relays.pdc=
  setPump(1,pdc,fn);}else;
if(g!=relays.g){
  incong('g',state);
  console.log(' attuators() : as current g pump state : ',relays.g,' is different from newval call setPump(2,',g,')');
  //relays.g=
  setPump(2,g,fn);}else;
if(n!=relays.n){
  incong('n',state);
  console.log(' attuators() : as current n pump state : ',relays.n,' is different from newval call setPump(3,',n,')');
  //relays.n=
  setPump(3,n,fn);}else;
if(s!=relays.s){
  incong('s',state);
  console.log(' attuators() : as current s pump state : ',relays.s,' is different from newval call setPump(4,',s,')');
  //relays.s=
  setPump(4,s,fn);}else;
  if(split!=relays.split){
    incong('split',state);
    console.log(' attuators() : as current s pump state : ',relays.s,' is different from newval call setPump(5,',split,')');
    //relays.s=
    setPump(5,split,fn);}else;

function incong(pump,state){
  let value=state.relays[pump];// true/false, pump as recorded on status
  let   pump_=relaisEv.lastIndexOf(pump);// the index in relais_
  if(pump_>=0){
  curval=relais_[pump_].readSync();// 0/1
  if(value&&curval==0||((!value&&curval==1))){// state != cur value 
    console.warn(' attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
    console.log(' attuators(), find pump ',pump,' state different from current pump position thats: ',curval); 
  }
}}
}

function setPump(pumpnumber,on,fn){// 0,1,2,3    on : changing value (true or false)
  console.log(' setpump() will emit socket pump event to change browser relay value x pump number',pumpnumber);

 
  let on_,state=fn.state;
  if(on)on_=1;else on_=0;// conver true > 1
  pumpsHandler[pumpnumber](0,on_);// called by anticipating algo in attuators
                                // its a copy of gpio button ralays handler (so we are simulating a gpio button press) that launch socket events
                                 // after set the browser pump flag will return with a socket handler that will call
                                 // onRelais(pumpnumber,on,'browser...',) : the gpio phisicalrelay
                                 // so the gpio relays can be called 2 times !
                                 // see :YUIO
  console.log(' setpump() just emitted socket  event x pumpnumber',pumpnumber,' asking to set: ',on);
  //onRelais(pumpnumber,on_,'server',state);// anyway set directly the gpio relay, in case the browser is not connecte ! 
                                          // ERROR : pump not pumpnumber !
  onRelais(relaisEv[pumpnumber],on_,'server',fn);// usually called before the duplicate coming from browser as feedback
                                    
                                          
  
  return true;}



// here the body :it wait for a get call connection , then add a gpio button listener to emit event on fv controlle eM   :
// when connected (can be many user browser session ?) add a button and a socket listener
io.sockets.on('connection', function (socket) {// WebSocket Connection :server is listening a client browser so now we built the socket connection, transmit to server if there are status updates 

console.log('socket connected to a client');
  let eM,
   repeat;// active rep func

  // define the listener :
  socket.on('startuserplant', function (data,feat) { // user press button to connect to some plant, so this event is fired , feat url enc
                                                      // inst/fn/ctl/eM :  here we create the ctl of the plant that will be passed to all the service functions 
    console.log('event startuserplant listening handler for plant ',data,' feature: ',feat);

    // get user login or just the plant name in some html field + button start that will fire event startuserplant
    let user = { name: data };
    eM = ccbb(user);// ** il fsm recupera/crea un siglethon x user/plant 
    if(eM)console.error('startuserplant , eM is built ');
    if(eM)console.log('startuserplant , eM is built ');
    eM.socket=socket;// update/embed the socket to connect the browser client
    if (eM) {
     // startfv_(eM,user);// ** start/update singlethon 
     recoverstatus.call(eM,user.name).then((em_) => startfv_(em_)); // >>>>   returns a promise resolved we we finish to write satus back with promise .writeScriptsToFile
                                                                    // will cb startfv_   // TTGG  // why do not use eM invece di passarlo come em_ ?
                                                                    //recoverstatus_.call(eM,user.name).then((em_) => startfv_(em_));// will cb startfv_


     // DANGER  :::   here state could not jet be recovered by previous promise !!!!
     //     so , it is really dangerous ? we just add properties to state 
     let state=eM.state;
     if(eM.reBuildFromState){
     
    

   
     // same handler that : on('repeatcheckxSun',(starthour,stophour,hourinterval) );
     
     
     if(state.anticipate){
      let {hourinterval,starthour,stophour,triggers}=state.anticipate;
      console.log('event startuserplant loading the repeating procedure from state.anticipate:  ',state.anticipate);

      // same handler that : socket.on('repeatcheckxSun', );
     repeatHandler(starthour,stophour,hourinterval,triggers);// rewite the state alredy wrote by TTGG  

     }
     eM.reBuildFromState=false;// reset now the ctl has the procurure loaded on closure checkFactory()
     }

    }
    return;// thread ends
  });
// });

  function startfv_(eM){// entry point when staus is recovered from file   // // why do not use eM invece di passarlo come em_ ?
    startfv(eM);// ** start/update singlethon 
    let plant=eM.state.app.plantname,user=plant;
  // abilita sezione gestione eventi plant nella pagina
  // abilita(user.data);
  abilita(plant );

  }

  function    // abilita sezione gestione eventi plant nella pagina
  abilita(data){// data==plant

    // view the relays input on browser 
    socket.emit('view', data); // nb .on('pump',,) can be not jet assigned 
    console.log('event startuserplant : abilita(). it is  emitting socket event view, user plant is: ',data);
    // socket.emit('status',,,) .on('status',)
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

  // implements also a button/algo handler array for actuators / pumps
 relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
                                  // 'g','n','s']
                                  
     if(!eM)console.error('event connection setting hw button , eM is still null ');
     if(!eM)console.log('event connection setting hw button, eM is still null ');
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
  });

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
 
 
 function onRelaisClos(){

  return function(pump,val,coming){// return with a void closure ?
    console.log(' onRelaisClos() called x pump: ',pump,' set value: ',val,' coming from: ',coming,' ctl is null: ',!eM);
    if(!eM)console.error('onRelaisClos(), eM is null , cant process browser old event call');
    if(!eM)console.log('onRelaisClos(), eM is null ');else console.log(' onRelaisClos(), eM is found '); 
    if(eM)onRelais(pump,val,coming,eM);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
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


function setanticipateflag(set_){
  if(!eM)console.error('.. setanticipateflag() eM is null ');
  if(!eM)console.log('.. setanticipateflag() eM is null ');else console.log(' . setanticipateflag(), eM is found '); 
    console.log(' setanticipateflag() called to set flag: ',set_);
    anticipateFlag(set_,eM);}// eM is set before in a preceeding  socket.on('startuserplant',,, ( like create a  closure var)


// repeat=checkFactory(eM);// eM could not still be set by a preceeding  socket.on('startuserplant',,, ( like create a  closure var)
 console.log('repeat could not be set here because eM is null: ',eM);// infact here is still null !! we'll be set on :  socket.on('startuserplant'

socket.on('repeatcheckxSun',repeatHandler);// start anticipating algo with setting and run an execute()
function repeatHandler(starthour,stophour,hourinterval,triggers) {// called also by ....
  if(!eM)console.error(' repeatHandler(), eM is null ');
  if(!eM)console.log(' repeatHandler(), eM is null ');else console.log(' repeatHandler(), eM is found '); 
    repeat=repeat||checkFactory(eM);// could be find null ???
    if(repeat.repeatcheckxSun(starthour,stophour,hourinterval)==0)// exit ok 
    setanticipateflag({running:true,starthour,stophour,hourinterval,triggers});
    else {repeat=null;
   console.log(' setanticipateflag() not called ');
    }
  }


socket.on('stopRepeat',() => {
  repeat=repeat||checkFactory(eM);// could be find null ???
  console.log(' stopRepeat event fired');
  if(repeat){
  repeat.stopRepeat();
  setanticipateflag(false);// same of registering  repeatcheckxSun()  ??
  }
  });// 




 }// ends function (socket) 




);// ends io.sockets.on('connection'


// todo what is this ?
// run a bash shell
process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});




return 'ok';
function anticipateFlag(set_,fn){// like onRelais, write state after completed it . todo add fn in callers !!!!!
  if(!fn)console.error('anticipateFlag(), eM is null ');
  if(!fn)console.log('anticipateFlag(), eM is null ');else console.log(' anticipateFlag(), eM is found ');
  let state=fn.state;
  state.anticipate=set_;
  return api.writeScriptsToFile(fn)
    .catch(function(err) {
      console.log(' anticipateFlag(),  writefile catched : ',err);
        console.error(err);

        // process.exit(1);
      });
}

function onRelais  (pump,data,coming,fn) { //pumps unique handlerget pumps switch status from client web page  data=0/1 pump ='pdc'
                                  // accoppiato con emit('pump',)   
                                  // >> pump in relaisEv
                                  //  onRelais can be called  from :
                                  //     - this server using   setPump() che chiamera onRelais sia direttamente che via browser (feedback )
                                  //      or
                                  //     - browser(via .emit('pump',,'browser')) che ha origine da 
                                  //          - browser user change flag
                                  //          - come feedback del event 'pump' lanciato dal server dal gpio button handler  :
                                  //                pumpsHandler[pumpnumber]= watchparam(pump)) 
                                  //                this handler can be called by gpio button change or
                                  //                 by  setPump() 
                                  // 
                                  //          nb setPump() chiama onRelais sia direttamente che via browser ( come feedback )
                                  //              setPump è chiamato da startfv, attuators
 
                                  // this is ....  global ?
  console.log('OnRelais started x pump: ',pump, ' coming: ',coming);
  if(!fn)console.error('onRelais(), eM is null ');
  let state=fn.state;
  let value=state.relays[pump];// true/false, pump as recorded on status
  let lightvalue = data,// 0/1
  pump_=relaisEv.lastIndexOf(pump);// the index in relais_
  if(pump_>=0){
  curval=relais_[pump_].readSync();// 0/1
  console.log(' onRelais, coming from: ',coming,', current rele position x ',pump,' is ',curval,' asking to set : ',data); 
  console.log('              onRelais, state: ',state); 
    let lchange=false;
  if(value&&curval==0||((!value&&curval==1))){// state != cur value . a problem !
    console.warn(' onRelais, find pump ',pump,' state different from current pump position thats: ',curval); 
    console.log(' warn: onRelais, find pump ',pump,' state different from current pump position thats: ',curval); 
    lchange=true;
  }
  if (lightvalue != curval) { // 0/1 != 0/1 gpio comanding relays is called, only change gpio if current position/value is different from present position
    console.log(' onRelais,  changing current rele position/value x ',pump,' to: ',lightvalue); 
    relais_[pump_].writeSync(lightvalue); //turn LED on or off
    console.log(' onRelais,  verifying current rele  position/value changing  x ',pump,' now is: ',lightvalue); 
    //console.log(' ****\n browser/algo ask ',pump,' relay to change value into : ',lightvalue); // ex 0
    /*
    if (buttoncaused) {// means that the relay is requested by user raspberry button press (or algo anticipating), not corresponding seb button press
      buttoncaused = false;
    } else {
      // eM.emit('web', 1);
    }*/

    // update staus in case the new pump data comes from button o from browser    
   
    if(value&&data==0||((!value&&data==1))){// state != cur value (data=lightvalue)
      // update state
      state.relays[pump]=!value;

      let plantname= state.app.plantname,
      procedura='unknown';// to do .....
    // update status file , dont need to wait so not async func  otherwise see doc on async in .on handler
    // 
    console.log(' onRelais(), to update, now call writeScriptsToFile: ',plantname,' scripts/state: ',state);
    // return // not mandatory
    //return api.writeScriptsToFile(state,plantname,procedura)
    return api.writeScriptsToFile(fn)
    .catch(function(err) {
      console.log(' onRelais(),  writefile catched : ',err);
        console.error(err);

        // process.exit(1);
      });
    }

  }else {console.log(' onRelais(), browser/algo ask ',pump,' rele to change value but is as before : ',lightvalue); // ex 0
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



function recoverstatus(plantname){// this ctl is the ctl whose state must be updated from file if exist (persistnce)
  // this.state is asic state x new ctl. if we have stored , get it 
  // >>>>   returns a promise resolved we we finish to write satus back with promise .writeScriptsToFile
let that=this,state=that.state,reBuildFromState=that.reBuildFromState;
  return new Promise(function(resolve, reject) {

    //console.log(' recoverstatus,  starting  : ',that);
 // api.loadScriptsFromFile(plantname,this).catch(function(err) {
    api.loadScriptsFromFile(plantname,that).catch(function(err) {
    console.log('Could not load scripts from file:',plantname, err);
    reject();
    process.exit(1);
}).then(function(that_) {// that_ is that with updated state 
                        // the  current plant state: from saved in file or a basic state  if new controller (that)
    // verify that we can now write back to the file.
    console.log(' recoverstatus() , now loadScriptsFromFile is resolved so callwriteScriptsToFile() writefile: ',plantname,' script: ',that_.state);
    //return api.writeScriptsToFile(scripts,plantname)
 
    // recover registered functionality if start from a new instance 
    
    // if(reBuildFromState){}// moved on calle , because of the problem of writing 2 times the state !
    


    return api.writeScriptsToFile(that_)// or that is the same ! nb this promise  is thenable to a .then function if any. here have AWQ
    .catch(function(err) {
      console.log(' recoverstatus,  writefile catched : ',err);
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

}



