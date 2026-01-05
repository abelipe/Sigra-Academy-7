import http from 'http';

function get(path){
  return new Promise((resolve,reject)=>{
    http.get({hostname:'localhost',port:4300,path,agent:false},res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}));
    }).on('error',e=>reject(e));
  })
}

(async()=>{
  try{
    console.log('GET / ->');
    console.log(await get('/'));

    // removed endpoints from backend; tests skipped
  }catch(e){
    console.error('Error testing endpoints',e);
  }
  process.exit(0);
})();
