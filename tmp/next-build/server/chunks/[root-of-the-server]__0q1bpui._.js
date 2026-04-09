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
  `);let t=l.prepare("INSERT OR IGNORE INTO users (name, pin) VALUES (?, '0000')");for(let e of s)t.run([e]);t.free(),l.run("INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (1, 8, 0, 0)"),o(l)}return n}function o(e){let t=e||n;if(!t)return;let s=t.export(),i=Buffer.from(s);r.default.writeFileSync(a,i)}e.s(["getDb",0,i,"saveDb",0,o])},18816,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),E=e.i(47587),c=e.i(66012),T=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),v=e.i(89171),A=e.i(43793);async function I(e){let t=await (0,A.getDb)(),{searchParams:r}=new URL(e.url),a=r.get("year")||new Date().getFullYear().toString(),n=r.get("month"),s=a;n&&(s=`${a}-${n.padStart(2,"0")}`);let i=t.prepare(`
    SELECT u.id, u.name, COUNT(r.id) as trip_count
    FROM users u
    LEFT JOIN reservations r ON u.id = r.user_id AND r.date LIKE ? || '%' AND r.cancelled_at IS NULL
    GROUP BY u.id, u.name
    ORDER BY trip_count DESC, u.name ASC
  `);i.bind([s]);let o=[];for(;i.step();){let e=i.getAsObject();o.push(e)}i.free();let l=t.exec(`
    SELECT DISTINCT substr(date, 1, 4) as year
    FROM reservations
    ORDER BY year DESC
  `),d=l.length>0?l[0].values.map(e=>e[0]):[],u=new Date().getFullYear().toString();d.includes(u)||d.unshift(u);let E=t.prepare(`
    SELECT DISTINCT substr(date, 6, 2) as month
    FROM reservations
    WHERE date LIKE ? || '%' AND cancelled_at IS NULL
    ORDER BY month ASC
  `);E.bind([a]);let c=[];for(;E.step();){let e=E.getAsObject();c.push(e.month)}return E.free(),v.NextResponse.json({stats:o,availableYears:d,availableMonths:c})}e.s(["GET",0,I],43895);var h=e.i(43895);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/stats/route",pathname:"/api/stats",filename:"route",bundlePath:""},distDir:"/tmp/next-build",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/stats/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:_,workUnitAsyncStorage:x,serverHooks:U}=O;async function C(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/stats/route";v=v.replace(/\/index$/,"")||"/";let A=await O.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!A)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,params:h,nextConfig:_,parsedUrl:x,isDraftMode:U,prerenderManifest:C,routerServerContext:f,isOnDemandRevalidate:S,revalidateOnlyGenerated:g,resolvedPathname:m,clientReferenceManifest:w,serverActionsManifest:y}=A,D=(0,o.normalizeAppPath)(v),b=!!(C.dynamicRoutes[D]||C.routes[m]),F=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,x,!1):t.end("This page could not be found"),null);if(b&&!U){let e=!!C.routes[m],t=C.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(_.adapterPath)return await F();throw new R.NoFallbackError}}let M=null;!b||O.isDev||U||(M="/index"===(M=m)?"/":M);let X=!0===O.isDev||!b,P=b&&!X;y&&w&&(0,i.setManifestsSingleton)({page:v,clientReferenceManifest:w,serverActionsManifest:y});let q=e.method||"GET",j=(0,s.getTracer)(),k=j.getActiveScopeSpan(),H=!!(null==f?void 0:f.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),G=(0,n.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,_,C,B);null==G||G.resetRequestCache(),globalThis.__incrementalCache=G;let Y={params:h,previewProps:C.preview,renderOpts:{experimental:{authInterrupts:!!_.experimental.authInterrupts},cacheComponents:!!_.cacheComponents,supportsDynamicResponse:X,incrementalCache:G,cacheLifeProfiles:_.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>O.onRequestError(e,t,a,n,f)},sharedContext:{buildId:I}},K=new l.NodeNextRequest(e),$=new l.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest(K,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>O.handle(W,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=j.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${q} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${q} ${v}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!B&&S&&g&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!b)return await (0,c.sendResponse)(K,$,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:S})},!1,f),t}},d=await O.handleResponse({req:e,nextConfig:_,cacheKey:M,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:g,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!b)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&b||u.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(K,$,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};H&&k?await o(k):(n=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(u.BaseServerSpan.handleRequest,{spanName:`${q} ${v}`,kind:s.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:S})},!1,f),b)throw t;return await (0,c.sendResponse)(K,$,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:x})},"routeModule",0,O,"serverHooks",0,U,"workAsyncStorage",0,_,"workUnitAsyncStorage",0,x],18816)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0q1bpui._.js.map