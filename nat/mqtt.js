var mqtt = require('mqtt');// http://www.steves-internet-guide.com/using-node-mqtt-client/
                            // https://www.macrometa.com/iot-infrastructure/node-js-mqtt
//const caFile = fs.readFileSync("ca.crt");
var fs = require('fs'); //require filesystem module

const SubAfterPlantReq=true;// code implem alternative
const defVar='off';// or -7777  default first write value for var device

const { emit } = require('process');
const caFile = fs.readFileSync("chain.pem");// ./chain.pem
const options = {// conn opn
    port: 1883,
    host: 'bot.sermovox.com',
    clientId: "sermovox-01",
    username: "sermovox",
    password: "sime01",
    clean: true,
    reconnectPeriod: 5000 // Try reconnecting in 5 seconds if connection is lost
    // credential ca ??
},tlsoptions = {// conn opn
    // if not in url add here :
    port: 8883,
    host: 'bot.sermovox.com',
    protocol:"mqtts",


    clientId: "sermovox-01_persistence",//clientId: 'mqttjs_' + 'persistence'
    username: "sermovox",
    password: "sime01",
    clean: true,
    reconnectPeriod: 5000 // Try reconnecting in 5 seconds if connection is lost
    ,ca:caFile // see http://www.steves-internet-guide.com/using-node-mqtt-client/ and mosquitto.conf
    // credential ca ??
},
    opt = {
        retain: true
        //,qos: 1
    };

let client;
// subscription and publishing topic x rele dev , shelly protocol :
// std Subscribe variables, in future will be customized using gpio set from device model config data in init() according with the type requested 
let shelly_stopic = 'shellies/',shelly_topicp = '/relay/0';
let shelly_options = {qos: 0};// needed really ?

// Publish variables
let shelly_topicpp = '/relay/0/command';
let messageOn = 'on', messageOff = 'off';
let pub_options = {qos: 0, retain: false};// in http://www.steves-internet-guide.com/using-node-mqtt-client/ use    ={retain:true,qos:1}




// HELP  func , now use  regTopic(topic) only
function isShelly(text){// old. text=topic, returning devid, the key in  gpio
    //= "shellies/shelly1-98F4ABF298AD/relay";

    if(!invTopic[text])return null;

    let devid=invTopic[text].portid,mqttInst=invTopic[text].mqttInst//portid,cant be 0 ! . no it must be  foreseen the plant the invTopic can be applied
  
    // find mqttInst per :
    //  - conoscere i device description from mqttInst.mqttnumb[index] e mqttprob 
    //  - e per fillare la coda .status[dev] da cui peschera il ctl con .readsync 

    

    console.log("Received message  from plant: ",mqttInst.plantName);

let ok=35<=text.length;
if(text.slice(0,8)=='shellies'&&text.slice(-8)==shelly_topicp&&ok){// ok also ?
   console.log("Received message  on  shelly topic: " + text,', now see if is a registerd portid');
   /* old :
   let devName=text.slice(9,-8),devid;// devName=shelly1-98F4ABF298AD; devid=11 the keys in gp
   for(mel in gpio){if (gpio[mel]==devName){devid=mel;break;}}*/





    
 
     
}else  console.log("mqtt Received message on  non shelly topic: " + text);
return null;
}



function isProbe(text){// old . text=topic, returning devid that has that template(topic=text), , was the key in  gpio
    //= "shellies/shelly1-98F4ABF298AD/relay";
let ok=35<=text.length;

   console.log("isProbe(): Received message  on  topic: " + text);
    let devid=null;// devName=shelly1-98F4ABF298AD; devid=11 the keys in gp
   /* old : 
   for(mel in mqttprob){
    if (mqttprob[mel].topic==text){devid=mel;break;}
    else if('ctl_'+mqttprob[mel].subtopic+mqttprob[mel].varx==text){devid=mel;break;}}*/

    devid=invTopic[text];//portid,cant be 0 !
   //  if(!devid)devid=null;


   if(devid==null) {console.log("isProbe(): mqtt Received message on  non probe topic: " + text);return null;}
   else return devid;
  
   }

function regTopic(topic){// just returns invTopic[topic], useless !
    // console.log("regTopic(): Received message  with  topic: " + topic);

    if(!invTopic[topic])return null;
    else return invTopic[topic];
   //  let devid=invTopic[text].portid,mqttInst=invTopic[text].mqttInst//portid,cant be 0 ! . no it must be  foreseen the plant the invTopic can be applied
  
}
// END HELP  func 



    //client = mqtt.connect("mqtt://192.168.1.157", options);
    // or x tsl :
    // var client  = mqtt.connect("mqtts://192.168.1.71:8883",tlsoptions);
    console.log("mqtt starting :  asking connection to broker with ops: " + JSON.stringify(options,null,2));
