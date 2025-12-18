from app import app
from models.User import User
import getpass

def create_super_admin():
    print("--- Create Super Admin ---")
    name = input("Enter Admin Name: ")
    email = input("Enter Admin Email: ")
    password = getpass.getpass("Enter Admin Password: ")
    
    with app.app_context():
        # Check if user exists
        user = User.objects(email=email).first()
        
        if user:
            print(f"⚠️ User {email} already exists. Promoting to Admin...")
            user.role = 'admin'
            user.is_verified = True # Admins are always verified
            user.set_password(password) # Update password just in case
            user.save()
        else:
            print(f"🆕 Creating new Admin user...")
            user = User(
                name=name, 
                email=email, 
                password=password, 
                role='admin',
                is_verified=True
            )
            user.set_password(password)
            user.save()
            
        print(f"✅ SUCCESS: {email} is now an Admin!")

if __name__ == "__main__":
    create_super_admin()