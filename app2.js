// import { EventEmitter } from "events";
let { EventEmitter }=require('events');

/*

summary:
app : è il fsm factory  server , app gestisce il fv ctl factory:  WithTime.

 struttura:
 - AAA class WithTime : il ctl fv che governa il fv , e' fsm event programmed
 - BBB  seguono i handler non customizzabili associati agli state event che sono std 
     gli handler cust sono injected dal client fv !
 - CCC main :
  app={// app obj , will pass fv ctl ( WithTime)
  getEventMng:function(cfg_){
    return ev = new WithTime(cfg_);
    },
  stat:{}// app status/staff
  };

- start fv client : will custom .on , start fv server to cfg , i/o connectors  and monitoring
  require('fv')(app,cfg).doStaff();





old :
evento('type',asincfunc,param , anal param poi esegue i end event );
  esegue il start event settera il statu evento =param, poi esegue dechech specifici di chiamata asyncfunc, poi girera il std anal to know what to do 
  es evento checknow
  will just run start che provvede a checcare gli statii da aiax call , leggere i param da gpio e poi in funzione dei config param e dei param di time param .
	
*/

let app={state:{name:'fv factory'},// the app state 
getEventMng:()=> WithTime  };// the factory 


// https://www.freecodecamp.org/news/how-to-code-your-own-event-emitter-in-node-js-a-step-by-step-guide-e13b7e7908e1/
// Example 7— Async Example demo
// Example 2->Adapted and thanks to Sameer Buna

/// AAA
class WithTime extends EventEmitter {// js version ....
  // Status var sono gli stati associati ai eventi cioe stati che segnalano lavvenimento di un evento e il suo perdurante effetto



  constructor(cfg) {
    super(); // call parent class constructor
    this.config = cfg;// init some obj , like set param in closure


    var pippo;

    let states_ = function () {// fsm instance (plant) states constructor, this is a new obj
      // class states_  {// constructor, this is a new obj
      this.int = { buttonPress: false, anticipating: false, maxbatt: false };// constructor of input datastate  state direcly filled by ex interrupt/listener
      this.app = { battThres: 80, anticipating: false,plantname:null };// fsm app internal state direcly updated with this process
      this.aiax = { battLevel: 0 };// input datastate direcly updated with aiax calls
      // internal fsm state :
      this.token=null;

    }


    // to  init , that is def 
    let config = this.config || {
      evAsync: {},
      par1: 0
    };


    function clearState() { return new states_() }


    let state = null;// a entity property !!!!
                    // >>>>>>>>>>>>>>>  if we implement a server insted of a event instance we will have uri entry on behalf of procedure and state=session
                    // recover in .on :   let state=this.state

    this.state=clearState();
  }

  // questa funzione e lo schema di processo generale ,, chiamera emitter e passera le variabili e funzioni custom to perform the process
  // this.execute=async function // will return awaited value (can be passed to next func like were a cb param)

  // nb execute is usually called : WithTime.execute , so this is the instance of WithTime !

