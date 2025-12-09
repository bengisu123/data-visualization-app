# Install required R packages for chart generation

# List of required packages
packages <- c(
  'ggplot2',      # Core plotting
  'dplyr',        # Data manipulation
  'tidyr',        # Data tidying
  'jsonlite',     # JSON parsing
  'ggridges',     # Ridgeline plots
  'viridis',      # Color palettes
  'reshape2',     # Data reshaping
  'RColorBrewer'  # Color palettes
)

# Function to install packages if not already installed
install_if_missing <- function(package) {
  if (!require(package, character.only = TRUE)) {
    cat(paste("Installing", package, "...\n"))
    install.packages(package, dependencies = TRUE, repos = "https://cran.r-project.org")
    library(package, character.only = TRUE)
  } else {
    cat(paste(package, "is already installed.\n"))
  }
}

# Install all packages
cat("Checking and installing required R packages...\n\n")
sapply(packages, install_if_missing)

cat("\n✅ All packages installed successfully!\n")
cat("You can now run the chart generator.\n")
