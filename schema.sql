DROP TABLE IF EXISTS logs;
CREATE TABLE IF NOT EXISTS logs (transaction_hash TEXT PRIMARY KEY, address TEXT, data TEXT, topics TEXT[], block_number BIGINT, block_hash TEXT, transaction_index BIGINT, log_index BIGINT, removed boolean, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

DROP TABLE IF EXISTS contracts;
CREATE TABLE IF NOT EXISTS contracts (address TEXT PRIMARY KEY, initial_block BIGINT, last_block TEXT)