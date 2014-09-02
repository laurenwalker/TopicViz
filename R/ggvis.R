library(rjson)

full_tab = read.table("data/table.tab", header = TRUE, sep = "\t")
tab = full_tab[, grep("^lda", colnames(full_tab))]

# kmpp function from Hans W Borchers on the R Help list
# https://stat.ethz.ch/pipermail/r-help/2012-January/300051.html
library(pracma)
kmpp <- function(X, k) {
  n <- nrow(X)
  C <- numeric(k)
  C[1] <- sample(1:n, 1)
  
  for (i in 2:k) {
    dm <- distmat(X, X[C, ])
    pr <- apply(dm, 1, min); pr[C] <- 0
    C[i] <- sample(1:n, 1, prob = pr)
  }
  
  kmeans(X, X[C, ])
}

km = kmpp(as.matrix(tab), 25)



xy = do.call(rbind, fromJSON(file = "data/xy.json"))
rownames(xy) = NULL
library(ggvis)

dat = cbind(as.data.frame(xy), cluster = as.factor(km$cluster))
colnames(dat)[1:2] = c("x", "y")

dat %>% 
  ggvis(~x, ~y, fill = ~cluster, shape = ~cluster) %>% 
  layer_points() %>%
  add_tooltip(function(x){x$cluster})
