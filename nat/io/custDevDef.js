let custDev = {// custom devices cmd ctl triggered by a writesync() on a regular dev
    66: async function (set_v = 0 ,rs485,param,exec,relais) {// state value are inverted , inversion active:  0<>1.
                                                                // better set exec and relais with init()
                                                                // relais is a array with fixed gpio input ctl, used to set type 4 var topic:
                                                                //      during a writesync we add to msg info about the sensor relais
                                                                // rs485 is a string to use in modbud custom dev 
                                                                // param values come from browser attributes to modify the command to send to modbus: todo
        // this ctl will start stop all splits by modbus ctl
        param=param||{quiet:false,section:false};
        let set_,quite=param.quiet,section=param.section;
        if (set_v == 1) set_ = '0'; else set_ = '1';// invert 0 <> 1 
        const adds = ['2', '3', '4', '5'];// all addresses 
        const adds1 = ['2', '3'];// section 1
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

    async function runMc(adds,mc,val){
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

        function cmd(addr,waction,value) {// ' 4188 ':on/off split
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

    10001: async function (incomVal,rs485,param,exec,relais) {// start he a custom device type prob. 
                                                            // can be sync ??
                                                        // use a type 4 mqttprob var that insert in topic the val : a json with probes val extracted by some script
                                                        // according with the optional incoming value params  set by fv3 algos
                                                        // if we are using  rpi gpio ....
                                                        // the other method to insert custom prob was the modbus sensor that was implemented  in fv3 algo using some config by models.js
                                                        // see in fv3  : async function shellcmd(sh,param){// param={addr:'notte',val:18}


        let inputgpio=relais[0];
        let dummy=11.11;
        incomVal.custProbeVal=dummy;// 

    }
}

module.exports = custDev;