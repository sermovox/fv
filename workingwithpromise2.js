// see https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
/*
major cases 
error catched e returned ,alt1=1 :
const caso=1,// (solo se alt3=2) immediato o sync waitn2
caso_=2,// (solo se caso=2 o alt3=1) 1  error o 2 resolve
caso__=1,// 1:come caso_ ma in settimeout, 2: normal execution of promise
alt1=2,// 1 o 2 dimostra che lo staement blocca il prosieguo
alt3=1,// 1 corretto  o 2 sbagliato: modo di simulae un aiax  
alt4=2,// 1 regularly reject or resolve 
alt2=1;// 1 o 2  top func usa .then o await 

error catched e not returned ,alt1=2 :
const caso=1,// (solo se alt3=2) immediato o sync waitn2
caso_=1,// (solo se caso=2 o alt3=1) 1  error o 2 resolve
caso__=2,// 1:come caso_ ma in settimeout, 2: normal execution of promise
alt1=2,// 1 o 2 dimostra che lo staement blocca il prosieguo
alt3=1,// 1 corretto  o 2 sbagliato: modo di simulae un aiax  
alt4=2,// 1 regularly reject or resolve 
alt2=1;// 1 o 2  top func usa .then o await 

resolve:
const caso=1,// (solo se alt3=2) immediato o sync waitn2
caso_=2,// (solo se caso=2 o alt3=1) 1  error o 2 resolve
caso__=2,// 1:come caso_ ma in settimeout, 2: normal execution of promise
alt1=2,// 1 o 2 dimostra che lo staement blocca il prosieguo
alt3=1,// 1 corretto  o 2 sbagliato: modo di simulae un aiax  
alt4=2,// 1 regularly reject or resolve 
alt2=1;// 1 o 2  top func usa .then o await 

*/
const caso=1,// (solo se alt3=2) immediato o sync waitn2
caso_=1,// (solo se caso=2 o alt3=1) 1  error o 2 resolve
caso__=2,// 1:come caso_ ma in settimeout, 2: normal execution of promise
alt1=2,// 1 o 2 dimostra che lo staement blocca il prosieguo 1: blocca
alt3=1,// 1 corretto  o 2 sbagliato: modo di simulae un aiax  
alt4=2,// 1 regularly reject or resolve 
alt2=1;// 1 o 2  top func usa .then o await 

async function thisThrows() {// modo errato
  if(caso==1)  throw new Error("Thrown from thisThrows()");
  else { setTimeout(setn, 2000);// attenzioe setn non e' lanciato da questa function ma da settimeut . quindi thisThrows() un viene catchata 

  }
  function setn(){
    if(caso_)throw new Error("Thrown from setn()");
    else console.log('ok done');
    return 'prmise resolved'
}
}


function thisThrows2() {// alt3=1: modo corretto di simulare await aiax()
    let promised= new Promise((resolve,reject) => {
        
        if(caso_==1)throw new Error("Thrown super from thisThrows2()");// GG error thrown in promise 
        else  setTimeout(resolving, 3000);// warning : alternativo a GG ma non avviene catchata da thisThrows2() ma da settimeout !

        function resolving(){
            if(caso__==2){
            if(alt4==1) reject("rejected from thisThrows2()");// regularly reject
            else {resolve('aiax resolved ok ');// regularly resolve
            }
        }else {throw new Error("Thrown from thisThrows2()");// error thown in settimeout

        }
            
            }
    });
    return promised;

  }

let j=0;
async function myFunctionThatCatches() {
    let i=0,awret;
    try {
        if(alt3==1)awret=await thisThrows2(); // case 2: aiax waitig  modo corretto di simulare await aiax()
        else awret= await thisThrows(); // case 2: aiax waitig  modo errato
        i++;
    } catch (e) {
        console.error(e);
       if(alt1==1) return "Nothing found i: "+i+', j: '+j;// utile se si vuole bloccare il prosieguo !
    } finally {// exec sia con try che con catch. come se fosse prosieguo ma eseguito anche se e catchata 
        console.log('We do cleanup here i:',i);// run after try or catch  ends 
    }
    // continue 
    j++;
    console.log('We do work here j:',j,', awret: ',awret);
    
    return "all found i: "+i+', j: '+j+', awret: '+awret;
}

async function run() {
    const myValue = await myFunctionThatCatches();
    console.log(myValue);
}
function run2() {
   myFunctionThatCatches.then((myValue) =>console.log(myValue));
}
if(alt2==1)run();else run2;
console.log('all ends')