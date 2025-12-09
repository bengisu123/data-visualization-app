#!/usr/bin/env python3
"""
Chart Generator for 10 Different Chart Types
Using matplotlib and seaborn
"""

import sys
import json
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib import rcParams

# Set style
sns.set_style("whitegrid")
rcParams['figure.facecolor'] = 'white'
rcParams['axes.facecolor'] = 'white'

def create_chart(chart_type, df, params):
    """Create chart based on type and parameters"""
    
    try:
        # Create figure
        fig, ax = plt.subplots(figsize=(10, 6))
        
        x_col = params.get('xColumn')
        y_col = params.get('yColumn')
        group_col = params.get('groupColumn')
        title = params.get('title', f'{chart_type.capitalize()} Chart')
        
        if chart_type == 'boxplot':
            # 1. BOXPLOT - Distribution and outliers
            if group_col:
                sns.boxplot(data=df, x=x_col, y=y_col, palette='viridis', ax=ax)
            else:
                sns.boxplot(data=df, y=y_col, color='#667eea', ax=ax)
            ax.set_xlabel(x_col if x_col else '')
            ax.set_ylabel(y_col)
            plt.xticks(rotation=45, ha='right')
            
        elif chart_type == 'scatter':
            # 2. SCATTER PLOT - Correlation between two variables
            if group_col:
                for group in df[group_col].unique():
                    group_data = df[df[group_col] == group]
                    ax.scatter(group_data[x_col], group_data[y_col], 
                             label=group, alpha=0.7, s=50)
                ax.legend()
            else:
                ax.scatter(df[x_col], df[y_col], color='#667eea', alpha=0.7, s=50)
            ax.set_xlabel(x_col)
            ax.set_ylabel(y_col)
            
        elif chart_type == 'line':
            # 3. LINE CHART - Time series and trends
            if group_col:
                for group in df[group_col].unique():
                    group_data = df[df[group_col] == group]
                    ax.plot(group_data[x_col], group_data[y_col], 
                           label=group, marker='o', linewidth=2)
                ax.legend()
            else:
                ax.plot(df[x_col], df[y_col], color='#667eea', 
                       marker='o', linewidth=2, markersize=6)
            ax.set_xlabel(x_col)
            ax.set_ylabel(y_col)
            
        elif chart_type == 'bar':
            # 4. BAR CHART - Categorical comparisons
            if group_col:
                df_pivot = df.pivot_table(values=y_col, index=x_col, 
                                         columns=group_col, aggfunc='sum')
                df_pivot.plot(kind='bar', ax=ax, colormap='viridis')
                ax.legend(title=group_col)
            else:
                df_agg = df.groupby(x_col)[y_col].sum()
                ax.bar(df_agg.index, df_agg.values, color='#667eea', alpha=0.8)
            ax.set_xlabel(x_col)
            ax.set_ylabel(y_col)
            plt.xticks(rotation=45, ha='right')
            
        elif chart_type == 'histogram':
            # 5. HISTOGRAM - Frequency distribution
            ax.hist(df[x_col].dropna(), bins=30, color='#667eea', 
                   edgecolor='#f093fb', alpha=0.7)
            ax.set_xlabel(x_col)
            ax.set_ylabel('Frequency')
            
        elif chart_type == 'violin':
            # 6. VIOLIN PLOT - Distribution density
            if group_col:
                sns.violinplot(data=df, x=x_col, y=y_col, palette='viridis', ax=ax)
            else:
                sns.violinplot(data=df, y=y_col, color='#667eea', ax=ax)
            ax.set_xlabel(x_col if x_col else '')
            ax.set_ylabel(y_col)
            plt.xticks(rotation=45, ha='right')
            
        elif chart_type == 'density':
            # 7. DENSITY PLOT - Continuous probability distribution
            if group_col:
                for group in df[group_col].unique():
                    group_data = df[df[group_col] == group]
                    group_data[x_col].plot(kind='density', label=group, ax=ax)
                ax.legend()
            else:
                df[x_col].plot(kind='density', color='#667eea', ax=ax)
            ax.set_xlabel(x_col)
            ax.set_ylabel('Density')
            
        elif chart_type == 'heatmap':
            # 8. HEATMAP - Correlation matrix
            numeric_cols = df.select_dtypes(include=[np.number])
            corr_matrix = numeric_cols.corr()
            sns.heatmap(corr_matrix, annot=True, fmt='.2f', 
                       cmap='coolwarm', center=0, ax=ax)
            plt.xticks(rotation=45, ha='right')
            plt.yticks(rotation=0)
            
        elif chart_type == 'ridgeline':
            # 9. RIDGELINE PLOT - Multiple distribution comparison
            # Simplified version using violin plots
            if group_col:
                sns.violinplot(data=df, x=y_col, y=x_col, palette='viridis', ax=ax)
            else:
                # Create categories if not provided
                df['category'] = pd.cut(df[x_col], bins=5)
                sns.violinplot(data=df, x=y_col, y='category', palette='viridis', ax=ax)
            ax.set_xlabel(y_col)
            ax.set_ylabel(x_col)
            
        elif chart_type == 'pie':
            # 10. PIE CHART - Proportions and percentages
            pie_data = df[x_col].value_counts()
            colors = plt.cm.viridis(np.linspace(0, 1, len(pie_data)))
            ax.pie(pie_data.values, labels=pie_data.index, autopct='%1.1f%%',
                  colors=colors, startangle=90)
            ax.axis('equal')
            
        else:
            raise ValueError(f"Unknown chart type: {chart_type}")
        
        # Set title
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        
        # Adjust layout
        plt.tight_layout()
        
        # Save figure
        output_path = params['outputPath']
        plt.savefig(output_path, dpi=300, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        plt.close()
        
        print(f"Chart created successfully: {output_path}")
        
    except Exception as e:
        print(f"Error creating chart: {str(e)}", file=sys.stderr)
        raise

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("No parameters file provided!", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Read parameters from file
        params_file = sys.argv[1]
        with open(params_file, 'r', encoding='utf-8') as f:
            params = json.load(f)
        
        # Read data
        with open(params['dataPath'], 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Create chart
        create_chart(params['chartType'], df, params)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
