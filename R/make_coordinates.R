library(tsne)
library(rjson)

full_tab = read.table("data/table.tsv", header = TRUE, sep = "\t")
tab = full_tab[, grep("^lda", colnames(full_tab))]
n = nrow(tab)


JSD = function(P, Q){
  M = (P + Q) / 2
  sqrt(.5 * sum(P * (log(P) - log(M))) + .5 * sum(Q * (log(Q) - log(M))))
}

distances = dist(tab)

xy = tsne(distances, whiten = TRUE)

write(
  toJSON(
    structure(as.data.frame(t(xy)), names = as.character(full_tab$primaryKey))    
  ), 
  file = "data/xy.json"
)
