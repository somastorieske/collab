# meal_time_suggester.py
# Suggests meals based on time of day


from datetime import datetime

kitchen = ["eggs", "bread", "milk", "ugali", "sukuma wiki", "chicken"]

meals = {
    "breakfast": {"name": "Eggs and Toast", "needs": ["eggs", "bread"]},
    "lunch":     {"name": "Ugali and Sukuma Wiki", "needs": ["ugali", "sukuma wiki"]},
    "dinner":    {"name": "Chicken and Ugali", "needs": ["chicken", "ugali"]},
}

hour = datetime.now().hour
time_of_day = "breakfast" if hour < 12 else "lunch" if hour < 17 else "dinner"
meal = meals[time_of_day]

print(f"Good {time_of_day}! Suggested meal: {meal['name']}")

if all(item in kitchen for item in meal["needs"]):
    print("✅ You have all the ingredients!")
else:
    print("❌ Missing some ingredients, time to restock!")