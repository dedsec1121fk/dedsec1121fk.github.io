PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS forum_members(
 id TEXT PRIMARY KEY,
 handle TEXT NOT NULL,
 handle_normalized TEXT NOT NULL UNIQUE,
 salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 created_at TEXT NOT NULL,
 disabled INTEGER NOT NULL DEFAULT 0 CHECK(disabled IN (0,1))
);
CREATE TABLE IF NOT EXISTS forum_sessions(
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES forum_members(id) ON DELETE CASCADE,
 csrf TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS forum_session_expiry ON forum_sessions(expires_at);
CREATE TABLE IF NOT EXISTS forum_rates(
 key TEXT PRIMARY KEY,
 hits INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS forum_rate_expiry ON forum_rates(expires_at);
CREATE TABLE IF NOT EXISTS forum_categories(
 slug TEXT PRIMARY KEY,
 title_en TEXT NOT NULL,
 title_el TEXT NOT NULL,
 description_en TEXT NOT NULL,
 description_el TEXT NOT NULL,
 sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS forum_sections(
 slug TEXT PRIMARY KEY,
 category_slug TEXT NOT NULL REFERENCES forum_categories(slug),
 title_en TEXT NOT NULL,
 title_el TEXT NOT NULL,
 description_en TEXT NOT NULL,
 description_el TEXT NOT NULL,
 sort_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS forum_sections_category ON forum_sections(category_slug,sort_order);
CREATE TABLE IF NOT EXISTS forum_topics(
 id TEXT PRIMARY KEY,
 section_slug TEXT NOT NULL REFERENCES forum_sections(slug),
 author_id TEXT REFERENCES forum_members(id) ON DELETE SET NULL,
 title TEXT NOT NULL CHECK(length(title) BETWEEN 6 AND 150),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 locked INTEGER NOT NULL DEFAULT 0 CHECK(locked IN(0,1)),
 pinned INTEGER NOT NULL DEFAULT 0 CHECK(pinned IN(0,1))
);
CREATE INDEX IF NOT EXISTS forum_topics_section_updated ON forum_topics(section_slug,pinned DESC,updated_at DESC);
CREATE TABLE IF NOT EXISTS forum_posts(
 id TEXT PRIMARY KEY,
 topic_id TEXT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
 author_id TEXT REFERENCES forum_members(id) ON DELETE SET NULL,
 body TEXT NOT NULL,
 created_at TEXT NOT NULL,
 edited_at TEXT,
 deleted INTEGER NOT NULL DEFAULT 0 CHECK(deleted IN(0,1))
);
CREATE INDEX IF NOT EXISTS forum_posts_topic_created ON forum_posts(topic_id,created_at,id);
CREATE TABLE IF NOT EXISTS forum_reports(
 post_id TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
 reporter_id TEXT NOT NULL REFERENCES forum_members(id) ON DELETE CASCADE,
 reason TEXT NOT NULL,
 created_at TEXT NOT NULL,
 PRIMARY KEY(post_id,reporter_id)
);
INSERT OR IGNORE INTO forum_categories VALUES
 ('announcements','Announcements','Ανακοινώσεις','Official updates and changes','Επίσημες ενημερώσεις και αλλαγές',1),
 ('general','Community','Κοινότητα','General conversations with other members','Γενικές συζητήσεις με τα υπόλοιπα μέλη',2),
 ('development','Programming & projects','Προγραμματισμός & έργα','Code, tools and software projects','Κώδικας, εργαλεία και εφαρμογές',3),
 ('security','Cybersecurity','Κυβερνοασφάλεια','Responsible learning and defensive security','Εκπαίδευση και αμυντική ασφάλεια',4),
 ('support','Help & troubleshooting','Βοήθεια & προβλήματα','Technical problems and installation help','Τεχνικά προβλήματα και εγκατάσταση',5),
 ('feedback','Suggestions & feedback','Ιδέες & προτάσεις','Improve the community and the project','Βελτίωση της κοινότητας και του έργου',6);
INSERT OR IGNORE INTO forum_sections VALUES
 ('news','announcements','News','Νέα','Community and project announcements','Ανακοινώσεις κοινότητας και έργου',1),
 ('updates','announcements','Updates & releases','Ενημερώσεις & εκδόσεις','Version history and changes','Ιστορικό εκδόσεων και αλλαγών',2),
 ('introductions','general','Introductions','Γνωριμία μελών','Introduce yourself to the community','Γνωρίσου με την κοινότητα',1),
 ('general-chat','general','General discussion','Γενικές συζητήσεις','Talk about anything relevant','Συζητήσεις για κάθε σχετικό θέμα',2),
 ('python','development','Python','Python','Python projects, lessons and questions','Εργασίες, μαθήματα και ερωτήσεις Python',1),
 ('web-development','development','Web development','Ανάπτυξη ιστοσελίδων','HTML, CSS and JavaScript','HTML, CSS και JavaScript',2),
 ('linux-termux','development','Linux & Termux','Linux & Termux','Linux, shell and Termux development','Ανάπτυξη Linux, shell και Termux',3),
 ('community-projects','development','Share your projects','Έργα μελών','Share your scripts, applications and games','Μοιράσου scripts, εφαρμογές και παιχνίδια',4),
 ('defense','security','Defensive security','Αμυντική ασφάλεια','Protective techniques and tools','Τεχνικές και εργαλεία προστασίας',1),
 ('training','security','Labs & learning','Εργαστήρια & εκπαίδευση','Authorized hands-on cybersecurity learning','Νόμιμη πρακτική εκπαίδευση κυβερνοασφάλειας',2),
 ('privacy','security','Privacy & safety','Ιδιωτικότητα & ασφάλεια','Data protection and privacy','Προστασία δεδομένων και ιδιωτικότητα',3),
 ('installation','support','Installation help','Βοήθεια εγκατάστασης','Supported systems and installation guides','Υποστηριζόμενα συστήματα και εγκατάσταση',1),
 ('errors','support','Errors & fixes','Σφάλματα & λύσεις','Debugging and troubleshooting','Αντιμετώπιση σφαλμάτων',2),
 ('feature-ideas','feedback','Feature requests','Προτάσεις λειτουργιών','Suggest ideas for DedSec','Πρότεινε λειτουργίες για το DedSec',1),
 ('site-feedback','feedback','Website & forum feedback','Σχόλια ιστοσελίδας & φόρουμ','Usability, reports and improvements','Χρηστικότητα, αναφορές και βελτιώσεις',2);
