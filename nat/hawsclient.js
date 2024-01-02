// import hass from "homeassistant-ws";
//import * as hassImp from 'homeassistant-ws';
// const hass = hassImp.default;
const readline_ = require('readline').createInterface({// see https://stackoverflow.com/questions/65260118/how-to-use-async-await-to-get-input-from-user-but-wait-till-entire-condition-sta
    input: process.stdin,
    output: process.stdout,
  });
  const readline=null;// not used in production 
  // const readline=readline_;// only debug 

  const ON='turn-on',OFF='turn-off';

// if we install locally: const hass=require("homeassistant-ws");// to install : npm -i homeassistant-ws .... see YYKK 
const hass=require("../../homeassistant_new/node_modules/homeassistant-ws/build/index.js");//install and modify node_modules/homeassistant-ws/build/index.js in a specific directory homeassistant-new
                                                                                          // or 
                                                                                          // follow https://www.geeksforgeeks.org/how-to-install-a-local-module-using-npm/:
                                                                                          // cd .../raspexample & npm install ./nodeassistant-ws
                                                                                          //    to install in loc dir  ./nodeassistant-ws then modify the index.js as above

                                        // hass is the exported function createclient in  homeassistant-ws-vxx package index.js  
                                        // clientobj= hass() is a promise resolving with ( see  LLHH) :
                                        //    clientObject(client)=  {  rawclient=client={ seq: 1, options, resultMap: {}, emitter: ws: options.ws(options)},
                                        //                              getStates,getServices,getPanel,getConfig,on,callService,fireEvent,,, 
                                        //                            }
                                        //  using  "isomorphic-ws" package ( NOT 'ws') we got the connected ws obj  : client.ws=require("isomorphic-ws")(ws://localhost:port/path) 
                                        //          >>> NOT the ws=require('ws')() !!!!   ex: websocket ws.on('close',handler) >>  begin isomorphic-ws ws.onclose(handler)
                                        //                                                but the event handler was pass-throught to client.on('ws-close',handler)
                                        //          nb the isomorphic-ws connected  obj is:  (client=await hass()).rawclient.ws , try not using it !
                                        // 





// console.log('ciao');

// if(client)main();

async function getNewCon(){// called by : async function kepAlive(reset=false)

      // Establishes a connection, and authenticates if necessary:
  client = await hass({  // ..... LLHH resolve with clientobj=clientObject(client)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiNmYxMDk3NDYxODI0YmZhYjkwNTc2NjQ1ZDVmODU4MyIsImlhdCI6MTY5NDQ0Mjg2MiwiZXhwIjoyMDA5ODAyODYyfQ.ppeuf-Ma1vLVQCT0Qrt07C5TXGHsHasX3ElOl1NCX3A', 
    host: '192.168.1.212',
    port: 8123,
   });
   ws=client.rawClient.ws;// clientobj.ws ,  in  "isomorphic-ws"  we got the connected ws obj  : clien.trawClient.ws=require("isomorphic-ws")(ws://localhost:port/path) 
                          //    seems == to require("ws")(ws://localhost:port/path) in nodejs

   // console.log('ciao mondo :\n',JSON.stringify(client));


}


async function main() {// call in a connected client to init the data transmission
    // client can get null when after  connection lost
    if(client==null)return;
      // Get a list of all available states, panels or services:
  inState=await client.getStates();// store initial state values
  console.log('inital states are: ',inState);




  /*
  await client.getServices();
  await client.getPanels();

  // Get hass configuration:
  await client.getConfig();
*/

  // Listen for all HASS events - the 'message' event is a homeassistant-ws event triggered for
  // all messages received through the websocket connection with HASS:
  //
  // See https://developers.home-assistant.io/docs/api/websocket/ for details on HASS events:
  client.on('message', (rawMessageData) => {
    console.log(' raw message received: ',rawMessageData);
  });

  // Listen only for state changes:
  client.on('state_changed', (stateChangedEvent) => {
    console.log('state_changed event : ',stateChangedEvent.data.new_state.state);
  });

let ex=false;


    let outprompt='>>>>>>>>>>>> please input :  lights,turn_on,light.my_light ';
    console.error('now start requesting iterately: ',outprompt);

    // just x debug doinp();

  function doinp(){  requestInput(outprompt).then(readin);// debug, if we were in a async we could : await  requestInput()
  }

  function readin(read_) {
    let reads = read_.split(",");
    docmd(...reads);
  }
  function docmd(...reads){// cmd,...arguments call ex: docmd('ser','switch','turn_on','switch.rssi') docmd('ser','python_script','set_state','switch.rssi','on')
    if (reads[0] == 'exit') console.error('Call a cmd, ends');
    else if (reads[0] == 'ser') {
      // Call a service, by its domain and name. The third argument is optional.
      console.error('Call a service, by its domain and name. The third argument is optional:', reads);
      if(reads[2]=='turn_on'||reads[2]=='turn_off'||reads[2]=='set_state'){//  available service
        let data={// domain,name data={ entity_id: reads[3]
          //  ,state:'the new value'}// if domain=
          entity_id: reads[3]
          }
        if(reads[2]=='set_state')if(reads.length>4)data.state=reads[4];else return;
      client.callService(reads[1], reads[2], data).then(doinp);}
    } else if (reads[0] == 'event') {
      console.error('fire event, by type, data :', reads);
      let data = {}; data[reads[2]] = reads[3];
      client.fireEvent(reads[1], data).then(doinp);
    }


  }

  function requestInput(shown) {// use :
    // in async  await requestInput
    // otherwise use a cn :  requestInput.then(goon);

    return new Promise((resolve, reject) => {
      console.error(shown);
      readline.question(shown, async (url) => {
        console.error('readline got line', url);
        //readline.close();
        resolve(url);

      });
    });
  }
}
function getState(){

}
let ws,// the current ws if active
wsArr,// the ws in fv3 ??
client=null,
Actstates=[],//  list of tracked entities ex: ['switch.rssi',,,]
              // the updated ha state list  we want to trace, can be :
              // reviewing.........    are state, devices or its topics (topic,pubtopic,cmdtopic ) ???
              //  - switch state (pubtopic,topic state is only to check what the switch is doing and can be avoid) or 
              //  - probe state : topic only
              //  - switch buttonpress (cmdtopic)event







