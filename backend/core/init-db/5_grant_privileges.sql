GRANT ALL ON cmc_learning_tree.* TO 'dba'@'%';
GRANT SELECT, INSERT, UPDATE ON cmc_learning_tree.* TO 'quarkus'@'%';
GRANT DELETE ON cmc_learning_tree.comment TO 'quarkus'@'%';
GRANT DELETE ON cmc_learning_tree.file TO 'quarkus'@'%';
GRANT DELETE ON cmc_learning_tree.comment_permission TO 'quarkus'@'%';
GRANT DELETE ON cmc_learning_tree.file_permission TO 'quarkus'@'%';