  //  execute(asyncFunc,asyMajorEv,asyProcess, ...args) 
  //execute(evname, evtype, evcontingencyparam, asyncFunc, asyncpreferred_evlistener - on, evlistener_data, asyMajorEv, asyProcess) {// a entry point in fsm (master event process that precess basic fsm events)
  //execute(evname,  evcontingencyparam,evAsyn,ev2run,evistener_data) {// a entry point in fsm (master event process that precess basic fsm events)
  execute(procName, evcontingencyparam, evAsyn, ev2run, evAsync, processAsync, dataArr) {// a entry point in fsm (master event process that precess basic fsm events)

    // run begin , the asyncfunc passed with args param to use with specific evname ()
    //ex the server connector fusionsolar , then using param and the async return 
    //run a next state routine, at last run end 


    /* ...args =[evname,evtype,evcontingencyparam,preferred_evlistener-on,evlistener_data)] 
    procname=( main event) name to process:
     main: events:
      startcheck(to start anticipating),
      timecheck(to stop anticipating),
      maxbattery,
      someaiaxtodo
        NEWS on callbacks:
    evAsyn = {asyncFunc:'',evname1:1,,,startcheck:0}: {asyncfunc to run in some poins:avalue?,the eventasynctorunin sequence:avalue?}startcheck=1 after updated the status will fire startcheck
    ev2run = {evname1:asyncOrPreviousEvnameOutput,,,startcheck:null}: {the eventasynctorunin sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means evistener_data !!
    evcontingencyparam ?? specific evname .on param 
      evlistener_data    evname handler /.on data 
            can contain data for all emitted events, not only evname:
    {
      data: 0,// main specific data for evname
        begin: 0,// begin data if different then data
            ,,,,
          	
            }
    asyncFunc: // here the we run the asyncFunc (custom event handler injected obj) just first action to do after fire the event evname
    asyncpreferred_evlistener - on : custom event handler injected obj to pass to evname.on
      == asyMajorEv
  
            NEWS
            Asyn={asinc1,asinc2,ev1,ev2} : asyncx a bank of injected func to activate in some point of the process execute, evx: the async tu run in the specific event
  
  
  
      >>> in future will be put in cfg call into
    evAsync = {} : a bank of event injected func at init!!!!!!!!!!!!!!!!!!!
    processAsync: additional custom injected to run in process(passed to all emitter chain), compreso  asyncFunc
  
  
  
      */

    // nb this is 



    // updater :
    /* SEDR :   template of .on called on fvx : .on(evname,afunc) , the afunc params are the ..args in     .emit(evname,..args)
    function afunc(inpu,cb){// the .on func ;    evMng.on(evname,func)
      console.log('ciaoppi',inpu);
      let result=inpu*100,err=0;
      cb( err,result);// the return
    }*/

    function updateData// the cb std func, do nothing, just returns data
      (//ev,// needed ?
        err, data) {// asyncFunc is the async runnin in execute: the client func will calc in the middle of execute some param needed to goon with the process
      // asyncFunc and generic .on listener returns can be the input for next subevent call, so 
      // they use this cb  updates up_data with the result of  the caller
      // here the middle is  after the evname run  and goon could be the definition/update of startcheck param 
      // will update 
      if (err) {
        return this.emit('error', err);
      }
      /*
      this.emit('data', data);
      console.timeEnd('execute');
      this.emit('end');
      */
      console.log('stting ', data);
      return data;

      // if(ev&&data)dataArr[ev] = data;// fill the input of impacted event
    }
    /*
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // do stuff
      }
      or
      Object.keys(obj).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
    });
    
    }*/


    // some settings :

    // templates DDFFRR : 
    // let evAsyn = {asyncFunc:'',evname1:1,startcheck:0};// {asyncfunc to run in some poins:avalue?,the eventasynctorunin sequence:avalue?}startcheck=1 after updated the status will fire startcheck
    // let ev2run = {begin:null,startcheck:'begin'};// {the eventasynctorunin sequence:avalue?}startcheck=1 after updated the status will fire startcheck, null means evistener_data !!
    // let dataArr={begin:100,startcheck:null};// event or processasync key
    // evAsync={aEv2runKey:itsasync,,,,,,}
    // processAsync={'login':true,,,,,}

/* the template for a .on listener FFGG:

function afunc(inpu,cb){// the .on func ;    evMng.on(evname,func)
    console.log('ciaoppi',inpu);
    let result=inpu*100;
    cb( 0,result);// the return 0 is 
  }

  NBNB   cb will call , as standard, updateData(err,dataresult)

*/

    let dataInv = {},// the output of events will go to ...
      dataCon = {};// the input data , some to update or to be added by som asyncprocess

    Object.keys(ev2run).forEach(function (key, index) {// fills dataCon dataInv
      console.log('key ', key);
      // key: the name of the object key
      // index: the ordinal position of the key within the object 
      if (ev2run[key]) {// event key must give return as input of event ev2run[key]
        console.log('key found on ev2run', key);
        dataInv[ev2run[key]] = key;// the event setting input
        dataCon[key] = null;// to be updated
      } else {// null value means the input is in dataArr.key
        // dataInv[ev2run[key]]=null;// alredy set
        console.log('key not found on ev2run', key);
        dataCon[key] = dataArr[key];
      }

    });

    function OuterFunction(par, ev) {// will fill inArr with afunc return
      // alternativa : basta  InnerFunction(newin)  con zz , 
      // non serve la closure (OuterFunction) che non configura niente !!
      console.log('ciao');
      var outerVariable = par;// che cosa configura ???
      function updateData_(err, data) {   // zz   this id the cb   to framework: set ev2run[ev] using std cb updateData () that just return  data
        ev2run[ev] = updateData(err, data);//  after updated the input for event ev 
        console.log(' updateData_', ev, ev2run);
      }

      function InnerFunction(newin) {// InnerFunction rename in :runevent, newin can force the new input instead of std input ev2run[ev]
        let inp = newin || ev2run[ev];
        //function updateData_(err,data){   // zz
        //		ev2run[evnam]=updateData(err,data);}
        // state sara in this.state .    inp=inp+state ;// ?????????????????????
        console.log('pilo', ev, inp);
        console.log('pi',);
        this.emit(ev, inp, updateData_);// so the template for .on call will be SEDR  !!!!!!!!!!!!!!!!!!!
                                        // QUESTION .on ha il this lo stesso di questo ??? (instanza corrente di )
                                        // se si allora posso ottenere state = this.state
      }

      return InnerFunction;
    }


    // basic event listener/router are here defined 
    // begin 

    let asyncPoint = { 1: 'login' }; //??

    // now start sequentially do the list : ev2run
    //  some event can change the index or interrupt the loop or run another event or procedure
    // for example in a listener fv can fire another event or procedure after reset the index of this loop
    // state.stateInd=1000; or =0 so restart the process after finish the event chain
    // emit('othereventchainhead',data), so we follow the customized(fv) chain of event , they will run sync 
    //  then when returns we  complete the for with the index resetted (0 or 1000 ) or we start a new execute


    let stepNum = 0;
    let prolist=ev2run.keys() , nprop=prolist.length;
    // for (var step in ev2runj) {//
    let stepInd=this.state.stepInd=0;
    for (let i=0;i<stepInd;i++) {// ******  in this loop we run sequentially events and asyncs according to procedure def in: DDFFRR 
                                  // the closure standard cb will set/reset input for next events using values in ev2run

    //  if (ev2run.hasOwnProperty(step)) {

        stepNum++;

        // now before a step event run some async :
        let asyncNam;
        if ((asyncNam = asyncPoint[stepNum])) {
          if (processAsync[asyncNam]) {// run here the (login) async before fire the event
            runAsync(asyncNam);

          }
        }
        // do stuff

        runEvent(step);// can return after a client defined event chain
      }



      // ends :

      console.time('execute');
      // moved this.on('data', (data)=> console.log('got data ', data));

      if (procName == 'customEv') { };

    
    // func:

    function runEvent(myev) {//run event myev with in data primariamente in ev2run
      //  var myev='begin';
      let par1 = 0;
      var emmitMyev = OuterFunction(par1, myev)();//,_mycb);// prepare senza usare zzzz
      console.log(' results of event ', myev, ':', ev2run, dataCon, 'dataInv: ', dataInv);
    }

    async function runAsync(asynckey) {
      // to call here or in some place , ex :in specific event listener :
      let asyncFunc = evAsyn[asynckey],
        input_ = dataArr[asynckey];
      if (asyncFunc)
        //if (args[0]==1)
        await asyncFunc(

          input_,
          // ...args
          procName, evcontingencyparam, evAsyn, ev2run, evAsync, processAsync, dataArr

          // usually the calc data will be put in key in dataCon={asynckey};

          , (err, data) => {// asyncFunc is the async runnin in execute. the client func 
            // will calc in the middle of execute some param needed to goon with the process
            // to be used in some ev2run , it is stored in  dataArr

            // here the middle is after start event 
            // here the we run the asyncFunc just first action to do after fire the event evname


            if (err) {
              return this.emit('error', err);
            }
            /*
            this.emit('data', data);
            console.timeEnd('execute');
            this.emit('end');
            */
            if (data) dataCon[asynckey] = data;

          });
    }

    /*
    ///////////// old 

    if (evtype.type == 1) {// event that will need full process , so chain startcheck event after process the evname lisner in a cb

    



      // version 1
      this.emit(evname, function (err, checkdata)
       {// different from updateData  !!!!!!!!!!!

        if (asyncFunc)
          //if (args[0]==2)
          if (evtype=='asyncFunc')
            await
        asyncFunc(...args, checkdata,updateData);

        this.emit('startcheck', checkdata,,,,,,,,);
      },
        evcontingencyparam, preferred_evlistener - on, evlistener_data, asyncFunc, asyMajorEv, asyProcess);// .on defined in caller

      // version 2
      this.emit(evname, function (err, checkdata)
       {// different from updateData  !!!!!!!!!!!

        if (asyncFunc)
          //if (args[0]==2)
          if (evtype=='asyncFunc')
            await
        asyncFunc(...args, checkdata,updateData);

        this.emit('startcheck', checkdata,,,,,,,,);
      },
        evcontingencyparam, preferred_evlistener - on, evlistener_data, asyncFunc, asyMajorEv, asyProcess);// .on defined in caller




    } else {// std event
      this.emit(evname, function (err, data) {
        let thisisacb;

      }, evcontingencyparam, preferred_evlistener - on, evlistener_data, asyncFunc, asyMajorEv, asyProcess);// .on defined in caller
    }

    ///////// old 
    */
    // new 




  }// ends execute


} // ends class WithTime




