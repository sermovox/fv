let mqtt=require('../mqtt');// nb this module should be init by fv3 itself !!!  ceck it !
const custDev=require('./custDevDef');
let Gpio=false,rs485='rs485.py',pdate;// rs485 sh script on base dir
let relais;// input gpio , temporaneamente fissi, non generati con chiamate  getctls: !

const PRTLEV=5,DEBUG=true;// print log level 


 /*                               // >>> so in relaisEv there are the names !
await getio(16, 'out'),
await getio(20, 'out'),
await getio(21, 'out'),

// b relays group:
await getio(26, 'out'),
await getio(19, 'out'),
await getio(13, 'out'),
await getio(6, 'out')
];
*/


// adding a not state custom device to act when a regular dev (numbSubscr or probSubscr of type 4 ) is writeSync
const deasync= require('deasync');// thats mandatory using async exec()
const { exec } = require('child_process');
/*
let custDev = {// custom devices cmd ctl triggered by a set on a regular dev
  66: async function (set_v = 0) {// state value are inverted , inversion active:  0<>1.
    // this ctl will start stop all splits by modbus ctl
    let set_;
    if (set_v == 1) set_ = 0; else set_ = 1;// invert 0 <> 1 
    const adds = ['2', '3', '4', '5'];// addresses
    console.log(' getio.js, on portid=110 writeSync() force a customdev write with param ', set_);
    //adds.forEach((val, ind) => {
    let mprom;
    for (let i = 0; i < adds.length; i++) {

      let addr = adds[i],
        myexec = 'python3 ' + rs485 + ' w ' + addr + ' 4188 ';
      if (set_ == 1) myexec += '1'; else myexec += '0';
      myexec += ' >> resultrs384.txt';
      console.log(' executing cmd: ', myexec);


      mprom = new Promise(function (resolve, reject) {// dont need resolve vel

       // setTimeout(function(){// unresponsive shell cmd 
        exec(myexec, // is async with cb. is there a sync version ????  ?????  ?????
          (error, stdout, stderr) => {
            console.log(' executing shell: ', stdout, ' cioe ${stdout}');
            console.log(' std error is ', stderr);
            if (error !== null) {
              console.log(`exec error: ${error}`);
              reject(error);
            }
            else {
              //if (Number.isNaN(Number(stderr))) {// std error should be a string number ??
                console.log(' getio() , shellcmd  n. ',i,' returned : ', stderr, ' cioe ${stderr}');
                resolve(stderr);// resolve with std error, test results can be a string numb

              //} else reject(' cant get split on/off');
            }
          })
        //},500);
      });

      // let ptest = new Promise.resolve(5);
      let stderr_=await mprom.catch(erro => { console.error('getio(), cant get split on/off , addreess: ', val, ' error: ', erro); });// in case aiax fire error and be rejected ;;
      //console.log(' getio() , shellcmd n. ',i,' resolved in : ', stderr_, ' cioe ${stderr}');
    }
  }

};
*/
/*;

let fff={66:async function(set_=0)// custom dev interface to add action on cust device (shell interface) attivabili su std writesync di  state supported  numbsubscr and probsubscr devs
                                  // todo add to models.js
                          {
                            const adds = ['2','3','4','5'];// addresses
                            console.log(' getio.js, on portid=110 writeSync() force a customdev write with param ', set_);
                            adds.forEach((val, ind) => {
                              let myexec = 'python3 ' + rs485 + ' w ' + val + ' 4188 ';
                              if (set_ == 1) myexec + '1'; else myexec + '0';
                              console.log(' executing cmd: ', myexec);
                              let mprom = new Promise(function (resolve, reject) {// dont need resolve vel

                                exec(myexec, // is async with cb. is there a sync version ??????????????????
                                  (error, stdout, stderr) => {
                                    console.log(' executing shell: ', stdout, ' cioe ${stdout}');
                                    console.log(' std error is ', stderr);
                                    if (error !== null) {
                                      console.log(`exec error: ${error}`);
                                      reject(error);
                                    }
                                    else {
                                      if (!Number(stderr)) {
                                        resolve(stderr);// resolve with std error, test results in is a numb

                                        console.log(' getio() , shellcmd returned : ', stderr, ' cioe ${stderr}');
                                      } else reject(' cant get split on/off');
                                    }
                                  });
                              });
                              await myprom;
                              await myprom.catch(erro => { console.error('getio(), cant get split on/off , addreess: ', val, ' error: ', erro); });// in case aiax fire error and be rejected ;

                            });
                          }



};*/

