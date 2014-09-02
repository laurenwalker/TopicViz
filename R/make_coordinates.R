library(tsne)
library(rjson)

tab = read.table("data/table.tab", header = TRUE, sep = "\t")
tab = tab[, grep("^lda", colnames(tab))]
n = nrow(tab)


JSD = function(P, Q){
  M = (P + Q) / 2
  sqrt(.5 * sum(P * (log(P) - log(M))) + .5 * sum(Q * (log(Q) - log(M))))
}

distances = dist(tab)

xy = tsne(distances, whiten = TRUE)

write(toJSON(xy), file = "data/xy.json")