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


categories = c(
  "Statistics and modeling" = 1,
  "conservation" = 2,
  "management" = 3,
  "marine ecology" = 4,
  "community ecology and biodiversity" = 5,
  "climate change" = 6,
  "pollination and dispersal" = 7,
  "population ecology" = 8,
  "biogeography and scaling rules" = 9,
  "ecosystem ecology" = 10,
  "trophic interactions" = 11,
  "paleoecology" = 12, 
  "evolutionary ecology" = 13,
  "forest ecology???" = 14,
  "disturbance and invasive species" = 15,
  "pathogens and parasites" = 16
)


subcategories = read.csv("data/87topics.csv", header = FALSE)[,2]

# plot --------------------------------------------------------------------

dat = cbind(
  as.data.frame(xy), 
  cluster = as.factor(full_tab[ , "maxtopic20selected_id"]),
  subcluster = full_tab[ , "maxtopic100selected_id"],
  full_tab[ , grep("lda020selected_topicWeights", colnames(full_tab))],
  title = paste0(full_tab$TI, full_tab$Title_for_TM)
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
    ": ",
    names(categories)[as.integer(as.character(row$cluster))],
    "<br>Subgroup ",
    row$subcluster,
    ": ",
    subcategories[row$subcluster],
    '<br><a href = "www.google.com">Here is a link.</a>'
  )
}

dat %>% 
  ggvis(~x, ~y, fill = ~cluster, shape = ~cluster, key := ~id) %>% 
  layer_points(
    size := input_checkboxgroup(
      choices = categories,
      map = function(x){
        if(length(x) == 0){
          return(8)
        }
        affinities = lapply(
          x, 
          function(check){
            full_tab[ , grep(paste0("lda020selected_topicWeights_\\.?", check, "$"), colnames(full_tab))]
          }
        )
        sizes = apply(do.call(cbind, affinities), 1, prod)
        sizes = (sizes + mean(sizes) / 2) / mean(sizes) * 5
      }
    )
  ) %>%
  add_tooltip(all_values, on = "hover")

