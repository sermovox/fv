var mqtt = require('mqtt');// http://www.steves-internet-guide.com/using-node-mqtt-client/
                            // https://www.macrometa.com/iot-infrastructure/node-js-mqtt
//const caFile = fs.readFileSync("ca.crt");
var fs = require('fs'); //require filesystem module

require('dotenv').config();// load .env
const INVERTONOFF_RELAY=process.env.INVERTONOFF_RELAY||(process.env.INVERTONOFF_RELAY=='true'),
OR_Present=parseInt(process.env.OR_Present)||0;

const SubAfterPlantReq=true;// code implem alternative
const defVar='off',// or -7777  default first write value for var device
debug_int=false;// if false , no debug, so process interrupts normally.

const { emit } = require('process');
const { resolve } = require('path');
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
},roOptions = {// conn opn x remote O
    port: 1883,
    host: '192.168.1.213',
    clientId: "client123",
    username: "master:mqtt_user2",
    password: "ZSxwu2AwfGYb0EJ4D9mJK7TkSmfLZbkK"
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

let client,roClient;
// subscription and publishing topic x rele dev , shelly protocol :
// std Subscribe variables, in future will be customized using gpio set from device model config data in init() according with the type requested 
const shelly_stopic = 'shellies/',shelly_topicp = '/relay/0',
     shelly_options = {qos: 0},// needed really ?
    nodeRedp='/NReadUser/cmd';// usato per comandare dal esterno il var/rele dev come fosse anche un virtual device con questo cmd topic

// Publish variables
const shelly_topicpp = '/relay/0/command',
nodeRedpp='/NReadUser/publish',// usato per ........  ????????
messageOn = 'on', messageOff = 'off',
pub_options = {qos: 0, retain: false};// in http://www.steves-internet-guide.com/using-node-mqtt-client/ use    ={retain:true,qos:1}




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
    // topic is the base url, then can be the cmd url= base url + opicNodeRed and can be verifyed on caller
    let baseurl
    if(!invTopic[topic])return null;
    else{ //if(!invTopic[topic])
    
    
    
    return invTopic[topic];
   //  let devid=invTopic[text].portid,mqttInst=invTopic[text].mqttInst//portid,cant be 0 ! . no it must be  foreseen the plant the invTopic can be applied
    }
}
// END HELP  func 



    //client = mqtt.connect("mqtt://192.168.1.157", options);
    // or x tsl :
    // var client  = mqtt.connect("mqtts://192.168.1.71:8883",tlsoptions);
    console.log("mqtt starting :  asking connection to broker with ops: " + JSON.stringify(options,null,2));
client = mqtt.connect(options);if(OR_Present)roClient = mqtt.connect(roOptions);


