from jugaad_data.nse import NSELive
import json

def test_jugaad():
    try:
        n = NSELive()
        print("Available methods:", [m for m in dir(n) if not m.startswith('_')])
        
        # Try finding a likely candidate
        response = n.index_option_chain("NIFTY")
        
        if response:
            keys = list(response.keys())
            print("✅ Success! Response keys:", keys)
            if "records" in response:
                print("✅ 'records' found.")
        else:
            print("❌ Empty response")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_jugaad()
