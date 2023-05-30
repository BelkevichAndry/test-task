CREATE TABLE IF NOT EXISTS tracking_events (
    date Date,
    date_time DateTime,
    event_id String,
    tracker_id String,
    ip String,
    user_id String,
    user_agent String,
    url String,
    value String
) ENGINE = MergeTree PARTITION BY toYYYYMM(date) ORDER BY (tracker_id) SETTINGS index_granularity = 8192;


CREATE TABLE IF NOT EXISTS readings_tracking (
    date Date,
    date_time DateTime,
    event_id String,
    tracker_id String,
    ip String,
    user_id String,
    user_agent String,
    url String,
    value String
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka:9092',
       kafka_topic_list = 'trackerExists',
       kafka_group_name = 'readings_consumer_group1',
       kafka_format = 'JSONEachRow',
       kafka_max_block_size = 1048576;

CREATE MATERIALIZED VIEW IF NOT EXISTS readings_tracking_mv TO tracking_events AS
SELECT 
    date,
    date_time,
    event_id,
    tracker_id,
    ip,
    user_id,
    user_agent,
    url,
    value 
FROM readings_tracking;         