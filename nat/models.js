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

      mqttnumb:[
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

        custDev: {// exported custom devices cmd ctl triggered by a writesync() on a regular dev 
                // nb if portid is gpio this customer will access to raspberry resources ! only 1 can usually !
                66: async function (set_v = 0 ,rs485,param={custSet:1,quiet:false,section:false},exec,relais) {// state value are inverted , inversion active:  0<>1.
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
                                    console.log(' executing shell: ', stdout, ' cioe ${stdout}');
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

cfgs.cfgMarsonLuigi_={ name:'MarsonLuigi_API_',// run in no raspberry
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
        mqttWebSock:        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'},// must be portid=0 ! : a dummy var that creates ctl websocket topic 

      mqttnumb:[// same dim as gpionumb 
                 {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
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
      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a type 2 var
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
                // nb if portid is gpio this customer will access to raspberry resources ! only 1 can usually !
                66: async function (set_v = 0 ,rs485,param={custSet:1,quiet:false,section:false},exec,relais) {// state value are inverted , inversion active:  0<>1.
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
                                    console.log(' executing shell: ', stdout, ' cioe ${stdout}');
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
                        plantName:plant,
                        custDev:plants[plant].cfg.custDev
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


function defFVMng(user,plant,localEntity)// default=casina class plant factory. copyed from casina, factory of a std plant template of FV app . now called by addUserPlant
                                          // localEntity will set numbmqtt and probmqtt : haEntity,haManButton 
                                          //  haEntity will set ,haManButton 
{       // plant=user+'_API',
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
      
                                  haManButton:[['input_button.start_savingservice','repeatcheckxSun'],// entity firing event on url related to cmdtopic 
                                  ['input_button.stop_savingservice','stopcheckxSun'],
                                  ['input_button.start_progservice','repeatcheckxPgm'],
                                  ['input_button.stop_progservice','stopcheckxPgm']
],
      
                                };// must be portid=0 ! : a dummy var that creates ctl websocket topic 
                                                                                                                        // todo >>>> must be added a user/token release process
      //mqttnumb:[{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
     // correct: 
     this.mqttnumb=[
        // {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475F7DE'},// clas 'out' or 'var' , same dim than gpionumb
                                                                                        // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
        {portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06',

         haEntity:'switch.rssi'//  will be updated with cust values, index 0 : haEntity,haManButton if the dev is connected to ha
              
              ,haManButton:[//  this non depend on cust def entity so just put in the constructor
                ['input_button.setmanual_rssi_on_but','on'],
                ['input_button.setmanual_rssi_off_but','off']
              
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
      haEntity:'input_text.text',// var gas/pdc, anticipate . ha un entity text e un cmd topic setMan on e off 
      haManButton:[['input_button.start_ensavings','on'],// ha entity firing event on url related to cmdtopic :setMan
      ['input_button.stop_ensavings','off'],// todo:  add std event on , off
       ]
    },// a var
      {portid:12,clas:'out',protocol:'shelly',subtopic:'_shelly1-34945475FE06',// acs
      haManButton:[['input_button.setmanual_acs_on_but','on'],//    this non depend on cust def entity so just put here in the constructor
      ['input_button.setmanual_acs_off_but','off']
      ],
      haEntity:'switch.acssw'// depend on the cust entity , will be updated, this dev has a ha entity related whose name is inserted on plant.localEntity.fv3 will send pubtopic to change entity state 






    }];// mqtt device info/id/port. number is the device id to subscribe

      

      this.mqttprob=[{portid:110,subtopic:'_shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_t',
       haEntity:'sensor.shelly_ht_temp'// will be merged correctly at new
    },//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'
        {portid:111,subtopic:'_shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_h'},
      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'},
        // {portid:77,clas:'var',protocol:'mqttstate',subtopic:'shelly1-666666666666'}
        {portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate',
        state:[// il func returned by setSwitch fillera le entity !  .    this non depend on cust def entity so just put here in the constructor
          ['state.battery','input_number.battery'],// * put battery value in entity input_number.battery !
          ['state.inverter','input_number.inverter'],// *
          ['state.desTemp','input_number.desTemp'],// *
          // [state.relays.acs,'input_text.acs'],  // * forse già usato solo come entity di acs pump: so useless 
          ['state.anticipate','input_text.opirun'],// * convertite true/false > 'ON'/'OFF'
          ['state.program','input_text.pgmrun'],// * convertite true > 'ON'
          ['sender.user','input_text.opt_service1'],// *
          ['sender.user','input_text.opt_service'],// * todo debug its value setting , 
        ]}
        ];// a var

        // merge  local real entities into plant dev configuration  (mqttnumb,mqttprobe,,,)
        this.mqttnumb.forEach((val,ind) => {if(localEntity.mqttnumb[ind]){
          if(localEntity.mqttnumb[ind].haManButton)if(val)val.haManButton=localEntity.mqttnumb[ind].haManButton;
        if(localEntity.mqttnumb[ind].haEntity)if(val)val.haEntity=localEntity.mqttnumb[ind].haEntity;}
       });
        this.mqttprob.forEach((val,ind) => {if(localEntity.mqttnumb[ind]){
          if(localEntity.mqttprob[ind].haManButton)if(val)val.haManButton=localEntity.mqttprob[ind].haManButton;
            if(localEntity.mqttprob[ind].haEntity)if(val)val.haEntity=localEntity.mqttprob[ind].haEntity;
            if(localEntity.mqttprob[ind].state)if(val)val.state=localEntity.mqttprob[ind].state;

        }});

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
        this.invNomPow=5;
        if(localEntity.huawei)this.huawei=localEntity.huawei// devid casina

        };
function defFVMng_(user,plant)// default=casina class plant factory. copyed from casina, factory of a std plant tempalte of FV app . now called by addUserPlant
        {  

        }

let haCfgData={casinauser1:{// ex: 'Casina'  , will be registered by user/installer from web  to create the user ha yaml file : addPlantHandler(user,cfgdata=haCfgData)
  email:'luigi.marson@gmail.com',
  token:'123',
  pass:'pass',
 
  localEntity: // AAQR this is user plant data formatted after gather it from a web. to insert on plant.localEntity and 
               // also merged into  mqttnumb,mqttprob as  state,haEntity,haManButton the ha entity that send topic and cmdtopic configured on :
               //        setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// **


  {mqttnumb:[{haEntity:'switch.rssi'//  index 0 : haEntity,haManButton if the dev is connected to ha
              /*  this non depend on cust def entity so just put in the constructor
              ,haManButton:[
                ['input_button.setmanual_rssi_on_but','on'],
                ['input_button.setmanual_rssi_off_but','off']
              
              ]*/

              },
      null,null,null,null,null,

      null,/*  this non depend on cust def entity so just put in the constructor
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
              haEntity:'switch.acssw'}
    
    
    ],// 
    mqttprob:[     { 
            haEntity:'sensor.shelly_ht_temp'},// or text.shelly_ht_temp ? really user sensor usually is mqtt....  !

   
      null,null,
       null/*  this non depend on cust def entity so just put in the constructor
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

module.exports = {
  init:function(){// add to plants, the registered plants
   haPlants= require('./haPlants.json');
    Object.assign(plants,haPlants);// merge into plants
    return this;
  },
        cfgData:haCfgData,// just to store the user specific data localEntity to use in addUserPlant()
        getconfig,// app funtionality custom cfg
        getPlant:function(token){return plantbytoken[token]},
        addUserPlant:function addUserPlant(user,browserUsr,reset=true){// ,cfgdata){// add a std template for fv optimization , cfgdata=haCfgData.x
                                                          // old : to review 
                                                          //  user registration process must recover all entries of cfgdata used to define the plant , expecially localEntity
                                                                                                // localEntity={}. // was {switch_consenso:switch.rssi,,} contiene riferimenti a ha entity che vengono inseriti in:
                                                                                                //  - alcuni dev cfg={,,,,  haEntity:localEntity.switch_consenso}
                                  
                                                                                                //  - in alcune delle cfg in ../packages (es in consenso : climate...heater=localEntity.switch_consenso)
                                                                                                //    e ../dashboards

          if(!this.cfgData[user]) return;
          let plant=user+'_API',// plant name
          {email,pass,token, 
            localEntity}=this.cfgData[user];// recover user info and real ha local entities definition . {email,pass,token,localEntity:{mqttnumb.mqttprob}}
                                            // dev related entity reference put on:  localEntity.mqttnumb/mqttprob[i].haEntity
                                            // will be used to -
                                            // - during plant config , merge the dev cfg plant dev configuration  (mqttnumb,mqttprobe,,,) and 
                                            // - to update the yaml file 
          if(reset)plants[plant]=null;
          if(plants[plant]!=null)return plants[plant];// already loaded 
                let 
                ucfg='cfg'+user,
                plantItem,
                dashboard,package// {filepath:yamlfile}
                cfg=cfgs[ucfg]=new defFVMng(user,plant,localEntity);// the plant devcfg , the std plant base template of FV app with user ha locals entity applied ,praticamente i suoi dev description 
                                              //   cfgs={cfguser:devcfg,,,,,}      plants={user_API:{cfg:devcfg,name,password,users,token,email}
                                              //                                                      ,,,,,,
                                              //                                                     }

               // old : let {eventMng='mqtt',haEntity,haManButton}=cfg;// todo : ** are recovered on cfg=ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev], the dev cfg, 
                                              // ctlpack.ctl.cfg.haEntity is the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,
                                              // nb  only device that are relayed on user ha can have haEntity,and (no probe ) haManButton
                                              // haEntity is the target of topic or pubtopic 
                                              // haMabButton event are source of cmdtopic msg to fv3

                
                plants[plant]=plantItem={cfg,// will be put in state.app.plant
                                                        // remember: // the dev  ha related entity is (ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev]).haEntity/haManButton is 
                                                        // the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,

                                                        

          

                        name:plant,// duplicated FFGG
                        passord:pass,// not used 
                        users:[browserUsr],
                        token:[token],// really token has a client and a permission to act on some data/process
                        email:email
                        ,localEntity // also stored here , after will be also merged to numb
                                      // was:{switch_consenso:'switch.rssi',sensor_t_giorno:"sensor.shelly_ht_temp"}
                        }
                plantItem.yaml={};// config (merge template with user local dev) yaml configuration x user plant 

                let add2configuration='';// to add tu user configuration.yaml 
                // input json to map
                let packjsonDir='../haCfg/defFVMng/package/energyEngineService/',dashjsonDir='../haCfg/defFVMng/dashboard/energyEngineService/';// the dir where we put the plant model devFVMng template
                let dashboards=`dashboard_yaml.json`,// list of json dashboard file 
                packages=[`anticipate_vardev.json`,`consenso.json`,'interface.json','sensor_acs.json'];// json file base sections, will be cfg with user plant locals entities
                // set custom/configurated yaml files:
                plantItem.yaml.dashboard=fillDash(dashjsonDir,dashboards,localEntity);// fill dasboards sections todo
                plantItem.yaml.package=fillPack(packjsonDir,packages,localEntity);//{filepath,yaml}//
                                  
                
                                    // a ha service or a file service will get the 2 dir to merge : dashboard , package
                                    // ex {./energyEngineService/anticipate_vardev.yaml:itsyaml,,,,} so first item will be set in hasscfg./package/energyEngineService/anticipate_vardev.yaml
                
                if(plantItem){
                    try {
                      haPlants[plant]=plantItem;
                        fs.writeFileSync('./nat/haPlants.json', JSON.stringify(haPlants,null,2));// or use a async :
                        if (!fs.existsSync('./haYaml/'+plant)) {
                          fs.mkdirSync('./haYaml/'+plant);
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
        getcfg,// all
        getconfig,
        getplant,// user staff
        ejscontext};// ejs context
   //     devid_shellyname,gpionumb,mqttnumb,relaisEv
   function fillDash(dashjsonDir,dashboards,localEntity){// set local entity , thats the entity on haCfgData.user.mqttnumb/mqttprobe[x].haEntity  ex rssi, acssw

    let mydash=require(dashjsonDir+dashboards);// a json file (yaml converted)
    // inject user local dev :
    mydash.views[2].cards[3].entities[4].entity=localEntity.mqttnumb[0].haEntity;// was 'switch.rssi';
    mydash.views[0].cards[2].cards[0].entities[1].entity=localEntity.mqttnumb[7].haEntity;// was 'switch.acssw';
    mydash.views[0].cards[1].outer.entity=localEntity.mqttprob[0].haEntity// was 'shelly_ht_temp';
    let myyamlF =YAML.stringify(mydash,{lineWidth:200});// yaml format
    // let myyaml =util.format('%s', myyamlF);// useless
    return myyamlF;
   

   }
   function fillPack(packjsonDir,packages_,localEntity){// take the json models in packjsonDir (devFVMng ossia casina like plant) and update them using user specific entity ( consenso, acs ,,) in localEntity
                                                        // returns a array of json file to populate a dir : pakage/energyEngineService
    /* storia di come si sono ottenuti i devFVMng
        le conf finali sono sotto packages e dashboards sotto dir energyEngineServices che tratta il modes Casina_API
        in save/haws/haws_package/energyEngineServices_before/energyEngineServices si mette i file yaml che si sono ottenuti dai test su Casina_API per portare le conf sotto packages
        poi si aggiunge la conversione  a json  che viene updatata per diventare i modelli in questa dir : haCfg/defFVMng/package/energyEngineServices/...
        nei modelli si configurano i nomi reali del plant che si aggiunge che sono in  plants[plant].localEntity
   
   
   
   */
      let package={};
    
   
    for(let i=0;i<packages_.length;i++){
      let js=require(packjsonDir+packages_[i]);// a json file (yaml converted)
     if(i==1){  // better: packages_[i]='consenso.json'
                // consenso (mqttnumb index = 0) is the only file to merge,  // other file has no local ref to update , 
            // set entity to configure in automation rssi :
            js['automation rssi'][0].action[0].data.entity_id=localEntity.mqttnumb[0].haEntity;// switch.rssi,  must be also : consenso['automation rssi'][0].alias='ws';
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
    return YAML.stringify(package,{lineWidth:200});// yaml format

  }
  function getIt(){// require a json file in   ./haCfg dir

  }
