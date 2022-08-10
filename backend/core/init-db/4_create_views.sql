CREATE SQL SECURITY INVOKER VIEW IF NOT EXISTS child_with_parent AS
    SELECT
        c.id    id,
        p1.name name,
        p2.id   parent_id,
        p2.name parent_name
    FROM child c
        NATURAL JOIN person p1
        INNER JOIN person p2 ON c.parent_id = p2.id;

CREATE SQL SECURITY INVOKER VIEW IF NOT EXISTS expanded_file AS
    SELECT
        f.id            id,
        f.case_id       case_id,
        f.name          name,
        f.extension     extension,
        f.data          data,
        f.description   description,
        l.`timestamp`   `timestamp`,
        u.id            author_id,
        u.email         author_email,
        u.name          author_name,
        u.picture       author_picture,
        u.active        author_active,
        r.name          role_name
    FROM file f
        INNER JOIN (SELECT file_id, revised_by, MIN(revised_at) `timestamp` FROM file_log GROUP BY file_id) l ON f.id = l.file_id
            INNER JOIN `user` u ON u.id = l.revised_by
        LEFT JOIN file_permission p ON f.id = p.file_id
            LEFT JOIN `role` r ON p.role_id = r.id;

CREATE SQL SECURITY INVOKER VIEW IF NOT EXISTS expanded_comment AS
    SELECT
        c.id            id,
        c.case_id       case_id,
        c.content       content,
        l.`timestamp`   `timestamp`,
        u.id            author_id,
        u.email         author_email,
        u.name          author_name,
        u.picture       author_picture,
        u.active        author_active,
        r.name          role_name
    FROM comment c
        INNER JOIN (SELECT comment_id, revised_by, MIN(revised_at) `timestamp` FROM comment_log GROUP BY comment_id) l ON c.id = l.comment_id
            INNER JOIN `user` u ON u.id = l.revised_by
        LEFT JOIN comment_permission p ON c.id = p.comment_id
            LEFT JOIN `role` r ON p.role_id = r.id;

CREATE SQL SECURITY INVOKER VIEW IF NOT EXISTS expanded_case AS
    SELECT
        ch.id               child_id,
        ch.name             child_name,
        ch.parent_id        child_parent_id,
        ch.parent_name      child_parent_name,
        c.state             state,
        c.closed            closed,
        f.id                file_id,
        f.name              file_name,
        f.extension         file_extension,
        f.data              file_data,
        f.description       file_description,
        f.`timestamp`       file_timestamp,
        f.author_id         file_author_id,
        f.author_email      file_author_email,
        f.author_name       file_author_name,
        f.author_picture    file_author_picture,
        f.author_active     file_author_active,
        f.role_name         file_role_name,
        co.id               comment_id,
        co.content          comment_content,
        co.`timestamp`      comment_timestamp,
        co.author_id        comment_author_id,
        co.author_email     comment_author_email,
        co.author_name      comment_author_name,
        co.author_picture   comment_author_picture,
        co.author_active    comment_author_active,
        co.role_name        comment_role_name
    FROM `case` c
        INNER JOIN child_with_parent ch ON c.id = ch.id
        LEFT JOIN expanded_comment co ON c.id = co.case_id
        LEFT JOIN expanded_file f ON c.id = f.case_id;