async function getio(num, iotype, ind, ismqtt = false,mqttInst) {// returns promise , resolving into   {ctl,devNumb:ind,type:'gpio'}
                                                                //   .ctl=, gives:{readSync,writeSync} working on io in  closure clos 
                                                        // iotype = 'out'   'in-var' dice dove trovare la cfg di model (mqttnumb o mqttprob)e come costruire il ctl 
                                                        // num is the portid, can be null usually if ismqtt false
    let ctl
    // ,custF=custDev[num]
    ;
  if (ismqtt) {

    let retu, injCustDev = null;
    if (mqttInst.avail) {
      // antipattern: retu=await mqtt.fact(num);//
      //if (num == 66)  console.log('lopo');
      console.log('lopo is ', num, ' ', ind);
    
      // nb if the not state devto add is a std shelly dev we can simply add a std type 4 var dev with topic and pubtopic the topic of shelly dev !!!!!!!!!!!!!!!!!

      // if (custF) { injCustDev = injCustDev_; }

      retu = mqttInst.fact(num, ind, iotype, injCustDev_);// returns promise , resolving into   {ctl,devNumb:ind,type:'gpio'}
      //  if iotype='out' : a state.relais pump/rele or var mqtt dev 
      //    or if (iotype='in-var' : a probe or var  mqtt dev 
      //    or if (iotype='int' , num=0   : a ctl interface using a dummy var
      // iotype: is the capability requested and must match the dev registration data done in init()

      if (num == 66) console.log('lopo');
    } else retu = null;
    return retu;//


  } else {// embed raspberry gpio, presently only 'out' iotype, type 1

    // aa
        /*
    return function clos() {
    
    const myio = new Gpio(num, iotype);// static closure obj
    // never null
    return {
    readSync: function () { return myio.readSync(); },
    writeSync: function () { return myio.writeSync(); }
    }
      // aa   }();
    */

    // bb
    console.log(' creating gpio parm: ', num, iotype);
    if (Gpio && num != null && num > 0 && num < 28) {
      ctl = new Gpio(num, iotype); 
      injCustDev_(ctl,num);// add in writesync custF, name=num in gpio
      return { ctl, devNumb: ind, type: 'gpio' }; // as async will return a Promise.resolve(aval)
    } else {
      console.log(' getio, dev number ', ind, ', creating null ctl , type: ', iotype, ' but  forcing to gpio');
      return { ctl: null, devNumb: ind, type: 'gpio' };// in no raspberry return a dummy obj with .ctl=null
    }

  }


  function injCustDev_(ctl,custName){// run writeSync(val) deAsync it. todo: would be better migrate this call inside writeSync passing 
    let custF=custDev[custName];
    if(custF) addCustDev(ctl,custF);
  }

  function addCustDev(ctl,custF){// changes the writeSync() to add custom dev write operation (then followed by call std writeSync) . 
                                // see https://stackoverflow.com/questions/21819858/how-to-wrap-async-function-calls-into-a-sync-function-in-node-js-or-javascript
    const ws=ctl.writeSync.bind(ctl);// std writeSync
    ctl.writeSync=function(val,addparm=null){// reset writeSync. sarebbe tutto piu facile se usassimo un exec sincrona !!!
      //function AnticipatedSyncFunction(){
        var ret,answ;
       
       
        setTimeout(function(){// unresponsive shell cmd , anyway return true
            ret = true; },1500);

            custF(val,rs485,addparm,exec,relais).then(()=>ret=true).catch(()=>ret=false);// 
          // moved after .  answ=ws(val);// waiting for timeout or promise custF run std writeSync . ws(val)=ctl.ws(val) ?, so why bind ?
        while(ret === undefined) {// wait anyway for custDev[num]
          deasync.runLoopOnce();
        }
        answ=ws(val);// waiting for timeout or promise custF run std writeSync . ws(val)=ctl.ws(val) ?, so why bind ?
                    // in custom probes val object can be modified by custF !

        return answ;// test ret ?    
      //}
      //return AnticipatedSyncFunction;

    }
  }
  
  }

  // usual module script cant have top lever await :item=await getio(12, 'out');relais_.push(item);// gpio phisical relays, see :YUIO

