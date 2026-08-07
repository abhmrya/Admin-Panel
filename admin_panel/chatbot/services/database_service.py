from django.db.models import Count, Q
from django.utils import timezone

from accounts.models import User
from profiles.models import Profile
from departments.models import Department
from audit.models import AuditLog


class DatabaseService:
    """
    Enterprise Database Service

    This service NEVER generates AI responses.

    It ONLY returns Python dictionaries/lists.

    Every method should do ONE job.
    """

    # =====================================================
    # USER STATISTICS
    # =====================================================

    @staticmethod
    def get_user_statistics():
        """
        Dashboard user statistics.
        """

        return {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(
                is_active=True
            ).count(),
            "inactive_users": User.objects.filter(
                is_active=False
            ).count(),
            "verified_users": User.objects.filter(
                is_verified=True
            ).count(),
            "oauth_users": User.objects.filter(
                is_oauth_user=True
            ).count(),
        }

    @staticmethod
    def get_total_users():
        return User.objects.count()

    @staticmethod
    def get_active_users():

        users = User.objects.filter(
            is_active=True
        )

        return [
            {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "role": user.role,
            }
            for user in users
        ]

    @staticmethod
    def get_inactive_users():

        users = User.objects.filter(
            is_active=False
        )

        return [
            {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "role": user.role,
            }
            for user in users
        ]

    @staticmethod
    def get_verified_users():

        users = User.objects.filter(
            is_verified=True
        )

        return [
            {
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}".strip(),
            }
            for user in users
        ]

    @staticmethod
    def get_oauth_users():

        users = User.objects.filter(
            is_oauth_user=True
        )

        return [
            {
                "email": user.email,
                "provider": (
                    "Google"
                    if user.google_id
                    else "Github"
                    if user.github_id
                    else "LinkedIn"
                    if user.linkedin_id
                    else "Unknown"
                )
            }
            for user in users
        ]
        # =====================================================
    # USER SEARCH
    # =====================================================

    @staticmethod
    def get_recent_users(limit=10):
        """
        Recently registered users.
        """

        users = (
            User.objects
            .order_by("-date_joined")[:limit]
        )

        return [
            {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "role": user.role,
                "joined": user.date_joined,
            }
            for user in users
        ]


    @staticmethod
    def get_users_by_role(role):
        """
        Get all users of a role.
        """

        users = User.objects.filter(
            role__iexact=role
        )

        return [
            {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "role": user.role,
                "active": user.is_active,
                "verified": user.is_verified,
            }
            for user in users
        ]


    @staticmethod
    def search_users(keyword):
        """
        Search users by name, email or username.
        """

        users = User.objects.filter(
            Q(first_name__icontains=keyword)
            | Q(last_name__icontains=keyword)
            | Q(email__icontains=keyword)
            | Q(username__icontains=keyword)
        )

        return [
            {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "role": user.role,
                "active": user.is_active,
            }
            for user in users
        ]


    @staticmethod
    def get_user_by_email(email):
        """
        Get a single user by email.
        """

        try:
            user = User.objects.get(email__iexact=email)

            return {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "active": user.is_active,
                "verified": user.is_verified,
                "joined": user.date_joined,
            }

        except User.DoesNotExist:
            return None


    @staticmethod
    def get_user_by_username(username):
        """
        Get a single user by username.
        """

        try:
            user = User.objects.get(username__iexact=username)

            return {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "active": user.is_active,
                "verified": user.is_verified,
            }

        except User.DoesNotExist:
            return None


    @staticmethod
    def get_user_profile(email):
        """
        Complete profile information.
        """

        try:

            profile = (
                Profile.objects
                .select_related(
                    "user",
                    "department",
                )
                .get(
                    user__email__iexact=email
                )
            )

            return {
                "name": (
                    f"{profile.user.first_name} "
                    f"{profile.user.last_name}"
                ).strip(),
                "email": profile.user.email,
                "username": profile.user.username,
                "role": profile.user.role,
                "department": (
                    profile.department.name
                    if profile.department
                    else None
                ),
                "gender": profile.gender,
                "dob": profile.dob,
                "address": profile.address,
            }

        except Profile.DoesNotExist:
            return None


    @staticmethod
    def get_today_joined_users():
        """
        Users joined today.
        """

        today = timezone.now().date()

        users = User.objects.filter(
            date_joined__date=today
        )

        return [
            {
                "name": f"{u.first_name} {u.last_name}".strip(),
                "email": u.email,
                "role": u.role,
            }
            for u in users
        ]


    @staticmethod
    def get_users_count_by_role():
        """
        Count users grouped by role.
        """

        data = (
            User.objects
            .values("role")
            .annotate(total=Count("id"))
            .order_by("role")
        )

        return list(data)
        # =====================================================
    # DEPARTMENT
    # =====================================================

    @staticmethod
    def get_department_statistics():
        """
        Department statistics.
        """

        return {
            "total_departments": Department.objects.count(),
            "active_departments": Department.objects.filter(
                is_active=True
            ).count(),
            "inactive_departments": Department.objects.filter(
                is_active=False
            ).count(),
        }


    @staticmethod
    def get_departments():
        """
        Get all departments.
        """

        departments = (
            Department.objects
            .order_by("name")
        )

        return [
            {
                "id": str(department.id),
                "name": department.name,
                "code": department.code,
                "description": department.description,
                "active": department.is_active,
            }
            for department in departments
        ]


    @staticmethod
    def search_departments(keyword):
        """
        Search department by name/code.
        """

        departments = Department.objects.filter(
            Q(name__icontains=keyword)
            | Q(code__icontains=keyword)
        )

        return [
            {
                "name": department.name,
                "code": department.code,
                "active": department.is_active,
            }
            for department in departments
        ]


    @staticmethod
    def get_department(department_name):
        """
        Get single department.
        """

        try:

            department = Department.objects.get(
                name__iexact=department_name
            )

            return {
                "id": str(department.id),
                "name": department.name,
                "code": department.code,
                "description": department.description,
                "active": department.is_active,
            }

        except Department.DoesNotExist:
            return None


    @staticmethod
    def get_department_users(department_name):
        """
        Users of a department.
        """

        profiles = (
            Profile.objects
            .select_related(
                "user",
                "department",
            )
            .filter(
                department__name__iexact=department_name
            )
            .order_by(
                "user__first_name"
            )
        )

        return [
            {
                "name": (
                    f"{profile.user.first_name} "
                    f"{profile.user.last_name}"
                ).strip(),
                "email": profile.user.email,
                "role": profile.user.role,
                "active": profile.user.is_active,
            }
            for profile in profiles
        ]


    @staticmethod
    def get_department_employee_count():
        """
        Employee count of every department.
        """

        departments = (
            Department.objects
            .annotate(
                employee_count=Count("employees")
            )
            .order_by(
                "-employee_count"
            )
        )

        return [
            {
                "department": department.name,
                "employees": department.employee_count,
            }
            for department in departments
        ]


    @staticmethod
    def get_biggest_department():
        """
        Department having maximum employees.
        """

        department = (
            Department.objects
            .annotate(
                employee_count=Count("employees")
            )
            .order_by(
                "-employee_count"
            )
            .first()
        )

        if not department:
            return None

        return {
            "department": department.name,
            "employees": department.employee_count,
        }


    @staticmethod
    def get_empty_departments():
        """
        Departments without employees.
        """

        departments = (
            Department.objects
            .annotate(
                employee_count=Count("employees")
            )
            .filter(
                employee_count=0
            )
        )

        return [
            {
                "name": department.name,
                "code": department.code,
            }
            for department in departments
        ]


    @staticmethod
    def get_recent_departments(limit=5):
        """
        Recently created departments.
        """

        departments = (
            Department.objects
            .order_by("-created_at")[:limit]
        )

        return [
            {
                "name": department.name,
                "code": department.code,
                "created_at": department.created_at,
            }
            for department in departments
        ]

        # =====================================================
    # AUDIT LOG
    # =====================================================

    @staticmethod
    def get_latest_audit_logs(limit=10):
        """
        Latest audit logs.
        """

        logs = (
            AuditLog.objects
            .select_related("actor")
            .order_by("-created_at")[:limit]
        )

        return [
            {
                "actor": log.actor.email if log.actor else "System",
                "action": log.action,
                "resource": log.resource,
                "endpoint": log.endpoint,
                "created_at": log.created_at,
            }
            for log in logs
        ]


    @staticmethod
    def get_today_audit_logs():
        """
        Today's audit logs.
        """

        today = timezone.now().date()

        logs = (
            AuditLog.objects
            .select_related("actor")
            .filter(created_at__date=today)
            .order_by("-created_at")
        )

        return [
            {
                "actor": log.actor.email if log.actor else "System",
                "action": log.action,
                "resource": log.resource,
                "endpoint": log.endpoint,
                "created_at": log.created_at,
            }
            for log in logs
        ]


    @staticmethod
    def get_logs_by_action(action):
        """
        Filter audit logs by action.
        """

        logs = (
            AuditLog.objects
            .select_related("actor")
            .filter(action__icontains=action)
            .order_by("-created_at")
        )

        return [
            {
                "actor": log.actor.email if log.actor else "System",
                "resource": log.resource,
                "endpoint": log.endpoint,
                "created_at": log.created_at,
            }
            for log in logs
        ]


    @staticmethod
    def get_logs_by_actor(email):
        """
        Filter audit logs by actor email.
        """

        logs = (
            AuditLog.objects
            .select_related("actor")
            .filter(actor__email__iexact=email)
            .order_by("-created_at")
        )

        return [
            {
                "action": log.action,
                "resource": log.resource,
                "endpoint": log.endpoint,
                "created_at": log.created_at,
            }
            for log in logs
        ]


    @staticmethod
    def get_logs_by_resource(resource):
        """
        Filter logs by resource.
        """

        logs = (
            AuditLog.objects
            .select_related("actor")
            .filter(resource__icontains=resource)
            .order_by("-created_at")
        )

        return [
            {
                "actor": log.actor.email if log.actor else "System",
                "action": log.action,
                "endpoint": log.endpoint,
                "created_at": log.created_at,
            }
            for log in logs
        ]


    # =====================================================
    # DASHBOARD
    # =====================================================

    @staticmethod
    def get_dashboard_summary():
        """
        Dashboard summary.
        """

        today = timezone.now().date()

        return {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(
                is_active=True
            ).count(),
            "verified_users": User.objects.filter(
                is_verified=True
            ).count(),
            "total_departments": Department.objects.count(),
            "today_users": User.objects.filter(
                date_joined__date=today
            ).count(),
            "today_logs": AuditLog.objects.filter(
                created_at__date=today
            ).count(),
        }


    @staticmethod
    def get_system_overview():
        """
        High level project overview.
        """

        return {
            "users": User.objects.count(),
            "departments": Department.objects.count(),
            "profiles": Profile.objects.count(),
            "audit_logs": AuditLog.objects.count(),
        }


    @staticmethod
    def health_check():
        """
        Database health check.
        """

        return {
            "database": "connected",
            "users": User.objects.exists(),
            "departments": Department.objects.exists(),
            "profiles": Profile.objects.exists(),
            "audit_logs": AuditLog.objects.exists(),
            "server_time": timezone.now(),
        }