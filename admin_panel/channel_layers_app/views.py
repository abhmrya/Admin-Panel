from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model
from profiles.models import Profile
from .models import (
    Group_name,
    Chat_msg,
    OneToOneMessage,
    UserProfile,
)

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
)


# ============================================================
# CUSTOM USER MODEL
# ============================================================

User = get_user_model()


# ============================================================
# AUTH VIEWS
# ============================================================

def register_page(request):
    return render(request, "register.html")


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "User registered successfully"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


def login_page(request):
    return render(request, "login.html")


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            # Django session login
            login(request, user)

            return Response(
                {
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_staff": user.is_staff,
                    },

                    "tokens": serializer.validated_data["tokens"]
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# LOGOUT
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):

    try:

        refresh_token = request.data.get("refresh")

        if refresh_token:

            token = RefreshToken(refresh_token)

            token.blacklist()

    except Exception as e:

        return JsonResponse(
            {
                "error": str(e)
            },
            status=400
        )

    # Clear Django session
    request.session.flush()

    return JsonResponse(
        {
            "message": "Logged out successfully"
        }
    )


# ============================================================
# AUDIO UPLOAD
# ============================================================

@csrf_exempt
def upload_audio(request):

    if request.method == "POST" and request.FILES.get("audio"):

        audio_file = request.FILES["audio"]

        group_name = request.POST.get("group")

        user = request.user

        group = Group_name.objects.filter(
            groupname=group_name
        ).first()

        if not group:

            return JsonResponse(
                {
                    "error": "Group not found"
                },
                status=400
            )

        chat = Chat_msg.objects.create(
            user=user,
            group=group,
            message="",
            audio=audio_file,
            time=now(),
        )

        return JsonResponse(
            {
                "url": chat.audio.url
            }
        )

    return JsonResponse(
        {
            "error": "Invalid request"
        },
        status=400
    )


# ============================================================
# INDEX
# ============================================================

def index(request):

    if not request.user.is_authenticated:

        return redirect("/login")

    allgroup = Group_name.objects.all()

    if request.method == "POST":

        group_nm = request.POST.get(
            "group-name",
            ""
        ).strip()

        if group_nm:

            Group_name.objects.get_or_create(
                groupname=group_nm
            )

            allgroup = Group_name.objects.all()

    return render(
        request,
        "index.html",
        {
            "groupname": allgroup
        }
    )


# ============================================================
# GROUP CHAT LANDING
# /group/
# ============================================================

def group_chatt(request):

    if not request.user.is_authenticated:

        return redirect("/login")

    allgroup = Group_name.objects.all()

    if request.method == "POST":

        group_nm = request.POST.get(
            "group-name",
            ""
        ).strip().replace(" ", "_")

        if group_nm:

            new_group, _ = Group_name.objects.get_or_create(
                groupname=group_nm
            )

            return redirect(
                f"/group/{new_group.groupname}"
            )

    return render(
        request,
        "group_chat.html",
        {
            "groupname": allgroup,
            "group_name": "",
            "chat_msgs": [],
        }
    )


# ============================================================
# GROUP CHAT
# /group/<group_name>/
# ============================================================

def group_chat(request, group_name):

    if not request.user.is_authenticated:

        return redirect("/login")

    allgroup = Group_name.objects.all()

    group = Group_name.objects.filter(
        groupname=group_name
    ).first()

    if not group:

        group = Group_name.objects.create(
            groupname=group_name
        )

    chat_msgs = Chat_msg.objects.filter(
        group=group
    ).order_by("time")

    if request.method == "POST":

        group_nm = request.POST.get(
            "group-name",
            ""
        ).strip().replace(" ", "_")

        if group_nm:

            new_group, _ = Group_name.objects.get_or_create(
                groupname=group_nm
            )

            return redirect(
                f"/group/{new_group.groupname}"
            )

    return render(
        request,
        "group_chat.html",
        {
            "group_name": group_name,
            "chat_msgs": chat_msgs,
            "groupname": allgroup,
        }
    )


# ============================================================
# ONE-TO-ONE HOME
# ============================================================

def one_to_home(request):

    if not request.user.is_authenticated:

        return redirect("/login")

    # Current logged-in user ko list mein nahi dikhana
    users = User.objects.exclude(
        id=request.user.id
    )

    return render(
        request,
        "one_to_one_home.html",
        {
            "users": users
        }
    )


# ============================================================
# ONE-TO-ONE CHAT
# ============================================================

def oneto_one_chat(request):

    if not request.user.is_authenticated:
        return redirect("/login")

    # Current logged-in user ko exclude karo
    users = User.objects.exclude(
        id=request.user.id
    )

    user_name = None
    send_to = None
    user_profile = None
    user_main_profile = None
    chat_msgs = []

    if request.method == "POST":

        user_name = request.POST.get(
            "user",
            ""
        ).strip()

        print("Requested username:", user_name)

        if user_name:

            # ------------------------------------------
            # Find Custom User
            # ------------------------------------------
            send_to = User.objects.filter(
                username=user_name
            ).first()

            print("send_to:", send_to)

            if send_to:

                print("send_to username:", send_to.username)
                print("send_to email:", send_to.email)

                # ------------------------------------------
                # Profile optional
                # ------------------------------------------
                user_profile = UserProfile.objects.filter(
                    user=send_to
                ).first()

                user_main_profile = Profile.objects.filter(
                    user=send_to
                ).first()

                print("user_profile:", user_profile)

                # ------------------------------------------
                # Fetch conversation
                # ------------------------------------------
                chat_msgs = OneToOneMessage.objects.filter(
                    Q(
                        send_from=request.user,
                        send_to=send_to
                    )
                    |
                    Q(
                        send_from=send_to,
                        send_to=request.user
                    )
                ).order_by("time")

            else:

                print(
                    f"User '{user_name}' not found"
                )

    return render(
    request,
    "one_to_one_chat.html",
    {
        "user_name": user_name,
        "users": users,

        # Chat profile
        "user": user_profile,

        # HRMS profile
        "profile": user_main_profile,

        "send_to": send_to,
        "chat_msgs": chat_msgs,
    }
)