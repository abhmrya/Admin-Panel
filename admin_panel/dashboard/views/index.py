from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from django.shortcuts import render

def index(request):
    return render(request, "dashboard/index.html")

# @login_required
# def index(request):

#     role = request.user.role
#     print(f'role------------{role}')

#     if role == "ADMIN":
#         return redirect("dashboard:admin_dashboard")

#     if role == "HR":
#         return redirect("dashboard:hr_dashboard")

#     if role == "MANAGER":
#         return redirect("dashboard:manager_dashboard")

#     if role == "EMPLOYEE":
#         return redirect("dashboard:employee_dashboard")

#     return redirect("accounts:login")