// so :mhttps://stackoverflow.com/questions/31426740/how-to-return-many-promises-and-wait-for-them-all-before-doing-other-stuff


/* 
// old :
 getio(12, 'out').then ;relais_.push(item);// gpio phisical relays, see :YUIO
                                // from pump name the gpio is relais_[relaisEv.lastIndexOf(pump)];
item=await getio(16, 'out');relais_.push(item);
item=await getio(20, 'out');relais_.push(item);
item=await getio(21, 'out');relais_.push(item);
// b relays group:
item=await getio(26, 'out');relais_.push(item);
item=await getio(19, 'out');relais_.push(item);
item=await getio(13, 'out');relais_.push(item);
item=await getio(6, 'out');relais_.push(item);
*/


  module.exports =  {init:// no|, arrow function take this from outer object , the obj n which you call the function !!
                          // (gp)=>{
                            function (gp,rs485_,pdate_){
                              rs485=rs485_;
                              Gpio=gp;
                              pdate=pdate_;
                              if(Gpio)relais= //  reserved input to check the ok . todo arrays of io ctl button x input : add to prob cfg in models.js !!
                                // can add in getio the following ctl as probes for specific plant , use a specific property in models.js , we add a handler to feed the input and extend the possibility to have gpio probes in :
                                //       myprobs_= getio.getctls(mqttInst,null,mqttprob,true,null);//      set null pointing to gpio probes !!!
                                // otherwise use the input to check other staff x specific plant or not using appropiate handler !!!
                                [
                                new Gpio(4, 'in', 'both'),// used in custdev 10001
                                new Gpio(17, 'in', 'both')
                                ];

                              return this;},
                  getctls:function(mqttInst,gpionumb,mqttnumb,isProbe=false,mqttWebSock){// isProb : look cfg in mqttprob , not in mqttnumb ! so in this case mqttnumb=cfg.mqttprob not mqttnumb=cfg.mqttnumb
                                                                    // mqttnumb=mqttnumb/mqppprob   the dev ids descriptions x the 2 type of device
                                                                    // gpionumb  is the raspberry alternative in case of mqttnumb                                                


                                                                    // old :
                                                                    // gpionumb,= [number,,,null,,,]  number is the raspberry gpio , null means no connection to dev available
                                                                    // // mqttnumb = [number,,,null,,,]  number is the mqtt device id to subscribe, see model.js
                                                                    //  >>>>> number not 0 !
                                                                    // resolves in BGT
    /* logic:
     return a promise 
     - fillctls is runned
        - resu,  the returning dev ctl array,  is built
          - for each gpionumb[i] :
              -  try first to get the mqtt device  mqttnumb[i] then gpionumb[i]
                        doSomethingAsync(gpio=mqttnumb[i]/gpionumb[i],i,true);
                           essa calcola nuovi parametri per lanciare  getio(gpio, 'out',ind,ismqtt) che ritorna un promise  in promises[]

                             getio(gpio, type='out'/'in-var',ind=i,ismqtt):
                             
                                ritorna, nel caso mqttnumb, : mqtt.fact(num,ind,iotype)
                                o, nel caso gpionumb,  : a promise resolving in: it={ctl:new Gpio(num, iotype),devNumb:ind,type:'gpio'}
                              > promises[] viene risolto in it con cui si riempie resu[it.devNumb]=it.ctl={readSync,writeSync}
                                                                            e resolved[it.devNumb]={devNumb:it.devNumb,devType:it.type,portnumb=gpionumb[it.devNumb]}
        - fillctls risolve finalmente tutti i  promises[] risolvendo anche il returned promise  in : {ctls:resu,devmap:resolved}
    */
   let numOfDev;// number of dev excluding portid=0
        if(gpionumb)numOfDev=gpionumb.length;else if(mqttnumb) numOfDev=mqttnumb.length; else numOfDev=0;
        //if(numOfDev>0&&mqttWebSock)numOfDev++;
return new Promise((resolve) => {// the getctls() returning promise, SSSDD==(GGDDSS)

  const promises = [];
let resu=Array(numOfDev).fill(null);// the returning dev ctl array, null means there is no dev , the sw will not do any write and anyway read a 0 state 
                                    // todo : better manage dimension like resolved

let pr,resolved= [],probj;//Array(8).fill(false);


function doSomethingAsync(gpio,ind,ismqtt=false) {// a wrapper to getio()
  let clas;
  if(isProbe){clas='in-var';// temp use std shelly ht mqtt protocol  in-var:probe or var device (look cfg in mqttprob!)
}else {clas='out';// relay device or var dev (without update in browser) (look cfg in mqttnumb!), temp use shelly 1 protocol .
                  // can be a mqttWebsock ctl 
}
if(gpio==0)clas='int';// user interface mqtt to websocket
if(gpio==66)
          console.log('lopo');
          console.log('lopo is ',gpio,' ',ind);
return getio(gpio,clas,ind,ismqtt,mqttInst);// return a promise pr
}




function setMqttXWebsock(){

  //let pr;

  if(mqttInst&&mqttInst.avail&&mqttWebSock){// 
    if(mqttWebSock.portid!=0)console.error(' setMqttXWebsock(): portid must be 0 ');
    else {
      resu.push(null);// increment for the portid=0 dummy dev
      pr=doSomethingAsync(0,numOfDev,true);//probj={ind:i,prom:pr};//mqttWebSock is     {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'},// a dummy var that creates ctl websocket topic
    fillProm(pr);  
  }}
}


function fillctls() {// main run 

for(i=0;i<numOfDev;i++){
// first ctl :
if(mqttInst&&mqttInst.avail&&mqttnumb[i]){// try first to get the mqtt device if mqttnumb[i]!=null
// use a mqtt device topic as gpio as registered in BBVV
// attach the mqtt io ctl in some relais index, here 0

if(mqttnumb[i].portid==66)
          console.log('lopo');
          console.log('lopo is ',mqttnumb[i].portid,' ',i);
// mqtt ctl registered at key/index 11 in AAFF
pr=doSomethingAsync(mqttnumb[i].portid,i,true);//probj={ind:i,prom:pr};// mqttnumb[i] is {portid:110,topic:'gas-pdc',varx:3,isprobe:false,clas:'var'/'out'}
}else{// if there is a spare in local gpio 12
pr=doSomethingAsync(gpionumb[i],i);// gpionumb[i] is an integer: the raspberry device port/id 
}

fillProm(pr);




}




};




// start here : 

fillctls();// fill array of resolving device (portid!=0) that when resolved ( all or after a max time) resolve the  SSSDD promise with the array of available devices ctl: resu[dev1ctl,,,]

if(mqttWebSock&&isProbe==false)setMqttXWebsock(); // set mqtt relay to websocket interface  (dev with portid=0)


// FINALLY RESOLVE (GGDDSS)
const to=1500, myto=setTimeout(() => {
//resolved.forEach((val)=>{if(val)push(resu)})

console.log("Resolving max time , the active ctl are: ",resolved,',in ',to,'ms,  nb false position  cant be operated !');
console.timeEnd('mqtt connection');

resolve(//(GGDDSS)  BGT returns the devices subscribed in untill to. some dev can still subscribing later ?or we have to stop subscription waiting
  {ctls:resu,// ctls=[ctl1,,,,,] ctlx: see PIRLA in mqtt
  devmap:resolved});// devmap=[{devNumb,devType,portnumb},,,,],release the ctl array , max time to resolve the ctl has got, some item can be null
}, to);
// >>>  or wait x all before max time to resolve the SSSDD promise 
Promise.all(promises)// send all resolved promise resu and its descriptors resolved
.then((results) => {
clearTimeout(myto);
console.timeEnd('mqtt connection');
if(PRTLEV>5) console.log("All ctls done, the array of resolved ctl is", JSON.stringify(results,null,2));

// resolve(resultsCtl);only the results[i].ctl
// or , hopily all it has called :
resolve({ctls:resu,devmap:resolved}); // (GGDDSS) WARNING :  hopily all it has called :
})
.catch((e) => {
// Handle errors here
console.error("All ctls done error: ",e);
});

function fillProm(pr){// called for increasing index 0,1,2,,,,numOfDev by fillctls() and if(mqttWebSock&&isProbe==false) by setMqttXWebsock() .       . nb index=it.devNumb

                      //    add pr to promises[pr] that resolved in it={} will fills:
                      //    - resu[it.devNumb]=it.ctl;// the available ctl array, 
                      //    - resolved[resu[it.devNumb]=
                      //           >>>  at the end return/resolve (GGDDSS) in  {ctls:resu,devmap:resolved}  
///
resolved.push(null); // create the item for index =it.devNumb that must be the munber on which thr pr works !
pr.then((it)=>{// when resolved fill items of resolved[devNumb]={devNumb,devtype,portnumber},resu[devNumb]=ctl
  // it={ctl:new fc(gp,ind)/null,devNumb:index,type:'mqtt'};
  // it={ctl:new Gpio(num, iotype)/null,devNumb:ind,type:'gpio'}
  
  /* 05052023 got in mqtt case
                : it={ctl:{cfg:mqttnumb/mqttprob[dev],       PRX
                             cl:1,
                              devnumb:0,
                              gpio:11,
                              isOn:false,
                              mqttInst,
                              //  +  ctl proto func readsync and writesync should be present ! :
                              readsync(),
                              writesync()
  
                              // + from  from :  subscred(resu) after subscribe cb in probSubscr/numbSubscr
                              topic,
                              cl_class
                              },
                        devNumb:0,
                        type:'out'
                      }
                      
   14102023 mqtt case :
   {
  ctl: {
    gpio: 54,
    devNumb: 2,
    type: "in-var",
    cfg: {
      portid: 54,
      subtopic: "var_gas-pdc_",
      varx: 3,
      isprobe: false,
      clas: "var",
      protocol: "mqttstate",
    },
    mqttInst: {},
    int: null,
    cl: 4,
    isOn: false,
  },
  devNumb: 2,
  type: "mqtt",
  topic: "@Casina_API@ctl_var_gas-pdc_3",
  cl_class: "var",
  protocol: "mqttstate",
}
  */
  //if(DEBUG)
  if(it.ctl){it.ctl.writeSync_=function(val){
    console.log(' writeSync , at ' ,pdate().toLocaleString(),', called for plant:  on plant ',mqttInst.plantName,' , dev number/index : ',it.devNumb,' value: ',val);  
    return it.ctl.writeSync(val);
  }

  }


  console.log(' getio.js, fillctls() , got it a new  ctl dev resolved.  devInfo Origin (mqttnumb/mqttprob): ',it.type,' , dev number/index : ',it.devNumb,' is ctl null? : ',it.ctl==null);//,' promise resolved in def time in :',JSON.stringify(it.ctl,null,2));
  if(it.ctl)console.log(' ..... , not null ctl : portio/devid/portid/gpio ',it.ctl.gpio,', on plant ',mqttInst.plantName,' , FEATURES : dev type= ctl.cl (rele var/probe var used in readsync ) ',it.ctl.cl,',  class ',it.cl_class,', protocol ',it.protocol,' ,mqtt registered topic ',it.topic);//,' promise resolved in def time in :',JSON.stringify(it.ctl,null,2));
  
  if(it.ctl)console.log(' ..... it has .readSync: ',!!it.ctl.readSync,' and writeSync(): ',!!it.ctl.writeSync);
  
  resu[it.devNumb]=it.ctl;// the available ctl array, 

/* ex of resolved array  items :
                                        { devNumb: 4, devType: 'gpio', portnumb: 26 },
																			  {
																			    devNumb: 5,
																			    devType: 'mqtt',
																			    portnumb: {
																			      portid: 66,
																			      clas: 'var',
																			      varx: 4,
																			      isprobe: false,
																			      protocol: 'mqttstate',
																			      subtopic: 'var_split_'
																			    }
																			  },
                        nb portnumb can be null if ctl is null  / number / descr obj in models.js
*/
  resolved[it.devNumb]={devNumb:it.devNumb,devType:it.type};
  if(it.ctl==null){console.log(' nb ( used in debug) ctl of type gpio are null if this server is not raspberry: ' );
  // portnumb property:  can be null if ctl is null  / number / descr obj in models.js
  resolved[it.devNumb].portnumb=null;// no hw device found, use a dummy device reading always 0
  }else if(it.type=='mqtt')
    if(it.devNumb<mqttnumb.length)
    resolved[it.devNumb].portnumb=mqttnumb[it.devNumb];// must be on mqttnumb
    else{
      if(it.ctl.gpio==0)// is a dummy portid=0  see models.js > mqttWebSock:        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'}, 
      resolved[it.devNumb].portnumb=mqttWebSock;
    }

  else resolved[it.devNumb].portnumb=gpionumb[it.devNumb];
  });// the available ctl status . mapping relaisEv to some dev
  
  promises.push(pr);

}

})// ends promise
}
  }
