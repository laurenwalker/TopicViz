# matching categories with subcategories ----------------------------------
# Assumes that full_tab is loaded from the other file.


# Major categories
tab_20 = full_tab[, grep("^lda020", colnames(full_tab))]

# Subcategories
tab_100 = full_tab[, grep("^lda100", colnames(full_tab))]

# KL divergence, with zeros removed.
# KL divergence addresses the question, "How well can a major topic (q)
# approximate a subcategory (p)?"
d = matrix(NA, ncol = ncol(tab_100), nrow = ncol(tab_20))
for(i in 1:ncol(tab_20)){
  for(j in 1:ncol(tab_100)){
    pp = tab_100[, j]
    qq = tab_20[, i]
    
    q = qq[qq!=0 & pp != 0]
    p = pp[qq!=0 & pp != 0]
    
    d[i, j] = sum(p * log(p / q))
  }
}

# Convenience function
semipaste = function(x){
  paste(head(subcategories[order(x)], 10), collapse = ";")
}

# Print out a list of subcategories associated with each category
structure(
  as.list(
    apply(d, 1, semipaste)
  ),
  names = names(categories)
)

