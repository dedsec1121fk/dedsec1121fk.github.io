CREATE TABLE IF NOT EXISTS forum_topic_tags (
 topic_id TEXT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
 tag TEXT NOT NULL CHECK(length(tag) BETWEEN 3 AND 40),
 PRIMARY KEY(topic_id,tag)
);
CREATE INDEX IF NOT EXISTS forum_topic_tags_tag ON forum_topic_tags(tag,topic_id);
