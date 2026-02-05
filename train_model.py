import pandas as pd
import numpy as np
import joblib
import argparse
import time
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from tradingbot import generate_dummy_data, get_full_option_chain, get_nse_option_info, CONFIG

FEATURE_NAMES = [
    'spot_price', 'atm_strike',
    'ce_ltp', 'ce_iv', 'ce_oi', 'ce_oi_change_pct', 'ce_delta', 'ce_gamma', 'ce_vega', 'ce_theta',
    'pe_ltp', 'pe_iv', 'pe_oi', 'pe_oi_change_pct', 'pe_delta', 'pe_gamma', 'pe_vega', 'pe_theta'
]

# --- Feature Engineering ---
def extract_features(data_point):
    """Extracts features from a single option chain data point."""
    records = data_point.get('records', {})
    spot_price = records.get('underlyingValue')
    atm_strike = round(spot_price / 50) * 50
    
    ce_data = None
    pe_data = None
    for item in records.get('data', []):
        if item.get('strikePrice') == atm_strike:
            ce_data = item.get('CE')
            pe_data = item.get('PE')
            break
            
    if not all([spot_price, ce_data, pe_data]):
        return None

    features = [
        spot_price,
        atm_strike,
        ce_data.get('lastPrice', 0),
        ce_data.get('impliedVolatility', 0),
        ce_data.get('openInterest', 0),
        ce_data.get('pchangeinOpenInterest', 0),
        ce_data.get('delta', 0),
        ce_data.get('gamma', 0),
        ce_data.get('vega', 0),
        ce_data.get('theta', 0),
        pe_data.get('lastPrice', 0),
        pe_data.get('impliedVolatility', 0),
        pe_data.get('openInterest', 0),
        pe_data.get('pchangeinOpenInterest', 0),
        pe_data.get('delta', 0),
        pe_data.get('gamma', 0),
        pe_data.get('vega', 0),
        pe_data.get('theta', 0),
    ]
    return features

# --- Dataset Creation ---
def create_dummy_dataset(num_samples=2000):
    """Creates a labeled dataset using dummy data."""
    print(f"Generating {num_samples} samples for the dataset...")
    feature_list = []
    labels = []
    
    # Generate first data point
    prev_spot = generate_dummy_data("NIFTY", "10-Feb-2026")['records']['underlyingValue']

    for i in range(num_samples):
        if (i + 1) % 200 == 0:
            print(f"  Generated {i+1}/{num_samples} samples...")
            
        current_data = generate_dummy_data("NIFTY", "10-Feb-2026")
        current_spot = current_data['records']['underlyingValue']
        
        features = extract_features(current_data)
        if features:
            feature_list.append(features)
            # Label: 1 if price went up, 0 if down or same
            labels.append(1 if current_spot > prev_spot else 0)
        
        prev_spot = current_spot
        
    return pd.DataFrame(feature_list), pd.Series(labels)

def collect_live_data(symbol="NIFTY", num_samples=100, interval=30, save_path="live_data.csv"):
    """Collects live data from NSE to build a training dataset."""
    expiry = get_nse_option_info()
    if not expiry:
        print("❌ Could not determine expiry date. Aborting.")
        return None, None

    print(f"📡 Collecting {num_samples} samples of live data for {symbol} ({expiry}) every {interval}s...")
    feature_list = []
    labels = []
    
    prev_features = None
    prev_spot = None
    
    # Loop to collect data
    # We need num_samples + 1 iterations to generate num_samples labels
    for i in range(num_samples + 1):
        try:
            records = get_full_option_chain(symbol, expiry)
            if records:
                current_spot = records.get('underlyingValue')
                data_point = {'records': records}
                features = extract_features(data_point)
                
                if features:
                    if prev_features is not None:
                        feature_list.append(prev_features)
                        # Label: 1 if price went up, 0 otherwise
                        label = 1 if current_spot > prev_spot else 0
                        labels.append(label)
                        print(f"   Sample {len(labels)}/{num_samples}: Spot {prev_spot} -> {current_spot} | Label: {label}")
                        
                        # Save incrementally if path provided
                        if save_path:
                            df_chunk = pd.DataFrame([prev_features], columns=FEATURE_NAMES)
                            df_chunk['label'] = label
                            df_chunk.to_csv(save_path, mode='a', header=not os.path.exists(save_path), index=False)

                    prev_features = features
                    prev_spot = current_spot
            else:
                print("   ⚠️ Failed to fetch data.")
        except Exception as e:
            print(f"   ⚠️ Error: {e}")

        if i < num_samples:
            time.sleep(interval)
            
    return pd.DataFrame(feature_list, columns=FEATURE_NAMES), pd.Series(labels)

def load_historical_data(csv_path):
    """Loads historical data from CSV."""
    print(f"📂 Loading historical data from {csv_path}...")
    try:
        df = pd.read_csv(csv_path)
        # Check if label exists, if not try to derive from spot_price
        if 'label' not in df.columns:
            if 'spot_price' in df.columns:
                print("   ℹ️ 'label' column not found. Deriving from 'spot_price'...")
                df['label'] = (df['spot_price'].shift(-1) > df['spot_price']).astype(int)
                df = df.dropna() # Drop last row which has NaN label
            else:
                print("   ❌ CSV must contain 'label' or 'spot_price' column.")
                return None, None
        
        X = df[FEATURE_NAMES]
        y = df['label']
        return X, y
    except Exception as e:
        print(f"   ❌ Error loading CSV: {e}")
        return None, None

# --- Model Training ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ML Model for Trading Bot")
    parser.add_argument("--mode", choices=["dummy", "live", "history"], default="dummy", help="Data source mode")
    parser.add_argument("--csv", help="Path to CSV file (for history input or live output) example : python train_model.py --mode history --csv nse_training_data.csv")
    parser.add_argument("--samples", type=int, default=2000, help="Number of samples to generate/collect")
    parser.add_argument("--interval", type=int, default=30, help="Interval in seconds for live collection")
    args = parser.parse_args()

    # 1. Create Dataset
    features_df = None
    labels_series = None

    if args.mode == "dummy":
        features_df, labels_series = create_dummy_dataset(args.samples)
        features_df.columns = FEATURE_NAMES
    elif args.mode == "live":
        features_df, labels_series = collect_live_data(num_samples=args.samples, interval=args.interval, save_path=args.csv)
    elif args.mode == "history":
        if not args.csv:
            print("❌ Error: --csv argument is required for history mode.")
            exit(1)
        features_df, labels_series = load_historical_data(args.csv)

    if features_df is None or features_df.empty:
        print("❌ No data available for training. Exiting.")
        exit(1)
    
    print("\nDataset created with shape:", features_df.shape)
    print("Label distribution:\n", labels_series.value_counts(normalize=True))

    # 2. Split Data
    X_train, X_test, y_train, y_test = train_test_split(
        features_df, labels_series, test_size=0.2, random_state=42, stratify=labels_series
    )

    # 3. Train Model
    print("\nTraining RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # 4. Evaluate Model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy on Test Set: {accuracy:.2f}")

    # 5. Save Model
    model_filename = 'trading_model.joblib'
    joblib.dump(model, model_filename)
    print(f"\n✅ Model saved successfully as '{model_filename}'")