import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from tradingbot import generate_dummy_data, CONFIG

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
def create_dataset(num_samples=2000):
    """Creates a labeled dataset for model training."""
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

# --- Model Training ---
if __name__ == "__main__":
    # 1. Create Dataset
    features_df, labels_series = create_dataset()
    
    # Define feature names for clarity
    feature_names = [
        'spot_price', 'atm_strike',
        'ce_ltp', 'ce_iv', 'ce_oi', 'ce_oi_change_pct', 'ce_delta', 'ce_gamma', 'ce_vega', 'ce_theta',
        'pe_ltp', 'pe_iv', 'pe_oi', 'pe_oi_change_pct', 'pe_delta', 'pe_gamma', 'pe_vega', 'pe_theta'
    ]
    features_df.columns = feature_names
    
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