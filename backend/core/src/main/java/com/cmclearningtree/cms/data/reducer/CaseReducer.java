package com.cmclearningtree.cms.data.reducer;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.jdbi.v3.core.result.LinkedHashMapRowReducer;
import org.jdbi.v3.core.result.RowView;

import com.cmclearningtree.cms.Case;
import com.cmclearningtree.cms.Comment;
import com.cmclearningtree.cms.File;

public class CaseReducer implements LinkedHashMapRowReducer<Integer, Case> {
    private final Map<Integer, Comment> commentsMap = new LinkedHashMap<>();
    private final Map<Integer, File> filesMap = new LinkedHashMap<>();

    private <E> void addIfAbsent(List<E> list, E e) {
        if (!list.contains(e)) {
            list.add(e);
        }
    }

    @Override
    public void accumulate(Map<Integer, Case> map, RowView rowView) {
        Case _case = map.computeIfAbsent(rowView.getColumn("child_id", Integer.class), id -> rowView.getRow(Case.class));

        CommentReducer commentReducer = new CommentReducer("comment");
        commentReducer.accumulate(commentsMap, rowView);
        FileReducer reducer = new FileReducer("file");
        reducer.accumulate(filesMap, rowView);

        Integer commentId = rowView.getColumn("comment_id", Integer.class);
        if (commentId != null) {
            addIfAbsent(_case.getComments(), commentsMap.get(commentId));
        }

        Integer fileId = rowView.getColumn("file_id", Integer.class);
        if (fileId != null) {
            addIfAbsent(_case.getFiles(), filesMap.get(fileId));
        }
    }
}
