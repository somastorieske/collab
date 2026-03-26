#check if food is ok to eat for people with allergies

suggested_food = ["ugali", "milk", "fish", "eggs", "meat",
                   "vegetables",  "potatoes","polen"]

users_allergies = "polen"
if users_allergies in suggested_food:
    print("user can not eat this food")
else:
    print("safe")


#user diet adjustment

proteins = ["fish",  "eggs",  "meat", "milk"]
carbs = ["ugali", "rice", "bread", "potatoes"]
vitamins = ["kale", "spinach", "oranges", "apples"]
allergy = input("What are you allergic to? ")

if allergy in proteins:
    print("you should eat more vegetables")
elif allergy in carbs:
    print("eat more fruits and vegetables")


 #my menu =[] 
 
item1 = input("Add the first food: ")
item2 = input("Add the second food: ")
my_menu = [item1, item2]
print(f"Tonight's menu is: {my_menu}")