client = mqtt.connect(options);


if (client) {
    console.log("mqtt client connecting .... , so registering message listener ...");
    client.on('message', function (topic, message) {// message=obj=buffer
        let msg = message.toString();
        console.log("mqtt Received message: " + msg + ", on topic: " + topic.toString());
        let adev;
      
     //   if ((dev = isShelly(topic))!=null || (dev = isProbe(topic))!=null  ) {// use statusList and queue status[dev] built for dev whose config is described in  gpio and  mqttprob
                                    // >>> satisfy all listener waiting for a msg , fill queue status[dev] to satisfy future coming read for msg request
            // device  id ex: 11 , not : shelly1-34945475FE06
            // status[dev]=status[dev]||{};

            if (adev=regTopic(topic) ) {//just returns invTopic[topic], useless !

            let dev=adev.portid,mqttInst=adev.mqttInst;

            // satisfy all pending listeners : (nb []  added  in init func , that can be still to call)
            if (mqttInst.statusList[dev]) {// pending listener for device number id=portid=11
                if (mqttInst.statusList[dev].length > 0) {
                    console.log("Received message , we found : ", mqttInst.statusList[dev].length, "listener to call , so scanit to cb=resolve them");
                    console.log("... probably listeners was added as msg queue is (0 expected ) Received message , we found : ", mqttInst.status[dev]);
                   // let count = 0;
                   // mqttInst.statusList[dev].forEach((el) => { count++; el(msg) });// el is the resolving func resolve !
                   // console.log("Received message , we called: ", count, " msg listener ");
                }
                mqttInst.statusList[dev].length = 0;// reset anyway
            }
            if(mqttInst.status[dev])// // subscribed !
                            console.log(" Received message (",message,") , current msg queue for device:",dev," had: ", mqttInst.status[dev].length, ' elements');
            else console.error(" Received message , current msg queue for device:",dev," had not been subscribed ");// never happen

            if (mqttInst.status[dev] && mqttInst.status[dev].push(msg) > 10) mqttInst.status[dev] = mqttInst.status[dev].slice(-2);// add queue
        }else{

           //  ...write here code  for topic different from gpio (cfg in gpio) and probe-var (cfg in mqttprob) devices
           console.log(" Received message , no dev was registered with current msg  topic: " + topic.toString());
        }









    });
}
let gpio=null,// now substituted by mqttnumb .    gpio,//={"11":'shelly1-34945475FE06'};// todo : fill with init !   nb dev=11  devname=shelly1-34945475FE06. cfg of gpio like dev (relay)
mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } .
        // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
        //    // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