if (roClient) {
    console.log("mqtt client connecting .... , so registering message listener ...");
    
    let waitListReturn = false,
        waitPromiseRes;// resolve che si mettera a disposizione se il precedente msh non ha resettato ancora i listener
    const CheckPrevMessageEnd = false; // debug 
    
    roClient.on('message', msgListFact(waitListReturn,waitPromiseRes,CheckPrevMessageEnd));
}
if (client) {
    console.log("mqtt client connecting .... , so registering message listener ...");
    
    let waitListReturn = false,
        waitPromiseRes;// resolve che si mettera a disposizione se il precedente msh non ha resettato ancora i listener
    const CheckPrevMessageEnd = false; // debug 
    
    client.on('message', msgListFact(waitListReturn,waitPromiseRes,CheckPrevMessageEnd));
}
function msgListFact(waitListReturn,waitPromiseRes,CheckPrevMessageEnd){

return function (topic, message, packet) {// message=obj=buffer  >>>>   the message income handler
    //   immagino che non ci possono essere 2 chiamate attive (2 tread) contemporanei//
    let msg,// the payload
        message_;// the js object

        console.log(' mqtt income. Received message ',message.toString(),' on topic ',topic);

    if (waitListReturn) {// the listener of previous message didnt retured jet
        let waitPromise= // added to correct error (forget to define waitPromise)
        new Promise((res, rej) => {// HUUY the previous message income has still the listener to reset , wait for it ,waitPromise=res, to resolve 
            waitPromiseRes = res; // metto a disposizione il resolver func e si  aspetta il reset dei listener nel precedente income, per procedere al ricevimento di questo message

        });
        waitPromise.then(function () {
            console.log("mqtt Received message , .....  goonP() (continue to process the received message) after previous readsync finished to reset listeners");
            waitPromiseRes = null; // tolgo il resolver reference anyway 
            goonP();
        })

    } else {
        waitPromiseRes = null; // tolgo il resolver reference anyway
        goonP();
    }


    function goonP() {// goon with message processing, we dont have to wait previous readsync finished
        let adev, packprop = [], packprop1 = Object.keys(packet);// packet contain some info , not used now
        //for (let x in packet) {
        //    packprop.push(x);
        //    };

        /*
        function props(obj) {// duscover prototype property chain , not used more
            var p = [];
            for (; obj != null; obj = Object.getPrototypeOf(obj)) {
                var op = Object.getOwnPropertyNames(obj);
                for (var i = 0; i < op.length; i++)
                    if (p.indexOf(op[i]) == -1)
                        p.push(op[i]);
            }
            return p;
        }*/

        // let allprops2=props(packet);

        //   if ((dev = isShelly(topic))!=null || (dev = isProbe(topic))!=null  ) {// use statusList and queue status[dev] built for dev whose config is described in  gpio and  mqttprob
        // >>> satisfy all listener waiting for a msg , fill queue status[dev] to satisfy future coming read for msg request
        // device  id ex: 11 , not : shelly1-34945475FE06
        // status[dev]=status[dev]||{};

        if (adev = regTopic(topic)) {//just returns invTopic[topic], useless !
                                    // in var dev topic can be base topic ( dont contain any '/') or cmd topic

            let dev = adev.portid, mqttInst = adev.mqttInst,
                ctlpack = adev.ctlpack,// ctlpack={ctl:new fc(gp,ind,inorout,cfg,that),devNumb:ind,type:'mqtt'};
                avar = ctlpack.type == 'mqtt' && (ctlpack.ctl.cl == 2 || ctlpack.ctl.cl == 4),// is a var dev
                fromthisctl = true,// serve a capire nei msg contenenti il sender (var dev) se esso proviene da un pub di questo ctl, non sempre usato: di solito i var dev usano il meccanismo node-red quando un ext ctl vuole cambiare stato pubs un message con topic command topicNodeRed (il dev è un virt var dev, isCmdTopic=true )
                isCmdTopic=false;// simulera il subscription  di un virtual shelly node-red . il nodered comanda questo virt device fisico che simula un cambio stato genera un call a questo listener che diventa il  listener del suo subscription. constatato che è meritevole di interruput ( probabile state change) lo lo chiama 

            // decode msg if is a var :
            if (avar) {// is a var json of : {payload:load,sender:{plant:topPlantPrefix,user:portit}}
                let topicNodeRed=adev.topicNodeRed;
                isCmdTopic=topicNodeRed&&topicNodeRed==topic; // if topic==topicNodeRed we have a cmd topic in case of var dev !!!

                message_ = rec(message);// can return a obj if good formatted , else null .
                if (message_ == null) {//  , is a signal not formatted 
                    msg = message.toString();// convert buffer to string   
                    fromthisctl = false;// in this case ever consider the msg not coming back from this device 
                    console.log(' mqtt Received a var  not fomatted message x dev ', dev, '  coming from outside so can readsync the not formatted value (msg itself) if is not a presence  ');
                   
                } else {// var message formatted 
                    msg = message_.payload;
                    fromthisctl = message_.sender && message_.sender.plant == mqttInst.plantName && message_.sender.user == dev;

                    //if(message_.plant&&message_.plant.user&&message_.plant.user==dev){
                    if (fromthisctl) {// user = dev !
                        //console.log(' mqtt Received message x dev ',dev,' thats a var , coming from itself, so discard it ');
                        console.log(' mqtt Received message x dev ', dev, ' thats a var , coming from itself, so can readsync the fotmatted value (payload) if is not a presence  ');
                        // return;//msg=null;   // discard incoming msg
                        // no now we process , will be rread that will manae the msg content (decide se è un signal '>ctlpresence' o un valore 'on/'off e torna 0/1/''(=N/A))
                    }
                }

            } else{ // not var , can be rele (or probs?), probably not formatted
                msg = message.toString();// convert buffer to string , can be 'on'/'off'  in case of rele , topic or topicNodeRed
                let topicNodeRed=adev.topicNodeRed;// added also x rele type ( and probe too ??????)
                isCmdTopic=topicNodeRed&&topicNodeRed==topic; // if topic==topicNodeRed we have a cmd topic in case of var dev !!!
            }
                    if (fromthisctl) {// user = dev !
            if(!isCmdTopic){// can be var (we calc if is  ) or rele (or probes ?) : 

            // satisfy all pending listeners : (nb []  added  in init func , that can be still to call)
            if (mqttInst.statusList[dev]) {// process existing pending listener for device number id=portid=11

                if (CheckPrevMessageEnd) waitListReturn = true;// impedisce al next msg process till  the listener in current msg are defined ( Promise.all(iterListen) .then((results))

                let nlis = mqttInst.statusList[dev].length;
                if (nlis > 0) {
                    console.log("Received message . LISTENER:  we found : ", nlis, "listener to call , so scanit to cb=resolve them");
                    // console.log("... probably listeners was added as msg queue is (0 expected ) Received message , we found : ", mqttInst.status[dev]);
                    if (!debug_int) {
                        let count = 0;

                        let iterListen = [],//  list of  listener result promise and its request  to reset
                            itsReq = [];// the list request number

                        mqttInst.statusList[dev].forEach((el) => {
                            count++; // IIOOPP


                            if (count <= nlis) {// to permit to all during process, not used ?

                                // iterListen.push(alist = el(msg));//  el(), sync,  is the listener embedded on resolving func in stList() !
                                // better 
                                if (el) {

                                    iterListen.push(el(msg));//  el(), sync,  is the listener embedded on resolving func in stList() !
                                    itsReq.push(el(0, 1));
                                }
                            }
                        });

                        Promise.all(iterListen)
                            .then((results) => {// [true,false,,,,]
                                console.log('Received message . we scanned all LISTENER list ,  some listener want to iterate if cant read a value ( msg was considered a presence/signal)they are  indexes: ',results,' ,  with relating requests :', itsReq);
                                postList(nlis, count, results, itsReq);

                                // next 2 must be atomic 
                                if (waitPromiseRes) waitPromiseRes();// if next msg has alredy arrived and see  waitListReturn true (HUUY) it will wait waitpromise resolver call to goon                   
                                waitListReturn = false;// next msg income will find  listener setted , dont neet to wait ;

                            })






                    }
                }



                function postList_(nlis, count, iterListen, itsReq) {// error, old .here we keep the listener added !!!

                    console.log("Received message , we just finished calling: ", count, " msg listener ");
                    //   console.log("Received message . after scanned LISTENER list :  we found listener that will wi", mqttInst.statusList[dev].length, "listener ");
                    if (nlis < mqttInst.statusList[dev].length) {// now listener cant add listener , just return the listener (itself ) to continue waiting x nexr msg !

                        console.error("Received message . we scanned LISTENER list but it number is increased of ',mqttInst.statusList[dev].length-nlis,', so leave the last listener into list list to process next msg ");

                        // so todo: do not delete the coming new listener :
                        mqttInst.statusList[dev].splice(0, mqttInst.statusList[dev].length - nlis);
                    } else // mqttInst.statusList[dev].length = 0;// reset at the end
                    {
                        mqttInst.statusList = iterListen;
                        console.log('Received message . we scanned LISTENER list , and some listener want to iterate , they are relating requests :', itsReq)
                    }

                }

                function postList(nlis, count, list2reset, itsReq) {// usually this thread is running after this msg is been processed and
                    console.log("Received message , we just finished calling: ", count, " msg listener , proposed new listener to goon waiting next msg are working on req id :", itsReq);
                    //   console.log("Received message . after scanned LISTENER list :  we found listener that will wi", mqttInst.statusList[dev].length, "listener ");

                    let resetList = [], iterReq = [];

                    mqttInst.statusList[dev].forEach((el, ind) => {
                        if (list2reset[ind]) {
                            resetList.push(el);// insert the current listener in next listener list because has been reset ( )
                            iterReq.push(itsReq[ind]);
                        }
                    });


                    console.log('Received message . we scanned LISTENER list , and some listener want to iterate( indexes: ',list2reset,' ), they are relating requests :', iterReq);
                    mqttInst.statusList[dev] = resetList;

                }
            }// end listener process 


            if (mqttInst.status[dev]) {// // subscribed  so put msg in buffer!
                if (mqttInst.status[dev].push(msg) > 10) mqttInst.status[dev] = mqttInst.status[dev].slice(-2);// add queue
                console.log(" Inserted current message (", msg, ") , in current msg queue for device:", dev, " is: ", mqttInst.status[dev]);
            } else console.error(" Received message , current msg queue for device:", dev, " had not been subscribed ");// never happen

        }

          else {// isCmdTopic  , news now also rele dev can have cmdtopic !!. // cmd topic dont write to dev queue, just interrupt ! valid now for var and also for rele dev !!!
          if (ctlpack.type == 'mqtt' && (avar||ctlpack.ctl.cl==1)) {// a var or a rele with cmd topic
                if (!fromthisctl) {// a msg coming from someoneelse , if the message is not frmatted it is considered not coming back from this device writesync/publish
                    // let packprop2=Object.keys(ctlpack.ctl);//,packprop3=Object.keys(ctlpack.ctl.prototype);
                    // allprop=props(ctlpack.ctl);
                    // let ass=ctlpack.ctl.readSync;

                    console.log('  message  with cmd topic x device ', dev, ', of type ',ctlpack.ctl.cl,' , so  interrupt to update the value. after update this dev will writesync the value x confirmation');


                    if(Number.isNaN(val_=Number(msg)))
                    console.error('  message   a cmd msg ',msg,' , x  dev ', dev, ', is not a string number so reject ');


                    // if the text msg must be processed according to type in adev  call readsync otherwise can use msg
                   // if (mqttInst.status[dev].length > 0)// per sicurezza il dato deve essere nel queue
                        // ctlpack.ctl.readSync().then((read) => {// read the queue last pos


                            ctlpack.ctl.int(msg, mqttInst.status[dev], ctlpack.ctl.lastwrite);// todo check that can be call for both var and rele type dev 
                       //  });//  set to  int that call setPump that call 
                    //    - pumpsHandler (update browser) 
                    //    - onRelays che update state ma trovando il valore effettivo = valore richiesto da setPump non chiama il writesync che il valore e' gia stato settato !! 
                } else // cant ever be 
                    console.log('  message x device ', dev, ', of type var has been emitted by this ctl, so no interrupt');
            }}
        } else {

            //  ...write here code  for topic different from gpio (cfg in gpio) and probe-var (cfg in mqttprob) devices
            console.log(" Received message , no dev was registered with current msg  topic: " + topic.toString());
        }






    }


}
}}

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

