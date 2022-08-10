package com.cmclearningtree.cms.data.reducer;

import java.util.Map;

import org.jdbi.v3.core.result.LinkedHashMapRowReducer;
import org.jdbi.v3.core.result.RowView;

import com.cmclearningtree.cms.Comment;
import com.cmclearningtree.cms.Role;

public class CommentReducer implements LinkedHashMapRowReducer<Integer, Comment> {
    private final String commentIdColumnName;
    private final String roleIdColumnName;

    public CommentReducer() {
        commentIdColumnName = "id";
        roleIdColumnName = "role_name";
    }

    public CommentReducer(String prefix) {
        commentIdColumnName = prefix + "_id";
        roleIdColumnName = prefix + "_role_name";
    }

    @Override
    public void accumulate(Map<Integer, Comment> map, RowView rowView) {
        Comment comment = map.computeIfAbsent(rowView.getColumn(commentIdColumnName, Integer.class),
                id -> rowView.getRow(Comment.class));
        String role = rowView.getColumn(roleIdColumnName, String.class);
        if (role != null) {
            comment.getPermissions().add(Role.from(role));
        }
    }
}
