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
  `);let t=o.prepare("INSERT OR IGNORE INTO users (name, pin) VALUES (?, '0000')");for(let e of s)t.run([e]);t.free(),o.run("INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (1, 8, 0, 0)"),l(o)}return n}function l(e){let t=e||n;if(!t)return;let s=t.export(),i=Buffer.from(s);r.default.writeFileSync(a,i)}e.s(["getDb",0,i,"saveDb",0,l])},95116,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),l=e.i(69741),o=e.i(16795),d=e.i(87718),u=e.i(95169),E=e.i(47587),c=e.i(66012),T=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var _=e.i(220),v=e.i(89171),f=e.i(43793);async function L(){let e=await (0,f.getDb)(),t=e.exec(`
    SELECT f.id, f.user_id, f.tank_level, f.jerry_cans_full, f.jerry_cans_empty, f.created_at, u.name as user_name
    FROM fuel_logs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.id DESC
    LIMIT 1
  `),r=e.exec(`
    SELECT f.id, f.user_id, f.tank_level, f.jerry_cans_full, f.jerry_cans_empty, f.created_at, u.name as user_name
    FROM fuel_logs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.id DESC
    LIMIT 10
  `),a=e=>({id:e[0],user_id:e[1],tank_level:e[2],jerry_cans_full:e[3],jerry_cans_empty:e[4],created_at:e[5],user_name:e[6]}),n=t.length>0&&t[0].values.length>0?a(t[0].values[0]):{tank_level:8,jerry_cans_full:0,jerry_cans_empty:0},s=r.length>0?r[0].values.map(a):[];return v.NextResponse.json({current:n,history:s})}async function I(e){let t=await (0,f.getDb)(),{user_id:r,tank_level:a,jerry_cans_full:n,jerry_cans_empty:s}=await e.json();return r&&void 0!==a?a<0||a>8?v.NextResponse.json({error:"tank_level must be 0-8"},{status:400}):(t.run("INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (?, ?, ?, ?)",[r,a,n??0,s??0]),t.run("INSERT INTO activity_log (user_id, action, detail) VALUES (?, 'fuel_update', ?)",[r,`Tank ${a}/8, ${n??0} full / ${s??0} empty cans`]),(0,f.saveDb)(),v.NextResponse.json({success:!0},{status:201})):v.NextResponse.json({error:"user_id and tank_level are required"},{status:400})}e.s(["GET",0,L,"POST",0,I],28871);var A=e.i(28871);let x=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/fuel/route",pathname:"/api/fuel",filename:"route",bundlePath:""},distDir:"/tmp/next-build",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/fuel/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:h,workUnitAsyncStorage:O,serverHooks:U}=x;async function y(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),x.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/fuel/route";v=v.replace(/\/index$/,"")||"/";let f=await x.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!f)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:L,params:I,nextConfig:A,parsedUrl:h,isDraftMode:O,prerenderManifest:U,routerServerContext:y,isOnDemandRevalidate:m,revalidateOnlyGenerated:C,resolvedPathname:S,clientReferenceManifest:g,serverActionsManifest:w}=f,D=(0,l.normalizeAppPath)(v),b=!!(U.dynamicRoutes[D]||U.routes[S]),M=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,h,!1):t.end("This page could not be found"),null);if(b&&!O){let e=!!U.routes[S],t=U.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(A.adapterPath)return await M();throw new R.NoFallbackError}}let F=null;!b||x.isDev||O||(F="/index"===(F=S)?"/":F);let j=!0===x.isDev||!b,k=b&&!j;w&&g&&(0,i.setManifestsSingleton)({page:v,clientReferenceManifest:g,serverActionsManifest:w});let X=e.method||"GET",q=(0,s.getTracer)(),P=q.getActiveScopeSpan(),H=!!(null==y?void 0:y.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),G=(0,n.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,A,U,B);null==G||G.resetRequestCache(),globalThis.__incrementalCache=G;let K={params:I,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:j,incrementalCache:G,cacheLifeProfiles:A.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>x.onRequestError(e,t,a,n,y)},sharedContext:{buildId:L}},Y=new o.NodeNextRequest(e),$=new o.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>x.handle(W,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=q.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${X} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${X} ${v}`)}),l=async n=>{var s,l;let o=async({previousCacheEntry:r})=>{try{if(!B&&m&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let o=K.renderOpts.collectedTags;if(!b)return await (0,c.sendResponse)(Y,$,s,K.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);o&&(t[N.NEXT_CACHE_TAGS_HEADER]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,a=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:m})},!1,y),t}},d=await x.handleResponse({req:e,nextConfig:A,cacheKey:F,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:m,revalidateOnlyGenerated:C,responseGenerator:o,waitUntil:a.waitUntil,isMinimalMode:B});if(!b)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",m?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&b||u.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(Y,$,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};H&&P?await l(P):(n=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${X} ${v}`,kind:s.SpanKind.SERVER,attributes:{"http.method":X,"http.target":e.url}},l),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:m})},!1,y),b)throw t;return await (0,c.sendResponse)(Y,$,new Response(null,{status:500})),null}}e.s(["handler",0,y,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:O})},"routeModule",0,x,"serverHooks",0,U,"workAsyncStorage",0,h,"workUnitAsyncStorage",0,O],95116)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0j-ysu4._.js.map