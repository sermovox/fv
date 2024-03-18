let custDev = {// exported custom devices cmd ctl triggered by a writesync() on a regular dev. NBNB : that WAS IN PREVIOUS IMPLEMENTATION . now see in medels.js !!
    66: async function (set_v = 0 , rs485, param_
        // ={custSet:1, quiet:false, section:false}
        , exec,conf) {// state value are inverted , inversion active:  0<>1.
                                                                // section is a param set when calling writeSync in fv3
                                                                //  better :
                                                                //      - pass state and get specific param with custParm  , see custParm=state.customParam;// 27012024
                                                                //      


                                                                // better set exec and relais with init()
                                                                // relais is a array with fixed gpio input ctl, used to set type 4 var topic:
                                                                //      during a writesync we add to msg info about the sensor relais
                                                                // rs485 is a string to use in modbud custom dev 
                                                                // param values come from browser attributes to modify the command to send to modbus: todo

        let state=param_,relays=state.relays;// assume that
        // this ctl will start stop all splits by modbus ctl
         param=state.customParam,
        set_, quite=param.quiet, section=param.section;

        if (custSet == 1) set_ = '0'; else set_ = '1';// invert 0 <> 1 
        const adds = ['2', '3', '4'];// all addresses 
        const adds1 = ['2', '3'];// section true
        console.log(' getio.js, on portid=66 writeSync() force a customdev write with param ', set_);
        //adds.forEach((val, ind) => {
        let  stderr_ , myadds=adds;// all
        if(section) myadds=adds1;
        await runFull(myadds,set_);

    async function runFull(adds,val) {
        await runMc(adds,' 4188 ',val);
        if(val='1'){
            if(quite)await runMc(adds,' 4190 ','1');
            else await runMc(adds,' 4190 ','3');
        }
    }

    async function runMc(adds,mc,val) {// adds : list od address,mc: modbus command, val : 0/1
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
    },
    10001: async function (incomVal,rs485,param,exec,relais) {// start he a custom device type prob. . TODO : review !
                                                        // use a type 4 mqttprob var that insert in topic the val : a json with probes val extracted by some script
                                                        // according with the optional incoming value params  set by fv3 algos
                                                        // if we are using  rpi gpio ....
                                                        // the other method to insert custom prob was the modbus sensor that was implemented  in fv3 algo using some config by models.js
                                                        // see in fv3  : async function shellcmd(sh,param){// param={addr:'notte',val:18}
        let inputgpio=relais[0];
        let dummy=11.11;
        incomVal.custProbeVal=dummy;// 
    },
    7077:  async function (set_v = 0 ,directiveFromFv3 , param_
        // ={custSet:1, quiet:false, section:false}
        , exec,conf) {// really is 55:  .  example x gas/pdc custom dev 
                // in this case we dont have a dedicated split relays state, x example in gas/pdc custom dev that must control a scaldabagno without create a new relays state  
                //  among other staff will control scaldabagnos

        let state=param_,relays=state.relays;// assume that
        // this ctl will start stop all splits by modbus ctl
        param=state.customParam;// {}// set in socket.on('startprogrammer',repeatHandler1);, the param x this handler, set in 
        if(param){scaldaB=param.scaldaB;// {topic,protocol} address od scaldab to activate
        if(scaldaB){
            let topic=scaldaB.topic,
                protocol=scaldaB.protocol;
            


            
        }


        }
    


    }
}
module.exports = custDev;