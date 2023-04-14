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

async function getio(num, iotype, ind, ismqtt = false) {// returns promise , resolved,  .ctl=, gives:{readSync,writeSync} working on io in  closure clos 
    let myio;
    if (ismqtt) {
  
      let retu;
        if(mqtt.avail) 
        // antipattern: retu=await mqtt.fact(num);//
        retu=mqtt.fact(num,ind),iotype;//a promise resolving to :
                                        //  a relais or 
                                        // if (iotype='in', a probes 
                                        // mqtt dev 
                                        // iotype is the capability requested and must match the dev registration data done in init()
        else retu= null;
      return retu;//
  
  
    } else {// embed gpio
  
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
        console.log(' reating gpio parm: ',num,iotype);
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
                  getctls:function(gpionumb,mqttnumb,isProbe=false){// gpionumb,= [number,,,null,,,]  number is the raspberry gpio , null means no connection to dev available
    // // mqttnumb = [number,,,null,,,]  number is the mqtt device id to subscribe
    //  >>>>> number not 0 !
    /* logic:
     return a promise 
     - fillctls is runned
        - resu,  the returning dev ctl array,  is built
          - for each gpionumb :
              -  try first to get the mqtt device  mqttnumb[i]
                        doSomethingAsync(mqttnumb[i]/gpionumb[i],i,true);
                        che calcola nuovi parametri per lanciare  getio(gpio, 'out',ind,ismqtt) che ritorna un promise in promises[]

                            getio(gpio, 'out',ind,ismqtt):
                             
                                usa per mqtt : mqtt.fact(num,ind)
                                o per gpio : new Gpio(num, iotype),devNumb:ind,type:'gpio'}
                              - e promise che risolta da it , it.ctl riempita resu[i]={readSync,writeSync}
                        quando promises[x] e risolto (in it) (entro un tempo max ) fatti i controlli su it si filla resu[it.devNumb]=it.ctl
        - fillctls risolve finalmente il promise con resu
    */
   let numOfDev;
        if(gpionumb)numOfDev=gpionumb.length;else if(mqttnumb) numOfDev=mqttnumb.length; else numOfDev=0;
return new Promise((resolve) => {// the returning SSSDD promise


function doSomethingAsync(gpio,ind,ismqtt=false) {// a wrapper to getio()
  let type;
  if(isProbe)type='in';// temp use std shelly ht mqtt protocol
  else type='out';// temp use shelly 1 protocol 
return getio(gpio,type,ind,ismqtt);// return a promise
}

function fillctls() {
const promises = [];
let resu=Array(numOfDev).fill(null);// the returning dev ctl array, null means there is no dev , the sw will not do any write and anyway read a 0 state 
let pr,resolved= [],probj;//Array(8).fill(false);

for(i=0;i<numOfDev;i++){
// first ctl :
if(mqtt&&mqtt.avail&&mqttnumb[i]){// try first to get the mqtt device 
// use a mqtt device topic as gpio as registered in BBVV
// attach the mqtt io ctl in some relais index, here 0

// mqtt ctl registered at key/index 11 in AAFF
pr=doSomethingAsync(mqttnumb[i],i,true);//probj={ind:i,prom:pr};
}else{// if there is a spare in local gpio 12
pr=doSomethingAsync(gpionumb[i],i);
}


promises.push(pr);resolved.push(null); 

pr.then((it)=>{// when resolved fill items of resolved[devNumb]={devNumb,devtype,portnumber},resu[devNumb]=ctl
// it={ctl:new fc(gp,ind)/null,devNumb:ind,type:'mqtt'};
// it={ctl:new Gpio(num, iotype)/null,devNumb:ind,type:'gpio'}

console.log(' fillctls() , now available dev ctl (devtype: ',it.type,')  dev number : ',it.devNumb);//,' promise resolved in def time in :',JSON.stringify(it.ctl,null,2));
if(it.ctl)console.log(' it has .readSync: ',it.ctl.readSync);

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
resolve({ctls:resu,// ctls=[ctl1,,,,,]
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