// one entry each state that will run immediately


/*

// BBB seguono i handler associati agli state event che sono std . ????????????
process.on("button", () => console.log("got button event"));
process.on("web", () => console.log("got web event"));
process.on("anal', () => console.log("Exit"));// general parsing x events condition to start action , will use customm asyncfunction ?

// i handler da customizzare sono invece settati dai moduli operativi LOPO


// CCC main 
let started = {};


let app = {// ** app obj , will pass the factory fv ctl ( WithTime)
  getEventMng: function (cfg_) {
    // ev = new WithTime(cfg_);// create the fv ctl
    let evclass = WithTime;//the factory
    return evclass;
  },
  stat: {}// app status

};

let cfgg = {
  name: 'fusionsolar'};

  // old : server fv is called one by one :
  cb=cc_bb;
  let runn=require('fv3')(app, cfgg, cb);// lauch client of fusionsolar fv that init some preliminary and return 1 if ok 
  // ** il server fotovoltaico viene chiamato per richiedere il singletho () instanza del gestore di uanwey  che gestisce un cliente
  if(runn!= 1);// error
   

function cc_bb(client) {// client got a request from a plant on a webpage , to register the fv ctl inst
  if (client.name) {
    let name = client.name;

    if (started.name) return started.name.inst;// just goon
    else {// start a fv instance
      started.name = client;
      if (!started.name.inst)
        started.name.inst = new WithTime(client.cfg_);// create the fv ctl
      return started.name.inst;

    }
  }

  // https://api.open-meteo.com/v1/forecast?latitude=45.6055&longitude=12.6723&hourly=temperature_2m,weathercode,cloudcover&timezone=Europe%2FBerlin
  //https://open-meteo.com/en/docs#latitude=45.65&longitude=13.77&hourly=temperature_2m,weathercode,cloudcover&timezone=Europe%2FBerlin

}

  //  end old : server fv is called one by one 
*/
// new make this app fv fsm factory( factory of event mngobj) 
// it also can be implemented as a server with user login and session (put in a session store service) will be the same as the event obj state(local vars))
module.exports = function fsmmanager(opt, cb) {
  // opt dice il tipo di inverter ()
  
  let no_ccbb = null, opt1 = {aiax};
  cb(app, opt1, no_ccbb)// give WithTime fsm factory app (ap=WithTime,opt) to cb



}

async function aiax(url,data,head){
  /*
data ={prop1:value1,,,}  , the js plain 1 level obj (js map)
ex:
rest("https://postman-echo.com/someendp',POST,{title: "Make a request with Node's http module"},"Content-Type": "application/json"})

  */
  let response = await  this.rest(url,'POST',data,head) 
  .catch((err) => { console.error(' REST got ERROR : ',err); }); 

if(response)return JSON.parse(response);// response: a json string 
else return null ;
}

