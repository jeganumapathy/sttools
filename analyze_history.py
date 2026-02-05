import pandas as pd
import json
import os

def analyze_historical_data(file_path, config_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Analyzing historical data from: {file_path}")
    
    try:
        # Read CSV
        df = pd.read_csv(file_path)
        
        # Clean column names (strip whitespace)
        df.columns = df.columns.str.strip()
        
        if 'Close' not in df.columns:
            print("Error: 'Close' column not found in CSV.")
            return

        # Basic Analysis
        mean_price = df['Close'].mean()
        max_price = df['Close'].max()
        min_price = df['Close'].min()
        
        # Calculate Volatility (Standard Deviation of Daily Returns)
        # Sort by date ascending for correct return calculation
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values('Date')
        
        df['Daily_Return'] = df['Close'].pct_change()
        daily_volatility = df['Daily_Return'].std()
        annualized_volatility = daily_volatility * (252 ** 0.5) * 100

        print("-" * 30)
        print(f"Period: {df['Date'].min().date()} to {df['Date'].max().date()}")
        print(f"Mean Spot Price: {mean_price:.2f}")
        print(f"Max Spot Price:  {max_price:.2f}")
        print(f"Min Spot Price:  {min_price:.2f}")
        print(f"Annualized Volatility: {annualized_volatility:.2f}%")
        print("-" * 30)

        # Update Config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            old_mean = config.get('spot_mean', 'N/A')
            config['spot_mean'] = int(mean_price)
            
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=4)
            
            print(f"✅ Updated 'spot_mean' in {config_path}: {old_mean} -> {int(mean_price)}")
        else:
            print(f"⚠️ Config file not found at {config_path}. Skipping update.")

    except Exception as e:
        print(f"An error occurred during analysis: {e}")

if __name__ == "__main__":
    csv_file = "NIFTY 50-02-01-2025-to-01-01-2026.csv"
    config_file = "config.json"
    analyze_historical_data(csv_file, config_file)
