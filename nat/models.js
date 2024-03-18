// see models in mvc : https://progressivecoder.com/how-to-create-a-nodejs-express-mvc-application/
const fs=require('fs');// const util = require('util');
// add wuawey passw 
/*
      //"userName":"MarsonLuigi_API",
      "systemCode":"Huawei@123" // put in .env
    url='https://eu5.fusionsolar.huawei.com/thirdData/login',
*/
let cfgluigi={ plants_:['MarsonLuigi_API']},// ??
cfgs={};
const YAML = require('yaml');// npm install yaml
cfgs.cfgMarsonLuigi={ name:'MarsonLuigi_API',//run in raspberry
        apiPass:'xxxx',// to do
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      gpionumb:[16,12,19,13,6,26,0,20],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

     mqttWebSock:        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'},// must be portid=0 ! : a dummy var that creates ctl websocket topic 

      mqttnumb:[// null item means use the  gpionumb device ! 
      //{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
        null,// use gpionumb !                                                                                // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
      null,null,null,null,
             {portid:66,clas:'var',varx:4,isprobe:false,protocol:'mqttstate',subtopic:'var_split_'}, // ex of a shelly like dev . agganciato al customdevice shell per accendere gli split : custDev.66
                        // question what is difference among type 1 and 2 ? : 
                        //              -       different topic formatting type 1 
                        //              -       obbligatoriamente ha pubtopic diverso da topic e avendo un device fisico che ricopia poi il pubtopic in topic 
                        //      so type 1 devono avere pubtopic diverso da topic ed è meglio che non facciano un readSync per ricvare lo state che puo avere ritardo 
                        //                                              
                        // TODO : add also a topicPub property ?????
      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var
      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a var
      null],// mqtt device info/id/port. number is the device id to subscribe

      mqttprob:[{portid:110,subtopic:'ht-cucina',varx:null,isprobe:true,clas:'probe',protocol:'shelly'},//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'

      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'},
      {portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate'}// state var , usually portid=777
        ],

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        pythonprob:[2,4,8],// virtual modbus python probs  x : g , n , s  virtual device zones 
      relaisEv:['heat','pdc','g','n','s','split'
        ,'gaspdcPref','acs'
        ],// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref","blocco acs"]//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,true]}//{aintermediateinrelaisEv:[true,false,null,,,,]} update of virtual dev to apply if a intermediate is set true by anticipate
                        // or a function(state) returning [true,false,null,,,,]
                        // virtual pdc (index =7) is set true: appena il intermediate è true pdc e' settato e verra data priorita al acs piuttosto che al condizionamento
                        // se si vuole bloccare la acs nella partecentrale della finestra in cui gaspdcPref e' true va introdotto altre regole/array:
                        // ex : si introduce un contattore che misura i tempo di attivazione di gaspdcpref (t) e si setta pdc a t=0 e dopo le 14
                     
                        // or a function(state) returning [true,false,null,,,,]
        ,virt2realMap:[0,1,2,3,4,5,6,7],// std virtual group , map only if >=0 , some bugs: so use identity only
        // virt2realProbMap:[-1,1000,-1,1001,-1,-1,-1],// algo works on index virt2realProbMap[0] of :
        virt2realProbMap:[2,1000,-1,1001,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
                                //  mqttprob
                                //  or ( if>1000) pythonprob   
                                //  to find probs relating to :
                                //      g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //              the g temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[1]]
                                //      n , virtual index 3 of gpionumb/mqttnumb pump dev
                                //              the n temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[3]]
                                //      s  virtual index 4 of gpionumb/mqttnumb pump dev
                                // better if < 1000 : 
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob and look at virt2realProbMap whose index are so mapped :
                                //  index of virt2realProbMap > [ha state dummy var device,g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined
                                // virtualindex 0 is reserved to state pub var dev on mqttprob[virtualindex[0]]

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:6,
        huawei:{inv:"1000000035350464",bat:"1000000035350466"},// devid bunis 

        custDev: {// exported custom devices (defined in this server, fv3 ) cmd ctl triggered by a writesync() on a regular dev 
                  // nb in future custDev could be put  in ws client config , like is done  for custom device realized in ha (custF) , see GGDD 
                  // nb if portid is gpio this customer will access to raspberry resources ! only 1 can usually !

                  // nb     - some dev ( gpionumb, mqttnumb, mqttprob) in any plant running on fv3 service can access to raspberry resources by this customFunc ! only 1 can usually !
                  //        - if dev = null (gpio dev not null with a mqttnumb null,  in a no raspberry service server ) cant have a custDev !
                  //        - mqtt dev can also access to custom func via custF  but in this case custF is defined  inside mqttnumb, mqttprob


                66: custDev_2// custDev_1 is old.   
                /*
               , 10001: async function (incomVal,rs485,param,exec,relais) {// start he a custom device type prob. 
                                                                        // can be sync ??
                                                                    // use a type 4 mqttprob var that insert in topic the val : a json with probes val extracted by some script
                                                                    // according with the optional incoming value params  set by fv3 algos
                                                                    // if we are using  rpi gpio ....
                                                                    // the other method to insert custom prob was the modbus sensor that was implemented  in fv3 algo using some config by models.js
                                                                    // see in fv3  : async function shellcmd(sh,param){// param={addr:'notte',val:18}
            
            
                    let inputgpio=relais[0];
                    let dummy=11.11;
                    incomVal.custProbeVal=dummy;// 
            
                }*/
            }

        };

//custDev_1= // to review, see custDev_2
        async function custDev_1(set_v = 0 ,rs485,param={custSet:1,quiet:false,section:false},exec,relais) {// state value are inverted , inversion active:  0<>1.
          // better set exec and relais with init()
          // relais is a array with fixed gpio input ctl, used to set type 4 var topic:
          //      during a writesync we add to msg info about the sensor relais
          // rs485 is a string to use in modbud custom dev 
          // param values come from browser attributes to modify the command to send to modbus: todo
// this ctl will start stop all splits by modbus ctl
// param=param||{quiet:false,section:false};
let set_,quite=param.quiet,section=param.section;
if (custSet == 1) set_ = '0'; else set_ = '1';// invert 0 <> 1 
const adds = ['2', '3', '4'];// all addresses 
const adds1 = ['2', '3'];// section true
console.log(' getio.js, on portid=66 writeSync() force a customdev write with param ', set_);
//adds.forEach((val, ind) => {
let  stderr_ ,myadds=adds;// all

if(section)            myadds=adds1;
await runFull(myadds,set_);

async function runFull(adds,val){
await runMc(adds,' 4188 ',val);
if(val='1'){
if(quite)await runMc(adds,' 4190 ','1');
else await runMc(adds,' 4190 ','3');
}
}

async function runMc(adds,mc,val){// adds : list od address,mc: modbus command, val : 0/1
for (let i = 0; i < adds.length; i++) {

let myexec = cmd(adds[i],mc,val);
console.log(' getio.js, on portid=66 writeSync() ,i:',i,' adds[i]: ',adds[i],' myexec:',myexec);
if (myexec)

// let ptest = new Promise.resolve(5);
stderr_ = await runP(myexec, i).catch(erro => { 
console.error('getio(), cant get split cmd: ',mc,', addreess: ', adds[i], ' error: ', erro); });// in case aiax fire error and be rejected ;;
//console.log(' getio() , shellcmd n. ',i,' resolved in : ', stderr_, ' cioe ${stderr}');
console.log(' getio.js, on portid=66 writeSync() promise runned');
};
}

function cmd(addr,waction,value) {// ' 4188 ':on/off split. build shell command
let myexec = 'python3 ' + rs485 + ' w ' + addr+waction ;
// if (set_ == 1) myexec += '1'; else myexec += '0';
myexec +=value;
myexec += ' >> resultrs384.txt';
console.log(' executing cmd: ', myexec);
return myexec;
}

function runP(myexec, i) {

return new Promise(function (resolve, reject) {// dont need resolve vel
console.log(' getio.js, on portid=66 writeSync() : promise: i: ',i,' myexec:',myexec);
// setTimeout(function(){// unresponsive shell cmd 
exec(myexec, // is async with cb. is there a sync version ????  ?????  ?????
(error, stdout, stderr) => {
console.log(' executing shell: ', stdout, ` cioe ${stdout}`);
console.log(' std error is ', stderr);
if (error !== null) {
console.log(`exec error: ${error}`);
reject(error);
}
else {
//if (Number.isNaN(Number(stderr))) {// std error should be a string number ??
console.log(' getio() , shellcmd  n. ', i, ' returned : ', stderr, ` cioe ${stderr}`);
resolve(stderr);// resolve with std error, test results can be a string numb

//} else reject(' cant get split on/off');
}
})
//},500);

});
}
}

cfgs.cfgMarsonLuigi_haws={ name:'MarsonLuigi_API_haws',// testing : run in no raspberry using haws. for a template see plant casinauser1_API (a generated plant cfg for haws interface )in json format in haPlants
        apiPass:'xxxx',// to do
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
        gpionumb:[ null,null,null,null, null,null,null,null],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 
        usingMqtt:false,// this plant dont use client mqtt to mqtt std broker. 

          // todo: insert on every dev : client:'haWebSoc',

        mqttWebSock:        {
          portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock',
          client:'haWebSoc',// use ws client to connecto to ha 
          haManButton:[['input_button.start_savingservice','repeatcheckxSun'],// >>> entity start_savingservice firing event repeatcheckxSun, on url related to cmdtopic 
          //      event handler will use some other  ha entities to build the msg that could be specified here 
                      ['input_button.stop_savingservice','stopcheckxSun'],
                      ['input_button.start_progservice','repeatcheckxPgm'],
                      ['input_button.stop_progservice','stopcheckxPgm']


                      /*
                      nb see the comment in hawsclient.js :

                      >>>>> attenzione qui si usano i button per sparare i cmdtopic, def in function defFVMng(user,plant,localEntity) in models.js 
                      tuttavia in interface si sono aggiunti anche dei automation che al trigger degli entity sparano un event
                      nel caso di problemi si potra usare tali event per sparare i cdmtopic al posto dei button entity . 

                      */
                      ]
        
        },// must be portid=0 ! : a dummy var that creates ctl websocket topic 

      mqttnumb:[// same dim as gpionumb 
                 {client:'haWebSoc',// use ws client to connecto to ha 
                  portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06',// clas 'out' or 'var' , same dim than gpionumb
                  client:'haWebSoc',// use ws client to connecto to ha (so use haEntity,,,,,,), otherwise use http client to connest the alredy casina configured ha
                  // so clone of casina can be configured with all null items, because the ha install is the same but in diferent user plant (only user data , token and tcp address is different than casina)
                  haEntity:'switch.casinauser1_rssi'
                  ,haManButton:[//  this non depend on cust def entity so just put in the constructor
                  ['input_button.setmanual_rssi_on_but','on'],// >>> entity setmanual_rssi_on_but firing event on, on url related to cmdtopic 
                  ['input_button.setmanual_rssi_off_but','off']
                
                ] 
                },                                                                     // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
                // {portid:11,clas:'out',protocol:'ro',subtopic:'master/client123/writeattributevalue/writeAttribute/3fkopVxPrC3Cz7u5GqztUR'},// test x remoteo

                // on protocol 'or' subtopic is the topic (dev state ) listened from or . like shelly does this is the   result , delayed, of 
                // the cmd topic (shelly is topic+'/command') that can be published by :
                //      - this app as result of a writesync
                //      - node-red or or pubs 
                // in or protocol, we can do :
                //      subtopic can be the shelly relay topic , subscribed by this app as usual, and by or  as external brocker subscription
                //      varx can be  the shelly command topic published by this app, as usual ,  and  by or  as external brocker pub
                //   nb remain still to lauch interrupt in receiving message handler when we receive from subscribe a dev state diffenent from relais that is the state of dev as proposed by app writeSync ! 
                //      as already  defined we do 
                
                null,null,null,null,

                //null, now on behalf add:
                {portid:66,clas:'var',varx:4,isprobe:false,protocol:'mqttstate',subtopic:'var_split_',
                client:'haWebSoc'}, 

      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var
      { client:'haWebSoc',// use ws client to connecto to ha 
        portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'
        ,
        haEntity:'input_text.optimizing_fv',// var gas/pdc, anticipate . ha un entity text e un cmd topic setMan on e off 
        haManButton:[['input_button.start_ensavings','on'],// ha entity firing event on url related to cmdtopic :setMan
        ['input_button.stop_ensavings','off'],// todo:  add std event on , off
         ],
         custF:function (msg,topic,state){    // is like custDev[portid]  but works on wsclient to goto ha.  GGDD 
                                    // returns actions to start with turn on/off a local switch or fire some events triggered by local automation ( or insert on configurationuser.yaml ?)
                                    //  actions={ent:[[entname,newval,newattr]],events:[[eventN,attr,attrVal]],,,]}. state={customParam,,,,}
                                    //,state)}// nb if we need we can also get here state oby that is full state info, so better that an extract put already in msg.payload.state:
                                    //    msg, if  std format for type 2,4 (nod dev 777 that set payload an obj )will be :
                                    //                                {payload:0/1,sender:{plant:Plant,user:portid}}
          let payload=msg.payload,
          scaldabagno;
          if(state.customParam)scaldabagno=state.customParam.scaldabagno;// can be null , set when start program algo in GGSS .
                                                                          // the custF customParam usually is set when in browser we fire the pgm algo handler. 
                                                                          // these params are used to activate scaldabagno. ex: switch entity and allowed hours
          if(scaldabagno){// se il parametri (state.customParam.scaldabagno) per questo custF sono stati impostati all'avvio del algo program, setto la action che sara eseguita sui seguenti entity/event di ha
           //  let ent=scaldabagno.ent;ent=ent||'switch.scaldab';// def if not present in starting program form
            if(msg.payload==1){// the dev val
              //return {ent:[ent,'on',{temp:50,inthour:scaldabagno.hours}]};// accendi switch.scaldabagno con attributo temp di 50 gradi
             return {events:[[scaldabagno.event,scaldabagno.attName,scaldabagno.attVal]]};// meglio fire a event with inthour as param/attribute/val :

          }else return {events:[[scaldabagno.event0]]};//reset . {ent:[ent,'off',null]};
        }
  
  
         }


      },// a type 2 var
        {         /*  this non depend on cust def entity so just put in the constructor
        haManButton:      
                    [['input_button.setmanual_acs_on_but','on'],// todo : ha entity firing event on url related to cmdtopic :setMan
                    ['input_button.setmanual_acs_off_but','off']
                    ],*/
      client:'haWebSoc',
      haEntity:'switch.casinauser1_acssw',
      portid:12,clas:'out',protocol:'shelly',subtopic:'_shelly1-34945475FE06',// not acs  type 1 dev , the fv3 mqtt dev data. as client:'haWebSoc' the connection to ha entity is via ws and not mqtt
      haManButton:[['input_button.setmanual_acs_on_but','on'],//    this non depend on cust def entity so just put here in the constructor
      ['input_button.setmanual_acs_off_but','off']
      ]
    
    }
    ],// mqtt device info/id/port. number is the device id to subscribe

      mqttprob:[{portid:110,subtopic:'ht-cucina',varx:null,isprobe:true,clas:'probe',protocol:'shelly',
      client:'haWebSoc',
      haEntity:'sensor.casinauser1_shelly_ht_temp'
    },//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'

      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate',
      client:'haWebSoc'},
 
      {client:'haWebSoc',
      portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate',
      state:[
        // >>>>>>>>>  il func returned by setSwitch fillera le entity !  .    this non depend on cust def entity so just put here in the constructor
        // - remember the msg built in QQIIJJ of ioreadwritestatus.js is :
        //                                {"payload":{"state":{"anticipate":true,"program":true,"battery":1,"inverter":0,"desTemp":20,
        //                                                      "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}
        //                                                      }
        //                                  },
        //                                 "sender":{"plant":"Casina_API","user":777}}

        // this var dev will send a msg (see in QQIIJK of hawsclient.js) to set different ha entities ( different from haEntity is the ent to write the new dev values extracted from the std format for a var msg (payload))
        //    - if .[0]=state.x : the msg.payload.state.x value is used to set the entity .[1]
        //    - if .[0]=sender.user   >  write to entity .[1] ON/OFF depending on msg.sender.user value 

        ['state.battery','input_number.battery'],// * put battery value in entity input_number.battery !
        ['state.inverter','input_number.inverter'],// *
        ['state.desTemp','input_number.desTemp'],// *
        // [state.relays.acs,'input_text.acs'],  // * forse già usato solo come entity di acs pump: so useless 
        ['state.anticipate','input_text.opirun'],// * convertite true/false > 'ON'/'OFF'
        ['state.program','input_text.pgmrun'],// * convertite true > 'ON'
        // nbnb : ['sender.user', ....     non presently used because there is not entity ...opt_service1  !!
        ['sender.user','input_text.opt_service1'],// *
        ['sender.user','input_text.opt_service'],// * todo debug its value setting , 
      ],
      custF:function (msg,topic,state){     // 777: this custF is used when we must do action on some switch or fire some automation that depends on many dev value
                                            //        AND the dev is 777 (so the func is called when we writeSync on dev 777 that is when we complete a program algo iteration)
                                            //  nb we could also use state on a normal dev custF , but writeSync is called when that dev is updated 
                                            //  so we calc actions from all state var !
        // returns actions to start with turn on/off a local switch or fire some events triggered by local automation ( or insert on configurationuser.yaml ?)
        //  actions={ent:[[entname,newval,newattr]],events:[[eventN,attr,attrVal]],,,]}. state={customParam,,,,}
        //,state)}// nb if we need we can also get here state oby that is full state info, so better that an extract put already in msg.payload.state:
        //    msg, for 777 dev type 4   std format will be as above , 
        //          so for example dev state (relays) can be get : msg.payload.state.relays.devName
        //          but can also easyly got from state.relays.devName !!
        //                                
                // do not use msg, just state ! , state.customParam are not used  !
                let main=!state.relays.acs||state.relays.heat;// heat or not block acs
                return {events:[['prgm_state_main',null,main]]};// meglio fire a event with inthour as param/attribute/val :
                }
    
    
    
    
    }
    
    ],// a var

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        pythonprob:[2,4,8],// virtual modbus python probs  x : g , n , s  virtual device zones temperatures
      relaisEv:['heat','pdc','g','n','s','split'
        ,'gaspdcPref','acs'
        ],// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref","blocco acs"]//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,true]}//{aintermediateinrelaisEv:[true,false,null,,,,]} update of virtual dev to apply if a intermediate is set true by anticipate
                        // or a function(state) returning [true,false,null,,,,]
                        // virtual pdc (index =7) is set true: appena il intermediate è true pdc e' settato e verra data priorita al acs piuttosto che al condizionamento
                        // se si vuole bloccare la acs nella partecentrale della finestra in cui gaspdcPref e' true va introdotto altre regole/array:
                        // ex : si introduce un contattore che misura i tempo di attivazione di gaspdcpref (t) e si setta pdc a t=0 e dopo le 14

                        // or a function(state) returning [true,false,null,,,,]
        ,virt2realMap:[0,1,2,3,4,5,6,7],// std virtual group , map only if >=0 , some bugs: so use identity only
        //virt2realProbMap:[-1,1000,-1,1001,-1,-1,-1],// algo works on index virt2realProbMap[0] of :
        virt2realProbMap:[3,-1,-1,-1,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
                                //  mqttprob
                                //  or ( if>1000) pythonprob   
                                //  to find probs relating to :
                                //      g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //              the g temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[1]]
                                //      n , virtual index 3 of gpionumb/mqttnumb pump dev
                                //              the n temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[3]]
                                //      s  virtual index 4 of gpionumb/mqttnumb pump dev
                                // better if < 1000 : 
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob and look at virt2realProbMap whose index are so mapped :
                                //  index of virt2realProbMap > [ha state dummy var device,g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined
                                // virtualindex 0 is reserved to state pub var dev on mqttprob[virtualindex[0]]

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:6,
        huawei:{inv:"1000000035350464",bat:"1000000035350466"},// devid bunis 

        custDev: {// exported custom devices cmd ctl triggered by a writesync() on a regular dev 
              // nb custDev[portid] is similar to custF , see GGDD 

                // nb     - some dev ( gpionumb, mqttnumb, mqttprob) in any plant running on fv3 service can access to raspberry resources by this customFunc ! only 1 can usually !
                //        - if dev = null (gpio dev in a no raspberry service server ) cant have a custDev !
                //        - mqtt dev can also access to custom func via custF  but in this case custF is defined  inside mqttnumb, mqttprob

                66:           // dev portid. param is set in getio usually is state.relays_Attr[5]
                custDev_2     // 

        }
        /*
, 10001: async function (incomVal,rs485,param,exec,relais) {// start he a custom device type prob. 
      // can be sync ??
  // use a type 4 mqttprob var that insert in topic the val : a json with probes val extracted by some script
  // according with the optional incoming value params  set by fv3 algos
  // if we are using  rpi gpio ....
  // the other method to insert custom prob was the modbus sensor that was implemented  in fv3 algo using some config by models.js
  // see in fv3  : async function shellcmd(sh,param){// param={addr:'notte',val:18}


let inputgpio=relais[0];
let dummy=11.11;
incomVal.custProbeVal=dummy;// 

}*/
}  ;
cfgs.cfgMarsonLuigi_={ name:'MarsonLuigi_API_',// run in no raspberry no ws ha
        apiPass:'xxxx',// to do
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
        gpionumb:[ null,null,null,null, null,null,null,null],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 
        mqttWebSock:        {
          portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'

        
        },// must be portid=0 ! : a dummy var that creates ctl websocket topic 

      mqttnumb:[// same dim as gpionumb 
                 {//client:'haWebSoc',// use ws client to connecto to ha 
                  portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
                                                                                        // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
                // {portid:11,clas:'out',protocol:'ro',subtopic:'master/client123/writeattributevalue/writeAttribute/3fkopVxPrC3Cz7u5GqztUR'},// test x remoteo

                // on protocol 'or' subtopic is the topic (dev state ) listened from or . like shelly does this is the   result , delayed, of 
                // the cmd topic (shelly is topic+'/command') that can be published by :
                //      - this app as result of a writesync
                //      - node-red or or pubs 
                // in or protocol, we can do :
                //      subtopic can be the shelly relay topic , subscribed by this app as usual, and by or  as external brocker subscription
                //      varx can be  the shelly command topic published by this app, as usual ,  and  by or  as external brocker pub
                //   nb remain still to lauch interrupt in receiving message handler when we receive from subscribe a dev state diffenent from relais that is the state of dev as proposed by app writeSync ! 
                //      as already  defined we do 
                
                null,null,null,null,null,
      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var
      { //client:'haWebSoc',// use ws client to connecto to ha 
        portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a type 2 var
      null],// mqtt device info/id/port. number is the device id to subscribe

      mqttprob:[{portid:110,subtopic:'ht-cucina',varx:null,isprobe:true,clas:'probe',protocol:'shelly'},//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'

      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'}],// a var

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        pythonprob:[2,4,8],// virtual modbus python probs  x : g , n , s  virtual device zones temperatures
      relaisEv:['heat','pdc','g','n','s','split'
        ,'gaspdcPref','acs'
        ],// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref","blocco acs"]//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,true]}//{aintermediateinrelaisEv:[true,false,null,,,,]} update of virtual dev to apply if a intermediate is set true by anticipate
                        // or a function(state) returning [true,false,null,,,,]
                        // virtual pdc (index =7) is set true: appena il intermediate è true pdc e' settato e verra data priorita al acs piuttosto che al condizionamento
                        // se si vuole bloccare la acs nella partecentrale della finestra in cui gaspdcPref e' true va introdotto altre regole/array:
                        // ex : si introduce un contattore che misura i tempo di attivazione di gaspdcpref (t) e si setta pdc a t=0 e dopo le 14

                        // or a function(state) returning [true,false,null,,,,]
        ,virt2realMap:[0,1,2,3,4,5,6,7],// std virtual group , map only if >=0 , some bugs: so use identity only
        //virt2realProbMap:[-1,1000,-1,1001,-1,-1,-1],// algo works on index virt2realProbMap[0] of :
        virt2realProbMap:[3,-1,-1,-1,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
                                //  mqttprob
                                //  or ( if>1000) pythonprob   
                                //  to find probs relating to :
                                //      g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //              the g temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[1]]
                                //      n , virtual index 3 of gpionumb/mqttnumb pump dev
                                //              the n temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[3]]
                                //      s  virtual index 4 of gpionumb/mqttnumb pump dev
                                // better if < 1000 : 
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob and look at virt2realProbMap whose index are so mapped :
                                //  index of virt2realProbMap > [ha state dummy var device,g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined
                                // virtualindex 0 is reserved to state pub var dev on mqttprob[virtualindex[0]]

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:6,
        huawei:{inv:"1000000035350464",bat:"1000000035350466"},// devid bunis 

        custDev: {// exported custom devices cmd ctl triggered by a writesync() on a regular dev 
              // nb custDev[portid] is similar to custF , see GGDD 

                // nb     - some dev ( gpionumb, mqttnumb, mqttprob) in any plant running on fv3 service can access to raspberry resources by this customFunc ! only 1 can usually !
                //        - if dev = null (gpio dev in a no raspberry service server ) cant have a custDev !
                //        - mqtt dev can also access to custom func via custF  but in this case custF is defined  inside mqttnumb, mqttprob

                66:           // dev portid. param is set in getio usually is state.relays_Attr[5]
                custDev_2     // 

        }
        /*
, 10001: async function (incomVal,rs485,param,exec,relais) {// start he a custom device type prob. 
      // can be sync ??
  // use a type 4 mqttprob var that insert in topic the val : a json with probes val extracted by some script
  // according with the optional incoming value params  set by fv3 algos
  // if we are using  rpi gpio ....
  // the other method to insert custom prob was the modbus sensor that was implemented  in fv3 algo using some config by models.js
  // see in fv3  : async function shellcmd(sh,param){// param={addr:'notte',val:18}


let inputgpio=relais[0];
let dummy=11.11;
incomVal.custProbeVal=dummy;// 

}*/
}        

    async function custDev_2(set_v = 0 ,rs485,state,exec,relais) {// state value are inverted , inversion active:  0<>1.
          // better set exec and relais with init()
          // relais is a array with fixed gpio input ctl, used to set type 4 var topic:
          //      during a writesync we add to msg info about the sensor relais
          // rs485 is a string to use in modbud custom dev 
          // param values come from browser attributes to modify the command to send to modbus: todo
// this ctl will start stop all splits by modbus ctl

let index=5,// warning , portid 66 is number 5 name is split 
param;
if(state.relays_Attr&&state.relays_Attr[5])param=state.relays_Attr[5];
else param={custSet :0,quiet:false,section:false};
let set_,quite=param.quiet,section=param.section;
if (custSet == 1) set_ = '0'; else set_ = '1';// invert 0 <> 1 
const adds = ['2', '3', '4'];// all addresses 
const adds1 = ['2', '3'];// section true
console.log(' getio.js, on portid=66 writeSync() force a customdev write with param ', set_);
//adds.forEach((val, ind) => {
let  stderr_ ,myadds=adds;// all

if(section)            myadds=adds1;
await runFull(myadds,set_);

async function runFull(adds,val){
await runMc(adds,' 4188 ',val);
if(val='1'){
if(quite)await runMc(adds,' 4190 ','1');
else await runMc(adds,' 4190 ','3');
}
}

async function runMc(adds,mc,val){// adds : list od address,mc: modbus command, val : 0/1
for (let i = 0; i < adds.length; i++) {

let myexec = cmd(adds[i],mc,val);
console.log(' getio.js, on portid=66 writeSync() ,i:',i,' adds[i]: ',adds[i],' myexec:',myexec);
if (myexec)

// let ptest = new Promise.resolve(5);
stderr_ = await runP(myexec, i).catch(erro => { 
console.error('getio(), cant get split cmd: ',mc,', addreess: ', adds[i], ' error: ', erro); });// in case aiax fire error and be rejected ;;
//console.log(' getio() , shellcmd n. ',i,' resolved in : ', stderr_, ' cioe ${stderr}');
console.log(' getio.js, on portid=66 writeSync() promise runned');
};
}

function cmd(addr,waction,value) {// ' 4188 ':on/off split. build shell command
let myexec = 'python3 ' + rs485 + ' w ' + addr+waction ;
// if (set_ == 1) myexec += '1'; else myexec += '0';
myexec +=value;
myexec += ' >> resultrs384.txt';
console.log(' executing cmd: ', myexec);
return myexec;
}

function runP(myexec, i) {

return new Promise(function (resolve, reject) {// dont need resolve vel
console.log(' getio.js, on portid=66 writeSync() : promise: i: ',i,' myexec:',myexec);
// setTimeout(function(){// unresponsive shell cmd 
exec(myexec, // is async with cb. is there a sync version ????  ?????  ?????
(error, stdout, stderr) => {
console.log(' executing shell: ', stdout, ` cioe ${stdout}`);
console.log(' std error is ', stderr);
if (error !== null) {
console.log(`exec error: ${error}`);
reject(error);
}
else {
//if (Number.isNaN(Number(stderr))) {// std error should be a string number ??
console.log(' getio() , shellcmd  n. ', i, ' returned : ', stderr, ` cioe ${stderr}`);
resolve(stderr);// resolve with std error, test results can be a string numb

//} else reject(' cant get split on/off');
}
})
//},500);

});
}
}

cfgs.cfgCasina={ name:'Casina_API',// duplicated FFGG
        apiPass:'xxxx',// to do, better use .env
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
        gpionumb:[ null,null,null,null, null,null,null,null],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

        mqttWebSock:        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'},// must be portid=0 ! : a dummy var that creates ctl websocket topic 
                                                                                                                        // todo >>>> must be added a user/token release process or implement a broker security by clientid
      //mqttnumb:[{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
     // correct: 
      mqttnumb:[
        // {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475F7DE'},// clas 'out' or 'var' , same dim than gpionumb
                                                                                        // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
        {portid:11,clas:'out',protocol:'shelly',subtopic:'_shelly1-34945475FE06'},// for test only
       null,null,null,null,
       {portid:66,clas:'var',varx:4,isprobe:false,protocol:'mqttstate',subtopic:'var_split_'}, // ex of a shelly like dev . agganciato al customdevice shell per accendere gli split 
                        // question what is difference among type 1 and 2 ? : 
                        //              -       different topic formatting type 1 
                        //              -       obbligatoriamente ha pubtopic diverso da topic e avendo un device fisico che ricopia poi il pubtopic in topic 
                        //      so type 1 devono avere pubtopic diverso da topic ed è meglio che non facciano un readSync per ricvare lo state che puo avere ritardo 
                        //                                              
                        // TODO : add also a topicPub property ?????
      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var
      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a var
      {portid:12,clas:'out',protocol:'shelly',subtopic:'_shelly1-34945475FE06'}],// mqtt device info/id/port. number is the device id to subscribe


      mqttprob:[{portid:110,subtopic:'_shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_t'},//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'

        {portid:111,subtopic:'_shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_h'},


      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'},
        // {portid:77,clas:'var',protocol:'mqttstate',subtopic:'shelly1-666666666666'}

        {portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate'},// state var , usually portid=777

        ],// a var
        

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        pythonprob:[2,4,8],// virtual modbus python probs  x : g , n , s  virtual device zones 
      relaisEv:['heat','pdc','g','n','s','split'
        ,'gaspdcPref','acs'],// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref",
        "blocco acs"]//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,true]}//{aintermediateinrelaisEv:[true,false,null,,,,]}
                                                                                // or a function(state) returning [true,false,null,,,,]
        ,virt2realMap:[0,1,2,3,4,5,6,7],// std virtual group , map only if >=0 , some bugs: so use identity only
        virt2realProbMap:[3,0,1,-1,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
                                //  mqttprob
                                //  or ( if>1000) pythonprob   
                                //  to find probs relating to :
                                //      g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //              the g temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[1]]
                                //      n , virtual index 3 of gpionumb/mqttnumb pump dev
                                //              the n temp prob is got by a python shell referring to address pythonprob[virt2realProbMap[3]]
                                //      s  virtual index 4 of gpionumb/mqttnumb pump dev
                                // better if < 1000 : 
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob and look at virt2realProbMap whose index are so mapped :
                                //  index of virt2realProbMap > [ha state dummy var device,g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined
                                // virtualindex 0 is reserved to state pub var dev on mqttprob[virtualindex[0]]

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:5,
         huawei:{inv:"1000000036026833",bat:"1000000036026834"}// devid casina
        //huawei:{inv:"1000000035350464",bat:"1000000035350466"}// devid bunis 

        };
cfgs.cfgDefFVMng={ name:'cfgDefFVMng',// duplicated FFGG. now better use constructor addUserPlant()
        apiPass:'xxxx',// to do, better use .env
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
        gpionumb:[ null,null,null,null, null,null,null,null],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

        mqttWebSock:        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'},// must be portid=0 ! : a dummy var that creates ctl websocket topic 
                                                                                                                        // todo >>>> must be added a user/token release process
      //mqttnumb:[{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
     // correct: 
      mqttnumb:[
        // {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475F7DE'},// clas 'out' or 'var' , same dim than gpionumb
                                                                                        // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
        {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// for test only
       null,null,null,null,
       {portid:66,clas:'var',varx:4,isprobe:false,protocol:'mqttstate',subtopic:'var_split_'}, // ex of a shelly like dev . agganciato al customdevice shell per accendere gli split 
                        // question what is difference among type 1 and 2 ? : 
                        //              -       different topic formatting type 1 
                        //              -       obbligatoriamente ha pubtopic diverso da topic e avendo un device fisico che ricopia poi il pubtopic in topic 
                        //      so type 1 devono avere pubtopic diverso da topic ed è meglio che non facciano un readSync per ricvare lo state che puo avere ritardo 
                        //                                              
                        // TODO : add also a topicPub property ?????
      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var
      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a var
      null],// mqtt device info/id/port. number is the device id to subscribe


      mqttprob:[{portid:110,subtopic:'shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_t'},//a probe,  the shelly ht probes to register (read only) 
      // nbnb clas e isprobe sono correlati !! > semplificare !
      // clas='var'/'probe'or 'in'

                {portid:111,subtopic:'shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_h'},


      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'},
        // {portid:77,clas:'var',protocol:'mqttstate',subtopic:'shelly1-666666666666'}
        {portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate'}
        ],// a var

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        pythonprob:[2,4,8],// virtual modbus python probs  x : g , n , s  virtual device zones 
      relaisEv:['heat','pdc','g','n','s','split'
        ,'gaspdcPref','acs'],// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref",
        "blocco acs"]//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,false]}//{aintermediateinrelaisEv:[true,false,null,,,,]}
                                                                                // or a function(state) returning [true,false,null,,,,]
        ,virt2realMap:[0,1,2,3,4,5,6,7],// std virtual group , map only if >=0 , some bugs: so use identity only
        virt2realProbMap:[3,0,1,-1,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
                                //  mqttprob
                                //  or ( if>1000) pythonprob   
                                //  to find probs relating to g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //  virtual index 3 is the same but relating to n , virtual index 3 of gpionumb/mqttnumb pump dev
                                // better:
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob index of :[g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined

                                // virtualindex 0 is reservet to state pub var dev in 

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:5,
        huawei:{inv:"1000000036026833",bat:"1000000036026834"}// devid

        };

let  haPlants,// ha added plants 
plants={MarsonLuigi_API:{cfg:cfgs.cfgMarsonLuigi,// will be put in state.app.plant
                name:"MarsonLuigi_API",// duplicated FFGG
                passord:"marson",// not used 
                users:['john'],
                token:['123'],// really token has a client and a permission to act on some data/process
                email:'luigi.marson@gmail.com'
                },
        MarsonLuigi_API_:{cfg:cfgs.cfgMarsonLuigi_,// will be put in state.app.plant
                name:"MarsonLuigi_API_",// duplicated FFGG
                passord:"marson",// not used 
                users:['john'],
                token:['123'],// really token has a client and a permission to act on some data/process
                email:'luigi.marson@gmail.com'
                },
        MarsonLuigi_API_haws:{cfg:cfgs.cfgMarsonLuigi_haws,// will be put in state.app.plant
                name:"MarsonLuigi_API_haws",// duplicated FFGG
                passord:"marson",// not used 
                users:['john'],
                token:['123'],// really token has a client and a permission to act on some data/process
                email:'luigi.marson@gmail.com'
                },
        DefFVMng_API:{  cfg:cfgs.cfgDefFVMng,// better now use addUserPlant()
                name:"DefFGMng_API",// duplicated FFGG
                passord:"marson",// not used 
                users:['john'],
                token:['123'],// really token has a client and a permission to act on some data/process
                email:'luigi.marson@gmail.com'
                },
           Mirco1_API:{cfg:cfgs.cfgMarsonLuigi,// will be put in state.app.plant
                name:"Mirco1_API",// duplicated FFGG
                passord:"marson",
                users:['mirco1'],
                token:['xyz'],
                email:'luigi.marson@gmail.com'
                },
          Casina_API:{cfg:cfgs.cfgCasina,// will be put in state.app.plant
                name:"Casina_API",// duplicated FFGG
                passord:"marson",
                users:['irene'],
                token:['abc'],
                email:'luigi.marson@gmail.com'
                }       
};

let plantbytoken={};

function updatePBT(){// update plantbytoken
plantbytoken={};
for(let pl in plants){
        plantbytoken[plants[pl].token[0]]=pl;

}}

updatePBT();




function getcfg(plant){// // general obj to customize the  app :functions, generator (ejs) ,,,,, 
            return plants[plant].cfg;
        }
function getplant(plant){
        /*
            let usr={user:plants[plant].name,password:plants[plant].password,email:plants[plant].email};
                usr.cfg=plants[plant].cfg;
                return usr;
                */
               return plants[plant];
        }
function getconfig(plant='MarsonLuigi_API'){// =plantconfig, general obj to customize the  app functions 
                                // or let{gpionumb,mqttnumb,relaisEv,devid_shellyname}=models.getconfig(plant)=.state.plantconfig;
                                //     after set state.app we can :  let{gpionumb,mqttnumb,mttprob,relaisEv,plantName}=plantconfig (=.state.app.plantconfig=
                return {gpionumb:plants[plant].cfg.gpionumb,
                        mqttnumb:plants[plant].cfg.mqttnumb,
                        mqttprob:plants[plant].cfg.mqttprob,
                        pythonprob:plants[plant].cfg.pythonprob,
                        mqttWebSock:plants[plant].cfg.mqttWebSock,
                        relaisEv:plants[plant].cfg.relaisEv,
                        anticInterm2VirtMap:plants[plant].cfg.anticInterm2VirtMap,
                        relaisDef:plants[plant].cfg.relaisDef,
                        virt2realMap:plants[plant].cfg.virt2realMap,
                        virt2realProbMap:plants[plant].cfg.virt2realProbMap,
                        huawei:plants[plant].cfg.huawei,
                        invNomPow:plants[plant].cfg.invNomPow,
                        plantName:plant,//  >>>>>> WARNING  little difference !!!!
                        custDev:plants[plant].cfg.custDev,
                        Ent_Prefix:plants[plant].cfg.Ent_Prefix,
                        connCfg:plants[plant].cfg.connCfg
                        // devid_shellyname:plants[plant].cfg.devid_shellyname,
                       // error :  relaisEv:plants[plant].cfg.mqttprob
                }
            }

// ejs generator contexts
function ejscontext(plant){
        let cont={};// ejs context=ejscontext(plant).pumps=[{id,title},,,,]
cont.pumps=getprods(plant);
return cont;
}

function getprods(plant){// prepare the context to expand the plant relais in web page
        if(plants[plant]&&plants[plant].cfg){
let relaisEv=plants[plant].cfg.relaisEv,
titles=plants[plant].cfg.titles;
let prods=[];
if(titles&&relaisEv&&titles.length==relaisEv.length)
        relaisEv.forEach((val,ind)=>{
                prods.push({id:val,
                        title:titles[ind]
                });
        });
else    prods=null;

// ? prods=prods_||prods;// prefer downloaded json 
// ? prods.forEach((pump, ind) =>{pump[ind].id=relaysEv[ind]});
return prods;
}else return null;
}


function defFVMng(user,plant,localEntity)//,replE)// default=casina class plant factory. copyed from casina, factory of a std plant template of FV app . now called by addUserPlant
                                          // localEntity will set local user specific hw entity, ex :numbmqtt and probmqtt : haEntity,haManButton 
                                          //  haEntity will set ,haManButton 
{       // plant=user+'_API',
    this.connCfg=localEntity.connCfg;// get conn param x haws

      const Ent_Prefix=localEntity.Ent_Prefix;// =replE;//=plant+'_';// the entity prefix to add to ha template config in : ./haCfg/defFVMng/package/energyEngineService. '' to add nothing
       this.Ent_Prefix=Ent_Prefix;                       // IUOO 
       this.name=plant;// duplicated FFGG
       this.apiPass='xxxx';// to do, better use .env
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      this.gpionumb=[ null,null,null,null, null,null,null,null];// useless here
      // (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

        this.mqttWebSock=        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock',
                                  // see in hawsclient at HHGG
                                  haManButton:[['input_button.'+Ent_Prefix+'start_savingservice','repeatcheckxSun'],// >>> entity start_savingservice firing event repeatcheckxSun, on url related to cmdtopic 
                                                                                                                    //      event handler will use some other  ha entities to build the msg that could be specified here 
                                  ['input_button.'+Ent_Prefix+'stop_savingservice','stopcheckxSun'],
                                  ['input_button.'+Ent_Prefix+'start_progservice','repeatcheckxPgm'],
                                  ['input_button.'+Ent_Prefix+'stop_progservice','stopcheckxPgm']


                          /*
                            nb see the comment in hawsclient.js :

                                >>>>> attenzione qui si usano i button per sparare i cmdtopic, def in function defFVMng(user,plant,localEntity) in models.js 
                                tuttavia in interface si sono aggiunti anche dei automation che al trigger degli entity sparano un event
                                 nel caso di problemi si potra usare tali event per sparare i cdmtopic al posto dei button entity . 

                        */
],
      
                                };// must be portid=0 ! : a dummy var that creates ctl websocket topic 
                                                                                                                        // todo >>>> must be added a user/token release process
      //mqttnumb:[{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
     // correct: 
     this.mqttnumb=[
        // {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475F7DE'},// clas 'out' or 'var' , same dim than gpionumb
                                                                                        // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
        {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06',

         haEntity:'switch.'+Ent_Prefix+'rssi'//  will be updated with cust values, index 0 : haEntity,haManButton if the dev is connected to ha
              
              ,haManButton:[//  this non depend on cust def entity so just put in the constructor
                ['input_button.'+Ent_Prefix+'setmanual_rssi_on_but','on'],// >>> entity setmanual_rssi_on_but firing event on, on url related to cmdtopic 
                ['input_button.'+Ent_Prefix+'setmanual_rssi_off_but','off']
              
              ]      
         
         
        },
       null,null,null,null,
       {portid:66,clas:'var',varx:4,isprobe:false,protocol:'mqttstate',subtopic:'var_split_'}, // ex of a shelly like dev . agganciato al customdevice shell per accendere gli split 
                        // question what is difference among type 1 and 2 ? : 
                        //              -       different topic formatting type 1 
                        //              -       obbligatoriamente ha pubtopic diverso da topic e avendo un device fisico che ricopia poi il pubtopic in topic 
                        //      so type 1 devono avere pubtopic diverso da topic ed è meglio che non facciano un readSync per ricvare lo state che puo avere ritardo 
                        //                                              
                        // TODO : add also a topicPub property ?????
      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var


      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate',
      // this non depend on cust def entity so just put in the constructor :
      haEntity:'input_text.'+Ent_Prefix+'optimizing_fv',// var gas/pdc, anticipate . ha un entity text e un cmd topic setMan on e off 
      haManButton:[['input_button.'+Ent_Prefix+'start_ensavings','on'],// ha entity firing event on url related to cmdtopic :setMan
      ['input_button.'+Ent_Prefix+'stop_ensavings','off'],// todo:  add std event on , off
       ],
       custF:function (msg,topic,state){    // is like custDev[portid]  but works on wsclient to goto ha.  GGDD 
                                  // returns actions={ent:[[entname,newval,newattr]],events:[[eventN,attr,attrVal]],,,]}. state={customParam,,,,}
                                  //,state)}// nb if we need we can also get here state oby that is full state info, so better that an extract put already in msg.payload.state:
                                  //    msg, if  std format for type 2,4 (nod dev 777 that set payload an obj )will be :
                                  //                                {payload:0/1,sender:{plant:Plant,user:portid}}
        let payload=msg.payload,
        scaldabagno=state.customParam;// ={attName:'data',attVal:1}
                                      // the custF param from browser start pgm algo attributes. tat are browser param to activate scaldabagno. ex: switch entity and allowed hours
                                      // NBNB if the user wants to start one (scaldabango) of the here configured  ha custF device supported by a dev ()preferredgas/pcd) 
                                      //      must insert a param named scaldabagno on the browser start program algo handler
                                      //      then must configure in ha a automation named : Ent_Prefix+'scaldabagno or ( state.customParam.name if defined ), of with we prepare the template in configuser.yaml
                                      //       triggering related real entity like switch.rssi

        if(scaldabagno){// se il parametri (state.customParam.scaldabagno) per questo custF sono stati impostati all'avvio del algo program, setto la action che sara eseguita sui seguenti entity/event di ha
          //  let ent=scaldabagno.ent;ent=ent||'switch.scaldab';// def if not present in starting program form
          let attName=scaldabagno.attName||'data',
          attVal=scaldabagno.attVal||'1';
           if(msg.payload==1){// the dev val
             //return {ent:[ent,'on',{temp:50,inthour:scaldabagno.hours}]};// accendi switch.scaldabagno con attributo temp di 50 gradi
            return {events:[[Ent_Prefix+'scaldabagno_event',attName,attVal]]};
                  // {events:[[scaldabagno.event,scaldabagno.attName,scaldabagno.attVal]]}; // or  ent:[scaldabagno.name,'on',{temp:50,inthour:scaldabagno.hours}]};// param can specify : accendi switch.scaldabagno con attributo temp di 50 gradi
                                                                                          // meglio fire a event with inthour as param/attribute/val :

         }else return {events:[[Ent_Prefix+'scaldabagno_off']]};//reset . {ent:[ent,'off',null]};
       }


       }

    },// a var
      {portid:12,clas:'out',protocol:'shelly',subtopic:'_shelly1-34945475FE06',// acs
      haManButton:[['input_button.'+Ent_Prefix+'setmanual_acs_on_but','on'],//    this non depend on cust def entity so just put here in the constructor
      ['input_button.'+Ent_Prefix+'setmanual_acs_off_but','off']
      ],
      haEntity:'switch.'+Ent_Prefix+'acssw'// depend on the cust entity , will be updated, this dev has a ha entity related whose name is inserted on plant.localEntity.fv3 will send pubtopic to change entity state 


    }];// mqtt device info/id/port. number is the device id to subscribe      

      this.mqttprob=[{portid:110,subtopic:'_shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_t',
       haEntity:'sensor.'+Ent_Prefix+'shelly_ht_temp'// will be merged correctly at new
    },//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'
        {portid:111,subtopic:'_shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_h'},
      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'},
        // {portid:77,clas:'var',protocol:'mqttstate',subtopic:'shelly1-666666666666'}
        {portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate',
        state:[  // GGUUNN
          // >>>>>>>>>  il func returned by setSwitch fillera le entity !  .    this non depend on cust def entity so just put here in the constructor
          // - remember the msg built in QQIIJJ of ioreadwritestatus.js is :
          //                                {"payload":{"state":{"anticipate":true,"program":true,"battery":1,"inverter":0,"desTemp":20,
          //                                 "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}}},
          //                                 "sender":{"plant":"Casina_API","user":777}}

          // this var dev will send a msg (see in QQIIJK of hawsclient.js) to set different ha entities ( different from haEntity is the ent to write the new dev values extracted from the std format for a var msg (payload))
          //    - if .[0]=state.x : the msg.payload.state.x value is used to set the entity .[1]
          //    - if .[0]=sender.user   >  write to entity .[1] ON/OFF depending on msg.sender.user value 

          /* 3 models :
               ['state.battery','input_number.'+Ent_Prefix+'battery']     >   state. key_to_readdata_from_msg , ha entity to update
                ['sender.user','input_text.'+Ent_Prefix+'opt_service1']   >   sender.user  ,  ha entity to update
                [state.relays.acs,'input_text.'+Ent_Prefix+'acs']         >   state.relays.  key_to_readdata_from_msg , ha entity to update
          */

          ['state.battery','input_number.'+Ent_Prefix+'battery'],// * put battery value in entity input_number.battery !
          ['state.inverter','input_number.'+Ent_Prefix+'inverter'],// *
          ['state.desTemp','input_number.'+Ent_Prefix+'desTemp'],// *
          // [state.relays.acs,'input_text.'+Ent_Prefix+'acs'],  // * forse già usato solo come entity di acs pump: so useless 
          ['state.anticipate','input_text.'+Ent_Prefix+'opirun'],// * convertite true/false > 'ON'/'OFF'
          ['state.program','input_text.'+Ent_Prefix+'pgmrun'],// * convertite true > 'ON'
          // nbnb : ['sender.user', ....     non presently used because there is not entity ...opt_service1  !!
          ['sender.user','input_text.'+Ent_Prefix+'opt_service1'],// *
          ['sender.user','input_text.'+Ent_Prefix+'opt_service'],// * todo debug its value setting , 
        ],
      custF:function (msg,topic,state){     // 777: this custF is used when we must do action on some switch or fire some automation that depends on many dev value
                                            //        AND the dev is 777 (so the func is called when we writeSync on dev 777 that is when we complete a program algo iteration)
                                            //  nb we could also use state on a normal dev custF , but writeSync is called when that dev is updated 
                                            //  so we calc actions from all state var !
        // returns actions to start with turn on/off a local switch or fire some events triggered by local automation ( or insert on configurationuser.yaml ?)
        //  actions={ent:[[entname,newval,newattr]],events:[[eventN,attr,attrVal]],,,]}. state={customParam,,,,}
        //,state)}// nb if we need we can also get here state oby that is full state info, so better that an extract put already in msg.payload.state:
        //    msg, for 777 dev type 4   std format will be as above , 
        //          so for example dev state (relays) can be get : msg.payload.state.relays.devName
        //          but can also easyly got from state.relays.devName !!
        //                                
                // do not use msg, just state ! , state.customParam are not used  !
                let main=!state.relays.acs||state.relays.heat;// heat or not block acs
                return {events:[[Ent_Prefix+'prgm_state_main','val',main]]};// meglio fire a event with inthour as param/attribute/val :
                }
      
      
      
      
      
      
      }
        ];// a var

        // merge/update  local real entities into plant dev configuration  (mqttnumb,mqttprobe,,,)
        //  infact those real entity can be assigned without a prefix in case we use it to clone a plant for a new user on same ha instance
        let atleast1=false;// at least 1 require ws client (client='haWebSoc')
  this.mqttnumb.forEach((val, ind) => {
    if (localEntity.mqttnumb[ind]) {// a local ha dev cfg is specified x this dev index
      if (localEntity.mqttnumb[ind].haManButton) if (val) val.haManButton = localEntity.mqttnumb[ind].haManButton;
      if (localEntity.mqttnumb[ind].haEntity) if (val) val.haEntity = localEntity.mqttnumb[ind].haEntity;
      if (localEntity.mqttnumb[ind].custF) if (val) val.haEntity = localEntity.mqttnumb[ind].custF;
      if (localEntity.mqttnumb[ind].client && val) { val.client = localEntity.mqttnumb[ind].client; if (val.client == 'haWebSoc') atleast1 = true; }// {client:'haWebSoc'}
    }
  });
        this.mqttprob.forEach((val,ind) => {if(localEntity.mqttprob[ind]){
          if(localEntity.mqttprob[ind].haManButton&&val)val.haManButton=localEntity.mqttprob[ind].haManButton;
            if(localEntity.mqttprob[ind].haEntity&&val)val.haEntity=localEntity.mqttprob[ind].haEntity;
            if(localEntity.mqttprob[ind].state&&val)val.state=localEntity.mqttprob[ind].state;
            if(localEntity.mqttprob[ind].custF&&val)val.custF=localEntity.mqttprob[ind].custF;
            if(localEntity.mqttprob[ind].client&&val){val.client=localEntity.mqttprob[ind].client;if(val.client=='haWebSoc')atleast1=true;}// {client:'haWebSoc'}

        }});
        if(localEntity.mqttWebSock&&localEntity.mqttWebSock.client)this.mqttWebSock.client=localEntity.mqttWebSock.client;
        if(atleast1)this.isHaWebSoc=true;// use at least 1 ws client in addition to mqtt client

      /*    this non depend on cust def entity so just put here in the constructor
        if(localEntity.mqttWebSock.haManButton)mqttWebSock.haManButton=localEntity.mqttWebSock.haManButton;
        if(localEntity.mqttWebSock.haEntity)mqttWebSock.haEntity=localEntity.mqttWebSock.haEntity;}
          */

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        this.pythonprob=[2,4,8]// virtual modbus python probs  x : g , n , s  virtual device zones 
        this.relaisEv=['heat','pdc','g','n','s','split'
        ,'gaspdcPref','acs'];// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      this.titles=["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref",
        "blocco acs"];//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        ;this.anticInterm2VirtMap={gaspdcPref:[true,true,true,null,null,true,null,false]}//{aintermediateinrelaisEv:[true,false,null,,,,]}
                                                                                // or a function(state) returning [true,false,null,,,,]

        this.virt2realMap=[0,1,2,3,4,5,6,7];// std virtual group , map only if >=0 , some bugs: so use identity only
        this.virt2realProbMap=[3,0,1,-1,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
                                //  mqttprob
                                //  or ( if>1000) pythonprob   
                                //  to find probs relating to g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //  virtual index 3 is the same but relating to n , virtual index 3 of gpionumb/mqttnumb pump dev
                                // better:
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob index of :[g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined

                                // virtualindex 0 is reservet to state pub var dev



        this.relaisDef=[false,false,false,false,false,false,false,true];// dafault value (if none algo propose true/false)
        this.invNomPow=localEntity.invNomPow;
        if(localEntity.huawei)this.huawei=localEntity.huawei// devid casina

        this.custDev={ 66: custDev_2};// custDev_1

        };
function defFVMng_(user,plant)// default=casina class plant factory. copyed from casina, factory of a std plant tempalte of FV app . now called by addUserPlant
        {  

        }

let haCfgData={// old   user plant data  to configure a new plant . must be collected in registration. nb if device has any of :(haEntity,)  >>> now see haCfgData_
  casinauser1:{// ex: 'Casina'  , will be registered by user/installer from web  to create the user ha yaml file : addPlantHandler(user,cfgdata=haCfgData)
  email:'luigi.marson@gmail.com',
  token:'123',
  pass:'pass',
 
  localEntity: // AAQR this is user plant data formatted after gather it from a web. to insert on plant.localEntity and 
               // also merged into  mqttnumb,mqttprob as  state,haEntity,haManButton the ha entity that send topic and cmdtopic configured on :
               //        setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// **


  {mqttWebSock:{client:'haWebSoc'},// items with client:'haWebSoc' will have ws and not mwtt client as client !
    
    mqttnumb:[{
            client:'haWebSoc',// use ws client to connecto to ha (so use haEntity,,,,,,), otherwise use http client to connest the alredy casina configured ha
                              // so clone of casina can be configured with all null items, because the ha install is the same but in diferent user plant (only user data , token and tcp address is different than casina)
            haEntity:'switch.casinauser1_rssi'//  index 0 : haEntity,haManButton if the dev is connected to ha
              /*  this non depend on cust def entity so just put in the constructor
              ,haManButton:[
                ['input_button.setmanual_rssi_on_but','on'],
                ['input_button.setmanual_rssi_off_but','off']
              
              ]*/

              },
      null,null,null,null,null,

      {client:'haWebSoc'},/*  this non depend on cust def entity so just put in the constructor
      {haEntity:'input_text.text',// var gas/pdc, anticipate . ha un entity text e un cmd topic setMan on e off 
      haManButton:[
        ['input_button.start_ensavings','on'] // to do inserire in dashboard the entity
        ,['input_button.stop_ensavings','off'] // to do inserire in dashboard
        
      
      ]

      }*/





      //  var !acs
      {         /*  this non depend on cust def entity so just put in the constructor
                haManButton:      
                            [['input_button.setmanual_acs_on_but','on'],// todo : ha entity firing event on url related to cmdtopic :setMan
                            ['input_button.setmanual_acs_off_but','off']
                            ],*/
              client:'haWebSoc',
              haEntity:'switch.casinauser1_acssw'}
    
    
    ],// 
    mqttprob:[     {  client:'haWebSoc',
            haEntity:'sensor.casinauser1_shelly_ht_temp'},// or text.shelly_ht_temp ? really user sensor usually is mqtt....  !

   
      null,null,
      {client:'haWebSoc'}/*  this non depend on cust def entity so just put in the constructor
          {state:[// il func returned by setSwitch fillera le entity !
          ['state.battery','input_number.battery'],// * put battery value in entity input_number.battery !
          ['state.inverter','input_number.inverter'],// *
          ['state.desTemp','input_number.desTemp'],// *
          // [state.relays.acs,'input_text.acs'],  // * forse già usato solo come entity di acs pump: so useless 
          ['state.anticipate','input_text.opirun'],// * convertite true/false > 'ON'/'OFF'
          ['state.program','input_text.pgmrun'],// * convertite true > 'ON'
          ['sender.user','input_text.opt_service1'],// *
          ['sender.user','input_text.opt_service'],// * todo debug its value setting , 
        ]}
        */
    ],
    huawei:{inv:"1000000036026833",bat:"1000000036026834",credential:null}// >>>>>>>>  todo insert user api credential !

}}
// ,,,,,,,
}
//        cfgRawData:{email:'luigi.marson@gmail.com',token:'123',pass:'pass',consCaldaia:'switch.£rssi',consAcs:'switch.£acssw',term:'sensor.£shelly_ht_temp',huawei:{inv:"1000000036026833",bat:"1000000036026834",credential:null}}, // init for debug, just to store, during user/plant registration, the user specific data localEntity to use in addUserPlant()   
function haCfgData_ (cfgRawData_){// user plant data  to configure a new plant . must be collected in registration. nb if device has any of :(haEntity,)

 
  let cfgRawData=cfgRawData_.userEnt;// user plant real entities

  this.localEntity= // AAQR this is user plant data formatted after gather it from a web. to insert on plant.localEntity and 
               // also merged into  mqttnumb,mqttprob,... as  state,haEntity,haManButton the ha entity that send topic and cmdtopic configured on :
               //        setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// **

  { connCfg:cfgRawData_.connCfg,
    /*{  // def cfg ..... LLHH resolve with clientobj=clientObject(client)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiNmYxMDk3NDYxODI0YmZhYjkwNTc2NjQ1ZDVmODU4MyIsImlhdCI6MTY5NDQ0Mjg2MiwiZXhwIjoyMDA5ODAyODYyfQ.ppeuf-Ma1vLVQCT0Qrt07C5TXGHsHasX3ElOl1NCX3A', 
    host: '192.168.1.212',
    port: 8124,
    },*/
    
    Ent_Prefix:cfgRawData_.Ent_Prefix,// set the entity prefix to use when define the entity name (to build a ha plant clone )

    
    mqttWebSock:{client:'haWebSoc'},// items with client:'haWebSoc' will have ws and not mwtt client as client !
    
    mqttnumb:[{
            client:'haWebSoc',// use ws client to connecto to ha (so use haEntity,,,,,,), otherwise use http client to connest the alredy casina configured ha
                              // so clone of casina can be configured with all null items, because the ha install is the same but in diferent user plant (only user data , token and tcp address is different than casina)
            haEntity:cfgRawData.consCaldaia,//  index 0 : haEntity,haManButton if the dev is connected to ha
              /*  this non depend on cust def entity so just put in the constructor
              ,haManButton:[
                ['input_button.setmanual_rssi_on_but','on'],
                ['input_button.setmanual_rssi_off_but','off']
              
              ]*/

              },
      null,null,null,null,null,

      {client:'haWebSoc'},/*  this non depend on cust def entity so just put in the constructor
      {haEntity:'input_text.text',// var gas/pdc, anticipate . ha un entity text e un cmd topic setMan on e off 
      haManButton:[
        ['input_button.start_ensavings','on'] // to do inserire in dashboard the entity
        ,['input_button.stop_ensavings','off'] // to do inserire in dashboard
        
      
      ]

      }*/





      //  var !acs
      {         /*  this non depend on cust def entity so just put in the constructor
                haManButton:      
                            [['input_button.setmanual_acs_on_but','on'],// todo : ha entity firing event on url related to cmdtopic :setMan
                            ['input_button.setmanual_acs_off_but','off']
                            ],*/
              client:'haWebSoc',
              haEntity:cfgRawData.consAcs}
    
    
    ],// 
    mqttprob:[     {  client:'haWebSoc',
            haEntity:cfgRawData.term},// or text.shelly_ht_temp ? really user sensor usually is mqtt....  !

   
      null,null,
      {client:'haWebSoc'}/*  this non depend on cust def entity so just put in the constructor
          {state:[// il func returned by setSwitch fillera le entity !
          ['state.battery','input_number.battery'],// * put battery value in entity input_number.battery !
          ['state.inverter','input_number.inverter'],// *
          ['state.desTemp','input_number.desTemp'],// *
          // [state.relays.acs,'input_text.acs'],  // * forse già usato solo come entity di acs pump: so useless 
          ['state.anticipate','input_text.opirun'],// * convertite true/false > 'ON'/'OFF'
          ['state.program','input_text.pgmrun'],// * convertite true > 'ON'
          ['sender.user','input_text.opt_service1'],// *
          ['sender.user','input_text.opt_service'],// * todo debug its value setting , 
        ]}
        */
    ],
    huawei:cfgRawData_.huawei,
    invNomPow:cfgRawData_.invNomPow

}}
// ,,,,,,,


module.exports = {
  init:function(){// add to plants, the registered plants
   haPlants= require('./haPlants.json');// GGUUII
    Object.assign(plants,haPlants);// merge into plants
    return this;
  },
        //   cfgData:new haCfgData_(this.cfgRawData),// init for debug, just to store, during user/plant registration, the user specific data localEntity to use in addUserPlant()
        
        cfgData:{},// ha user running request , should be persistant like haPlants
        getconfig,// app funtionality custom cfg
        getPlant:function(token){return plantbytoken[token]},
        addUserPlant:function addUserPlant(cfgdata,user,browserUsr,reset=true){// ,cfgdata){// add a std template for fv optimization ,
                                                          //  cfgdata= cfgdata={email:'luigi.marson@gmail.com',token:'123',pass:'pass',consCaldaia:'switch.£rssi',consAcs:'switch.£acssw',term:'sensor.£shelly_ht_temp',humid:'sensor.£shelly_ht_humid',
                                                          //  consCaldaia_:'£rssi',consAcs_:'£acssw',term_:'£shelly_ht_temp',humid_:'£shelly_ht_humid',
                                                          //  huawei:{inv:"1000000036026833",bat:"1000000036026834",credential:null}}; 

                                                          // old : to review 
                                                          //  user registration process must recover all entries of cfgdata used to define the plant , expecially localEntity
                                                                                                // localEntity={}. // was {switch_consenso:switch.rssi,,} contiene riferimenti a ha entity che vengono inseriti in:
                                                                                                //  - alcuni dev cfg={,,,,  haEntity:localEntity.switch_consenso}
                                  
                                                                                                //  - in alcune delle cfg in ../packages (es in consenso : climate...heater=localEntity.switch_consenso)
                                                                                                //    e ../dashboards

          if(!cfgdata) return;
          let plant=user+'_API',// plant name
          cfgplant=new haCfgData_(cfgdata);// cfgdata: ha user info x plant to build. in pratica le entities to connect : 
                                          // - real user entities (from cfgdata ) 
                                          // nb defFVMng will add  other app entity to build the package and dashboard , can be fixed or plant differentiated (£) if we use a service ha
          let {// email,pass,token, 
            localEntity}=cfgplant;// recover user info and real ha local entities definition . {email,pass,token,localEntity:{mqttnumb.mqttprob}}
                                            // dev related entity reference put on:  localEntity.mqttnumb/mqttprob[i].haEntity
                                            // will be used to -
                                            // - during plant config , merge the dev cfg plant dev configuration  (mqttnumb,mqttprobe,,,) and 
                                            // - to update the yaml file 
          // if(reset)plants[plant]=null;          if(plants[plant]!=null)return plants[plant];// already loaded 

            //const replE=localEntity.replE;// =user+'_';// variation on cfg names , var not still used , use localEntity.replE
                let 
                ucfg='cfg'+user,
                plantItem,
                dashboard,package// {filepath:yamlfile}
                cfg=cfgs[ucfg]=new defFVMng(user,plant,localEntity);// the built plant devcfg , the std plant base template of FV app with user ha locals entity applied ,praticamente i suoi dev description 
                                              //   cfgs={cfguser:devcfg,,,,,}      plants={user_API:{cfg:devcfg,name,password,users,token,email}
                                              //                                                      ,,,,,,
                                              //                                                     }
                                              // >>>> replE is the  variation on cfg names to apply to plant ha entities , excluding the localEntity ha entities

               // old : let {eventMng='mqtt',haEntity,haManButton}=cfg;// todo : ** are recovered on cfg=ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev], the dev cfg, 
                                              // ctlpack.ctl.cfg.haEntity is the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,
                                              // nb  only device that are relayed on user ha can have haEntity,and (no probe ) haManButton
                                              // haEntity is the target of topic or pubtopic 
                                              // haMabButton event are source of cmdtopic msg to fv3

                
                plants[plant]=plantItem={cfg,// will be put in state.app.plant
                                                        // remember: // the dev  ha related entity is (ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev]).haEntity/haManButton is 
                                                        // the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,

                email:cfgdata.email,
                password:cfgdata.pass,                                

          

                        name:plant,// duplicated FFGG
                        apiPass:cfgplant.apiPass,// not used 
                        users:[browserUsr],
                        token:[cfgdata.token],// really token has a client and a permission to act on some data/process
                        email:cfgdata.email,
                        localEntity // also stored here , after will be also merged to numb
                                      // was:{switch_consenso:'switch.rssi',sensor_t_giorno:"sensor.shelly_ht_temp"}
                        }
                plantItem.yaml={};// config (merge template with user local dev) yaml configuration x user plant 

                let add2configuration='';// to add tu user configuration.yaml 
                // input json to map
                // LLUUJJ 
                let packjsonDir='../haCfg/defFVMng/package/energyEngineService/',dashjsonDir='../haCfg/defFVMng/dashboard/energyEngineService/';// the dir where we put the plant model devFVMng template
                let dashboards=`dashboard_yaml.json`,// list of json dashboard file 
                packages=[`anticipate_vardev.json`,`consenso.json`,'interface.json','sensor_acs.json','dashboardStaff.json'];// DONT CHANGE ORDER !; json file base sections, will be cfg with user plant locals entities
                // set custom/configurated yaml files:
                let replE=cfgdata.Ent_Prefix;// LLOOPP :entities prefix : in package and dashboard modify the std name of entities of the std model managed by the std fv3 app 
                                            //  that in case we want run 2 user on one stance of ha 
                                            //  then, when configure ha ws in setSwitch we point the std dev to related user std entity with the right prefix
                plantItem.yaml.dashboard=fillDash(dashjsonDir,dashboards,localEntity).replaceAll('£', replE);//£: customize entity name and conf items  to be unique
                plantItem.yaml.package=fillPack(packjsonDir,packages,localEntity,cfgdata).replaceAll('£', replE);//{filepath,yaml}//
                plantItem.yaml.configurationAdd = fs.readFileSync('./haCfg/defFVMng/configurationAdd.yaml', 'utf8').replaceAll('£', replE);

                plantItem.yaml.configurationUser = fs.readFileSync('./haCfg/defFVMng/configurationUser.yaml', 'utf8');// the local real entities template. can generate them if not already done in configuration.haml
                                                                                                                      // the same as LLOOPP but regards the local name of real user switches
                                                                                                                      //  if local user switches are not alredy set you can define in plantItem.yaml.configurationUser a template with placeholder switches x user local switches 
                                                                                                                      // then render the template with actual name read from config obj cfgdata.userEnt
                                                                                                                      // if user has alredy config the real switches/ in local configure.yaml, use jut x debug, user will already have these
               //cfgRawData:{email:'luigi.marson@gmail.com',token:'123',pass:'pass',consCaldaia:'switch.£rssi',consAcs:'switch.£acssw',term:'sensor.£shelly_ht_temp',huawei:{inv:"1000000036026833",bat:"1000000036026834",credential:null}}, // init for debug, just to store, during user/plant registration, the user specific data localEntity to use in addUserPlant() 
               
               // now render the user template of real local entities using config info put in cfgdata.userEnt
               plantItem.yaml.configurationUser=plantItem.yaml.configurationUser.replaceAll('£caldaia', cfgdata.userEnt.consCaldaia_)// use jut x debug and check differencies with local config in configure.yaml, usually user will already have these
                .replaceAll('£acs', cfgdata.userEnt.consAcs_)
                .replaceAll('£temp', cfgdata.userEnt.term_)
                .replaceAll('£humid', cfgdata.userEnt.humid_)
                .replaceAll('£scaldabagno', cfgdata.userEnt.scaldabagno_)
                .replaceAll('£', '');// entity prefix are not  used in local real switches, so in configurationUser.
                //.replaceAll('£', user);// if want differentiate: each plant has different real entities 
                
                                    // a ha service or a file service will get the 2 dir to merge : dashboard , package
                                    // ex {./energyEngineService/anticipate_vardev.yaml:itsyaml,,,,} so first item will be set in hasscfg./package/energyEngineService/anticipate_vardev.yaml
                
                if(plantItem){
                    try {// rewrite updated json of all ha configured plant . at start in  GGUUII, will be merge into plants
                      haPlants[plant]=plantItem;// update the present plants
                        fs.writeFileSync('./nat/haPlants.json', JSON.stringify(haPlants,null,2));// insert plant x next restart . or use a async 
                        if (!fs.existsSync('./haYaml/'+plant)) {// prepare dir to write yaml when return
                          fs.mkdirSync('./haYaml/'+plant);fs.mkdirSync('./haYaml/'+plant+'/packages');fs.mkdirSync('./haYaml/'+plant+'/dashboards');fs.mkdirSync('./haYaml/'+plant+'/dashboards/energyEngineService');fs.mkdirSync('./haYaml/'+plant+'/packages/energyEngineService');
                        }


                        // fs.writeFile("data.json",JSON.stringify(obj)), (error) => {
                      //  console.log('writescript: file ',file,' writed ')
                    } catch(err) {
                      console.error('Cannot write new ha registering plant  to file: haPlans.json, err: ' + err);

                      throw err;

                    }                      
                }
                return plantItem;
        },
        getcfg,// all plant cfg . will be put in ctl.state.app.plantcfg, 
        getconfig,//  will be put in  ctl.state.app.plantconfig >>>>>>> little old, projection with little diff of getcfg , better use ctl.state.app.plantcfg  CAN BE MISLEADING!!!!
        getplant,// user staff
        ejscontext};// ejs context
   //     devid_shellyname,gpionumb,mqttnumb,relaisEv
   function fillDash(dashjsonDir,dashboards,localEntity){// set local entity , thats the entity on haCfgData.user.mqttnumb/mqttprobe[x].haEntity  ex rssi, acssw

    let mydash=require(dashjsonDir+dashboards);// a json file (yaml converted to json)
    // inject user local dev :
    mydash.views[2].cards[3].entities[4].entity=localEntity.mqttnumb[0].haEntity;// was 'switch.rssi';
    mydash.views[0].cards[2].cards[0].entities[0].entity=localEntity.mqttnumb[0].haEntity;// was 'switch.rssi';
    //mydash.views[2].cards[3].entities[4].entity=localEntity.mqttnumb[0].haEntity;// was 'switch.rssi';

    mydash.views[0].cards[2].cards[0].entities[1].entity=localEntity.mqttnumb[7].haEntity;// was 'switch.acssw';
    mydash.views[0].cards[1].outer.entity=localEntity.mqttprob[0].haEntity// was 'shelly_ht_temp';
    let myyamlF =YAML.stringify(mydash,{lineWidth:200});// yaml format
    // let myyaml =util.format('%s', myyamlF);// useless
    return myyamlF;
   

   }
   function fillPack(packjsonDir,packages_,localEntity,cfgdata){// take the json models in packjsonDir (devFVMng ossia casina like plant) and update them using user specific entity ( consenso, acs ,,) in localEntity
                                                        // returns a array of json file to populate a dir : pakage/energyEngineService
    /* storia di come si sono ottenuti i devFVMng
        le conf finali sono sotto packages e dashboards sotto dir energyEngineServices che tratta il modes Casina_API
        in save/haws/haws_package/energyEngineServices_before/energyEngineServices si mette i file yaml che si sono ottenuti dai test su Casina_API per portare le conf sotto packages
        poi si aggiunge la conversione  a json  che viene updatata per diventare i modelli in questa dir : haCfg/defFVMng/package/energyEngineServices/...
        nei modelli si configurano i nomi reali del plant che si aggiunge che sono in  plants[plant].localEntity
   
   
   
   */
      let package={};
    
   
    for(let i=0;i<packages_.length;i++){
      let js=require(packjsonDir+packages_[i]);// a json file (was converted from a yaml template)
     if(i==1){  // better: packages_[i]='consenso.json'
                // consenso (mqttnumb index = 0) is the only file to merge,  // other file has no local ref to update , 
            // set entity to configure in automation rssi :
            //  todo : select the automation by ...alias and not by index !!
            // >>> di seguito si adegua il nome entity chiamata dal action secondo quanto previsto da userEnt !!  :
            js['automation £rssi'][0].action[0].data.entity_id=localEntity.mqttnumb[0].haEntity;// switch.rssi,  must be also : consenso['automation rssi'][0].alias='ws';
            js['automation £rssi'][1].action[0].data.entity_id=cfgdata.userEnt.scaldabagno;// automation x event fired by custF() registered in some mqttnumb dev
            js['automation £rssi'][2].action[0].data.entity_id=cfgdata.userEnt.scaldabagno;
            js['automation £rssi'][3].action[0].data.entity_id=cfgdata.userEnt.consAcs;
            js['automation £rssi'][4].action[0].data.entity_id=cfgdata.userEnt.consAcs;

            // that is just to see how to trigger a event fired by ws
          // manual algo button : nothing just intercept event on hawsclient
          js.climate[0].heater=localEntity.mqttnumb[0].haEntity;
          js.climate[0].target_sensor=localEntity.mqttprob[0].haEntity;// the temp probe entity
          // polo.yaml : can be deleted  automation that launch turn_on/off or receiveing topic on device portid=777: see  portio 777 topic handler in hawsclient
          //  motion_light_tutorial0.yaml : idem , delete
     }
     
     // package[packages_[i]]=js;// not necessary : package={`anticipate_vardev.json,consenso.json,interface.json,sensor_acs.json}
     // instead we'll do consolidate yaml ,
     // shallow copy not good for structured obj : Object.assign(package, js);

     for (const prop in js) {
      if (Object.hasOwn(js, prop)) {// useless 

        if(package[prop]){// 1 level prop obj, can be array or obj, is already in package
          if(typeof js[prop] =='object')
          if(Array.isArray(js[prop])){
            package[prop].push(...js[prop]);//  add all items 

          }else {

            Object.assign(package[prop], js[prop]);// merge (1 level only ) the prop of js into package

          }

        }else package[prop]=js[prop];// just add
      }
    }
    }

    let ret=YAML.stringify(package,{lineWidth:200});// yaml format
    return ret.replaceAll('$', '\"');// some string (starting  and ending $) must be "...." . todo check it

  }
  function getIt(){// require a json file in   ./haCfg dir

  }
