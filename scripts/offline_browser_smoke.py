#!/usr/bin/env python3
"""Optional local Chromium smoke check for extracted static site and both locales.

Requires Python playwright package and a system Chromium executable. Runs on a
local HTTP server; makes no external requests or modifications to production.
"""
from __future__ import annotations
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json
import os
import threading
from urllib.parse import quote

from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HOST='127.0.0.1'

class SilentHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    os.chdir(ROOT)
    server=ThreadingHTTPServer((HOST,0),SilentHandler)
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    url=f'http://{HOST}:{server.server_port}/DedSec-Project-Website/index.html'
    findings=[]
    expected=json.loads((ROOT/"Documentation"/"OFFLINE_CURATION_MANIFEST.json").read_text(encoding="utf-8"))["retained_records_per_language"]
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
            for width,height,locale in [(390,844,'en'),(390,844,'el'),(1280,800,'en'),(1280,800,'el')]:
                page=browser.new_page(viewport={'width':width,'height':height},locale='en-US')
                errors=[]
                page.on('pageerror',lambda err:errors.append(str(err)))
                page.goto(url,wait_until='domcontentloaded',timeout=30000)
                page.wait_for_timeout(300)
                stats=page.evaluate('''() => ({en:window.ARCHIVE_EN?.length,el:window.ARCHIVE_EL?.length,ready:document.readyState,navbar:!!document.querySelector('#topbar'),title:document.title})''')
                assert stats['en']==expected['en'] and stats['el']==expected['el'],stats
                assert not errors,errors
                firstid=page.evaluate('''() => (window.ARCHIVE_EN||[]).find(x => x.p.endsWith('.md'))?.id''')
                page.goto(url+'#read:'+quote(firstid,safe=''),wait_until='domcontentloaded',timeout=30000)
                page.wait_for_timeout(350)
                text=page.locator('body').inner_text(timeout=10000)
                assert len(text)>350,(locale,width,len(text))
                findings.append({'width':width,'height':height,'requested_locale':locale,'indexed_en':stats['en'],'indexed_el':stats['el'],'body_characters':len(text),'javascript_errors':len(errors),'title':stats['title']})
                page.close()
            browser.close()
    finally:
        server.shutdown()
    dest=ROOT/'Documentation'/'OFFLINE_BROWSER_SMOKE.json'
    dest.write_text(json.dumps({'results':findings,'browser':'Chromium (system executable)','method':'local HTTP / Playwright','meaning':'Smoke test, not full visual or accessibility certification'},indent=2,ensure_ascii=False)+'\n','utf8')
    print('CHROMIUM_OFFLINE_SMOKE_PASS:',json.dumps(findings,ensure_ascii=False))
if __name__=='__main__':main()
