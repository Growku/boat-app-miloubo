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
      `)}catch{}}l(i)}else{var o=n=new e.Database;o.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL DEFAULT '0000'
    )
  `),o.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      cancelled_at TEXT DEFAULT NULL
    )
  `),o.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
    ON reservations (date) WHERE cancelled_at IS NULL
  `),o.run(`
    CREATE TABLE IF NOT EXISTS fuel_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tank_level INTEGER NOT NULL CHECK(tank_level >= 0 AND tank_level <= 8),
      jerry_cans_full INTEGER NOT NULL DEFAULT 0,
      jerry_cans_empty INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `),o.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);let t=o.prepare("INSERT OR IGNORE INTO users (name, pin) VALUES (?, '0000')");for(let e of s)t.run([e]);t.free(),o.run("INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (1, 8, 0, 0)"),l(o)}return n}function l(e){let t=e||n;if(!t)return;let s=t.export(),i=Buffer.from(s);r.default.writeFileSync(a,i)}e.s(["getDb",0,i,"saveDb",0,l])},77842,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),l=e.i(69741),o=e.i(16795),d=e.i(87718),u=e.i(95169),E=e.i(47587),c=e.i(66012),T=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),_=e.i(89171),v=e.i(43793);async function f(){let e=(await (0,v.getDb)()).prepare(`
    SELECT f.tank_level, f.jerry_cans_full, f.jerry_cans_empty, f.created_at,
           u.name as reported_by
    FROM fuel_logs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
    LIMIT 1
  `);if(e.step()){let t=e.getAsObject();return e.free(),_.NextResponse.json(t)}return e.free(),_.NextResponse.json({tank_level:8,jerry_cans_full:0,jerry_cans_empty:0,created_at:null,reported_by:null})}e.s(["GET",0,f],69222);var A=e.i(69222);let I=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/fuel/latest/route",pathname:"/api/fuel/latest",filename:"route",bundlePath:""},distDir:"/tmp/next-build",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/fuel/latest/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:h,serverHooks:O}=I;async function U(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),I.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let _="/api/fuel/latest/route";_=_.replace(/\/index$/,"")||"/";let v=await I.prepare(e,t,{srcPage:_,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,params:A,nextConfig:x,parsedUrl:h,isDraftMode:O,prerenderManifest:U,routerServerContext:C,isOnDemandRevalidate:y,revalidateOnlyGenerated:g,resolvedPathname:m,clientReferenceManifest:S,serverActionsManifest:w}=v,b=(0,l.normalizeAppPath)(_),D=!!(U.dynamicRoutes[b]||U.routes[m]),F=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,h,!1):t.end("This page could not be found"),null);if(D&&!O){let e=!!U.routes[m],t=U.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(x.adapterPath)return await F();throw new R.NoFallbackError}}let M=null;!D||I.isDev||O||(M="/index"===(M=m)?"/":M);let X=!0===I.isDev||!D,j=D&&!X;w&&S&&(0,i.setManifestsSingleton)({page:_,clientReferenceManifest:S,serverActionsManifest:w});let q=e.method||"GET",P=(0,s.getTracer)(),k=P.getActiveScopeSpan(),H=!!(null==C?void 0:C.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),G=(0,n.getRequestMeta)(e,"incrementalCache")||await I.getIncrementalCache(e,x,U,B);null==G||G.resetRequestCache(),globalThis.__incrementalCache=G;let K={params:A,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:X,incrementalCache:G,cacheLifeProfiles:x.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>I.onRequestError(e,t,a,n,C)},sharedContext:{buildId:f}},Y=new o.NodeNextRequest(e),$=new o.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>I.handle(W,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=P.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${q} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${q} ${_}`)}),l=async n=>{var s,l;let o=async({previousCacheEntry:r})=>{try{if(!B&&y&&g&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let o=K.renderOpts.collectedTags;if(!D)return await (0,c.sendResponse)(Y,$,s,K.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);o&&(t[N.NEXT_CACHE_TAGS_HEADER]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,a=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,C),t}},d=await I.handleResponse({req:e,nextConfig:x,cacheKey:M,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:g,responseGenerator:o,waitUntil:a.waitUntil,isMinimalMode:B});if(!D)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",y?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&D||u.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(Y,$,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};H&&k?await l(k):(n=P.getActiveScopeSpan(),await P.withPropagatedContext(e.headers,()=>P.trace(u.BaseServerSpan.handleRequest,{spanName:`${q} ${_}`,kind:s.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},l),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,C),D)throw t;return await (0,c.sendResponse)(Y,$,new Response(null,{status:500})),null}}e.s(["handler",0,U,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:h})},"routeModule",0,I,"serverHooks",0,O,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,h],77842)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__03xy~bv._.js.map