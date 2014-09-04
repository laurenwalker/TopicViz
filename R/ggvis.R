library(tsne)  # For 2D spatial arrangement of points
library(rjson) # For saving/loading xy coordinates in json
# using the development version of ggvis from github.
# install with devtools package and `devtools::install_github("rstudio/ggvis")`
library(ggvis)

# Data import -------------------------------------------------------------
full_tab = read.table(
  "data/table.tsv", 
  header = TRUE, 
  sep = "\t", 
  stringsAsFactors = FALSE
)

# Load broad categories
raw_categories = read.csv(
  "data/16topics.csv", 
  header = TRUE, 
  stringsAsFactors = FALSE
)
categories = structure(raw_categories[[2]], names = raw_categories[[1]])

# Load narrow categories
subcategories = read.csv(
  "data/87topics.csv", 
  header = FALSE, 
  stringsAsFactors = FALSE
)[,2]


# X-Y coordinates ---------------------------------------------------------
# # Hellinger distance is Euclidean distance of sqrt(p).
# # Taking the square root makes the difference between .001 and .002 matter more
# # than the difference between .501 and .502
# # Distances are calculated using the lda100 columns.
# distances = dist(sqrt(full_tab[, grep("^lda100", colnames(full_tab))]))
# 
# # Compute and save t-SNE for 2-D position/layout.
# # t-SNE tries to ensure that similar documents are close together, but doesn't
# # care about precisely how far apart dissimilar documents are.
# # Makes nice clusters.
# xy = tsne(distances, whiten = TRUE, min_cost = 1.5)
# 
# # Save coordinates in json for later javascript extraction
# write(
#   toJSON(
#     structure(as.data.frame(t(xy)), names = as.character(full_tab$primaryKey))    
#   ), 
#   file = "data/xy.json"
# )
# 
# Load xy coordinates and convert from json
xy = do.call(rbind, fromJSON(file = "data/xy.json"))


# Combine data sources ----------------------------------------------------
dat = cbind(
  structure(as.data.frame(xy), names = c("x", "y")),
  full_tab,
  title = paste0(full_tab$TI, full_tab$Title_for_TM),
  id = 1:nrow(full_tab)
)

# Make topic ID columns into factors
dat$maxtopic100selected_id = as.factor(dat$maxtopic100selected_id)
dat$maxtopic20selected_id = as.factor(dat$maxtopic20selected_id)


# Build the tooltips ------------------------------------------------------
# Based loosly on koundy's Stack Overflow answer at
# http://stackoverflow.com/a/24528087/783153
tooltip <- function(x) {
  if(is.null(x)){
    return(NULL)}
  else{
    # Identify the row of `dat` corresponding to the user-selected point using 
    # the`id` column.
    row <- dat[dat$id == x$id, ]
    
    # Paste together an HTML string for the tooltip to render.
    paste0(
      "<i><b>",
      row$title,
      "</b></i><br>Group ", 
      row$maxtopic20selected_id,
      ": <b>",
      names(categories)[as.integer(as.character(row$maxtopic20selected_id))],
      "</b><br>Subgroup ",
      row$maxtopic100selected_id,
      ": <b>",
      subcategories[row$maxtopic100selected_id],
      '</b><br><a href = "www.google.com">link.</a>'
    )
  }
}

# Build the plot ----------------------------------------------------------
avg_size = 15 # The average point should be this large
floor_size = 2 # Points should all be at least this large

# The %>% ("pipe") operator lets us chain a bunch of commands together.
# Start with the data, hand it to ggvis(), then hand results to a function that
# sets up the points, then hand results to a function that removes the legend,
# then to a function that sets up the tooltips on hover.
dat %>% 
  ggvis(
    x = ~x, 
    y = ~y, 
    fill = ~maxtopic20selected_id, 
    shape = ~maxtopic20selected_id, 
    key := ~id, 
    stroke := "white", 
    strokeWidth := .5
  ) %>% 
  layer_points(
    size := input_checkboxgroup(
      choices = categories,
      map = function(x){
        # Mapping from checkbox to point size
        if(length(x) == 0){
          return(avg_size)
        }
        # Determine how closely affiliated each point is with the selected boxes
        affinities = lapply(
          x, 
          function(check){
            # Pull out the relevant columns
            columns = grep(
              paste0("lda020selected_topicWeights_\\.?", check, "$"), 
              colnames(dat)
            )
            dat[ , columns]
          }
        )
        # Multiply affinities together to identify points that are affiliated
        # with all the checked boxes.
        products = apply(do.call(cbind, affinities), 1, prod)
        
        # Return a vector of sizes (areas) for all the points
        floor_size + products / mean(products) * (avg_size - floor_size)
      }
    )
  ) %>%
  hide_legend(scales = c("shape", "fill")) %>%
  add_tooltip(tooltip, on = "hover") # On hover, call the `tooltip` fn