if(OR_Present){
roClient.on("error", function (error) {
    console.log(" ro brocker Can't connect" + error);
    process.exit(1);// cant retry
});

// Notify reconnection
roClient.on("reconnect", function () {
    console.log(" ro brocker Reconnection starting");
});

// Notify offline status
roClient.on("offline", function () {
    console.log(" ro brocker Currently offline. Please check internet!");
});

}

client.on("error", function (error) {
    console.log(" mosquitto brocker Can't connect" + error);
    process.exit(1);// cant retry
});

// Notify reconnection
client.on("reconnect", function () {
    console.log(" mosquitto brocker Reconnection starting");
});

// Notify offline status
client.on("offline", function () {
    console.log(" mosquitto brocker Currently offline. Please check internet!");
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
    this.int=null;// interrupt to register
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

    fc.prototype.readSync  =// dont need  async return a promise resolving 0/1
                        function (to=100){// timeout
    // in case of a previous write the msg queue is cleared so the effect of a write can be read also waiting some time !
    let mqttInst=this.mqttInst,// the plant mqtt inst is registred on this dev ctl
    that=this,// this dev ctl
    gp=this.gpio;// portid , ex 11, warning il portid è unico a livello di plant !!!!!!!!!!!!!!!!!!! infatti la sua queue e'  nella mqttinstance
    let ts=new Date().getTime(),listCall=0;// // ts is really the id of the request , just for tracking the listeren called


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
        // nb first time we receive a  msg,  queue is filled and we  wont  use listener if future
        //   nb msg in queue can be very old !!! 
        // , returns 0 or 1 !

        // sunto 113052023
        // chiamo rread ricursivamente (nel caso lo richiamo se un valore non mi soddisfa e allora lo richiedo ma senza guardare il current queue , ossia forzo un listener )
        // se trovo queue allora  prendo last val (a meno che non ci sia per un dev var 'ctlpresent')
        // altrimenti attendo la risoluzione di un listener che aggiungo alla lista 
        // caricamento valore letto  secondo tipo (rele/var/probe) e protocollo 
        // chiudo chiamando ending( valore da caricare ). nb se null significa ho letto valore erraro7nullo

let ret=0;// def return

let resRetList,// the resolving func
resetListener=false;             // reset the listener x next msg, true when after lauch stList() we need to launch anothe stList()
                                // when true we can just continue with another reset or just resolve the readsync
let theListener, // the listener
retProm=new Promise(function (res,rej){// resolve when the rread knows if resolve the readsync or reset a listener 

resRetList=res;

});

async function rread(checkQueueFirst=true){// the returned value depends from the dev type ( rele,var,probs) and from device protocol extraction from state[dev] queue 
                                            // example in mqttstate protocol for var device ( (clas == 2||clas == 4) {// a var in mqttnumb ) : we return 
let re;                                 // checkQueueFirst if false dont look at a current queue , just wait for next val

        /* now when a  var subscribe, are sent 2 message :
        1: '>ctlpresent'
        2: no more :the def var , it will be set at first write !

        se vogliamo inviare (con .subscribe() ) il presence sullo stesso template, dobbiamo lavorare su message handler( client.on('message', ...) e readsync() x evitare 
            che venga letto quando si vuole leggere un valore con readsync.  2 strategie:
        a) inserirla nel queue (client.on('message',,)) quando arriva il >ctlpresent ,  e quindi impedire di leggerlo dal readsync, lanciando un listener stList() anche piu volte (se il >ctlpresent viene mandato 2 volte dal brocker),
        b) non inserire >ctlpresent nel queue  da parte del  (client.on('message',,)) .
        b) e' da implementare ancora  


        */




// const defVar=0;// or -7777
if(mqttInst.status[gp]){//is subscribed 
   let curlength=mqttInst.status[gp].length;
//console.log('  readsync() : getgpio wants read buffer for dev: ',gp,', , its  dim is: ',curlength);// todo 05052023  called 2 times ???
console.log(' readsync() :  rread()  is reading for dev: ',gp,', current queue : ',mqttInst.status[gp],' ,request ts # ',ts);// todo 05052023  called 2 times ???
if (checkQueueFirst)console.log(' ......   rread()  will now try to get the top of current queue ',mqttInst.status[gp]);
else console.log(' ......   rread()  will now add a listener waiting for a next message ');
if(checkQueueFirst&&curlength>0){re= mqttInst.status[gp][curlength-1];//  WARNING ::

                                                //  last message in queue , <<<<  hope a message caused after a write operation, eventually rewrite the same value
                                                // till get a read = the last  write
if (clas == 1||clas== 3){// rele or  probe after read last val dont change  the queue , next read will will find any way the last message on top of the queue
  // no :   mqttInst.status[gp].length=0;
}else if (clas == 2||clas== 4){// a var

   /* mqttInst.status[gp].length--;// delete presence x now, look for previous if any
    rread(true);
    */
   // re= mqttInst.status[gp][curlength-1];
    if (re == '>ctlpresent'){// if last meggage is this client presence msg , iscrivi un listener per ricevere il messaggio successivo 
        //re=defVar;mqttInst.status[gp].push(defVar);


        //re= await stList();// the def write that must follow
        console.log(' readsync() : warning, for request ',ts,', a listener read a presence, >ctlpresent, value from queue, so add a listener to be called on  next message');
        return rread(false);
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

// caricamento valore letto  secondo tipo (rele/var/probe) e protocollo 

    if (clas == 1) {// rele
        if (that.cfg.protocol == 'shelly') { if (re == 'on') return ending(1); else return ending(0); }
        else if (that.cfg.protocol == 'ro') { return ending(re);// the same re
        }else return ending(null);// unknown
    }// relays value: 0/1
    else if (clas == 2 || clas == 4) {// a var in mqttnumb or mqttprob
        if (re == '>ctlpresent') {// must come after POLP,  >>>>>    is a signal in incoming mqtt stream ,  used in var device 
            // no more wait a next msg :  return rread(false);// discard (coming from this inst. or other)  ctl presence
            if (curlength > 0) console.error('can be an error in rread() processin a var ');

            console.log(' readsync() , dev: ', gp, ', current queue : ', mqttInst.status[gp], ' ,request ts # ', ts, '. warning a listener  fired with   still a presence/signal msg, so add another listener to be called on a new next message in a new listener list');
            //  mqttInst.status[gp].push(defVar);// anyway add def in top  queue
            resetListener = true;// or just add a listener in list queue
            return rread(false);// relaunch rread
        }
        else {
            if (that.cfg.protocol == 'mqttstate') // the msg is a value not a signal , according to proocol return a value (usually a var has integer)
            // return a int or ''/null 
            // {if (re == 'on') return ending( 1); else return ending( 0);}
            {
                if (re == '') return ending(null);// '' or null
                else { return ending(re); }// usually a integer 
            }
            else return ending(null);// unknown
        }

    } else if (clas == 3) {// probe in mqttprob
        if (that.cfg.protocol == 'shelly') { return ending(re); }
        else return ending(null);// unknown protocol


    } 


else return ending( null);// error !

}else return ending( null);


    function stList() {//(dev,token){// return a promise that  add to a dev listener list, the promise is resolved when the listener ,is called with the next  msg
        // todo : add a reject to fire after a max time is reached
        // when a msg arrives the listener will be called and resolves, then the current queue (should be void ) will be filled by the last msg

        return new Promise((res, rej) => {// resolved when the cb/listener is called by another thread. qui e' un listener di una funzionalità gia attivata 
            // (cioe non devo chiamare un funzione ee passarli il cb , giuso add un listeren in una lista che verra chiamata)
            let dev = gp;
            // let ts=new Date().getTime();// old name
            console.log(' stlist() listener . now adding a listener x dev : ', dev, 'in current mqttinst.statuslist: ', mqttInst.statusList, ' , request id(ts) ', ts);
            console.error(' stlist() listener no ERROR. now adding a listener x dev : ', dev, 'in current mqttinst.statuslist: ', mqttInst.statusList);// 05052023   dev is the devid x debug only

            theListener = theListener || (function (id_) {   // closure 
                let id = id_, fired = false;
                return function (lastmsg, test = 0) {// the listener . is sync function , so return to the caller (IIOOPP) after eventually added a new listener 
                    // and eventually delete itself ref 
                    // 05052023   dev is the devid , test to have the function id to recognize it when delete the listener reference in array

                    if (test == 0) {// process listened msg
                        if (!fired) {
                            listCall++;
                            console.log(' stlist() : listener x dev : ', dev, ', registered to wait for next message, in request ts #', ts, ', in listener position # ', listCall, ' is called by  the message the listener was waiting for.  so cb with message: ', lastmsg);





                            res(lastmsg);
                            // todo rej if timeout !!
                            fired = true;
                            return retProm;// the returned promise will be resolved after rread knows if continue with another listener on next message if cant find a good val to read 
                        } else return;
                    } else {// return id to be recognized
                        console.log(' stlist() : listener x dev : ', dev, ', registered to wait for next message, in request ts #', ts, ', is called to give its id ', id);

                        return id;
                    }

                }
            })(ts)// the id 

            if (resetListener) {
                resRetList(resetListener);// say to message income to reset the listener
                console.log(' stlist() : listener x dev : ', dev, ', resolving promise, say to message income to reset the current listener to wait for next message, in request ts #', ts);
            } else {
                console.log(' stlist() : listener x dev : ', dev, ', say to message income to set for first time the listener to wait for next message, in request ts #', ts);
                //in this case we were reading frm msg queue because not null . so we can just add to current listener array a new listener 




                /* error 
                let todo2 = true;
                if (todo2) {
                    if (resetListener) resRetList(theListener);   // better PPLLKK  
                } else {
                    */
                    mqttInst.statusList[dev].push(theListener);// set for first time the listener in message incom
                

            }
            // set the timeout :
            const myto = setTimeout(() => {
                //resolved.forEach((val)=>{if(val)push(resu)})

                console.log(' stlist() : listener x dev : ', dev, ', registered to wait for next message, in request ts #', ts, ', in listener position # ', listCall, ' is timeout.  so cb with void message');


                // todo : delete its 

                // delete itself:
                let todo1 = true;
                if (todo1) {
                    if (resetListener) resRetList(theListener);    // better PPLLKK  
                } else {
                    let ind = -1;
                    mqttInst.statusList[dev].forEach((val, ind_) => {
                        if (val(0, 1) == ts) ind = ind_;// this listerer index
                    });
                    if (ind >= 0) {
                        console.log(' stlist() : this listener x dev : ', dev, ', is timeout so reviewing the list list of dim ', mqttInst.statusList[dev].length);
                        mqttInst.statusList[dev].splice(ind, 1);// delete it without wait for a probable  never coming msg !
                        console.log(' stlist() : this listener x dev : ', dev, ',  id ', ts, ', as overridden by timeout cannot process a next msg and  will delete its reference set in listener array index ', ind, ' , so the current listener list is now of dim ', mqttInst.statusList[dev].length);
                    }
                }
                res('');// timeout readsync result :  would be better reject !
            }, to);
        });
    }

function ending (value) {
    resRetList(null);// no iterate listener 
    console.log(' ** readsync()  , using instance ',mqttInst.id,' for portid ',gp,', is ending . reading val: ',value,', now current dev queue is : ',mqttInst.status[gp],' req id ',ts,' listener chained ',listCall);
    console.log(' ** readsync()  ,debug  mqttTopPub is  ',mqttInst.mqttTopPub);
    return valCorrection(value);
}


}// ends rread()
return rread(true);

}// ends getgpio()

}

fc.prototype.writeSync = function (val_) {// val 0/1, can return false if in error 
    // will send a topic KKUU as registered in init() conf data for the device 
    // todo : in dev config data we can mark a dev if is available for out (a shelly 1 relay) or 'in' a HT device
    val=valCorrection(val_);
    let gp = this.gpio,// portid
    queue=this.mqttInst.status[gp],
    that=this;
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
                    console.log("writeSync() , using instance ",that.mqttInst.id, " Published on device ",dev," , a (no var) msg ",message,',successfully with protocol ',this.cfg.protocol,' and topic ', topic);
                    return ending( true);
                }
            });


        }else if (this.cl == 2||this.cl == 4) {// a var in mqttnumb or mqttprob[i] 



            // let { topic, varx, isprobe, clas ,protocol} = this.cfg;// protocol:'mqttstate'
            //topic_=topic;

            if(this.cfg.protocol=='mqttstate'){// si applica la regola std  per settare il topic x le variabili che metto in mqtt!
           //  let topic_ = 'ctl_' + topic + varx;// warning we add ctl_   !!!!

          // if (val == 0) message = messageOff; else message = messageOn;
          message=pub(val,this.mqttInst.plantName,gp);

           // clear msg queue ( and its listener ? must be rejected ????)
           // WARNING hope a message in transit dont get here meanwile !!!!
           this.mqttInst.status[gp].length = 0; // ??????

            client.publish(topic, message, pub_options, function (err) {
                if (err) {
                    console.log("An error occurred during publish on dev: ", gp);
                    return ending( false);
                } else {
                    console.log("writeSync() , using instance ",that.mqttInst.id, " Published on device ",dev," , a var msg ",message,",successfully to " + topic);
                    return ending( true);
                }
            });}
            else return ending( false);// cant write to unknown proto 

        }else if (this.cl == 3) {// a probe in mqttprob[i] . a prob cant write |||||||||||||||||  sodo  return true
            return ending( true);
    } else return ending( false);// return  false if error
}else return ending( null);// cant write

