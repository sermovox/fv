// see models in mvc : https://progressivecoder.com/how-to-create-a-nodejs-express-mvc-application/

// add wuawey passw 
/*

      //"userName":"MarsonLuigi_API",
      "systemCode":"Huawei@123" // put in .env
    url='https://eu5.fusionsolar.huawei.com/thirdData/login',
*/
let
cfgluigi={ plants_:['MarsonLuigi_API']},// ??





// TODO 
cfgs={};




cfgs.cfgMarsonLuigi={ name:'MarsonLuigi_API',// duplicated FFGG
        apiPass:'xxxx',// to do
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      gpionumb:[12,16,20,21,26,19,13,6],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

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
      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a var
      null],// mqtt device info/id/port. number is the device id to subscribe

      mqttprob:[{portid:110,subtopic:'ht-cucina',varx:null,isprobe:true,clas:'probe',protocol:'shelly'},//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'

      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'}],// a var

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
        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,false]}//{aintermediateinrelaisEv:[true,false,null,,,,]} update of virtual dev to apply if a intermediate is set true by anticipate
                        // or a function(state) returning [true,false,null,,,,]
                        // virtual pdc (index =7) is set true: appena il intermediate è true pdc e' settato e verra data priorita al acs piuttosto che al condizionamento
                        // se si vuole bloccare la acs nella partecentrale della finestra in cui gaspdcPref e' true va introdotto altre regole/array:
                        // ex : si introduce un contattore che misura i tempo di attivazione di gaspdcpref (t) e si setta pdc a t=0 e dopo le 14
                        ,anticInterm2VirtMap:{gaspdcPref:[true,true,true,null,null,true,null,false]}//{aintermediateinrelaisEv:[true,false,null,,,,]}
                        // or a function(state) returning [true,false,null,,,,]
        ,virt2realMap:[0,1,2,3,4,5,6,7],// std virtual group , map only if >=0 , some bugs: so use identity only
        virt2realProbMap:[-1,1000,-1,1001,-1,-1,-1],// algo works on index virt2realProbMap[0] of :
                                //  mqttprob
                                //  or ( if>1000) es 1003 > pythonprob[3] is the address to inquire modbus 
                                //  to find probs relating to g, virtual index 2 of gpionumb/mqttnumb pump dev
                                //  index 1 is the same but relating to n , virtual index 3 of gpionumb/mqttnumb pump dev
                                // better:
                                // virtual modbus python probs used by algo.  x : g , n , s  virtual zones temp/humid device map to  mqttprob dev
                                // algo wants to find mqttprob index of :[g temp,g humid,n temp,n humidg, s temp,s humid]
                                // -1 for undefined

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:6,
        huawei:{inv:"1000000035350464",bat:"1000000035350466"}// devid bunis 
        };
cfgs.cfgCasina={ name:'Casina_API',// duplicated FFGG
        apiPass:'xxxx',// to do, better use .env
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      gpionumb:[12,16,20,21,26,19,13,6],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
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

                                // virtualindex 0 is reservet to state pub var dev

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:5,
         huawei:{inv:"1000000036026833",bat:"1000000036026834"}// devid casina
        //huawei:{inv:"1000000035350464",bat:"1000000035350466"}// devid bunis 

        };
cfgs.cfgDefFVMng={ name:'cfgDefFVMng',// duplicated FFGG. now better use constructor addUserPlant()
        apiPass:'xxxx',// to do, better use .env
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      gpionumb:[12,16,20,21,26,19,13,6],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
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

                                // virtualindex 0 is reservet to state pub var dev

        relaisDef:[false,false,false,false,false,false,false,true],// dafault value (if none algo propose true/false)
        invNomPow:5,
        huawei:{inv:"1000000036026833",bat:"1000000036026834"}// devid

        };

let plants={MarsonLuigi_API:{cfg:cfgs.cfgMarsonLuigi,// will be put in state.app.plant
                name:"MarsonLuigi_API",// duplicated FFGG
                passord:"marson",// not used 
                users:['john'],
                token:['123'],// really token has a client and a permission to act on some data/process
                email:'luigi.marson@gmail.com'
                },
        DefFVMng_API:{  cfg:cfgs.cfgDefFVMng,
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

function addUserPlant(user,email_,password,token_){// add a std template for fv optimization

        let plant=user+'_API',
        ucfg='cfg'+user;
        cfgs[ucfg]=new defFVMng(user);
        plants[plant]={cfg:cfgs[ucfg],// will be put in state.app.plant
                name:plant,// duplicated FFGG
                passord:password,// not used 
                users:[user],
                token:[token_],// really token has a client and a permission to act on some data/process
                email:email_
                }
}


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
                        plantName:plant
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


function defFVMng(user)// factory of a std plant tempalte of FV app 
{ 
       this.name='cfg'+user;// duplicated FFGG
       this.apiPass='xxxx';// to do, better use .env
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      this.gpionumb=[12,16,20,21,26,19,13,6];// useless here
      // (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

        this.mqttWebSock=        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock'};// must be portid=0 ! : a dummy var that creates ctl websocket topic 
                                                                                                                        // todo >>>> must be added a user/token release process
      //mqttnumb:[{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
     // correct: 
     this.mqttnumb=[
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
      null];// mqtt device info/id/port. number is the device id to subscribe


      this.mqttprob=[{portid:110,subtopic:'shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_t'},//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'
        {portid:111,subtopic:'shellyht-1E6C54',varx:null,isprobe:true,clas:'probe',protocol:'shellyht_h'},
      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'},
        // {portid:77,clas:'var',protocol:'mqttstate',subtopic:'shelly1-666666666666'}
        {portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate'}
        ];// a var

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
        this.virt2realProbMap[3,0,1,-1,-1,-1,-1],// algo works on virtual index 1 ,rindex= virt2realProbMap[1] is the index in :
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
        this.huawei={inv:"1000000036026833",bat:"1000000036026834"}// devid

        };



module.exports = {getconfig,// app funtionality custom cfg
        getPlant:function(token){return plantbytoken[token]},
        getcfg,// all
        getconfig,
        getplant,// user staff
        ejscontext};// ejs context
   //     devid_shellyname,gpionumb,mqttnumb,relaisEv
