let mqtt=require('../mqtt');// nb this module should be init by fv3 itself !!!  ceck it !
let Gpio=false;

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

async function getio(num, iotype, ind, ismqtt = false,mqttInst) {// returns promise , resolved,  .ctl=, gives:{readSync,writeSync} working on io in  closure clos 
                                                        // iotype = 'out'   'in-var' dice dove trovare la cfg di model (mqttnumb o mqttprob)e come costruire il ctl 
    let myio;
    if (ismqtt) {
  
      let retu;
        if(mqttInst.avail) 
        // antipattern: retu=await mqtt.fact(num);//
        retu=mqttInst.fact(num,ind,iotype);//a promise resolving to :
                                        //  a relais if iotype='out' a pump or var
                                        //    or if (iotype='in-var', a probe or var
                                        //  mqtt dev 
                                        // iotype: is the capability requested and must match the dev registration data done in init()
        else retu= null;
      return retu;//
  
  
    } else {// embed gpio, presently only 'out' iotype
  
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
        console.log(' creating gpio parm: ',num,iotype);
        if(Gpio)return {ctl:new Gpio(num, iotype),devNumb:ind,type:'gpio'}; // as Promise.resolve
        else return {ctl:null,devNumb:ind,type:'gpio'};// in no raspberry return a dummy obj 
  
  
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
                            function (gp){
                              Gpio=gp;return this;},
                  getctls:function(mqttInst,gpionumb,mqttnumb,isProbe=false){// isProb : look cfg in mqttprob , not in mqttnumb ! so in this case mqttnumb=cfg.mqttprob not mqttnumb=cfg.mqttnumb
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
   let numOfDev;
        if(gpionumb)numOfDev=gpionumb.length;else if(mqttnumb) numOfDev=mqttnumb.length; else numOfDev=0;
return new Promise((resolve) => {// the returning SSSDD promise


function doSomethingAsync(gpio,ind,ismqtt=false) {// a wrapper to getio()
  let clas;
  if(isProbe){clas='in-var';// temp use std shelly ht mqtt protocol  in-var:probe or var device (look cfg in mqttprob!)
}else {clas='out';// relay device or var dev (without update in browser) (look cfg in mqttnumb!), temp use shelly 1 protocol 

}
return getio(gpio,clas,ind,ismqtt,mqttInst);// return a promise
}

function fillctls() {
const promises = [];
let resu=Array(numOfDev).fill(null);// the returning dev ctl array, null means there is no dev , the sw will not do any write and anyway read a 0 state 
let pr,resolved= [],probj;//Array(8).fill(false);

for(i=0;i<numOfDev;i++){
// first ctl :
if(mqttInst&&mqttInst.avail&&mqttnumb[i]){// try first to get the mqtt device 
// use a mqtt device topic as gpio as registered in BBVV
// attach the mqtt io ctl in some relais index, here 0

// mqtt ctl registered at key/index 11 in AAFF
pr=doSomethingAsync(mqttnumb[i].portid,i,true);//probj={ind:i,prom:pr};// mqttnumb[i] is {portid:110,topic:'gas-pdc',varx:3,isprobe:false,clas:'var'/'out'}
}else{// if there is a spare in local gpio 12
pr=doSomethingAsync(gpionumb[i],i);// gpionumb[i] is an integer the device port/id 
}


promises.push(pr);resolved.push(null); 

pr.then((it)=>{// when resolved fill items of resolved[devNumb]={devNumb,devtype,portnumber},resu[devNumb]=ctl
// it={ctl:new fc(gp,ind)/null,devNumb:ind,type:'mqtt'};
// it={ctl:new Gpio(num, iotype)/null,devNumb:ind,type:'gpio'}

/* 05052023 got  : it={ctl:{cfg:mqttnumb/mqttprob[dev],
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
    
*/

console.log(' getio.js, fillctls() , got it a new  ctl dev resolved.  devInfo Origin (mqttnumb/mqttprob): ',it.type,' , dev number/index : ',it.devNumb,' is ctl null? : ',it.ctl==null);//,' promise resolved in def time in :',JSON.stringify(it.ctl,null,2));
if(it.ctl)console.log(' ..... , not null ctl : devid/portid/gpio ',it.ctl.gpio,', on plant ',mqttInst.plantName,' , FEATURES : ctl.cl (rele var/probe var used in readsync ) ',it.ctl.cl,',  class ',it.cl_class,', protocol ',it.protocol,' ,mqtt egistered topic ',it.topic);//,' promise resolved in def time in :',JSON.stringify(it.ctl,null,2));

if(it.ctl)console.log(' ..... it has .readSync: ',!!it.ctl.readSync);

resu[it.devNumb]=it.ctl;// the available ctl array, usefull?
resolved[it.devNumb]={devNumb:it.devNumb,devType:it.type};
if(it.ctl==null){console.log(' nb ( used in debug) ctl of type gpio are null if this server is not raspberry: ' );
resolved[it.devNumb].portnumb=null;// no hw device found, use a dummy device reading always 0
}else if(it.type=='mqtt')resolved[it.devNumb].portnumb=mqttnumb[it.devNumb];else resolved[it.devNumb].portnumb=gpionumb[it.devNumb];
});// the available ctl status . mapping relaisEv to some dev

}


// >>> wait a max time before resolve the SSSDD promise :
const to=7000;//7s
console.time('mqtt connection');

const myto=setTimeout(() => {
//resolved.forEach((val)=>{if(val)push(resu)})

console.log("Resolving max time , the active ctl are: ",resolved,',in ',to,'ms,  nb false position  cant be operated !');
console.timeEnd('mqtt connection');

resolve(// BGT returns the devices subscribed in untill to. some dev can still subscribing later ?or we have to stop subscription waiting
  {ctls:resu,// ctls=[ctl1,,,,,] ctlx: see PIRLA in mqtt
  devmap:resolved});// devmap=[{devNumb,devType,portnumb},,,,],release the ctl array , max time to resolve the ctl has got, some item can be null
}, to);
// >>>  or wait x all before max time to resolve the SSSDD promise 
Promise.all(promises)
.then((results) => {
clearTimeout(myto);
console.timeEnd('mqtt connection');
console.log("All ctls done, the array of resolved ctl is", JSON.stringify(results,null,2));

// resolve(resultsCtl);only the results[i].ctl
// or , hopily all it has called :
resolve({ctls:resu,devmap:resolved}); // WARNING :  hopily all it has called :
})
.catch((e) => {
// Handle errors here
console.error("All ctls done error: ",e);
});

};




fillctls();// fill array of resolving device that when resolved ( all or after a max time) resolve the  SSSDD promise with the array of available devices ctl: resu[dev1ctl,,,]


})
}
  }
