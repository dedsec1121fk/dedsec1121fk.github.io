#!/usr/bin/env python3
"""Index the canonical website HTML content, excluding chrome and executable code.

Physical /dedsec/ pages are canonical source records; build-time root aliases and
lesson previews are mirrors, not additional search hits. Never index remote feeds.
"""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re,sys
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'DedSec-Project-Website'
OUT=SITE/'data/site-search.js'
class PageText(HTMLParser):
 def __init__(self,locale):
  super().__init__(convert_charrefs=True);self.locale=locale;self.stack=[];self.body=[];self.heading=[];self.title=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);
  if tag in ('p','div','section','article','li','pre','h1','h2','h3','h4','tr'):self.body.append('\n\n')
  parent=self.stack[-1] if self.stack else {'skip':False,'replace':False,'scope':False,'h1':False,'title':False}
  scope=parent['scope'] or tag=='main' or 'page-content' in a.get('class','').split() or 'main-content' in a.get('class','').split()
  skip=parent['skip'] or tag in ('script','style','nav','footer','svg','noscript','iframe') or a.get('id','') in ('site-loader','collapseOverlay','dedsec-cookie-overlay') or any(x in a.get('class','').split() for x in ('merged-topbar','topbar','ambient-background','music-panel'))
  replaced=parent['replace'];value=a.get('data-gr' if self.locale=='el' else 'data-en')
  entry={'tag':tag,'skip':skip,'scope':scope,'replace':replaced or value is not None,'h1':parent['h1'] or tag=='h1','title':parent['title'] or tag=='title'}
  if not skip and not replaced and value is not None:
   value=re.sub(r'</?(?:a|b|strong|em|code|span|br|small|i)\b[^>]*>','',value)
   if scope:self.body.append(value)
   if entry['h1']:self.heading.append(value)
  if tag not in ('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'):self.stack.append(entry)
 def handle_endtag(self,tag):
  if tag in ('p','div','section','article','li','pre','h1','h2','h3','h4','tr'):self.body.append('\n\n')
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i]['tag']==tag:self.stack=self.stack[:i];break
 def handle_data(self,text):
  if not self.stack:return
  p=self.stack[-1]
  if p['title']:self.title.append(text)
  if not p['skip'] and not p['replace']:
   if p['scope']:self.body.append(text)
   if p['h1']:self.heading.append(text)
 def result(self):
  clean=lambda parts:re.sub(r'\s+',' ',' '.join(parts)).strip()
  body='\n\n'.join(re.sub(r'\s+',' ',part).strip() for part in ''.join(self.body).split('\n\n') if part.strip())
  return clean(self.heading) or clean(self.title),body
def rows():
 result=[]
 for path in sorted((SITE/'dedsec').rglob('*.html')):
  rel=path.relative_to(SITE).as_posix()
  if path.name in ('index.html','404.html'):continue
  locale='el' if '/el/' in rel else 'en';p=PageText(locale);p.feed(path.read_text('utf8'));title,body=p.result()
  if not title or not body:raise ValueError('Missing searchable page content: '+rel)
  result.append(dict(id='page-'+hashlib.sha256(rel.encode()).hexdigest()[:16],l=locale,t=title,p=rel,g='website',kind='page',url=rel,b=body))
 # SPA home and dynamic discovery have useful stable descriptions; fetched GitHub
 # repositories remain searchable through TikDev's own explicit GitHub search.
 for locale in ('en','el'):
  p=PageText(locale);p.feed((SITE/'index.html').read_text('utf8'))
  for slug,title,body in [
   ('home','DedSec Project' if locale=='en' else 'DedSec Project — Αρχική', 'DedSec Project brings Android, Termux and Linux tools together with installation guides, assistance and a bilingual programming library. Open the desktop applications to browse tools, frequently asked questions, project history, contact details, sponsorship and privacy information. Learning categories include programming languages, algorithms, reverse engineering, defensive security and engineering practice. Search page contents and lessons locally, switch English or Greek and choose a dark or light galaxy theme. Code blocks provide Copy buttons; interior pages provide a Back control. The homepage displays the #1 In Google Results badge and GitHub stars and forks.' if locale=='en' else 'Το DedSec Project συνδυάζει εργαλεία Android, Termux και Linux με οδηγούς εγκατάστασης, βοήθεια και δίγλωσση βιβλιοθήκη προγραμματισμού. Οι εφαρμογές της αρχικής σελίδας οδηγούν σε εργαλεία, συχνές ερωτήσεις, ιστορία του έργου, στοιχεία επικοινωνίας, χορηγίες και πληροφορίες απορρήτου. Οι κατηγορίες μάθησης περιλαμβάνουν γλώσσες προγραμματισμού, αλγορίθμους, αντίστροφη μηχανική, αμυντική ασφάλεια και πρακτική μηχανικής. Η αναζήτηση εξετάζει τοπικά σελίδες και μαθήματα, με επιλογή αγγλικών ή ελληνικών και σκοτεινού ή φωτεινού γαλαξιακού θέματος. Τα τμήματα κώδικα έχουν κουμπιά αντιγραφής και οι εσωτερικές σελίδες διαθέτουν επιστροφή. Η αρχική εμφανίζει την ένδειξη #1 στα αποτελέσματα Google και κάρτες αστεριών και forks GitHub.'),
   ('tikdev','TikDev — discover GitHub projects' if locale=='en' else 'TikDev — ανακάλυψε έργα GitHub','TikDev presents public GitHub repositories in a vertical discovery feed. Search GitHub directly, select interests, inspect repository descriptions, language, stars and forks, and read a project README without leaving the page. Save interesting projects locally and use the feed controls to move between results. The common navigation Search button opens the whole DedSec website search; the repository search inside TikDev queries GitHub. Repository availability and current statistics depend on the external GitHub service.' if locale=='en' else 'Το TikDev παρουσιάζει δημόσια αποθετήρια GitHub σε κατακόρυφη ροή ανακάλυψης. Αναζήτησε απευθείας στο GitHub, επίλεξε ενδιαφέροντα, εξέτασε περιγραφές, γλώσσα, αστέρια και forks και διάβασε το README ενός έργου χωρίς να φύγεις από τη σελίδα. Αποθήκευσε τοπικά ενδιαφέροντα έργα και χρησιμοποίησε τα χειριστήρια για μετακίνηση μεταξύ αποτελεσμάτων. Το κουμπί αναζήτησης της κοινής πλοήγησης ανοίγει την αναζήτηση ολόκληρης της ιστοσελίδας DedSec, ενώ η εσωτερική αναζήτηση αποθετηρίων του TikDev απευθύνεται στο GitHub. Η διαθεσιμότητα και τα τρέχοντα στατιστικά των αποθετηρίων εξαρτώνται από την εξωτερική υπηρεσία GitHub.')]:
   result.append(dict(id='page-'+slug+'-'+locale,l=locale,t=title,p='index.html' if slug=='home' else 'TikDev.html',g='website',kind='page',url='index.html#home' if slug=='home' else 'TikDev.html',b=body))
 return result

def generate():return '/* Generated from canonical website content; run scripts/build_site_search.py. */\nwindow.SITE_SEARCH_INDEX='+json.dumps(rows(),ensure_ascii=False,separators=(',',':'))+';\n'
if __name__=='__main__':
 expected=generate()
 if '--check' in sys.argv:
  if not OUT.exists() or OUT.read_text('utf8')!=expected:raise SystemExit('SITE_SEARCH_STALE: regenerate scripts/build_site_search.py')
 else:OUT.write_text(expected,'utf8')
 print('SITE_SEARCH_INDEX:',len(rows()),'canonical page records')
