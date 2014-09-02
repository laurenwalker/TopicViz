library(tsne)
library(rjson)

full_tab = read.table("data/table.tab", header = TRUE, sep = "\t")
tab = full_tab[, grep("^lda", colnames(full_tab))]

distances = dist(tab)

xy = tsne(distances, whiten = TRUE)

write(
  toJSON(
    structure(as.data.frame(t(xy)), names = as.character(full_tab$primaryKey))    
  ), 
  file = "data/xy.json"
)
