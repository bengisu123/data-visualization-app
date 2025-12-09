#!/usr/bin/env Rscript

# Chart Generator for 10 Different Chart Types
# Using ggplot2 and related packages

library(ggplot2)
library(dplyr)
library(tidyr)
library(jsonlite)
library(ggridges)
library(viridis)
library(reshape2)
library(RColorBrewer)

# Parse command line arguments
args <- commandArgs(trailingOnly = TRUE)
if (length(args) == 0) {
  stop("No parameters provided!")
}

# Parse JSON parameters
params <- fromJSON(args[1])

# Read data
data <- fromJSON(params$dataPath)

# Convert to data frame
df <- as.data.frame(data)

# Set default theme
theme_set(theme_minimal() + 
  theme(
    plot.title = element_text(size = 16, face = "bold", hjust = 0.5),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "white", color = NA)
  ))

# Chart generation functions
create_chart <- function(chart_type, df, params) {
  
  tryCatch({
    
    if (chart_type == "boxplot") {
      # 1. BOXPLOT - Distribution and outliers
      p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn)) +
        geom_boxplot(fill = "#667eea", alpha = 0.7, outlier.color = "#f093fb") +
        labs(title = params$title, x = params$xColumn, y = params$yColumn) +
        theme(axis.text.x = element_text(angle = 45, hjust = 1))
      
    } else if (chart_type == "scatter") {
      # 2. SCATTER PLOT - Correlation between two variables
      if (!is.null(params$groupColumn) && params$groupColumn != "") {
        p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn, color = params$groupColumn)) +
          geom_point(size = 3, alpha = 0.7) +
          scale_color_viridis(discrete = TRUE) +
          labs(title = params$title, x = params$xColumn, y = params$yColumn)
      } else {
        p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn)) +
          geom_point(size = 3, alpha = 0.7, color = "#667eea") +
          labs(title = params$title, x = params$xColumn, y = params$yColumn)
      }
      
    } else if (chart_type == "line") {
      # 3. LINE CHART - Time series and trends
      if (!is.null(params$groupColumn) && params$groupColumn != "") {
        p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn, color = params$groupColumn, group = params$groupColumn)) +
          geom_line(size = 1.2) +
          geom_point(size = 2) +
          scale_color_viridis(discrete = TRUE) +
          labs(title = params$title, x = params$xColumn, y = params$yColumn)
      } else {
        p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn)) +
          geom_line(size = 1.2, color = "#667eea") +
          geom_point(size = 2, color = "#f093fb") +
          labs(title = params$title, x = params$xColumn, y = params$yColumn)
      }
      
    } else if (chart_type == "bar") {
      # 4. BAR CHART - Categorical comparisons
      if (!is.null(params$groupColumn) && params$groupColumn != "") {
        p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn, fill = params$groupColumn)) +
          geom_bar(stat = "identity", position = "dodge") +
          scale_fill_viridis(discrete = TRUE) +
          labs(title = params$title, x = params$xColumn, y = params$yColumn) +
          theme(axis.text.x = element_text(angle = 45, hjust = 1))
      } else {
        p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn)) +
          geom_bar(stat = "identity", fill = "#667eea", alpha = 0.8) +
          labs(title = params$title, x = params$xColumn, y = params$yColumn) +
          theme(axis.text.x = element_text(angle = 45, hjust = 1))
      }
      
    } else if (chart_type == "histogram") {
      # 5. HISTOGRAM - Frequency distribution
      p <- ggplot(df, aes_string(x = params$xColumn)) +
        geom_histogram(bins = 30, fill = "#667eea", color = "#f093fb", alpha = 0.7) +
        labs(title = params$title, x = params$xColumn, y = "Frequency")
      
    } else if (chart_type == "violin") {
      # 6. VIOLIN PLOT - Distribution density
      p <- ggplot(df, aes_string(x = params$xColumn, y = params$yColumn)) +
        geom_violin(fill = "#667eea", alpha = 0.7) +
        geom_boxplot(width = 0.1, fill = "#f093fb", alpha = 0.5) +
        labs(title = params$title, x = params$xColumn, y = params$yColumn) +
        theme(axis.text.x = element_text(angle = 45, hjust = 1))
      
    } else if (chart_type == "density") {
      # 7. DENSITY PLOT - Continuous probability distribution
      if (!is.null(params$groupColumn) && params$groupColumn != "") {
        p <- ggplot(df, aes_string(x = params$xColumn, fill = params$groupColumn)) +
          geom_density(alpha = 0.6) +
          scale_fill_viridis(discrete = TRUE) +
          labs(title = params$title, x = params$xColumn, y = "Density")
      } else {
        p <- ggplot(df, aes_string(x = params$xColumn)) +
          geom_density(fill = "#667eea", alpha = 0.7) +
          labs(title = params$title, x = params$xColumn, y = "Density")
      }
      
    } else if (chart_type == "heatmap") {
      # 8. HEATMAP - Correlation matrix
      # Select only numeric columns
      numeric_cols <- df %>% select_if(is.numeric)
      cor_matrix <- cor(numeric_cols, use = "complete.obs")
      melted_cor <- melt(cor_matrix)
      
      p <- ggplot(melted_cor, aes(Var1, Var2, fill = value)) +
        geom_tile() +
        scale_fill_gradient2(low = "#667eea", mid = "white", high = "#f093fb", 
                            midpoint = 0, limit = c(-1, 1)) +
        labs(title = params$title, x = "", y = "", fill = "Correlation") +
        theme(axis.text.x = element_text(angle = 45, hjust = 1))
      
    } else if (chart_type == "ridgeline") {
      # 9. RIDGELINE PLOT - Multiple distribution comparison
      p <- ggplot(df, aes_string(x = params$yColumn, y = params$xColumn, fill = params$xColumn)) +
        geom_density_ridges(alpha = 0.7) +
        scale_fill_viridis(discrete = TRUE) +
        labs(title = params$title, x = params$yColumn, y = params$xColumn) +
        theme(legend.position = "none")
      
    } else if (chart_type == "pie") {
      # 10. PIE CHART - Proportions and percentages
      # Aggregate data
      pie_data <- df %>%
        group_by(!!sym(params$xColumn)) %>%
        summarise(count = n()) %>%
        mutate(percentage = count / sum(count) * 100)
      
      p <- ggplot(pie_data, aes(x = "", y = count, fill = !!sym(params$xColumn))) +
        geom_bar(stat = "identity", width = 1) +
        coord_polar("y", start = 0) +
        scale_fill_viridis(discrete = TRUE) +
        labs(title = params$title, fill = params$xColumn) +
        theme_void() +
        theme(plot.title = element_text(size = 16, face = "bold", hjust = 0.5))
      
    } else {
      stop(paste("Unknown chart type:", chart_type))
    }
    
    # Save the plot
    ggsave(params$outputPath, plot = p, width = 10, height = 6, dpi = 300, bg = "white")
    cat("Chart created successfully:", params$outputPath, "\n")
    
  }, error = function(e) {
    cat("Error creating chart:", e$message, "\n")
    stop(e)
  })
}

# Create the chart
create_chart(params$chartType, df, params)
