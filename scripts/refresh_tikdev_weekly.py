#!/usr/bin/env python3
"""Seven-day, low-cost, bounded public-link health check for TikDev.
Uses GitHub's public search API plus YouTube oEmbed verification. Does not
scrape or download audio; never stores credentials or removes curated links.
"""
from __future__ import annotations
import json, os, pathlib, re, datetime, urllib.parse, urllib.request, urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUTPUT=ROOT/"DedSec-Project-Website/data/tikdev-weekly.json"
SITE=ROOT/"DedSec-Project-Website/TikDev.html"
UA="DedSec-Test-TikDev-weekly-cache/1.0"
def get_json(url, token=None, timeout=12):
    headers={"User-Agent":UA,"Accept":"application/vnd.github+json"}
    if token:headers["Authorization"]="Bearer "+token
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=timeout) as response:
            if response.status!=200: return None
            return json.load(response)
    except (urllib.error.URLError, TimeoutError, ValueError, OSError) as error:
        print("Request unavailable:",urllib.parse.urlsplit(url).netloc,str(error)[:160])
        return None
def load_existing():
    try:
        obj=json.loads(OUTPUT.read_text(encoding="utf-8"))
        return obj if isinstance(obj,dict) else {}
    except (FileNotFoundError,ValueError):return {}
def main():
    original=load_existing()
    token=os.getenv("GITHUB_TOKEN") or None
    # Bounded to one search request per weekly run; do not spend API quota per card.
    q=urllib.parse.urlencode({"q":"stars:>500 archived:false fork:false",
                              "sort":"updated","order":"desc","per_page":60})
    answer=get_json("https://api.github.com/search/repositories?"+q,token)
    repositories=[]
    if isinstance(answer,dict) and isinstance(answer.get("items"),list):
        for raw in answer["items"]:
            if not isinstance(raw,dict) or not raw.get("full_name"):continue
            repositories.append({key:raw.get(key) for key in (
                "id","name","full_name","html_url","description","stargazers_count",
                "forks_count","watchers_count","language","topics","updated_at",
                "pushed_at","created_at","open_issues_count","archived","fork",
                "private","default_branch","license","size")}|{
                    "owner":{"login":(raw.get("owner") or {}).get("login"),
                             "avatar_url":(raw.get("owner") or {}).get("avatar_url")}})
    if not repositories:
        repositories=original.get("repositories",[])
        print("Keeping last known repository snapshot; search unavailable")
    html=SITE.read_text(encoding="utf-8")
    stations=[]
    pattern=r'data-music-id="([^"]+)"[^>]*data-music-title="([^"]+)"[^>]*data-music-subtitle="([^"]+)"[^>]*data-music-channel="([^"]*)"'
    previous={s.get("id"):s for s in original.get("audio",[]) if isinstance(s,dict)}
    for video_id,name,subtitle,link in re.findall(pattern,html):
        status="offline" if video_id.startswith("ambient:") else "unverified"
        # YouTube oEmbed can reject valid live streams; a negative check is
        # inconclusive and must never disable playback.
        if re.fullmatch(r"[A-Za-z0-9_-]{11}",video_id):
            url="https://www.youtube.com/oembed?"+urllib.parse.urlencode({
                "url":"https://www.youtube.com/watch?v="+video_id,"format":"json"})
            payload=get_json(url,timeout=6)
            status="reachable" if isinstance(payload,dict) and payload.get("title") else "unverified"
        stations.append({"id":video_id,"title":name,"channel":link,
                         "status":status if status!="unverified" else
                           previous.get(video_id,{}).get("status","unverified")})
    snapshot={"schema":1,
              "updated_at":datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
              "refresh_interval_days":7,
              "source":"GitHub public search; YouTube oEmbed best-effort",
              "repositories":repositories,"audio":stations}
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Snapshot ready: {len(repositories)} repositories and {len(stations)} audio sources")
if __name__=="__main__":main()
