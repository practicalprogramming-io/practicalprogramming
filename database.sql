CREATE TABLE users_roles (
    users_roles_id SERIAL PRIMARY KEY,
    role VARCHAR
);

CREATE TABLE users (
    users_id SERIAL PRIMARY KEY,
    users_roles_id INTEGER REFERENCES users_roles(users_roles_id) ON DELETE CASCADE,
    username VARCHAR (25) UNIQUE,
    email VARCHAR UNIQUE,
    password VARCHAR,
    registration_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_profiles (
    users_profiles_id SERIAL PRIMARY KEY,
    users_id INTEGER REFERENCES users(users_id) ON DELETE CASCADE,
    content_markdown VARCHAR,
    content_html VARCHAR
);

CREATE TABLE tutorials (
    tutorials_id SERIAL PRIMARY KEY,
    users_id INTEGER REFERENCES users(users_id) ON DELETE CASCADE,
    url_path VARCHAR,
    title VARCHAR,
    description VARCHAR,
    content_markdown VARCHAR,
    content_html VARCHAR,
    created_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    tags_id SERIAL PRIMARY KEY,
    tag_name VARCHAR
);

CREATE TABLE tutorials_tags (
    tutorials_tags_id SERIAL PRIMARY KEY,
    tutorials_id INTEGER REFERENCES tutorials(tutorials_id) ON DELETE CASCADE,
    tags_id INTEGER REFERENCES tags(tags_id) ON DELETE CASCADE
);

CREATE TABLE jobs (
    jobs_id SERIAL PRIMARY KEY,
    users_id INTEGER REFERENCES users(users_id) ON DELETE CASCADE,
    url_path VARCHAR,
    content_markdown VARCHAR,
    content_html VARCHAR,
    created_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs_tags (
    jobs_tags_id SERIAL PRIMARY KEY,
    jobs_id INTEGER REFERENCES jobs(jobs_id) ON DELETE CASCADE,
    tags_id INTEGER REFERENCES tags(tags_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO practicalprogramming_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO practicalprogramming_user;