inState=null,// the updated state of Actstates: if null means there is no connection active
            // it will be init with state at connection time , then when we add a dev queue  add Actstate and 
            // add state-change handler that 
            //  - at next update updates Actstates and call ctlcb to fill the queue 
            //    we can use the present inState if  reset inState=await client.getStates(); then :
            // - we can call ctlcb, just after the add queue request, to send present value
ctlcb=null; // calls msgList(topic,msg) , the fv3 income process handler of msg on suscribed/expecting topic : this.msgHand(topic,val)=msgList 
            //    issue  val on topic topic to the message handler:  msgList
            //    the cb function to fill fv3 Actstates cmdtopic/interrupt ( queue not interesting) for type 1,2
            //                                      topic ovvero queue per type=3
            //    so x topic and cmdtopic
// ctlComTopic=null;// cmdtopic entry point 

kepAlive();

async function trackEnt(ent) {
  if (Actstates.indexOf(ent < 0)) {// register and get 

    client.on('state_changed', (stateChangedEvent) => {// add a listener x future changes . here checks the dev related entity (haEntity,haManButton) that fire topic and cmdtopic x this dev 
      // we could have just 1 listener that check all entity for all devs 
      let msgtopics;// the msg x cmdtopic issued by this dev of type 2 : 

      // ent or entid ???????????????????
      if (stateChangedEvent.data.entity_id==ent) {// >>>>>>>>>>>>>    entity var or id ???????????   changes on cmdent entity 
        // check is entity_id like switch.rssi   ???????
        inState[ent]=stateChangedEvent.data.new_state.state;


      } else return null;// not registered 

    });
    return inState[ent]=(await client.getStates())[ent];// store initial state values

  }
}

function updateState(entity=null){// will call the ctl cb to fill fv3 queue
  if(ctlcb==null) return;
if(entity==null){
 for(ent in Actstates){
  ctlcb(ent,null);// fill ent queue with null: no connection 
  }}else {
    ctlcb(ent,inState[ent]);
  }
}


async function kepAlive(reset=false){// start tracking a new connecting client, use reset x ....
    if(reset)client=ws=null;
    if(client!=null)return;
    await getNewCon();// fills client and ws with a new connection 
    if(client)main();// restart tracing state, events ,,,,
    /*
    from ws github, verify works in ws used by package hass

    			Just like the server example above your clients might as well lose connection without knowing it. You might want to add a ping listener on your clients to prevent that. A simple implementation would be:

			import WebSocket from 'ws';

			function heartbeat() {
			  clearTimeout(this.pingTimeout);

			  // Use `WebSocket#terminate()`, which immediately destroys the connection,
			  // instead of `WebSocket#close()`, which waits for the close timer.
			  // Delay should be equal to the interval at which your server
			  // sends out pings plus a conservative assumption of the latency.
			  this.pingTimeout = setTimeout(() => {
			    this.terminate();
			  }, 30000 + 1000);
			}

			const client = new WebSocket('wss://websocket-echo.com/');

			client.on('error', console.error);
			client.on('open', heartbeat);
			client.on('ping', heartbeat);
			client.on('close', function clear() {
			  clearTimeout(this.pingTimeout);
			});

    */
	//		import WebSocket from 'ws';
			function heartbeat() {
			  clearTimeout(this.pingTimeout);

			  // Use `WebSocket#terminate()`, which immediately destroys the connection,
			  // instead of `WebSocket#close()`, which waits for the close timer.
			  // Delay should be equal to the interval at which your server
			  // sends out pings plus a conservative assumption of the latency.
			  this.pingTimeout = setTimeout(() => {
			    this.terminate();
                client=ws=null;
			  }, 60000 + 1000);
        setTimeout(() => {
			  kepAlive();// restart connection , and main ??
              
			  }, 60000 + 1000);
			}


      // ws=client.rawClient.ws;
			client.on('ws_error',// in ws we used : client.on('error',
      console.error);
			//ws.onopen(heartbeat);// 
      ws.on('open',//function(x){ heartbeat(x);}
      heartbeat
      );//client.on('open', heartbeat);
			ws.on('ping',// function(x){heartbeat(x);}
      heartbeat
      );//client.on('ping', heartbeat);
			client.on('ws-close',// client.on('close',// //  ws.onclose handler will pass-trought the close event to client.emitter ws-close event.so here add a listener on ws_close. 

      function clear(){ 
                                          //   if server asks  to close clear connection obj then exit 
			  clearTimeout(this.pingTimeout);
              client=ws=null;
			});
}

