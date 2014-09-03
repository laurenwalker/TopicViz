library(tsne)
library(rjson)
library(ggvis)


full_tab = read.table("data/table.tsv", header = TRUE, sep = "\t", stringsAsFactors = FALSE)

tab = full_tab[, grep("^lda100", colnames(full_tab))]
colnames(tab) = gsub("\\.", "", colnames(tab))

# Hellinger distance is Euclidean distance of sqrt(p).
# Taking the square root makes the difference between .001 and .002 matter more
# than the difference between .501 and .502
distances = dist(sqrt(tab))

xy = tsne(distances, whiten = TRUE, min_cost = 1.5)

write(
  toJSON(
    structure(as.data.frame(t(xy)), names = as.character(full_tab$primaryKey))    
  ), 
  file = "data/xy.json"
)




# plot --------------------------------------------------------------------

dat = cbind(
  as.data.frame(xy), 
  cluster = as.factor(full_tab[ , "maxtopic20selected_id"]),
  subcluster = full_tab[ , "maxtopic100selected_id"],
  full_tab[ , grep("lda020selected_topicWeights", colnames(full_tab))],
  title = full_tab$TI
)
colnames(dat)[1:2] = c("x", "y")

dat$id = 1:nrow(dat)

# Based on koundy's Stack Overflow answer at
# http://stackoverflow.com/a/24528087/783153
all_values <- function(x) {
  if(is.null(x)) return(NULL)
  row <- dat[dat$id == x$id, ]
  
  paste0(
    row$title,
    "<br>Group ", 
    row$cluster,
    "<br>Subgroup ",
    row$subcluster,
    '<br><a href = "www.google.com">Here is a link.</a>'
  )
}

dat %>% 
  ggvis(~x, ~y, fill = ~cluster, shape = ~cluster, key := ~id) %>% 
  layer_points(
    size := input_checkboxgroup(
      choices = 1:16,
      map = function(x){
        if(length(x) == 0){
          return(4)
        }
        affinities = lapply(
          x, 
          function(check){
            full_tab[ , grep(paste0("_\\.?", check, "$"), colnames(dat))]
          }
        )
        sizes = apply(do.call(cbind, affinities), 1, prod)
        sizes = sizes / sum(sizes) * length(sizes) * 4
      }
    )
  ) %>%
  add_tooltip(all_values, on = "click") %>%
  add_tooltip(
    function(x){
      paste0(
        "This point belongs to <b>group ",
        x$cluster,
        "</b><br>Click for more information"
      )
      
    }, 
    on = "hover"
  )

