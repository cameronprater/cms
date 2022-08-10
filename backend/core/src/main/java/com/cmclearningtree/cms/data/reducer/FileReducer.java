package com.cmclearningtree.cms.data.reducer;

import java.util.Map;

import org.jdbi.v3.core.result.LinkedHashMapRowReducer;
import org.jdbi.v3.core.result.RowView;

import com.cmclearningtree.cms.File;
import com.cmclearningtree.cms.Role;

public class FileReducer implements LinkedHashMapRowReducer<Integer, File> {
    private final String fileIdColumnName;
    private final String roleIdColumnName;

    public FileReducer() {
        fileIdColumnName = "id";
        roleIdColumnName = "role_name";
    }

    public FileReducer(String prefix) {
        fileIdColumnName = prefix + "_id";
        roleIdColumnName = prefix + "_role_name";
    }

    @Override
    public void accumulate(Map<Integer, File> map, RowView rowView) {
        File file = map.computeIfAbsent(rowView.getColumn(fileIdColumnName, Integer.class), id -> rowView.getRow(File.class));
        String role = rowView.getColumn(roleIdColumnName, String.class);
        if (role != null) {
            file.getPermissions().add(Role.from(role));
        }
    }
}