function ending (value) {
    that.lastwrite=value;// record last write
    console.log(' ** writesync , using instance ',that.mqttInst.id, ' for portid ',gp,', cl  ',that.cl,', is ending writinging val: ',val,', now current dev queue is : ',queue,' returning code',value);
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
    this.id= new Date().getTime();// debug 
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
   console.log('mqttClass() create a mqttInst id: ',this.id,' for plant ',this.plantName);
   }}
   //for(dev in mqttprob){
    for(let i=0;i< this.mqttprob.length;i++){
        // status[dev]=null;// queue ** su topic shellies/<model>-<deviceid>/relay if array is null means no connected 
        if(this.mqttprob[i]){let dev=this.mqttprob[i].portid;
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
        that=this;// fact generated instance

    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 
        let ctlpack= {ctl:new fc(gp,ind,inorout,cfg,that),devNumb:ind,type:'mqtt'};// depend on inorout the model cfg is different (see  mqttnumb,mqttprob in plantconfig)
                    


        return new Promise((res,rej)=>{// resolved in  a dev ctl  

            if(SubAfterPlantReq){// subscribe here not in onConnect (std )

                if(that.status[gp]){// never happens !!!!
                    // is already subscript as the subscript cb is called and set status[gp] 
                    // (a var dev cant be subscribed by more plants ! 
                    //  and also a prob/rele usually has unique topic and must be subscribed by 1 plant , usually )
                    subscred();// or  res(ctlpack);
                }else{
                if(inorout!='out')  probSubscr(cfg,that,ctlpack,subscred); /// mqttprob described device // nb added ctlpack to give more info. that = mqttInst 
                else  numbSubscr(cfg,that,ctlpack,subscred); // mqttnumb described device 
                }
            }else{// alredy tryed to subscribe in onconnect (not std )
            if(that.status[gp]){// is already subscript by numbSubscr() as the subscript cb is called and set status[gp]
                console.log(' factory is resolving the dev (',gp,') ctl as it is alredy subscribed (SubAfterPlantReq=false) ');
                res(ctlpack);
            }else{// register a resolver when the cb will come. 
                console.log(' factory set cb x a onconnection unsatisfacted subscription (SubAfterPlantReq=false) to give the dev ctl , dev:',gp);
                that.futurecb[gp]=function (){// when this func will be called (by subscription cb )we resolve giving the device ctl
                    console.log(' factory fact() , waiting for a not subscribed topic is now subscribed, so can goon to create the dev ctl: ',gp);
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



        function numbSubscr(val,that,ctlpack,subscred){// al subscribe del topic associato al dev , that=mqttInst
                                                        // difference from pubSubscr() : 
                                                        // fv3 will keep dev state into state.relais. 
                                                        // so when fv3 algo change the state writesync pub to a cmd topic to change thephisical dev value according to state.relais and 
                                                        // we dont need to check the dev output state pubs into topic if the update is done fromthisctl (writesync())
                                                        //  so in var dev  we dont even fill dev queue with fromthisctl message coming to topic
                                                        // var dev adds  a virtual cmd topic topicNodeRed that ( pubs by ext ctl)  will interrupt running a manual algo to change the state.relais state 
                                                        // only if the dev change its state alne or ext dev ctl will cll its cmd topic we find a queue value different from internal state.relais
                                                        // and we must (todo) interrupt with a specific manual algo to take care of the ext changes
                                                        
                                                        // pubSubscr() dont have state.relais , so the dev state must be read from queue (pay attention to delay from writesync)
                                                        // to avoid delay problem between write and readsync ,  .....
            // subtopic:'shelly1-34945475FE06
            if(val==null)return false;
            let { portid, varx, isprobe, clas, protocol, subtopic } = val,// val=cfg,
            cl_class;
            
            // now use std Subscribe variables for shelly 1 or shelly ht , 
            // todo in future :
            //      - will be customized using gpio set from device model config data in init() according with the type requested 
            //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))
            let topic,topicPub,topicNodeRed,// topicnodered realizza un virtual dev che comanda il dev via un cmd topic like shelly, puo essere rel o dev 
            topicNodeRedPubish;// used ?
            if (clas == 'out') {
                cl_class='rele';// rele
                if (protocol == 'shelly') {// other protocol different from shelly can have different feature ex subscriptTopic and PubTopic !
                    // RTY
                    topic = // that.topPlantPrefix+
                    shelly_stopic + subtopic + shelly_topicp;// shellies/<model>-<deviceid>/relay  must be unique in all plants
                    topicPub=shelly_stopic + subtopic + shelly_topicpp;// writesync pub to a cmd topic
                    topicNodeRed=topic+nodeRedp;// news : anche i shelly possono essere comandati con meccanismo virtual da un ext ctl come node red o openremote usando questo topic
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

                    if(topicNodeRed)client.subscribe(topicNodeRed, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing a dev var")
                        }else ;  // register a handler !
                     });

                    
        
                }else if (OR_Present&&protocol == 'ro') {;// ro protocol , any protocol will work on a specific mqtt client (connected to a specific brocker )

                    topic = // that.topPlantPrefix+
                     'futureuse';// shellies/<model>-<deviceid>/relay  must be unique in all plants
                    topicPub=subtopic;//
                    roClient.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing ro: ",err);
                        } else {
                            that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log('numbSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to ro brocker  out/rele protocol, topic: ' + topic);
                            if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                            if(subscred)subscred({topic,cl_class});
                        }
                    });
                
                } else return false;// other prococol x 'out' !!!!!!!!!!!!!!!!!!!
            }else if (!isprobe && varx != null && clas == 'var') {
                cl_class='var';
        
                if (protocol == 'mqttstate') {// var std prot
        
                    topic= that.topPlantPrefix+'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!
                    topicNodeRed=topic+nodeRedp;
                    topicNodeRedPubish=topic+nodeRedpp;
                    topicPub=null;// // writesync pub to the topic so  if not fromthisctl will fill the dev (readsync) queue
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
                            console.log("An error occurred while subscribing a dev var")
                        } else {
                            that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log('numbSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to mqttstate protocol, topic: ' + topic);
      
                            if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                            if(subscred)subscred({topic,cl_class});

//client.publish(topic, "buona sera", opt);  // send msg with testtopic topic for debug and trace in var itself a connection was asked?
                                            // >>> if the server keeps last var state we delete the current value ! 
                                            // forse e meglio mndare il msg >ctlpresent solo se dopo aver subscribed non ricevo nulla e so che sto aprendo per la prima volta questa var 
                                client.publish(topicNodeRedPubish, pub(">ctlpresent",that.plantName,portid), opt);// better send in specific sub topic 
                                //client.publish(topic, 'paolo', opt);
                                // client.publish(topic, defVar, opt);
                                //client.publish(topic, 'giovanni', opt);

                                                    // subscribe to receive  node-red cmd
                                if(topicNodeRed)client.subscribe(topicNodeRed, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                                    if (err) {
                                        console.log("An error occurred while subscribing a dev var")
                                    }else ;  // register a handler !
                                 });
                                    }
                                });
                } else return false;// error 
              
            } else return false;// end clas checks
        
            if(topic){that.mqttTop[portid]=topic;// the topic of a port
                if(invTopic[topic])log.error('numbSubscr() , error, found a device with already registered topic by someother plant !!!')
                invTopic[topic]={portid,mqttInst:that,topic,topicNodeRed,cl_class,protocol,ctlpack};};// complete cfg to easier/better dev management !
                if(topicNodeRed)invTopic[topicNodeRed]=invTopic[topic];// duplicate entry for cmd topic
            if(topicPub)that.mqttTopPub[portid]=topicPub;// register topic x publish if different from subscribe. can be null if writesync receves a null value
            return true;// ??
        }

        function probSubscr(val,that,ctlpack,subscred){

        let { portid, subtopic, varx, isprobe, clas, protocol } = val,
        topic,topicPub,cl_class,topicNodeRed,topicNodeRedPubish;

    if (!isprobe && varx != null && clas == 'var') {
        cl_class='var';// a var in mqttprob
        if (protocol == 'mqttstate') {// state persistant in mqtt server, interfaciable with node red 



            /*
            topic= that.topPlantPrefix+'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!

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

                    client.publish(topic, pub(">ctlpresent",that.plantName,portid), opt);// send msg with testtopic topic for debug

                }
            });
            */


            topic= that.topPlantPrefix+'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!
            topicNodeRed=topic+nodeRedp;
            topicNodeRedPubish=topic+nodeRedpp;

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
                    console.log("An error occurred while subscribing a dev var")
                } else {
                    that.status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                    console.log('numbSubscr() deviceid/portid ',portid,' Subscribed successfully in plant ',that.plantName,' to mqttstate protocol, topic: ' + topic);

                    if (that.futurecb[portid]) that.futurecb[portid]();// check point to goon later when we want the gp ctl 
                    if(subscred)subscred({topic,cl_class});

//client.publish(topic, "buona sera", opt);  // send msg with testtopic topic for debug and trace in var itself a connection was asked?
                                    // >>> if the server keeps last var state we delete the current value ! 
                                    // forse e meglio mndare il msg >ctlpresent solo se dopo aver subscribed non ricevo nulla e so che sto aprendo per la prima volta questa var 
                        client.publish(topicNodeRedPubish, pub(">ctlpresent",that.plantName,portid), opt);// better send in specific sub topic 
                        //client.publish(topic, 'paolo', opt);
                        // client.publish(topic, defVar, opt);
                        //client.publish(topic, 'giovanni', opt);

                                            // subscribe to receive  node-red cmd
                        client.subscribe(topicNodeRed, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                            if (err) {
                                console.log("An error occurred while subscribing a dev var")
                            } });
                            }
                        });

        } else return false;// error 

   } else if (isprobe && clas == 'probe') { 
    cl_class='probe';
        // just set the topic x the probe according to protocol 
        if (protocol == 'shelly') {
            topic='ctl_probe_' +subtopic;// according to device 
            topicPub='';// x dummy write  ??
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
        if(invTopic[topic])log.error('probSubscr() , error, found a device with already registered topic by someother plant !!!');
        invTopic[topic]={portid,mqttInst:that,topic,topicNodeRed,cl_class,protocol,ctlpack};
    };// complete cfg to easier/better dev management !
    // QUESTION : prob var dev non ha meccanismo/topic topicNodeRed ? significa che gli ext ctl banalmente scrivono sul anche loro sul topic base in cui si legge lo stato. infatti non c'e' un state.relais !!!!
    if(topicPub)that.mqttTopPub[portid]=topicPub;// register topic x publish if different from subscribe. can be null if writesync receves a null value
    return true;// ??
}

function pub(load,Plant,portid){
return JSON.stringify({payload:load,sender:{plant:Plant,user:portid}})  ;// user is really portid = dev !!!
}
function rec(msg){// recognize the payload in not signal message string
let retu;
    if(msg) {
        try {
            retu = JSON.parse(msg);// buffers has starting and stopping '  ???? so toString()
        } catch(e) {
            console.log(' rec() , on a var dev a not signal msg is not formatted as required , so return the msg itself , syntax error:',e);
           retu=null;//msg.toString(); // error in the above string (in this case, yes)!
        }

        if(retu.payload&&retu.sender)return retu;// is formatted as expected : {payload,sender}
        else return null;
    }

   // let ret=JSON.parse(msg);
    }

function  valCorrection(value){// change 0 <> 1
if(value==null||isNaN(value))return value ;
if(INVERTONOFF_RELAY)if(value==0)return 1; else return 0;

}