# Merge product abstract table with existing table

setwd("TopicViz/data");
abs = read.csv("product_abstracts_only.csv", header=TRUE, skipNul=FALSE);
data = read.delim("filtered_table.txt", header=TRUE);
merged = merge(abs, data)
write.table(merged, "filtered_table.txt", sep="\t")
