const DEBUG1=false,
MAXHistLen=10;
// import { EventEmitter } from "events";
let { EventEmitter }=require('events');
const readline = require('readline').createInterface({// see https://stackoverflow.com/questions/65260118/how-to-use-async-await-to-get-input-from-user-but-wait-till-entire-condition-sta
  input: process.stdin,
  output: process.stdout,
});
const dOraLegale=parseInt(process.env.dOraLegale)||0;
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
      this.aiax = {};//{ battLevel: 0 };// input datastate direcly updated with aiax calls
      // internal fsm state :
      this.token=null;
      this.stepInd=-1;// next step navigation
      this.relays={};//{pdc:false,g:false,n:false,s:false};// current gpio relays values , moved to fv3
      this.discFromBrow=[];// used in onRelais to not duplicate server cmd when duplicated c md comes from browser 
      this.blocking=[];// the timer ref used with discFromBrow, to block the brouser duplicated onRelais req
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


    this.state=clearState();// after try to recover from file  012023
  }

  // questa funzione e lo schema di processo generale ,, chiamera emitter e passera le variabili e funzioni custom to perform the process
  // this.execute=async function // will return awaited value (can be passed to next func like were a cb param)

  // nb execute is usually called : WithTime.execute , so this is the instance of WithTime !

  //  execute(asyncFunc,asyMajorEv,asyProcess, ...args) 
  //execute(evname, evtype, evcontingencyparam, asyncFunc, asyncpreferred_evlistener - on, evlistener_data, asyMajorEv, asyProcess) {// a entry point in fsm (master event process that precess basic fsm events)
  //execute(evname,  evcontingencyparam,evAsyn,ev2run,evistener_data) {// a entry point in fsm (master event process that precess basic fsm events)
  //execute(procName, evcontingencyparam, evAsyn, ev2run, evAsync, processAsync,asyncPoint, dataArr) {// a entry point in fsm (master event process that precess basic fsm events)
    execute(procName, evcontingencyparam, evAsyn, ev2run, processAsync,asyncPoint, dataArr_,cb){
/* news 20122021
    ev2run={evname1:null,evname1:eventnamtofillinputwithresults=evname1,,,}={connect:startcheck,openapi:null,startcheck:null}  the event to run and the event to set the input as result 
 
      evname will run with input dataCon[evname] that is :
            dataArr[evname].event or, if eventnamtofillinputwithresults is not null:
            the results of evAsyn[eventnamtofillinputwithresults]( input =dataCon[eventnamtofillinputwithresults] usually dataArr[eventnamtofillinputwithresults].event  )
      so evname1 will be run not with input = dataArr[evname] 
            but with input  : the results of evAsyn[evname]( input =dataCon[evname].event )
        
  
        we can insert dummy events (.emit(dummy,,,) is uneffect ), just to insert a step with null event but that can run some processAsync
  
    evAsyn={evname:a asynctorun,,,} : asynctorun  is the async to run before fire the event, input x asynctorun is : dataArr[evname].processAsync
                                      the asynctorun cb(data)  will set dataCon[asynckey]=date if data not null  
    dataArr[evname]=data/{event:evdata,processAsync:asyncdata}  nb if .processAsinc is null then will be set as .event or data  
      dataArr[evname].processAsync



    asyncPoint={1:'login',,,,,}; at step 1 run :   processAsync={login:function(){},,,,,} with input  input_ = dataArr[asynckey];

    stepx : // current step index : can be reset in event handler setting this.state.stepInd!! (default is ++)
        ev2run events will be fired sequentially (step=0,1,,,) in ...
            with .emit(event,inputdata=dataCon[event],,)

          but before firing  we can run  the async processAsync[ asyncprocedurename=asyncPoint[stepx])]


    

    problem : what to do with : evAsync  ????, seems old staff
        

*/



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
    evAsyn = {} : a bank of event injected func at init!!!!!!!!!!!!!!!!!!!
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



    /* todo
    if(dataArr[key])
    if(dataArr[key].event){
      dataArr[evname].processAsync=dataArr[evname].processAsync||dataArr[evname].event;
    }
    else {dataArr[key].event=dataArr[key];dataArr[evname].processAsync=dataArr[evname];
      
    }
    */
   const dataArr=dataArr_;// temporarely


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
      console.log('updateData setting return data ', data);
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
    // let dataArr={begin:{event:100,processAsync:null},startcheck:null};// event or processasync key
    // evAsyn={aEv2runKey:itsasync,,,,,,}
    // processAsync={1:'login',,,,,}

/* the template for a .on listener FFGG:

function afunc(inpu,cb){// the .on func ;    evMng.on(evname,func)
    console.log('ciaoppi',inpu);
    let result=inpu*100;
    cb( 0,result);// the return 0 is 
  }

  NBNB   cb will call , as standard, updateData(err,dataresult)

*/

  console.log('\n *******  execute() start running procedure ',procName ,' with event list : ',ev2run,'\n inputarray: ',dataArr,' at ',new Date());

                      // ev2run[key] is the event whose result set the input of key-esimo event
    let dataInv = {},// the output of k-esimo event will set the input of event dataInv[k] . evento su cui viene updatato con l'output del k-esimoo event
      dataCon = {};// the i-esimo input data , or updated by output of event asyncprocess

    Object.keys(ev2run).forEach(function (key, index) {// for each entryrun a event/dummy step 
                                                      // navigation : next step will be ++ or modified by state.stateInd
                                                      //fills :
                                                      // -dataCon[key]
                                                      //    > data to use x event key, to be updated when event key is fired and returns the data
                                                      //        or simply : dataArr[key]
                                                      // - dataInv 
                                                      //    >   dataInv[key] :the event ev2run[key] will receive input from event key
                                                      // ev2run={connect:startcheck,openapi:null,startcheck:null}
      console.log(' execute review the input array : ',dataArr,  ' accordimg to event output map: ',dataInv,' for event: ',key);
      // key: the name of the object key
      // index: the ordinal position of the key within the object 
      if (ev2run[key]) {// event key must give return as input of event ev2run[key]
        console.log('ev2run event', key,' will get input also from result of event  ',ev2run[key]);
        console.log('so  event', ev2run[key],' will give its result  adding input to dataCon of event  ',key);
        dataInv[ev2run[key]] = key;// the event ev2run[key] will give input to event: key
        // dataCon[key] = null;// data to use x event key, to be updated when event ev2run[key] is fired and returns the data
      } else {// null value means the input is in dataArr.key
        // dataInv[ev2run[key]]=null;// alredy set

        console.log('ev2run event', key,' wont have  reviewed its input .');//('key not found on ev2run , property: ', key);
      }
      dataCon[key] =null;
      if(dataArr[key])dataCon[key] = dataArr[key];//.event; usually dataArr[key]={dataArr:{.....},,,,ex data:..,someprevEvent:...,,,} 

      console.log('ev2run event', key,'  assign dataArr input to current building input array dataCon: ',dataCon);
    });

    function OuterFunction(par, ev) {// will fill inArr with afunc return    >> called with that as context !!!
      // alternativa : basta  InnerFunction(newin)  con zz , 
      // non serve la closure (OuterFunction) che non configura niente !!
      console.log('ciao');
      var outerVariable = par;// che cosa configura ???
      function updateData_(err, data) {   // zz   this id the cb   to framework: set ev2run[ev] using std cb updateData () that just return  data
                                          // is a async cb
       //  ev2run[ev] = updateData(err, data);//  after updated the input for event ev 
       
       console.log('Outerfunction. updateData_: in procedure: ',procName,' event (',ev,') handler returned data in cb : ',JSON.stringify(data,null,2));
       if(data&&dataInv[ev] ){
        dataCon[dataInv[ev] ]=dataCon[dataInv[ev] ]||{};
        // insert usually with the ev name key or 'data' key
        dataCon[dataInv[ev] ][ev]=updateData(err, data);// =data . updated the input for event dataInv[ev] calculated from the data filled in cb by handler .on()
       console.log(' returned data from handler: ',ev,' set the input: ',dataCon[dataInv[ev] ],', for event: ',dataInv[ev]);
      }else  console.log(' returned data from handler ',ev,'  dont updated any event inputs, so dataCon[] dont changes: ',dataCon);
      //console.log('Outerfunction. updateData_:  event ',ev,' sets input chain as :', ev,'dataCon(inputarray updated by previous event results): ', dataCon);
      // goon step
      goonstep(data);// last event results
     

      }

      function InnerFunction(newin) {// >>>>  <InnerFunction rename in :runevent, 
                                      // newin can force the new input instead of std input ev2run[ev]
        let inp = newin || 
          dataCon[ev];// no :ev2run[ev];
        //function updateData_(err,data){   // zz
        //		ev2run[evnam]=updateData(err,data);}
        // state sara in this.state .    inp=inp+state ;// ?????????????????????
        console.log('pilo, innerfunction(), event: ', ev,' , inp: ', inp,' dataCon: ',dataCon);
        //console.log('pi',);
        this.emit(ev, inp, updateData_);// so the template for .on call will be SEDR  !!!!!!!!!!!!!!!!!!!
                                        // QUESTION .on ha il this lo stesso di questo ??? (che e' callato con that, instanza corrente di questo app )
                                        // se si allora posso ottenere state = this.state
                                        // the handler starts async threads ! so we returns using cb updateData

        // >>>>  emit is sync so emit returns ( so innerfunction returns to runEvent() caller)
        //  when .on(ev,,) handler returns. but the promise on .on hanler will call updatedata_ usually just before the handler returns  
        //    >> not later infact in the handler we wait the async rest  
      }

      return InnerFunction;
    }


    // basic event listener/router are here defined 
    // begin 

    //asyncPoint = asyncPoint||{ 0: 'login' }; //??  at step stepx run the async processAsync[ asyncPoint[stepx])]

    // now start sequentially do the list : ev2run
    //  some event can change the index or interrupt the loop or run another event or procedure
    // for example in a listener fv can fire another event or procedure 
    // after reset the index of this loop :  state.stateInd=1000; or =0 
    //      so restart the process after finish the event chain
    // emit('othereventchainhead',data), so we follow the customized(fv) chain of event , they will run sync 
    //  then when returns we  complete the for with the index resetted (0 or 1000 ) or we start a new execute


    let that=this;// to set this obj as context in embedded functions that can access to this context instead to set embedded func context : call(context,parms)

    let stepNum = -1;// new stepindex
    let prolist=Object.keys(ev2run) , nprop=prolist.length;
    // for (var step in ev2runj) {//
    let stepInd=this.state.stepInd=-1;// if >0 :current step index : can be reset in event handler !! (default is ++)
    let i=0;// old stepindex

    //for ( i=0;i<nprop;i++) {// ******  in this loop we run sequentially events and asyncs according to procedure def in: DDFFRR 
                                  // the closure standard cb will set/reset input for next events using values in ev2run

    

    // moove to IIUU           ??
    function goonstep(lastRes){// the for loop è triggerato  by a asinc return  in Outerfunction!(

    //  if (ev2run.hasOwnProperty(step)) {

      // navigation :
      // for each entryrun a event/dummy step 
      //  : next step will be ++ or modified by state.stateInd
      // to  exit the stake set  state.stateInd>=nprop  ex 1000


      //if(this.state.stepInd>=0)stepnum=state.stepInd;
      if(that.state.stepInd>=0){stepNum=that.state.stepInd;// reset event loop if someone change the std increse of stepNum and set the new navigated stepnumber
      that.state.stepInd=-1;// std
    }
        else stepNum++; // std action

        if(stepNum<0 ||stepNum>=nprop){
          ends(stepNum,lastRes);// exit loop
          return ;
        }


        let step=prolist[stepNum],// event at current step
        asyncNam = asyncPoint[stepNum];// ex : asyncPoint={1:'login',,,,,}at step 1 run :   processAsync['login']={login:function(){},,,,,}.login with input  input_ = dataArr[asynckey];
       // let outpu='goonstep called , exec procedure: '+procName+', step: '+stepNum+', event: '+step+'\n state: '+JSON.stringify(that.state,null,2)+'\n  async to run: '+asyncNam+'\n\n';
        let outpu='goonstep called , exec procedure: '+procName+', step: '+stepNum+', event: '+step+'\n  async to run: '+asyncNam+'\n\n';

        //console.log('\n *****   goonstep called , exec procedure: ',procName,', step: ',stepNum,'\n state: ',that.state,'\n event: ',step,', async to run: ',asyncNam,'\n');
        console.log('\n ***** ## ',outpu);
      
        let outprompt='>>>>>>>>>>>> please input somethig togoon step.'+outpu;
        if(DEBUG1){
        console.error(outprompt);
        requestInput(outprompt,procName,' event ',step,' step ',stepNum,', now please input somethig togoon ').then(goonstep_);// debug, if we were in a async we could : await  requestInput()
        // goonstep_();// normal
        }else goonstep_();

        function goonstep_ (){
          console.log(' goonstep running goonstep_  after debug console readline');
        // now before a step event run some async :
        let noasync=true;
        if ((asyncNam )) {
          if (processAsync[asyncNam]) {// run here the (login) async before fire the event
            noasync=false;
            runAsync(asyncNam)// a promise
                              .then(() => runEvent(step));


          }
        }
        // do stuff
        if(noasync)
        runEvent(step);// can return after a client defined event chain
         // Outerfunction will wait cb then call this goonstep() togoon a step
      };// ends goonstep_

    };// ends goonstep

 
      console.time('execute '+procName);console.log(' execute procedure: ',procName,' started running and  calls console.time ');


     goonstep();// start event loop ev2run
     
      
      return ;// sync thread ends

// UUII : .....

      // ends goonstep loop :
      function ends(stepNum,lastRunnedProcedure){// lastRunnedProcedure= { execute: 'noprogramming'/'pumps suggestion' ,data},
        let dd=new Date();dd.setHours(dd.getHours()+dOraLegale);
        let GMTdate=dd.toLocaleString();
        that.state.lastRunnedProcedure={result:lastRunnedProcedure,procName,GMTdate,setBy:'ends execute,last step result. in app2'};
        that.state.relHistory=that.state.relHistory||[];
        if(lastRunnedProcedure&&lastRunnedProcedure.execute)// log only execute not null  results 
          if(that.state.relHistory.push(that.state.lastRunnedProcedure)>MAXHistLen){
            let lent=that.state.relHistory[that.state.relHistory.length-1];
            that.state.relHistory.length=1;that.state.relHistory[0]=lent;// reset array push last entry
          };
      console.log('****\n execute procedure: ',procName,' stopped running with  step/code ',stepNum,', relHistory dim: ',that.state.relHistory.length,' cur state: ',that.state,' Time Consumed : ');console.timeEnd('execute '+procName);
      // moved this.on('data', (data)=> console.log('got data ', data));

      if (procName == 'customEv') { };

      if(stepNum>1000){
        if(stepNum==1001){
          console.error(' fv3 exiting some execute() because cant get a token from server');
          // to do : fire a socket event to browser !
        }
      }
      cb();// execute ends: return null flow to cb (see OuterFunction)
      }
    
    // func:

    function runEvent(myev) {//run event myev with in data primariamente in ev2run
      //  var myev='begin';
      let par1 = 0;
      console.log(' ## app2.runEvent(): firing handler of event : ',myev);
      var emmitMyev = OuterFunction(par1, myev).call(that,null);//,_mycb);// prepare senza usare zzzz
      console.log(' runEvent(): promise was started ( probably terminated)  , event ', myev, ', ev2run is:', ev2run,' con input dataCon: ', dataCon, ', dataInv(quali eventi sono alimentati): ', dataInv);
    }

    async function runAsync(asynckey) {// run async associated to event with input=dataArr[asynckey].processAsync  dataArr={login:{processAsync:input}}
      // to call here or in some place , ex :in specific event listener :
      let asyncFunc = evAsyn[asynckey],
        input_ = null;
        if(dataArr[asynckey]) input_=dataArr[asynckey].processAsync;
        console.log(' runAsync(): , asyncevent ', asynckey, ', take its input from dataArr[asynckey].processAsync: ',input_);
 
      if (asyncFunc)
        //if (args[0]==1)
        console.time(asynckey);

        dataCon[asynckey] =// HHGGJJ
        await asyncFunc(// a promise 

          input_,
          // ...args chained from excute args
          procName, evcontingencyparam, evAsyn, ev2run, evAsync, processAsync, dataArr

          // usually the calc data will be put in key in dataCon={asynckey};


          /* HHGGJJ asyncFunc is a promise so return from await normally ==
          , (err, data) => {// asyncFunc is the async runnin in execute. the client func 
            // will calc in the middle of execute some param needed to goon with the process
            // to be used in some ev2run , it is stored in  dataArr

            // here the middle is after start event 
            // here the we run the asyncFunc just first action to do after fire the event evname


            if (err) {
              return this.emit('error', err);
            }
            
            // this.emit('data', data);
            // console.timeEnd('execute');
            //this.emit('end');
            
            console.log(asynckey,' async func ends with time: ');console.timeEnd(asynckey);
            if (data) dataCon[asynckey] = data;

          }*/
          );
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


} // ends class execute , was old WithTime




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
// so some socket events coming from browser (probably after a login to user and a logim to plant with related session/token ) that are addressed to specific plant mng will be routed to the implemented rest fsm server
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

const requestInput = (shown) => {// use :
                              // in async  await requestInput
                              // otherwise use a cn :  requestInput.then(goon);
  return new Promise((resolve, reject) => {
    readline.question(shown, async (url) => {
   console.error('readline got line');
        //readline.close();
        resolve(url);
      
      });
    });
  }