mqttnumbTop={},//  calculated topic 
mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (class=probe/var + isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
        // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
mqttprobTop={},// //  calculated topic
invTopic={};// topic > dev portid  inv map x both mqttnumb and mqttprob
let status={},// plant devid/portid dev queues ** su topic shellies/<model>-<deviceid>/relay if dev array is null (status[dev]=null) means no connected .
                //  both for gpio and probe/var topic/dev
    statusList={};// array od listeners: the listener list  x last status {dev:[],dev2:[]}
                //  both for gpio and probe/var topic/dev

/*let stList=function (dev,token,cb){// cb is the promise resolve, this is the closure with private properties to reference the listener env (cb will operate on listener context)
    statusList[dev].push(function(lastmsg){
        console.log(' stlist() listener cb with lastmsg: ',lastmsg);
        cb(lastmsg);
    });
}*/
// easier :
// moved : function stList(dev,token){



// lare in init : Object.keys(gpio).forEach((el)=>{status[el]=null});

let futurecb={};// cb of subcribe can resolve a request to get a new fc dev ctl . both for gpio and probe/var topic
                // but if the cb comes before someone request a new dev ctl , when the request is done will find the cb has called as 

// moved inside mqttInst :              async function getgpio(gp,clas){/






client.on("error", function (error) {
    console.log("Can't connect" + error);
    process.exit(1);// cant retry
});

// Notify reconnection
client.on("reconnect", function () {
    console.log("Reconnection starting");
});

// Notify offline status
client.on("offline", function () {
    console.log("Currently offline. Please check internet!");
});

/*
https://indomus.it/formazione/shelly-mqtt-e-http-comandi-utili/
https://shelly-api-docs.shelly.cloud/gen1/#availability-and-announces
https://www.giorgioravera.it/mqtt-e-shelly/


shellies/<shellymodel>-<deviceid>/announce

su un shelly  “shelly1-98F4ABF298AD” 
pubblico un topic comando + payload :
 “shellies/command announce” o shellies/shelly1-98F4ABF298AD/command + announce

 risponde su topic payload :
 shellies/shelly1-98F4ABF298AD/online true

shellies/announce {“id”:”shelly1-98F4ABF298AD”,”mac”:”98F4ABF298AD”,”ip”:”192.168.1.81″,”new_fw”:false, “fw_ver”:”20200206-083100/v1.5.10@e6a4205e”}


pubblicando :
shellies/<model>-<deviceid>/relay/0 + ??

risponde lo stato su topic  : shellies/<model>-<deviceid>/relay **
.............


pubblicando :

shellies/<model>-<deviceid>/relay/0/command  + on/off
risponde : su topic shellies/<model>-<deviceid>/relay  **


*/

let fc= function (gp,ind,inorout,cfg,mqttInst){// mqtt gpio constructor new fc will return the io ctl
                                        // inorout=iotype=clas='out'/'in-var' , nb  clas in doSomethingAsync is not this.clas
                                        // PIRLA   returns {gpio=portid/devid=gp,devNumb=index=ind,type=inout,cfg,cl=1(clas='out')/2(a var)/3(clas='in'OR'prob'),ison,readsync,writesync},
                                        //                                               ex: ctl={cfg:{portid,clas protocol,subtopic},cl:1,devNumb:0,gpio:11,isOn:true,readsync,writesync}
                                // type = old :  inorout is the dev type or capability requested ,must match the config data got in init()
                                //        new :  can be 'out' for gpio like relais (cfg in mqttnumb) or 'in-var' for mqtt probes/var (cfg in mqttprob)
                                //  update : if clas/inorout='out', now we can also  have rele/pump dev ,and also var device with similar  config data  as mqttprob[i]
    this.gpio=gp;// gp: wh gpio or in case of mqtt dev the mqttnumb/mqttprob.portid 
                // // portid , ex 11, warning il portid è unico a livello di plant !!!!!!!!!!!!!!!!!!! infatti la sua queue e'  nella mqttinstance
    this.devNumb=ind; // the associated array  item index  as displayed in browser  and for mqttnumb case the index  in relaisEv/relais_ 
    this.type=inorout;// >>> 'out' for rele configured in mqttnumb, or in-var for probes/vars configured in mqttprob. tells where is the cfg and if is relais or probs/vars
    this.cfg=cfg;//  >>>> mqttnumb/mqttprob item  depending on inorout
    this.mqttInst=mqttInst;

    // this time clas is integer , bad name !, confusing , , nb  clas in doSomethingAsync is not this.clas, is not mqttprob.clas !!!!!!!!!!!!!!!!!!!!
    if(this.type=='out'){
        if(cfg.clas=='out')this.cl=1;// rele in mqttnumb (valued updatable in browser !)
        else this.cl=2;// a var in mqttnumb[i] of name relaisEv[i]
    }else if(cfg.clas=='in'||cfg.clas=='probe')this.cl=3;// probe
    else this.cl=4;// var in mqttprob (no visibility in browser)



  //   if(SubAfterPlantReq){}// subscribe during ctl instantiation
   
   //
    if(mqttInst.status[gp]
        // todo && devtype[gp].contains(type)
        ) this.isOn=true;// is subscribed ! (at least status[gp] =[], see LLPP)  . so can readSync coming values !!
   //
     else this.isOn=false;

    // return this ! if .isOn the ctl is active

}

    fc.prototype.readSync  =// dont need  async 
                        function (){
    // in case of a previous write the msg queue is cleared so the effect of a write can be read also waiting some time !
    let mqttInst=this.mqttInst,// the plant mqtt inst
    that=this,
    gp=this.gpio;// portid , ex 11, warning il portid è unico a livello di plant !!!!!!!!!!!!!!!!!!! infatti la sua queue e'  nella mqttinstance
    if(mqttInst.status[gp]&&client.connected//if(gpio[gp]&&client.connected
        // &&status[gp]
        ){// still registered, subscribed, connected 
    let resolRead;
    //mqttInst=this.mqttInst;// the plant mqtt inst

    resolRead=getgpio(this.cl);// get last queue entry when available in a short time (< maxtime), according with  dev type cl

    console.log('mqtt readsync read value from queue or listener, using getgpio(cl=',this.cl,')');// promise : ',resolRead);
            return resolRead;// nb resolve value must be 0 or 1 !!!
    }else return Promise.resolve(null);// data not available





    async function getgpio(clas){// get last entry in that.status[gpio] queue array, leave in array only last msg OR fill a listener for coming msg
        // nb first time we receive a  msg queue is filled and we  wont  use listener if future
        //   nb msg in queue can be very old !!! 
        // , returns 0 or 1 !
let ret=0;// def return

async function rread(checkQueueFirst=true){// the returned value depends from the dev type ( rele,var,probs) and from device protocol extraction from state[dev] queue  
let re;                                 // checkQueueFirst if false dont look at a current queue , just wait for next val
// const defVar=0;// or -7777
if(mqttInst.status[gp]){// the device filled alredy its msg queue , so get the last msg !
   let curlength=mqttInst.status[gp].length;
console.log('  readsync() : getgpio wants read buffer for dev: ',gp,', , its  dim is: ',curlength);// todo 05052023  called 2 times ???
console.log(' readsync() :  read buffer/queue for dev: ',gp,', queue : ',mqttInst.status[gp]);// todo 05052023  called 2 times ???
if(checkQueueFirst&&curlength>0){re= mqttInst.status[gp][curlength-1];//  WARNING ::

                                                //  last message in queue , <<<<  hope a message caused after a write operation, eventually rewrite the same value
                                                // till get a read = the last  write
if (clas == 1||clas== 3){// rele or  probe after read last val dont change  the queue , next read will will find any way the last message on top of the queue
  // no :   mqttInst.status[gp].length=0;
}else if (clas == 2||clas== 4){// a var

   /* mqttInst.status[gp].length--;// delete presence x now, look for previous if any
    rread(true);
    */
    re= mqttInst.status[gp][curlength-1];
    if (re == '>ctlpresent'){
        //re=defVar;mqttInst.status[gp].push(defVar);
        /* now the var subscription is dome sending 2 message :
        1: '>ctlpresent'
        2: the def var , it will be set at first write !
        */
        re= await stList();// the def write that must follow
    }
}


}else {



    if (clas == 2||clas== 4){// a var , dont wait for future val just set a def 
        
             // no var was sent by nore red so take initiative and set the value of default : -7777 or just 0 ??
             // when node red send some msg will be put in top 
             // so will be one var proposed by fv3 and one var suggested by node red  > add different clas !
             // si potrebbe anche cambiare il canale per il presence come x shelly ex    aggiungendo /presence al topic !!! >> add different clas !!!
             // so now class 2 and 4 is var proposed by fv3 , and presence msg here to see the start 
             // so :
        /*
             mqttInst.status[gp].length=0;
             mqttInst.status[gp].push(defVar);
            re=defVar;
            */
            re= await stList();// POLP
     }else{


// wait till get a msg or timeout
// add a promise in dev queue with a token associated to last write (better leave the write to add this listener ,
// then here we can .then the promise with that token 

/* error : no need to return a promise in a async call !!!!!!!!!!!!!!!!
return  new Promise((res,rej)=>{// the listener cb
// register with token
// old : statusList[gp].push(function(){ return function(lastdata) });
stList(gp,123,res); })*/  
// easier: (yu can simplify all promises  returning only one promise here without using an async !)
re= await stList();//(gp,123);// add a listener for device gp. when a msg arrives the listener will be called and resolves, then the current queue (should be void ) will be filled by the last msg

// todo 06052023 what todo with the queue that is filled by 
     }


}

if (clas == 1) {// rele
if(that.cfg.protocol=='shelly') 
{if (re == 'on') return ending( 1); else return ending( 0);}
else return ending( null);// unknown
}// relays value: 0/1
else if (clas == 2||clas == 4) {// a var in mqttnumb
if (re == '>ctlpresent') {// must come after POLP
   // no more wait a next msg :  return rread(false);// discard (coming from this inst. or other)  ctl presence
   if(curlength>0)console.error('error in rread() processin a var ');
 //  mqttInst.status[gp].push(defVar);// anyway add def in top  queue
   return rread(true);// read that value on top queue
}
else {if(that.cfg.protocol=='mqttstate') 
{if (re == 'on') return ending( 1); else return ending( 0);}
else return ending( null);// unknown
}

}else if (clas == 3) {// probe in mqttprob
if (that.cfg.protocol=='shelly')
{return ending( re);}
else return ending( null);// unknown protocol


} 


else return ending( null);// error !

}else return ending( null);


function stList(){//(dev,token){// return a promise that is resolved when a listener , added to a dev listener list, is called with the next  msg
    // todo : add a reject to fire after a max time is reached
    // when a msg arrives the listener will be called and resolves, then the current queue (should be void ) will be filled by the last msg

return  new Promise((res,rej)=>{// the listener cb
    let dev=gp;// old name
    console.error(' stlist() listener now add a listener x dev : ',dev,'in mqttinst.statuslist: ',mqttInst.statusList);// 05052023   dev is the devid x debug only
    mqttInst.statusList[dev].push(function(lastmsg){// 05052023   dev is the devid 
console.log(' stlist() listener now cb with lastmsg: ',lastmsg);
res(lastmsg);
});
})}

function ending (value) {
    
    console.log(' ** readsync for portid ',gp,', is ending reading val: ',value,', now current dev queue is : ',mqttInst.status[gp]);
    return value;
}


}// ends rread()
return rread(true);

}

}

fc.prototype.writeSync = function (val) {// val 0/1, can return false if in error 
    // will send a topic KKUU as registered in init() conf data for the device 
    // todo : in dev config data we can mark a dev if is available for out (a shelly 1 relay) or 'in' a HT device
    let gp = this.gpio,// portid
    queue=this.mqttInst.status[gp];
    if (//gpio[gp]&&
        client && client.connected && this.mqttInst.status[gp]) {// registered, subscribed, connected . in type wont write anything

        let message,topic,dev=this.gpio;// gpio is the devid/portid in case of mqtt

            // no, get topic from devctl :    let pub_topic = shelly_stopic + this.cfg.subtopic+ shelly_topicpp;// KKUU calc the topic to send from config (according to dev type): shellies/ + <model>-<deviceid> + /relay/0/command  
            if(this.mqttInst.mqttTopPub[dev]){
            if(this.mqttInst.mqttTopPub[dev]=='')return ending( true);// dummy write
            else topic=this.mqttInst.mqttTopPub[dev];
            }else  topic=this.mqttInst.mqttTop[dev];// same as write topic (subscription)
           
        if (this.cl == 1) { // a rele/pump inorout='out'   see mqttnumb set

            if(this.cfg.protocol=='shelly')
            if (val == 0) message = messageOff; else message = messageOn;





            // clear msg queue ( and its listener ? must be rejected ????)
            // WARNING hope a message in transit dont get here meanwile !!!!
            this.mqttInst.status[gp].length = 0; // ??????

            client.publish(topic, message, pub_options, function (err) {
                if (err) {
                    console.log("An error occurred during publish on dev: ", gp);
                    return ending( false);
                } else {
                    console.log("Published successfully to " + topic);
                    return ending( true);
                }
            });


        }else if (this.cl == 2||this.cl == 4) {// a var in mqttnumb or mqttprob[i] 



            // let { topic, varx, isprobe, clas ,protocol} = this.cfg;// protocol:'mqttstate'
            //topic_=topic;

            if(this.cfg.protocol=='mqttstate'){// si applica la regola std  per settare il topic x le variabili che metto in mqtt!
           //  let topic_ = 'ctl_' + topic + varx;// warning we add ctl_   !!!!

           if (val == 0) message = messageOff; else message = messageOn;

           // clear msg queue ( and its listener ? must be rejected ????)
           // WARNING hope a message in transit dont get here meanwile !!!!
           this.mqttInst.status[gp].length = 0; // ??????

            client.publish(topic, message, pub_options, function (err) {
                if (err) {
                    console.log("An error occurred during publish on dev: ", gp);
                    return ending( false);
                } else {
                    console.log("Published successfully to " + topic);
                    return ending( true);
                }
            });}
            else return ending( false);// cant write to unknown proto 

        }else if (this.clas == 3) {// a probe in mqttprob[i] . a prob cant write |||||||||||||||||  sodo  return true
            return ending( true);
    } else return ending( false);// return  false if error
}else return ending( null);// cant write

function ending (value) {
    
    console.log(' ** writesync for portid ',gp,', is ending writinging val: ',val,', now current dev queue is : ',queue,' returning ',value);
    return value;

}

}


module.exports ={// returns ...

    init:function(plantconfig){// wait connection and subsribe all gpio x plantconfig, 
                                                    // so  as soon cb is called we have status[gp]=[] (the subscription is ok )

                                                    //  old :  'gpio_11':[[id,topic],,,,,,]}){//console.log('rest init : load http: ',http_);
        return new mqttClass(plantconfig);
    }
}
function mqttClass(plantconfig){
    this.gpio=null;// not used // deleted : gpio=plantconfig.devid_shellyname||{11:'shelly1-34945475FE06'}; 
    this.mqttnumb=plantconfig.mqttnumb,
    this.mqttprob=plantconfig.mqttprob;// prob + var state cfg array
    this.mqttTop={};// //  calculated topic
    this.mqttTopPub={};// //  calculated topic x publish if different from subscribe. item can be '' x dummy writesync
    this.futurecb={};
    this.status={};// pool x dev read queue
    this.statusList={};
    // one x both : this.mqttnumbTop={},this.mqttprobTop={};//  calculated topic 
    this.plantName=plantconfig.plantName;
    // this.invTopic={};// that becomes at mqtt.js level: invTopic=invTopic||{}; every dev in any mqtt instance has a topic registered in invTopic
    this.topPlantPrefix='@'+this.plantName+'@';// prefix for dev topics for dev type (i probe e i rele hanno il s/n per cui i topic sono sicuramente unici in tutto il mqtt server) see RTY
   // for(dev in gpio){
    for(let i=0;i< this.mqttnumb.length;i++){
   // status[dev]=null;// queue ** su topic shellies/<model>-<deviceid>/relay if array is null means no connected 
   if(this.mqttnumb[i]){let dev=this.mqttnumb[i].portid;
   this.futurecb[dev]=null;// it will be filled by the request of a dev ctl
   this.status[dev]=null;// the queue x device dev  not subscribed jet !
   this.statusList[dev]=[];// init list arrays
   }}
   //for(dev in mqttprob){
    for(let i=0;i< this.mqttprob.length;i++){
        // status[dev]=null;// queue ** su topic shellies/<model>-<deviceid>/relay if array is null means no connected 
        if(this.mqttnumb[i]){let dev=this.mqttnumb[i].portid;
    this.futurecb[dev]=null;// it will be filled by the request of a dev ctl
    this.status[dev]=null;// not subscribed jet !
    this.statusList[dev]=[];// init list arrays
    }}
   //if(client.connected)return true; else return false;
   if(this.start()){
    this.avail=true;// connected to broker, wating for all dev subscription cb
    // return this;
   }else {
    this.avail=false;
    // return null;
   }


    avail:null// null, true,false th connection to broker is ok
    // use : await read()

}
mqttClass.prototype.start = function

   (){// wait/check connection and subscribe all gpio , so  as soon cb is called we have set status[gp]=[] (the subscription is ok )
       
        // in future subscribe when the fc(gp,ind,type) is called as the device can be used differently depending on the type requested 
        //  and we can also add the ctl to the invTopic[topic]  so we can have info from ctl to do some preelaboration (?)
        let that=this;
if(!client){
console.error("mqtt start() :client not available jet, too late ! recovering  todo ....");
return false }
console.log("mqtt start() :  checking connection cb  to mosquitto, connection state: " + client.connected);
let onlyone=false;


if(!client.connected)client.on("connect",onconnection);else if(client.connected)onconnection();// check connection


function onconnection() {// subscribe topic 'presence' only at connection start
if (onlyone) return;
onlyone = true;
console.log("mqtt connected to mosquitto: " + client.connected, ' now we have to  subscript all devices with its topic ');

client.subscribe('presence', function (err) {// usefull?, to do to see if there is the dev connected 
    if (!err) {
        // client.publish('presence', 'Hello mqtt')
    }
});


// todo   set here the node-red subscription for the service channel ( comandi di cfg/ attivazione procedure da node-red a fv3) 



// let keylist=  Object.keys(gpio);//mqttnum   keys

if( !SubAfterPlantReq)subscribePlantEv(that);

// moved at top level : function subscribePlantEv(that){



};
// dont wait return async , wait later on futurecb[key]
return true;
}

mqttClass.prototype.fact = function(gp,ind,inorout='out'){// // gp=portid,ind=0,1,2 index of mqttnumb or mqttprob depending on inorout !! (***)
                                        // PIRLA: >>  return promise resolving in  {ctl:new fc(gp,ind,inorout,cfg)={gpio=portid/devid,devNumb=index,type=inout,cfg,cl=1(clas='out')/2(a var)/3(clas='in'OR'prob'),ison,readsync,writesync},
                                        //                                               ex: ctl={cfg={portid,clas protocol,subtopic},cl:1,devNumb:0,gpio:11,isOn:true,readsync,writesync}
                                        //                                          devNumb:ind,
                                        //                                          type:'mqtt'}  (=pr)  

                                        //              when we got the subscription (status[gp]!=null) on dev topic using dev info loaded in 
                                        //    inorout definisce/punta alla cfg del dev che puo essere tipo  rele/out o var-in (cfg in mqttprob )       
                                        // a factory, usually returns a obj, but as our obj is the resolve of a promise the caller of the fact  must await or thenable that promise return 
                                        // inorout is the dev type or capability requested ,must match the config data got in init()
                                        //          can be out for gpio like relais or in-var for mqtt probes/var 
                                        //          say where find cfg in model (***) and how to build the dev ctl
                                        // the promise resolves in {ctl:new fc(gp,ind,inorout),devNumb:ind,type:'mqtt'}
                                        //                  after device number gp  is subscribed in start() using : client.subscribe(sub_topic, shelly_options, function....)
                                        //                      setting status[gp]=[]
                                        //                          nb sub_topic is got fron cfg data gpio set in  init:function(gpio_={11:'shelly1-34945475FE06'} called in fv3:
                                        //                                  if(!(isAvail=mqtt.init(devid_shellyname)
                                        //                                         let{gpionumb,mqttnumb,mqttprob,relaisEv,devid_shellyname}=plantconfig;
                                        //                                          plantconfig=eM.state.app.plantconfig; (set in loadScriptsFromFile , plantconfig=model.getconfig(plant_) )

                                        //                  infact the device is usable if the mqtt server recognise a topic it can serve so cb the subscrition requested
                                        //                  the subscribing request for a gp dev ask for a topic = shelly_options. it done in init() 
                                        //   
        let res_,infosrc='mqttprob'
        cfgf=this.mqttnumb;if(inorout!='out')cfgf=this.mqttprob;else infosrc='mqttnumb';// (***)
        let cfg=cfgf[ind],// dev cfg from model,
                                                // {portid:110,clas:'var'/'out',  
                                                // if 'out'  +
                                                // protocol:'shelly',subtopic:'shelly1-34945475FE06',
                                                // if !'out'  +
                                                // topic:'gas-pdc',varx:3,isprobe:false}
        that=this;

    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 
        let ctlpack= {ctl:new fc(gp,ind,inorout,cfg,that),devNumb:ind,type:'mqtt'};// depend on inorout the model cfg is different (see  mqttnumb,mqttprob in plantconfig)
                    


        return new Promise((res,rej)=>{// resolved in  a dev ctl  

            if(SubAfterPlantReq){// subscribe here not in onConnect 

                if(that.status[gp]){// never happens !!!!
                    // is already subscript as the subscript cb is called and set status[gp] 
                    // (a var dev cant be subscribed by more plants ! 
                    //  and also a prob/rele usually has unique topic and must be subscribed by 1 plant , usually )
                    subscred();// or  res(ctlpack);
                }else{
                if(inorout!='out')  probSubscr(cfg,that,ctlpack,subscred); /// mqttprob described device // nb added ctlpack to give more info. that = mqttInst 
                else  numbSubscr(cfg,that,ctlpack,subscred); // mqttnumb described device 
                }
            }else{// alredy tryed to subscribe in onconnect 
            if(that.status[gp]){// is already subscript by numbSubscr() as the subscript cb is called and set status[gp]
                console.log(' factory is resolving the dev (',gp,') ctl as it is alredy subscribed (SubAfterPlantReq=false) ');
                res(ctlpack);
            }else{// register a resolver when the cb will come. 
                console.log(' factory set cb x a onconnection unsatisfacted subscription (SubAfterPlantReq=false) to give the dev ctl , dev:',gp);
                that.futurecb[gp]=function (){// when this func will be called (by subscription cb )we resolve giving the device ctl
                    res(ctlpack);
                }
            }
        }
        function subscred(resu){ 
            console.log(' **** dev factory mqttInst.fact() for plant ',that.plantName,' relaised/resolved the devid/portid ',gp,' after subscribing on topic ',resu.topic);
            console.log(' **** according model info: ',cfg,' \nfound  in ',infosrc,' a device of type: ',resu.cl_class,' protocol ',cfg.protocol);
            ctlpack.topic=resu.topic;ctlpack.cl_class=resu.cl_class;ctlpack.protocol=cfg.protocol;
            res(ctlpack)}
        })

    }

    function subscribePlantEv(that){

        // >>>>>>>  function  map portid dev > its topic   + store inverted map   
        
        // >>>>>>>>>><<  now subscribe all topic associated with device and fill their topic lists
        
        that.mqttnumb.forEach((val) => {// subscribe all relay key/dev, registered in gpio by init(), in order to call readSync(), .....
            // if('shelly')
            //  let devkey=gpio[key];
            // 
        
            return numbSubscr(val,that);
        
        });
        
        
        //  let problist=  Object.keys(mqttprob);// the prob/var mqtt dev
        
        that.mqttprob.forEach((val) => {// subscribe all relay key/dev, registered in mqttprob by init(), 
            // if('shelly')
            //let prob=mqttprob[val];// = mqttprob di models
            // 
            return probSubscr(val,that);
        

        });
        
        
        client.publish("testtopic", "test message", opt);// send msg with testtopic topic for debug
        }// end subscribePlant()



        function numbSubscr(val,that,ctlpack,subscred){// al subscribe del topic associato al dev 

            // subtopic:'shelly1-34945475FE06
            if(val==null)return false;
            let { portid, varx, isprobe, clas, protocol, subtopic } = val,cl_class;
            
        
        
            // now use std Subscribe variables for shelly 1 or shelly ht , 
            // todo in future :
            //      - will be customized using gpio set from device model config data in init() according with the type requested 
            //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))
            let topic,topicPub;
            if (clas == 'out') {
                cl_class='rele';// rele
                if (protocol == 'shelly') {// other protocol different from shelly can have different feature ex subscriptTopic and PubTopic !
                    // RTY
                    topic = // that.topPlantPrefix+
                    shelly_stopic + subtopic + shelly_topicp;// shellies/<model>-<deviceid>/relay  must be unique in all plants
                    topicPub=shelly_stopic + subtopic + shelly_topicpp;//
        
                    client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing shelly: ",err);
                        } else {
                            that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log('numbSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to shelly out/rele protocol, topic: ' + topic);
                            if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                            if(subscred)subscred({topic,cl_class});
                        }
                    });
        
        
                } else return false;// other prococol x 'out' !!!!!!!!!!!!!!!!!!!
            }else if (!isprobe && varx != null && clas == 'var') {
                cl_class='var';
        
                if (protocol == 'mqttstate') {
        
                    topic= that.topPlantPrefix+'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!
        
  /*      
                    client.publish(topic, ">ctlpresent", opt);// send msg with testtopic topic for debug and trace in var itself a connection was asked?
                                                                // >>> if the server keeps last var state we delete the current value ! 
                                                                // forse e meglio mndare il msg >ctlpresent solo se dopo aver subscribed non ricevo nulla e so che sto aprendo per la prima volta questa var 
                     client.publish(topic, 'paolo', opt);
                     client.publish(topic, defVar, opt);
                     client.publish(topic, 'giovanni', opt);
                    // now use std Subscribe variables for shelly 1 or shelly ht , 
                    // todo in future :
                    //      - will be customized using gpio set from device model config data in init() according with the type requested 
                    //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))
    */                
                    client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing shelly")
                        } else {
                            that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log('numbSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to mqttstate protocol, topic: ' + topic);
      
                            if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                            if(subscred)subscred({topic,cl_class});

client.publish(topic, "buona sera", opt);  // send msg with testtopic topic for debug and trace in var itself a connection was asked?
                                            // >>> if the server keeps last var state we delete the current value ! 
                                            // forse e meglio mndare il msg >ctlpresent solo se dopo aver subscribed non ricevo nulla e so che sto aprendo per la prima volta questa var 
client.publish(topic, ">ctlpresent", opt);
client.publish(topic, 'paolo', opt);
client.publish(topic, defVar, opt);
client.publish(topic, 'giovanni', opt);
                        }
                    });
                } else return false;// error 
              
        
        
            } else return false;// end clas checks
        
            if(topic){that.mqttTop[portid]=topic;
                if(invTopic[topic])log.error('numbSubscr() , error, found a device with already registered topic by someother plant !!!')
                invTopic[topic]={portid,mqttInst:that,topic,cl_class,protocol};};// complete cfg to easier/better dev management !
            if(topicPub)that.mqttTopPub[portid]=topicPub;// register topic x publish if different from subscribe. can be null if writesync receves a null value
            return true;// ??
        }



        function probSubscr(val,that,ctlpack,subscred){

        let { portid, subtopic, varx, isprobe, clas, protocol } = val,
        topic,topicPub,cl_class;

    if (!isprobe && varx != null && clas == 'var') {
        cl_class='var';// a var in mqttprob
        if (protocol == 'mqttstate') {// state persistant in mqtt server, interfaciable with node red 

            topic= that.topPlantPrefix+'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!
            client.publish(topic, ">ctlpresent", opt);// send msg with testtopic topic for debug

            // now use std Subscribe variables for shelly 1 or shelly ht , 
            // todo in future :
            //      - will be customized using gpio set from device model config data in init() according with the type requested 
            //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))

            client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                if (err) {
                    console.log("An error occurred while subscribing shelly")
                } else {
                    that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                    console.log('probSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to mqttstate protocol, topic: ' + topic);
                    if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                    if(subscred)subscred({topic,cl_class});
                }
            });
        } else return false;// error 

   } else if (isprobe && clas == 'probe') { 
    cl_class='probe';
        // just set the topic x the probe according to protocol 
        if (protocol == 'shelly') {
            topic='ctl_probe_' +subtopic;// according to device 
            topicPub='';// x dummy write
            client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                if (err) {
                    console.log("An error occurred while subscribing shelly")
                } else {
                    that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                    console.log('probSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to shelly probe protocol, topic: ' + topic);
                    if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                    if(subscred)subscred({topic,cl_class});
                }
            });

        }
    }
    if(topic){that.mqttTop[portid]=topic;
        if(invTopic[topic])log.error('probSubscr() , error, found a device with already registered topic by someother plant !!!')
        invTopic[topic]={portid,mqttInst:that,topic,cl_class,protocol};
    };// complete cfg to easier/better dev management !
    if(topicPub)that.mqttTopPub[portid]=topicPub;// register topic x publish if different from subscribe. can be null if writesync receves a null value
    return true;// ??
}
