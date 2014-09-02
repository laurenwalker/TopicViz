library(tsne)
library(rjson)

full_tab = read.table("data/table.tab", header = TRUE, sep = "\t")
tab = full_tab[, grep("^lda", colnames(full_tab))]
n = nrow(tab)


JSD = function(P, Q){
  M = (P + Q) / 2
  sqrt(.5 * sum(P * (log(P) - log(M))) + .5 * sum(Q * (log(Q) - log(M))))
}

distances = dist(tab)

xy = tsne(distances, whiten = TRUE)
row.names(xy) = full_tab$primaryKey

write(
  toJSON(as.data.frame(t(xy)), 
  file = "data/xy.json"
)
