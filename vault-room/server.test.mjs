import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server } from './server.mjs';
test('room serves its assets but never source/server files or arbitrary paths',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  for(const path of ['/','/game.mjs','/model.mjs','/game.css']) {
   const response=await fetch(base+path);assert.equal(response.status,200,path);
   assert.ok(response.headers.get('content-security-policy').includes("script-src 'self'"));
   assert.ok((await response.text()).length>0);
  }
  for(const path of ['/server.mjs','/.env','/README.md','/../server.mjs'])assert.equal((await fetch(base+path)).status,404,path);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,404);
 } finally {await new Promise(resolve=>server.close(resolve));}
});
