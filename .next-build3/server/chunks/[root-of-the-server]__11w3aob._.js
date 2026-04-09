module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},43793,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"boat.db"),n=null,s=["Lou","Josha","Ruby","Wouter","Corine","Maarten","Nicole","Tom","Michael","Bob","Reinout"];async function i(){if(n)return n;let e=await (0,t.default)();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);var i=n=new e.Database(t);try{i.exec("SELECT pin FROM users LIMIT 1")}catch{i.run("ALTER TABLE users ADD COLUMN pin TEXT NOT NULL DEFAULT '0000'")}try{i.exec("SELECT cancelled_at FROM reservations LIMIT 1")}catch{i.run("ALTER TABLE reservations ADD COLUMN cancelled_at TEXT DEFAULT NULL")}i.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);try{let e=i.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='reservations'");if(e.length>0&&e[0].values.length>0){let t=e[0].values[0][0];t.includes("UNIQUE")&&t.includes("date")&&(i.run("ALTER TABLE reservations RENAME TO reservations_old"),i.run(`
          CREATE TABLE reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            cancelled_at TEXT DEFAULT NULL
          )
        `),i.run(`
          INSERT INTO reservations (id, user_id, date, created_at, cancelled_at)
          SELECT id, user_id, date, created_at, cancelled_at FROM reservations_old
        `),i.run("DROP TABLE reservations_old"),i.run(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
          ON reservations (date) WHERE cancelled_at IS NULL
        `))}}catch{try{i.run(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
        ON reservations (date) WHERE cancelled_at IS NULL
      `)}catch{}}o(i)}else{var l=n=new e.Database;l.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL DEFAULT '0000'
    )
  `),l.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      cancelled_at TEXT DEFAULT NULL
    )
  `),l.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
    ON reservations (date) WHERE cancelled_at IS NULL
  `),l.run(`
    CREATE TABLE IF NOT EXISTS fuel_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tank_level INTEGER NOT NULL CHECK(tank_level >= 0 AND tank_level <= 8),
      jerry_cans_full INTEGER NOT NULL DEFAULT 0,
      jerry_cans_empty INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `),l.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);let t=l.prepare("INSERT OR IGNORE INTO users (name, pin) VALUES (?, '0000')");for(let e of s)t.run([e]);t.free(),l.run("INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (1, 8, 0, 0)"),o(l)}return n}function o(e){let t=e||n;if(!t)return;let s=t.export(),i=Buffer.from(s);r.default.writeFileSync(a,i)}e.s(["getDb",0,i,"saveDb",0,o])},69597,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),E=e.i(47587),c=e.i(66012),T=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),v=e.i(89171),A=e.i(43793);async function _(e){let t=await (0,A.getDb)(),{searchParams:r}=new URL(e.url),a=r.get("month"),n=r.get("year"),s=r.get("upcoming"),i=`
    SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    WHERE r.cancelled_at IS NULL
  `,o=[];if("true"===s){let e=new Date().toISOString().slice(0,10);i+=" AND r.date >= ?",o.push(e),i+=" ORDER BY r.date ASC LIMIT 5"}else a?(i+=" AND r.date LIKE ?",o.push(`${a}%`)):n&&(i+=" AND r.date LIKE ?",o.push(`${n}%`)),i+=" ORDER BY r.date ASC";let l=t.prepare(i);o.length>0&&l.bind(o);let d=[];for(;l.step();){let e=l.getAsObject();d.push(e)}return l.free(),v.NextResponse.json(d)}async function I(e){let t=await (0,A.getDb)(),{user_id:r,date:a}=await e.json();if(!r||!a)return v.NextResponse.json({error:"user_id and date are required"},{status:400});let n=t.exec("SELECT id FROM reservations WHERE date = ? AND cancelled_at IS NULL",[a]);return n.length>0&&n[0].values.length>0?v.NextResponse.json({error:"This date is already reserved"},{status:409}):(t.run("INSERT INTO reservations (user_id, date) VALUES (?, ?)",[r,a]),t.run("INSERT INTO activity_log (user_id, action, target_date, detail) VALUES (?, 'booked', ?, 'Reserved this date')",[r,a]),(0,A.saveDb)(),v.NextResponse.json({success:!0},{status:201}))}async function h(e){let t=await (0,A.getDb)(),{searchParams:r}=new URL(e.url),a=r.get("id"),n=r.get("user_id");if(!a||!n)return v.NextResponse.json({error:"id and user_id are required"},{status:400});let s=t.exec("SELECT id, date FROM reservations WHERE id = ? AND user_id = ? AND cancelled_at IS NULL",[Number(a),Number(n)]);if(0===s.length||0===s[0].values.length)return v.NextResponse.json({error:"Reservation not found or not yours"},{status:403});let i=s[0].values[0][1];return t.run("UPDATE reservations SET cancelled_at = datetime('now') WHERE id = ?",[Number(a)]),t.run("INSERT INTO activity_log (user_id, action, target_date, detail) VALUES (?, 'cancelled', ?, 'Cancelled reservation')",[Number(n),i]),(0,A.saveDb)(),v.NextResponse.json({success:!0})}e.s(["DELETE",0,h,"GET",0,_,"POST",0,I],18827);var x=e.i(18827);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/reservations/route",pathname:"/api/reservations",filename:"route",bundlePath:""},distDir:".next-build3",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/reservations/route.ts",nextConfigOutput:"",userland:x,...{}}),{workAsyncStorage:U,workUnitAsyncStorage:f,serverHooks:g}=O;async function S(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/reservations/route";v=v.replace(/\/index$/,"")||"/";let A=await O.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!A)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:_,params:I,nextConfig:h,parsedUrl:x,isDraftMode:U,prerenderManifest:f,routerServerContext:g,isOnDemandRevalidate:S,revalidateOnlyGenerated:C,resolvedPathname:m,clientReferenceManifest:w,serverActionsManifest:y}=A,D=(0,o.normalizeAppPath)(v),b=!!(f.dynamicRoutes[D]||f.routes[m]),F=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,x,!1):t.end("This page could not be found"),null);if(b&&!U){let e=!!f.routes[m],t=f.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(h.adapterPath)return await F();throw new R.NoFallbackError}}let M=null;!b||O.isDev||U||(M="/index"===(M=m)?"/":M);let j=!0===O.isDev||!b,q=b&&!j;y&&w&&(0,i.setManifestsSingleton)({page:v,clientReferenceManifest:w,serverActionsManifest:y});let P=e.method||"GET",X=(0,s.getTracer)(),k=X.getActiveScopeSpan(),H=!!(null==g?void 0:g.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),G=(0,n.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,h,f,B);null==G||G.resetRequestCache(),globalThis.__incrementalCache=G;let K={params:I,previewProps:f.preview,renderOpts:{experimental:{authInterrupts:!!h.experimental.authInterrupts},cacheComponents:!!h.cacheComponents,supportsDynamicResponse:j,incrementalCache:G,cacheLifeProfiles:h.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>O.onRequestError(e,t,a,n,g)},sharedContext:{buildId:_}},Y=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),$=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>O.handle($,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=X.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${P} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${P} ${v}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!B&&S&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let o=K.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=K.renderOpts.collectedTags;if(!b)return await (0,c.sendResponse)(Y,W,s,K.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,a=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:S})},!1,g),t}},d=await O.handleResponse({req:e,nextConfig:h,cacheKey:M,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:f,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!b)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&b||u.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(Y,W,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};H&&k?await o(k):(n=X.getActiveScopeSpan(),await X.withPropagatedContext(e.headers,()=>X.trace(u.BaseServerSpan.handleRequest,{spanName:`${P} ${v}`,kind:s.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:S})},!1,g),b)throw t;return await (0,c.sendResponse)(Y,W,new Response(null,{status:500})),null}}e.s(["handler",0,S,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:U,workUnitAsyncStorage:f})},"routeModule",0,O,"serverHooks",0,g,"workAsyncStorage",0,U,"workUnitAsyncStorage",0,f],69597)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__11w3aob._.js.map