const controller={ /*
                      initx:// no|, arrow function take this from outer object , the obj n which you call the function !!
                        (swname,getread_)=>{this.getread=getread_;
                          this.setSwitch(swname);
                          return true;
                        },*/



                    
                    init:// 
                        function (ctlcb_//,ctlComTopic_
                        ){
                         
                         //  this.queues=getread_;// A) : bring queue here or 
                          ctlcb=ctlcb_;// this cb(atopic,val) will pub atopic with val on fv3 mqtt incoming handler
                                        //  B) : let cb will fill queue  , ( equivale a dev topic )
                          // ctlComTopic=ctlComTopic_;// >>>>>>>>>>>>>>  can be avoid using LLCC, so got the name of topic and cmdtopic from ....  and put the topic on ctlcb(topic/cmdtopic,val)
                          //if(ctlpack);// ?? this.transYalm();
                          return true;
                        }
                    ,
                    transYalm:()=>{// transer or check config addend

                    },
                    addDev:// useful ?
                        (swname)=>{
                          this.setSwitch(swname);
                          return true;
                        }
                    ,
                   
                    //queues,
                    /*
                    setProbe:(name,ent)=>{//add a listener for the state changed event to fill the switch queue , dev type=3 of name name
                                        // mapped to ha entity ent

                      // ha sensor >>> dev topic, ovvero dev queue
                      if(Actstates[ent]) return false;// already registered
                      Actstates[ent]=true;
                        // if want present value : 
                        //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                        //  ctlcb(name,inState[name]);
                      client.on('state_changed', (stateChangedEvent) => {// future changes 
                        if(stateChangedEvent.data.entity_id==ent){
                        console.log(' rssi state_changed event update:  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                        ctlcb(name,stateChangedEvent.data.new_state.state);// B)
                        // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                        }

                      });*/
                      subscribe:function (topic,option,cb){// option={type=0/1/2/3/4,topictype=0/1/2(topic,pubtopic,nrtopic),cfg}
                        if(topictype==0){// a probe val to transmit as dev topic to fv3 incoming process
                                          // topic was built  from a dev cfg in numbSubscr(val, that, ctlpack, subscred),,,
                                          //                                              ctlpack = {ctl,devNumb,type} 
                                          //                                              cfg=ctl.cfg={ portid, varx, isprobe, clas, protocol, subtopic } = cfg in  models.js   mqttnumb,,,, 
                                          //              >>>>>   adding cfg.haEnt='rssi'
                        }

                      },
                      //setSwitch:function (name,cmdent,ent,ctlpack){// see  WSTMS 
                        setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// *** use fv3 device topics(topic,pubtopic,cmd topic) that interfaces fv3 with real device to interface related ha entity and its triggers,changes
                                                                                  //      returns the ha topic/pubtopic trigger handler 
                                                          //                         type 1 :the ha entity control the real devices usually with same topics . 
                                                          //                                    so we must relay the fv3 topics to :
                                                          //                                      - transmit the fv3 pubtopic to real device  . this is achived changing ha switch state after received pubtopic from fv3 
                                                          //                                            infact when writesync: fv3 publish to (topic/) pubtopic ( so not call fv3 handler msgList(topic,val) that is subscribed only to topic and cmd topic ) and 
                                                          //                                                                    fire a ha setstate service to associated switch entity (via  writeWs func ha handler of pubtopic x this dev ) 
                                                          //                                      - dont need to transmit back the real ha topic coming from real device  to fv3 
                                                          //                                     and transmit the cmd topic from the dedicated button entity  to send external cmd to managed device  by interrupt handler 
                                                          //                                            thats calling ctlcb(topic,val) that will call the msg handler : msgList(topic,val) 
                                                          //                          type 2/4 :the ha entity monitor the fv3 published topic  
                                                          //                                     and transmit the cmd topic from the dedicated button entity  to send external cmd to var device managed by interrupt handler
                                                          //                          type 3  : ...........



                                                          //      obsolete:
                                                          //  * ha >> fv3 :
                                                          //    - (type 3,4?) : add a ws listener for the state-changed entity (button/switch) on associated ha entity to fill the corresponding dev queue  
                                                          //      or
                                                          //    
                                                          //    - (type 1,2):  from associated ha cmd topic button entity send a cmdtopic to fv3 message handler the will issue a interrupt to specific user interface ws handler 
                                                          //       that will set a manual(user/external request/cmd) algo object  

                                                          //          >>> nb fw3 type 1,2 dev dont receive dev topic from ha, because not interested
                                                          //              , so device income goonP() cant fill dev queue 
                                                          //          but the proposal to  fv3 to change dev state (event from user int like ws)  must be done as cmd topic and managed throught interrupt calling associated browser ws handler

                                                          //  * fv3 >> ha 
                                                          //  - will return the writeWs func to call from writeSync to trigger ha associated switch change process (usually call a setstate service)
                                                          //    the name dev will be mapped to ha entity ent provided by customer in models numbSubscr,,, or something else

                                                          //  nb from fv3 , ex from models.js we get the associated ha entity and its cmd topic entity
                          /* remember ctlpack= {ctl:new fc(gp,ind,inorout,cfg,that),devNumb:ind,type:'mqtt'}

                          */

                         // let entStates=null;// hass......    todo point to state traced by hass , ex entStates['switch.rssi']='on'

                         let ctl=ctlpack.ctl,url;
                         let {topicMsg,cmdtopicMsg,cfg}=ctl;
                        let portid=ctl.gpio,// dev portid
                        devind=ctlpack.devNumb,// dev index;
                        type = ctl.cl;// 0,1,2,3,4 , used to .....
                          portid==0?url='':url='setMan';// cmdtopic url setMan excluding portid 0 
                        


                        // let {eventMng='mqtt',haEntity,haManButton,package,dashboard}=cfg;// cfg =plant.mqttnumb/mqttprob[dev], the dev cfg

                        // ??
                        let {eventMng='mqtt',
                            haEntity,haManButton,// used to fire cmdtopic to fv3 , use a std cmdtopic msg format (PPLL) 
                            state // used in state dev: portid==777, to update ha entities using a proper msg format on topic msg
                            }=cfg;// todo : ** are recovered on cfg=ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev], the dev cfg, 
                                                                        // ctlpack.ctl.cfg.haEntity is the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,
                                                                        // nb  only device that are relayed on user ha can have haEntity,and (no probe ) haManButton
                                                                        // haEntity is the target of topic or pubtopic 
                                                                        // haManButton event are source of cmdtopic msg to fv3
                                                                        // state only for portid=777
                          
                          /*
                          when add a plant for a user we add a basic info in models.plants ,
                           the user can register giving info:
                           - its hw connected relay to connect ex consenso e probes
                            - token per connettersi al ha del user via ws con questo modulo
                           a questo punto posso generare i file yalm in package e in dashboards via std obj (rispecchiano i file ora usati )che updato in funzione di  info
                            usandi il handler di app.post("/registerPlant/"  solo che riepio i package e dashboard invece che fare chiamata webhook 
                            ora qui posso trasferirli usando il sevice di trasferimento file che temporaneamente e' in configuration.yaml che il user deve aggiungere al suo configuration 
                            o in alternativa si copiera il pachage e il dashboard scaricabili durante la registrazione
                            see transYalm()

                            question: il supervisor ha per caso la capacità di leggere scrivere i file ??


                          */

                          // 



                          let cmdent=haManButton,// the button entity to send cmd topicto a dev (not type 3)  PPLL
                                                          //  - if type=1,2,4  entity that fire cmdtopic in a msg with url  'setMan' : haManButton=[[entity,on/off]
                                                          //  - if type=0 the entity that fire cmdtopic in a msg  with url  'mqttxwebsock' and its event :
                                                          //                    : haManButton=[[entitytostartprogram,event='repeatcheckxPgm'],
                                                          //                                    [entitytostartprogram,event='stopcheckxPgm'],
                                                          //                                    [entitytostartprogram,event='repeatcheckxSun",
                                                          //                                    ....
                                                          //                                  ],

                                                          /* ex: 
                                                          cfg.haManButton=[['input_button.setManx3hours_portid11','on'],// todo : ha entity firing event on url related to cmdtopic :setMan
                                                                          ],

                                                          cfg.haManButton=[['input_button.start_savingservice','repeatcheckxSun'],// entity firing event on url related to cmdtopic of this dev 
                                                                          ['input_button.stop_savingservice','stopcheckxSun'],
                                                                          ['input_button.start_progservice','repeatcheckxPgm'],
                                                                          ['input_button.stop_progservice','stopcheckxPgm']]
                                                                        

                                                          */

                          ent=haEntity; //  ha entity   >>    fv3 dev : 
                                        // type 3 dev (probe) :  the ha entity that send topic (not pubtopic or ) msg to dev income process (goonP) ,    PPLL 

                                        // fv3 dev  >>   ha entity  : 
                                        // type 1 dev : the ha entity to update on a pubtopic dev msg 
                                        // type 2,4 dev, not portid=777 : the ha entity to update on a topic dev msg
                                        // type 4 , portid=777 , a state dev , use state property , not this one !

                                        //  ex: 'switch.rssi' , the switch entity to represent the dev state  PPLL 
                                        /*

                                                haEntity:localEntity.switch_consenso},// this dev has a ha entity related whose name is inserted on plant.localEntity
                                        */

                          // now 
                          // - foreach dev type we must simulate the mqtt message handler call client.on('message',msgList=function (topic, message, packet) 
                          //    that, using mqtt, would be pub on a topic from ha after a change on corresponding dev entity in ha (  entity( switch/sensor) ,cmd topic button x fire interrupt) on dev topic or cmdtopic
                          //    compreso il dev type 0 that is a dev that receives cmd topic whose interrupt call a subset of browser ws emit events
                          //    >> in pratica ha deve mandare via wsclient nel message handler msgList  gli stessi msg sui topic che i dev si aspettano usando il normale  mqtt client !
                          //        in sostanza i topics sono :
                          //              per il type 3 probe il  topic topic
                          //              per type 1  il pubcopy e il cmd topic (il topic non interessa)
                          //              per  il type 2 il topic e il cmd topic
                          //              per il type 0 il topic
                          // - return the handler to call when the dev writesync pub data on pubtopic(/topic): wsclient.publish()
                          //        must update same ent like in mqtt case the ha mqtt trigger set from a message on pubtopic/topic 
                          //       HHSS : will trigger update of entity ent when dev writesync call wsclient.publish(dev_pubtopic, data)
                          //            nb in state dev , portid=777 we fill many entities from state values, all must be mapped to the entity in the package cfg that must be cloned/downloaded/webhooked fron fv3 server
                          //            temporaneamente lavoriamo su fixed package , so name are fixed and do need to be mapped in cfg data (models.js)
                          //     >> il pratica i dev writesync sono pub su :
                          //                pubtopic (type 1) e vanno a controllare il device fisico in attesa di msg su pubtopic o 
                          //                vengono  cortocircuitati nel topic (type 2 e 4) , :
                          //                    - quindi alimentando il queue del dev via handler msgList su topic e/o 
                          //                    - osservato da chi e' eventualmente subscribed su tale topic (che e' solo ha nel caso di wsclient)
                          //                se uso wsclient devo quindi assicurare che i messaggi publicati da writesync assieme al loro topic  alimenti un handler (HHSS) 
                          //                    che sia in grado di updatare le entity associate al device
                          //                     es : triggerare azioni service o event firing
                          //                     nb l'hanler dovra nel caso di type 1 dovra gestire lo update del entity associata che essendo entity reale avra un nome customizzato che 
                          //                      potra essere inserito in models.js nella conf del dev
                          //                      ma potra come nel caso del dev state (type 4 , portid 777) updatare le var state che sono associate a altrettante entity che non dipendono dal plant
                          //                        costanti perche definite nella config del package associato
                          //                      a fv3 comprese le dashbord def.

                          if(type!=-1){// useless, any type, but some ent , cmd ent can be null 
                                        // usually not all dev type has  a ha cmdent (button ) to send cmd topic , ex type 3
                                        //  type 1 and 2 and 4 and 0  are usually not interested to track the topic state of real entity ent on ha
                                        //  
                        //

                        /*
                        let hasent=false,hascmdent=false;
                        if(cmdent!=null) {if(Actstates[cmdent]==true) hascmdent=true;// already registered to trace cmdent state_changed event
                            else Actstates[cmdent]=true;} // aggiungo l'entity [] to trace all entities that can send this dev cmdtopic that are:
                                                          //  - if type=1 the entity that fire cmdtopic with url  'setMan' 
                                                          //  - if type=0 the entity that fire cmdtopic with url  'mqttxwebsock' and its event 
                                                          // es x consenso sara ent=switch.rssi e cmdent=input_button.setmanual_rssi_on_but
                            if(ent!=null) {if(Actstates[ent]==true) hasent=true;// already registered
                        else  Actstates[ent]=true;}
                        if(hascmdent&&hasent)return false;//  alredy processed 

                          // if want present value : 
                          //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                          //  ctlcb(name,inState[name]);

                          //   **  a) ha firing topics : depending on dev (use index or portid) fire  publish on topic (type 3 (probe), only ? ) or cmd topic ( type 1,2,4) 

                         // nb this client is the haws client homeassistant-ws, not the custom ws client wsclient in haWs!

                         if(!hascmdent)// ?
                          */
                         let probee;// is a probe
                        if(cmdent||(probee=ent&&type==3))
                        client.on('state_changed', (stateChangedEvent) => {// add a listener x future changes . here checks the dev related entity (haEntity,haManButton) that fire topic and cmdtopic x this dev 
                                                                            // we could have just 1 listener that check all entity for all devs 
                          let msgtopics;// the msg x cmdtopic issued by this dev of type 2 : 

                          let finded,entity_=stateChangedEvent.data.entity_id;
                          if(cmdent&&(finded=findCmdtopicEnt(entity_))>=0){ // PPLL  ha entity want change a dev (! type 3 ) val will send a cmdtopic with a msg on std format
                                                                    //    depending on type we set automatically the url so that in income goonP() the correct interrupt handler will be chosen 
                                                                    //          type 0 : url= 'mqttxwebsock'
                                                                    //          type 1,2,4 url='setMan'
                                                                    // >>>>>>>>>>>>>    entity var or id ???????????   changes on cmdent entity 
                                                                                        // check is entity_id like switch.rssi   ???????
                                    // this will use the  client = await hass() set up of a emitter interface subscription: client.on ( works after launched command  command({ type: 'subscribe_events' },  )
                                    // but can also define a some additional triggers (see https://developers.home-assistant.io/docs/api/websocket/) like : 
                                   //  setTrigger: async () => command({ type: 'subscribe_trigger' }, client),
                                    /*
                                    {
                                                  "id": 2,
                                                  "type": "subscribe_trigger",        // command FRTT
                                                  "trigger": {
                                                      "platform": "state",
                                                      "entity_id": "binary_sensor.motion_occupancy",
                                                      "from": "off",
                                                      "to":"on"
                                                  }
                                              }


                                          and , using a button will be :
                                               .... {
                                                  "platform": "state",
                                                  "entity_id": "input_button.start_ensavings"
                                                } ....


                                    */ 
                                   // and manages the .onTrigger() (like we did with .on()  !!) checking the return of the command FRTT with its  id=2

                          let entity=entity_,// ok ?
                          event=cmdent[finded][1];
                          console.log(' rssi manual button state_changed event update (button entity',entity,' was pressed or its automation firing an event: ',event,')  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                          // ctlcb(name,stateChangedEvent.data.new_state.state);// B)

                          
                                              //             "topic": "@Casina_API@ctl_var_gas-pdc_4/NReadUser/cmd",
                                              //     msg >>       "{\"payload\":1,\"sender\":{\"plant\":\"Casina_API\",\"user\":1055},\"url\":\"setMan\",\"checked\":1,\"data\":{{ states.input_number.hour.state}}}\n"
                          

                          // ** here we have a to issue a dev cmdtopic msg. to fv3 income . it depende on dev type (?) and protocol because must be handle according to fv3 income handler 
                          //    so the msg x topic of a device is got by ctl.topicMsg=msgFormat.topicMsg;  and ctl.cmdtopicMsg
                          //  il dev avendo dichiarato haManButton sul dev mqttnumb significa che il entity haManButton è usato per emettere un cmdtopic msg che ha un format base che contiene
                          //  url che viene usato in goonP per cercare un handler registrato in una property ctl.int1 . l'handler lavora con msg con format base o uno esteso.
                          //  il msg viene creato da ctl.cmdtopicMsg che per costruire il msg (format base o esteso) ha a disposizione il context ctl che builda il msg per i 
                          //  url implementati (inserire handler, suo mappaggio in goonP, build del msg in cmdtopicMsg in msgFormat poi assegnato come property di ctl)

                        let url;
                        // >>>>  if a cmdtopic of a deve can fire more urls , add url to array in haManButton ex : 
                        //        cfg.haManButton=[['input_button.setManx3hours_portid11','on',url='setMan']],// 
                        type?url='setMan':url='mqttxwebsock';// set std url for dev type
                      
                        //+/  Actstates cant contain all entity addressed on cmdtopicMsg  !! (url,event=null,param=null,val_=0,Actstates,trackEnt,user='extctlId'
                         msgtopics=ctl.cmdtopicMsg(url,event,param=null,1,Actstates,trackEnt,user='extctlId');// the payload, ha id, the url of the interrupt handler
                          ctlcb(topicNodeRed,msgtopics);// press of cmdent button will pub  new val on dev topicnodered=cmdtopic , so incoming process handler goonP() will receive val on the dev cmdtopic 
                                  // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                                  // in mqtt int  we did : ......................

                         
                          } else if(probee&&stateChangedEvent.data.entity_id==ent){//ha entity send  dev topic msg: called only x probs (type 3). if ha entity want change a dev (! type 3 ) val will send a cmdtopic !
                            console.log(' ha entity transmit msg value to topic, only x sensor ....todo)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                            // ctlcb(name,stateChangedEvent.data.new_state.state);// B)

                            // ** here we have a to issue a dev topic msg. to fv3 income . it depende on dev type (?) and protocol because must be handle according to fv3 income handler 
                           // msgtopics= "{\"payload\":1,\"sender\":{\"plant\":\"Casina_API\",\"user\":1055},\"url\":\"setMan\",\"checked\":1}";  // nb data is useless !
 
                            msgtopics=ctl.topicMsg(stateChangedEvent.data.new_state.state);// build/format the msg for the topics topic , msg is simply stateChangedEvent.data.new_state.state (a number )

                            ctlcb(topic,msgtopics);// // changes of ent will pub new val on dev topic , so incoming process handler will receive val on the dev topic 
                            // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                            }
                          });

                            //   fv3  >>>> ha entities, sending device info to ha entities
                            // >>>>  ** now RETURN a function that will be used to update the ha entity related with the dev indipendentemente  of the topic/pubtopic but depending from dev type (not type 3)
      
                            // fv3 dev are write(d using writesync that pub a val on dev pubtopic to change the state of dev that gives values publishing on  dev topic:
                            //      .pub('pubtopic',val)
                            //          nb some dev type, like 2 ( not in  4 ? ) , pubtopic=topic so simulate a real switch device that pub on topic (so fill dev queue (the dev state)) just the val it was comanded using pubtopic
                            // in haWs we are using haws instead of mqtt, so we build a custom ws client (wsclient) that when .pub on a pubtopic/topic must change the associated ha switch like when it was done using mqtt:
                            //  >> so in wsclient when we .pub a topic we must do the same of the mqtt handler called becaused subscribed  on the dev pubtopic :
                            //      change the dev associated switch state !
                            //  so  on caller set :swclient.pubs[pubtopic]= the handler HHSS
                            //    that handler will be called when writesync calls wsclient.pub('thedev_pubtopic',val)

                          //   fv3  >>>> ha entities, sending device info to ha entities
                          // ** b) ha receiving  topics (topics=topic or pubtopic if type 1) from dev.writeSync(): depending on dev do action ( no : depending on topic or pubtopic ),
                          //       usually ha will fire event or switch service to change the entity state
                          if(type==1){// a relay/pump dev , a topics=pubtopic msg

                            // todo implement  on dev type or index .....
                          
                          return function (val) {  // val is 0/1 (on/off) , topics= pubtopic
                                                // this is the handler for coming msg (from fv3) of ha subscribed dev topics ( YYKK ), ( topics is topic if type 2,4 anf pubtopic if type1)
                                                // as std mqtt case we can just updata the state of a mqtt switch or trigger a service from the coming mqtt msg topic 
                            
                            
                                                // HHSS : will trigger update of entity ent when writesync pubs on  dev pubtopic for type 1 and on topic for type 2 and 4:
                                                // in type 1 usually the ha entity ent is reading state from real device topic and pub on pubtopic to real device when we manually switch the device
                                                // so this func will be called when client.publish('topic',val) call with topic= the registered pubtopic on this device , see XXFF  
                            //    here we come for msg of topics (pubtopic x type1 , topic x type 2 e 4 : check it ! )
                            //    now the problem is the msg will be on/off unless the portid 777 dev that is the state dev 
                         
                            let act;
                            if (val==1)act=ON;else act=OFF;
                            docmd('ser','switch',act,ent);// 
                          };// call f('switch','turn_on','switch.rssi'

                        }else if(type==2||4){/* topics=topic
                          val =msg={"payload":0/1,"sender":{"plant":"Casina_API","user":55}
                          so like in mqtt entity :  "value_template": "{% if value_json.payload == 0 %} \"0\" {% elif value_json.payload == 1 %} \"1\" {% endif %}",
                        */

                            return function (val) {  // val is set in ioreadwritestatus:
                            
                            if(type==4&&portid==777){// portid=777  state dev: fill all std entity that depend on state var found on dev topic msg
                            // debug: topic should be @Casina_API@ctl_var_state_0
                            // use probmqtt state property to update entities when this dev will send a topic msg 
                            /*
                            val.payload= state:{anticipate,// send to ha the status it expects
                                        program,
                                        battery:new_scripts.aiax.battery,
                                        inverter:new_scripts.aiax.inverter,
                                        desTemp,// desidered temp , giorno only !
                                        relays:new_scripts.relays// the pump browser state
                                    }})
                              
  
                            /* mosquitto_sub -t @Casina_API@ctl_var_state_0   -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                            {"payload":{"state":{"anticipate":true,"program":true,"battery":1,"inverter":0,"desTemp":20,
                            "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}}},
                            "sender":{"plant":"Casina_API","user":777}}
                            // so no need to customize acs,battery,inverter,desTemp :

                            */
                           // battery entity :

                              state.forEach(el =>// 
                                 {
                                  let nval;// nb : convert boolean to string , let string , let number 
                                if (el[0] == 'sender.user') nval = val.sender.user;
                                else if (el[0].substring(0,6) == 'state.') {
                                  let attr=el[0].substring(6)
                                  if (typeof val.payload.state[attr] == 'boolean') { val.payload.state[attr] ? nval = 'ON' : nval = 'OFF'; } else nval = val.payload.state[attr];// true/false > ON/OFF
                                  
                                 docmd('ser', 'python_script', 'set_state', el[1], nval);
                                }
                                else if (el[0].substring(0,13) == 'state.ralays.') {//is the pump index in mqttnumb
                                  // convert relays tru/false to ON/OFF
                                  let attr=el[0].substring(13)
                                  //if(typeof state.relays[el[0]]=='boolean')
                                  { val.payload.state.relays[attr] ? nval = 'ON' : nval = 'OFF'; }
                                  docmd('ser', 'python_script', 'set_state', el[1], nval);
                                }// entity like input_text !
                              });
                           
                            
                            }else{// normal type 2,4  , topics=topic , update ent entity 
                        let value=JSON.parse(val).payload;// 0/1
                        let act;
                            if (value==1)act='1';else act='0';
                            
                            docmd('ser','python_script','set_state',ent,value) ;// text,set_text
                            }
                          }

                      }else return null;// other type (0,3) dont write to ha !
                          }
                      function findCmdtopicEnt(entity){
                            if(cmdent!=null){
                            for(let i=0;i<cmdent.length;i++){
                              if(cmdent[i][0]==entity)return i;
                            }
                            return -1;
                            }return -1;
                          }
                    },
                    /*
                    setCmdInterf:function (name,startcmdentity,stopcmdentity,ent){// see  WSTMS . ent : the entity associated to start stop algo ,ex: startcmdentity and stopcmdentity, the button entities to start stop the service 
                                                                                  // these entity usually are button , when pressed must send a msg on cmd topic x the interfae device (portid=0)
                                                                                  // see WQSD

                      //  * start/stop algo cmd ha >> fv3 event handler called using a interface device ( the cmd topic will call a browser ws event handler 
                      //        ex: event,handler :  socket.on('startprogrammer',repeatHandler1) . repeatHandler1 is called by interrupt intWebSock, when in goonP we process :
                      //                else {// isCmdTopic  ......       
                      //    - add a ws listener for the state-changed entity (button) on associated ha state cmd entity (ex: button start_progservice ) 
                      //        in mqtt si triggerava il change staus con un automation , id= strpgmserv, verso il cmdtopic interrupt  verso il interface (type 0 (~type 2)) int dev  :
                      //           @Casina_API@interface_mqtt_websock_0/NReadUser/cmd 
                      //        in ha ws we use the ctlcb to fire the  associated int dev  interrupt that is used to fire cmd algo handler (the same fired on receiving same emitted cmd from browser)
                      //            nb si potrebbe anche sparare un automation triggerando dal change button    o registrare banalmente un trigger sul change button state  in ws client 

                      //  * fv3 >> ha cmd status entity  BBFG
                      //  * fv3 state fills a type 4 state device (used just as a channel, a state probe input properties) >> ha fv3 algo status switch  and fv3 state vars x info (ex battery,,,, usually implemented  as probes in ha )   
                      //  - il cmd browser ws event 'state' lanciato/emitted , se attivo, verso il browser  ws e aggiornando con writeSync verso lo state dev : mqttprob[virtualindex[0]] ,  topic=@Casina_API@ctl_var_state_0:
                      //        stind=state.app.plantconfig.virt2realProbMap[0] ,  is the mqttprob dev type 4 ( mqttprob[virtualindex[0]]) reserved to pub (essendo type 4 si publica su pubtopic=topic ?) state var  using writesync   
                      //              mqttprob:[,,,{portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate'}}// state var , usually portid=777

     		   //??           //     ora, mentre in  mqtt si provvedeva a invialo sul topic del type 4 state dev, e , quindi raccolto dal associated ha state mqtt entity  optimizing_fv
     		   // ??           //    in  ha ws will use this returned function  writeWs  to send a turn_on/off service to associated state entity optimizing_fv


                      
                      //  nb fv3 , ex in models.js we get the type 4 state var and associated ha algo entity and its cmd topic entity

                      //   ..................... todo review following code :

                      let cmdent=startcmdentity,cmd;
                      if(Actstates[cmdent]) return false;// already registered
                      Actstates[cmdent]=true;
                      Actstates[stopcmdentity]=true;
                      // if want present value : 
                      //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                      //  ctlcb(name,inState[name]);
                      client.on('state_changed', (stateChangedEvent) => {// future changes , button press !!!
                      if(stateChangedEvent.data.entity_id==cmdent)cmd='ON';
                      else if(stateChangedEvent.data.entity_id==stopcmdentity)cmd='OFF';
                      if(cmd){
                      console.log(' algo button state_changed/buttonpress event update (button press or its automation firing an event)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                      // ctlcb(name,stateChangedEvent.data.new_state.state);// B)
                      // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                      ctlcb(name,cmd);
                      }});

                      // ?????? todo put here all switch/sensor that are triggered from state dev topic/pubtopic
                      return function (val) {
                      // if a number

                      let act;
                      if (val==1)act=ON;else act=OFF;
                      docmd('ser','switch',act,'switch.'+ent);
                      }// call f('switch','turn_on','switch.rssi'
                      
                      },
                      */
                    getCon:function(){// start connection 
                       kepAlive(true);
                        return { ws,// gethasscon=haws.getCon();   ws=gethasscon.ws() ; if(ws)ws.....()
                                      /*
                                          ws can be used to implement the function that make readsyn and writesync working with the external entity defined by protocol
                                          for example :
                                          - type 1
                                             in mqtt when we work with mqtt we write algo proposal in pub topic , check in topic and change the algo proposal with a cmd topic and its interrupts
                                             in ws we have a remote entity switch to command and to listen to cmd topic events
                                             so in ctl.writesync created by  ctl=new fc(gp,ind,inorout,cfg) called in : 
 	 			    										                                              ctlpack = mqttInst.fact(num, ind, iotype, injCustDev_) 
                                                                              see TTRROO in doc 
                                             we will send a service turn_on/off switch and attend on readsync some of :
                                              - the promise resolution (needed?)
                                              - the ricorrent data from switch state using a ricorreent trigger that change a specific event we are listening for (needed ?)
                                                    
                                              - the state transition from the switch that we are subsribed , or better

                       >>>>                   - we register a remote trigger that will send us the state change of wsitch
                                                           > use client.on('state_changes',) rinforzato da 
                                                                client.subTrigger('time_pattern','wsitch.rssi')
                                                                to fill the dev queue
                                                           or simply register a event client.on('state_changed', ) and check for specific swith changes on the switch
                                                           >>>> so we dont need to change config data just use user login info about its switch to interconnect !
                                                  +
                                                -  a recover of switch state in case of reconnection > use let states=await client.getStates(); at conn restarting 



                                      */

                    }
                    }
                }
                module.exports =  controller;