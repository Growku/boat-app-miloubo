(()=>{var a={};a.id=483,a.ids=[483],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:a=>{"use strict";a.exports=require("path")},4129:(a,b,c)=>{"use strict";c.d(b,{L:()=>m});let d=require("better-sqlite3");var e=c.n(d);let f=require("fs");var g=c.n(f),h=c(3873),i=c.n(h);let j=i().join(process.cwd(),"data","boat.db"),k=null,l=["Lou","Josha","Ruby","Wouter","Corine","Maarten","Nicole","Tom","Michael","Bob","Reinout"];function m(){if(k)return k;let a=i().dirname(j);return g().existsSync(a)||g().mkdirSync(a,{recursive:!0}),(k=new(e())(j)).pragma("journal_mode = WAL"),k.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()?function(a){a.prepare("PRAGMA table_info(users)").all().some(a=>"pin"===a.name)||a.exec("ALTER TABLE users ADD COLUMN pin TEXT NOT NULL DEFAULT '0000'"),a.prepare("PRAGMA table_info(reservations)").all().some(a=>"cancelled_at"===a.name)||a.exec("ALTER TABLE reservations ADD COLUMN cancelled_at TEXT DEFAULT NULL"),a.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);try{let b=a.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='reservations'").get();b&&b.sql.includes("UNIQUE")&&b.sql.includes("date")&&(a.exec("ALTER TABLE reservations RENAME TO reservations_old"),a.exec(`
        CREATE TABLE reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          date TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          cancelled_at TEXT DEFAULT NULL
        )
      `),a.exec(`
        INSERT INTO reservations (id, user_id, date, created_at, cancelled_at)
        SELECT id, user_id, date, created_at, cancelled_at FROM reservations_old
      `),a.exec("DROP TABLE reservations_old"),a.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
        ON reservations (date) WHERE cancelled_at IS NULL
      `))}catch{try{a.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
        ON reservations (date) WHERE cancelled_at IS NULL
      `)}catch{}}}(k):function(a){a.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL DEFAULT '0000'
    )
  `),a.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      cancelled_at TEXT DEFAULT NULL
    )
  `),a.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
    ON reservations (date) WHERE cancelled_at IS NULL
  `),a.exec(`
    CREATE TABLE IF NOT EXISTS fuel_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tank_level INTEGER NOT NULL CHECK(tank_level >= 0 AND tank_level <= 8),
      jerry_cans_full INTEGER NOT NULL DEFAULT 0,
      jerry_cans_empty INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `),a.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);let b=a.prepare("INSERT OR IGNORE INTO users (name, pin) VALUES (?, '0000')");a.transaction(()=>{for(let a of l)b.run(a)})(),a.prepare("INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (1, 8, 0, 0)").run()}(k),k}},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5215:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{DELETE:()=>y,GET:()=>w,POST:()=>x});var e=c(5736),f=c(9117),g=c(4044),h=c(9326),i=c(2324),j=c(261),k=c(4290),l=c(5328),m=c(8928),n=c(6595),o=c(3421),p=c(7679),q=c(1681),r=c(3446),s=c(6439),t=c(1356),u=c(641),v=c(4129);async function w(a){let b=(0,v.L)(),{searchParams:c}=new URL(a.url),d=c.get("month"),e=c.get("year");if("true"===c.get("upcoming")){let a=new Date().toISOString().slice(0,10),c=b.prepare(`
      SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.cancelled_at IS NULL AND r.date >= ?
      ORDER BY r.date ASC LIMIT 5
    `).all(a);return u.NextResponse.json(c)}if(d){let a=b.prepare(`
      SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.cancelled_at IS NULL AND r.date LIKE ?
      ORDER BY r.date ASC
    `).all(`${d}%`);return u.NextResponse.json(a)}if(e){let a=b.prepare(`
      SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.cancelled_at IS NULL AND r.date LIKE ?
      ORDER BY r.date ASC
    `).all(`${e}%`);return u.NextResponse.json(a)}let f=b.prepare(`
    SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    WHERE r.cancelled_at IS NULL
    ORDER BY r.date ASC
  `).all();return u.NextResponse.json(f)}async function x(a){let b=(0,v.L)(),{user_id:c,date:d}=await a.json();return c&&d?b.prepare("SELECT id FROM reservations WHERE date = ? AND cancelled_at IS NULL").get(d)?u.NextResponse.json({error:"This date is already reserved"},{status:409}):(b.transaction(()=>{b.prepare("INSERT INTO reservations (user_id, date) VALUES (?, ?)").run(c,d),b.prepare("INSERT INTO activity_log (user_id, action, target_date, detail) VALUES (?, 'booked', ?, 'Reserved this date')").run(c,d)})(),u.NextResponse.json({success:!0},{status:201})):u.NextResponse.json({error:"user_id and date are required"},{status:400})}async function y(a){let b=(0,v.L)(),{searchParams:c}=new URL(a.url),d=c.get("id"),e=c.get("user_id");if(!d||!e)return u.NextResponse.json({error:"id and user_id are required"},{status:400});let f=b.prepare("SELECT id, date FROM reservations WHERE id = ? AND user_id = ? AND cancelled_at IS NULL").get(Number(d),Number(e));return f?(b.transaction(()=>{b.prepare("UPDATE reservations SET cancelled_at = datetime('now') WHERE id = ?").run(Number(d)),b.prepare("INSERT INTO activity_log (user_id, action, target_date, detail) VALUES (?, 'cancelled', ?, 'Cancelled reservation')").run(Number(e),f.date)})(),u.NextResponse.json({success:!0})):u.NextResponse.json({error:"Reservation not found or not yours"},{status:403})}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/reservations/route",pathname:"/api/reservations",filename:"route",bundlePath:"app/api/reservations/route"},distDir:"/tmp/next-build-5",relativeProjectDir:"",resolvedPagePath:"/sessions/nifty-intelligent-tesla/mnt/Boat app - Miloubo/boat-app/src/app/api/reservations/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){var d;let e="/api/reservations/route";"/index"===e&&(e="/");let g=await z.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||z.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===z.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>z.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>z.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},6487:()=>{},8335:()=>{},9121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[331,692],()=>b(b.s=5215));module.exports=c})();